/**
 * @file dynamo.js
 * @overview aws dynamo sdk
 */
import AWS from 'aws-sdk'

export const inject = {
  name: 'dynamo',
}

export default async function () {
  /**
   * DynamoDB converter
   * @module {AWS.DynamoDB.Converter}
   */
  const converter = AWS.DynamoDB.Converter
  const { unmarshall } = converter

  /**
   * Extract document from dynamo record and return related data
   * @param  {Object} params.record - dynamo stream record
   * @return {Object}
   */
  function parseDynamoRecord(record) {
    const message = record
    const { Keys, NewImage, OldImage, StreamViewType } = message.dynamodb
    const key = Keys.id.S
    switch (StreamViewType) {
      case 'NEW_AND_OLD_IMAGES': {
        if (NewImage) {
          message.dynamodb.NewImage = unmarshall(NewImage)
        }
        if (OldImage) {
          message.dynamodb.OldImage = unmarshall(OldImage)
        }
        return { key, record: message }
      }
      default: {
        return new Error(`unsupported StreamViewType '${StreamViewType}'`)
      }
    }
  }

  return {
    converter,
    parseDynamoRecord,
  }
}
