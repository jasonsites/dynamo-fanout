/**
 * @module kinesis
 * @overview low level aws kinesis sdk
 */
import AWS from 'aws-sdk'
import retry from 'retry'

export const inject = {
  name: 'kinesis',
  require: ['config'],
}

export default function (config) {
  const { aws, backoff, kinesis } = config

  // kinesis client options
  const { 'stream-name': StreamName } = kinesis.target
  const options = { params: { StreamName } }
  if (aws.region) Object.assign(options, { region: aws.region })

  /**
   * Configured kinesis client
   * @class {AWS.Kinesis}
   */
  const client = new AWS.Kinesis(options)

  /**
   * Wrapper around client method that handles retrying failed records
   * @param  {Object[]} data - extracted records
   * @param  {Object}   log  - logger
   * @return {Promise}
   */
  async function putRecords(data, log) {
    const operation = new PutRecordsOperation({ client, config: backoff, log })
    await operation.exec(data)
  }

  return {
    client,
    putRecords,
  }
}

/**
 * Handles retrying failed records with exponential backoff
 * @class {PutRecordsOperation}
 */
export class PutRecordsOperation {
  /**
   * @param {Object} params.client  - configured kinesis client
   * @param {Object} params.config  - backoff config
   * @param {Object} params.log     - logger
   */
  constructor({ client, config, log }) {
    this.operation = retry.operation(config)
    this.client = client
    this.log = log
  }

  /**
   * Executes the underlying operation
   * @param  {Object[]} data - extracted records
   * @return {Promise}
   */
  async exec(data) {
    /* eslint no-await-in-loop: 0 */
    // keep a reference to the records and define intial params
    const params = data.reduce((memo, { key, record }) => {
      memo.Records.push({
        Data: `${JSON.stringify(record)}\n`,
        PartitionKey: key,
      })
      return memo
    }, { Records: [] })

    // while there are records left to send, send them.
    // remove successful records from params after each call
    while (params.Records.length > 0) {
      const { FailedRecordCount, Records } = await this._putRecords(Object.assign({}, params))
      if (FailedRecordCount !== 0) {
        params.Records = params.Records.filter((r, i) => typeof Records[i].ErrorCode === 'string')
      } else {
        params.Records = []
      }
    }
  }

  /**
   * Wrapped client method that overlays backoff logic
   * @param  {Object} params - put record parameters
   * @return {Promise}
   * @private
   */
  _putRecords(params) {
    return new Promise((resolve, reject) => {
      this.operation.attempt(async () => {
        try {
          const data = await this.client.putRecords(params).promise()
          resolve(data)
        } catch (err) {
          if (this.operation.retry(err)) {
            this.log.warn(err, 'retrying failed operation')
          } else {
            reject(err)
          }
        }
      })
    })
  }
}
