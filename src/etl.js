/**
 * @module etl
 * @overview provides etl logic for parsing, unmarshalling,
 * and writing dynamo data to kinesis
 */
import Bluebird from 'bluebird'
import get from 'lodash.get'
import has from 'lodash.has'

import { ConfigurationError, MalformedEventError } from './errors'

export const inject = {
  name: 'etl',
  require: {
    config: 'config',
    dynamo: 'dynamo',
    kinesis: 'kinesis',
    validate: 'validation',
  },
}

export default function ({ config, dynamo, kinesis }) {
  const { fanout: { map } } = config

  /**
   * Map of dynamo tables to kinesis streams
   * @type {Object}
   */
  const streamMap = { ...map }

  /**
   * Helper function for returning kinesis stream arn for a given table
   * @param  {String} table - table name
   * @return {String}
   */
  function lookupStreamForTable(table) {
    const stream = streamMap[table]
    if (!stream) {
      return new ConfigurationError(`missing fanout stream for table '${table}'`)
    }
    return stream
  }

  /**
   * Process a dynamo stream message
   * @param {Object} e    - lambda event
   * @param {Object} log  - log module
   * @return {Promise[]}
   */
  async function processMessage(e, log) {
    const records = get(e, 'Records')
    if (!Array.isArray(records)) {
      throw new MalformedEventError('missing or invalid `Records` field')
    }
    return Bluebird.mapSeries(records, record => processRecord(record, log))
  }

  /**
   * Process a single dynamo stream record, unmarshall, and write to kinesis
   * @param {Object} record  - event data
   * @param {Object} log     - log module
   * @return {Promise}
   */
  async function processRecord(record, log) {
    if (record.eventSource !== 'aws:dynamodb' || !has(record, 'dynamodb')) {
      log.warn({ record }, 'Record did not originate from DynamoDB')
      return { noop: true }
    }

    // parse and unmarshall dynamo data
    const data = dynamo.parseDynamoRecord(record, log)
    if (data instanceof MalformedEventError) {
      log.error(data)
      return { noop: true }
    }
    const { id, message, requestId, tableName } = data

    // lookup kinesis stream target
    const stream = lookupStreamForTable(tableName)
    if (stream instanceof ConfigurationError) {
      log.error(stream)
      return { noop: true }
    }

    // write message to kinesis
    await kinesis.writeToKinesis({ id, message, stream })
    return { id, requestId, success: true }
  }

  return { lookupStreamForTable, processMessage, processRecord }
}
