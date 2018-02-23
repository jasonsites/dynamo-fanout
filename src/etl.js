/**
 * @module etl
 * @overview provides etl logic for parsing, unmarshalling,
 * and writing dynamo data to kinesis
 */
import get from 'lodash.get'
import has from 'lodash.has'

import { MalformedEventError } from './errors'

export const inject = {
  name: 'etl',
  require: {
    dynamo: 'dynamo',
    kinesis: 'kinesis',
    validate: 'validation',
  },
}

export default function ({ dynamo, kinesis }) {
  /**
   * Process a dynamo stream message
   * @param {Object} e    - lambda event
   * @param {Object} log  - logger
   * @return {Promise[]}
   */
  async function processEvent(e, log) {
    // extract data
    const data = extractRecords(e, log)
    log.debug({ data }, 'record data')
    if (!data.length) {
      return { n: 0 }
    }

    // batch write to kinesis
    const result = await kinesis.putRecords(data, log)
    log.debug({ result }, 'kinesis result')
    return { n: data.length }
  }

  /**
   * Process a single dynamo stream record, unmarshall, and write to kinesis
   * @param {Object} e    - lambda event
   * @param {Object} log  - logger
   * @return {Object[]}
   */
  function extractRecords(e, log) {
    const records = get(e, 'Records')
    if (!Array.isArray(records)) {
      throw new MalformedEventError('missing or invalid `Records` field')
    }

    return records.reduce((memo, record) => {
      // skip records that did not originate from dynamo
      if (record.eventSource !== 'aws:dynamodb' || !has(record, 'dynamodb')) {
        log.warn({ record }, 'Record did not originate from DynamoDB')
        return memo
      }

      // parse and unmarshall dynamo data
      const data = dynamo.parseDynamoRecord(record, log)
      if (data instanceof Error) {
        log.error(data)
        return memo
      }

      memo.push(data)
      return memo
    }, [])
  }

  return { extractRecords, processEvent }
}
