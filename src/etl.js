/**
 * @module etl
 * @overview provides etl logic for parsing, unmarshalling,
 * and writing dynamo data to kinesis
 */
import Bluebird from 'bluebird'
import get from 'lodash.get'
import has from 'lodash.has'

import { MalformedEventError } from './errors'

export const inject = {
  name: 'etl',
  require: {
    config: 'config',
    dynamo: 'dynamo',
    kinesis: 'kinesis',
  },
}

export default function ({ config, dynamo, kinesis }) {
  const { fanout: { map } } = config
  // Object.entries(map).map(([key, val]) => {
  //   const valid = validate.fanout(val)
  //   if (valid instanceof ValidationError) {
  //     log.debug({ record }, `ValidationError: ${valid.message}`)
  //     return { noop: true }
  //   }
  // })

  /**
   * Map of dynamo tables to kinesis streams
   * @type {Object}
   */
  const streamMap = { ...map }

  /**
   * Helper function for returning the kinesis stream arn for a given table
   * @param  {String} table - table name
   * @return {String}
   */
  function lookupStreamForTable(table) {
    const stream = streamMap[table]
    if (!stream) {
      throw new Error(`Missing fanout stream for table '${table}'`)
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
    const data = dynamo.parseDynamoRecord(record)
    const { id, message, requestId, tableName } = data
    const stream = lookupStreamForTable(tableName)
    await kinesis.writeToKinesis({ id, message, stream })
    return { id, requestId, success: true }
  }

  return { lookupStreamForTable, processMessage, processRecord }
}
