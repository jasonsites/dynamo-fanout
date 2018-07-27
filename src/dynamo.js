/**
 * @file dynamo.js
 * @overview aws dynamo sdk
 */
import AWS from 'aws-sdk'
import get from 'lodash.get'

export const inject = {
  name: 'dynamo',
  require: ['config'],
}

export default async function (config) {
  const converter = AWS.DynamoDB.Converter
  const { partition: { delimiter, mode, paths } } = config.kinesis
  if ((mode === 'first' || mode === 'concat') && !paths) {
    throw new Error(`missing required 'partitionPaths' configuration for partitionMode '${mode}'`)
  }

  /**
   * Extract document from dynamo record and return related data
   * @param  {Object} record - dynamo stream record
   * @return {Object}
   */
  function parseDynamoRecord(record) {
    const modified = record
    const { NewImage, OldImage, StreamViewType } = modified.dynamodb

    switch (StreamViewType) {
      case 'NEW_AND_OLD_IMAGES': {
        if (NewImage) {
          modified.dynamodb.NewImage = converter.unmarshall(NewImage)
        }
        if (OldImage) {
          modified.dynamodb.OldImage = converter.unmarshall(OldImage)
        }
        break
      }
      default: {
        return new Error(`unsupported StreamViewType '${StreamViewType}'`)
      }
    }
    const key = parsePartitionKey(modified)
    return { key, record: modified }
  }

  /**
   * Computes the kinesis partition key for the given unmarshalled dynamodb event record
   * @param  {Object} record - unmarshalled dynamo stream record
   * @return {String}
   */
  function parsePartitionKey(record) {
    const { Keys } = record.dynamodb

    switch (mode) {
      // concatenate all non nil values found at the configured partition paths
      case 'concat': {
        const key = paths.reduce((acc, p) => {
          const val = get(record, p)
          if (val !== undefined && val !== null) {
            acc.push(val)
          }
          return acc
        }, []).join(delimiter)
        if (!key) {
          throw new Error('unable to concatenate partition key')
        }
        return key
      }

      // return the first defined value found by evaluating the configured partition paths
      case 'first': {
        const path = paths.find((p) => {
          const val = get(record, p)
          return val !== undefined && val !== null
        })
        if (!path) {
          throw new Error('no partition paths matched record')
        }
        return get(record, path)
      }

      // compute partition key using dynamo hash/range keys
      default: {
        const unmarshalledKeys = converter.unmarshall(Keys)
        return Object.keys(unmarshalledKeys)
          .reduce((memo, k, idx) => {
            if (idx === 0) return `${unmarshalledKeys[k]}`
            return `${memo}-${unmarshalledKeys[k]}`
          }, '')
      }
    }
  }

  return {
    converter,
    parseDynamoRecord,
    parsePartitionKey,
  }
}
