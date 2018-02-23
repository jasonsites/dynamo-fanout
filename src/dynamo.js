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
   * @param  {Object} record - dynamo stream record
   * @return {Object}
   */
  function parseDynamoRecord(record) {
    const modified = record
    const { Keys, NewImage, OldImage, StreamViewType } = modified.dynamodb
    const key = Object.entries(unmarshall(Keys))
      .reduce((memo, [, val], idx) => {
        if (idx === 0) return `${val}`
        return `${memo}-${val}`
      }, '')
    switch (StreamViewType) {
      case 'NEW_AND_OLD_IMAGES': {
        if (NewImage) {
          modified.dynamodb.NewImage = unmarshall(NewImage)
        }
        if (OldImage) {
          modified.dynamodb.OldImage = unmarshall(OldImage)
        }
        return { key, record: modified }
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
