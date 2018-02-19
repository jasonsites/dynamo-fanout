/**
 * @module kinesis
 * @overview low level aws kinesis sdk
 */

import AWS from 'aws-sdk'

export const inject = {
  name: 'kinesis',
  require: ['config'],
}

export default function (config) {
  const { aws: { region } } = config

  /**
   * Configured kinesis client
   * @class {AWS.Kinesis}
   */
  const client = new AWS.Kinesis({ region })

  /**
   * Promisified putRecord call that resolves with the passed message
   * @param  {String} params.id       - dynamo record id
   * @param  {Object} params.message  - dynamo record with unmarshalled images
   * @param  {String} params.stream   - stream name
   * @return {Promise}
   */
  async function writeToKinesis({ id, message, stream }) {
    await client.putRecord({
      Data: Buffer.from(JSON.stringify(message), 'utf8'),
      PartitionKey: id,
      StreamName: stream,
    }).promise()
    return message
  }

  return {
    client,
    writeToKinesis,
  }
}
