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
 * Extract dynamo table name from a dynamo arn
 * (arn:aws:dynamodb:region:account-id:table/tablename)
 * @param  {String} arn - dynamo arn
 * @return {String}
 */
  function extractTableNameFromStreamARN(arn) {
    return arn.split('/')[1]
  }

  /**
   * Extract document from dynamo record and return related data
   * @param  {Object} params.record - dynamo stream record
   * @return {Object}
   */
  function parseDynamoRecord(record) {
    const message = record
    const { dynamodb, eventName, eventSourceARN } = message
    const { NewImage, OldImage, StreamViewType } = dynamodb
    switch (StreamViewType) {
      case 'NEW_AND_OLD_IMAGES': {
        const tableName = extractTableNameFromStreamARN(eventSourceARN)
        if (NewImage) {
          message.dynamodb.NewImage = unmarshall(NewImage)
        }
        if (OldImage) {
          message.dynamodb.OldImage = unmarshall(OldImage)
        }
        if (eventName === 'REMOVE') {
          const { id, requestId } = message.dynamodb.OldImage
          return { id, message, requestId, tableName }
        }
        const { id, requestId } = message.dynamodb.NewImage
        return { id, message, requestId, tableName }
      }
      default: {
        const err = new MalformedEventError(`unsupported StreamViewType '${StreamViewType}'`)
        return err
      }
    }
  }

  return {
    converter,
    extractTableNameFromStreamARN,
    parseDynamoRecord,
  }
}
