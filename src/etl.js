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
   * @param {Object} log  - log module
   * @return {Promise[]}
   */
  async function processEvent(e, log) {
    // extract data
    const records = extractRecords(e, log)
    log.debug({ records }, 'records')
    if (!records.length) {
      return { n: 0 }
    }

    // batch write to kinesis
    const result = await kinesis.putRecords(records, log)
    log.debug({ result }, 'result')
    return { n: records.length }
  }

  /**
   * Process a single dynamo stream record, unmarshall, and write to kinesis
   * @param {Object} record  - event data
   * @param {Object} log     - log module
   * @return {Promise}
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
      if (data instanceof MalformedEventError) {
        log.error(data)
        return memo
      }

      memo.push(data)
      return memo
    }, [])
  }

  return { extractRecords, processEvent }
}
