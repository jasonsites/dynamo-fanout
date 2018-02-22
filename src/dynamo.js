/**
 * @file dynamo.js
 * @overview aws dynamo sdk
 */
import AWS from 'aws-sdk'

import { MalformedEventError } from './errors'

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
    const { dynamodb } = message
    const { NewImage, OldImage, StreamViewType } = dynamodb
    switch (StreamViewType) {
      case 'NEW_AND_OLD_IMAGES': {
        if (NewImage) {
          message.dynamodb.NewImage = unmarshall(NewImage)
        }
        if (OldImage) {
          message.dynamodb.OldImage = unmarshall(OldImage)
        }
        return message
      }
      default: {
        // TODO
        return new MalformedEventError(`unsupported StreamViewType '${StreamViewType}'`)
      }
    }
  }

  return {
    converter,
    parseDynamoRecord,
  }
}
