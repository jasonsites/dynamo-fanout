import AWS from 'aws-sdk'
import faker from 'faker'
import _, { partial } from 'lodash'

/**
 * Mock aws account number
 * @type {String}
 */
export const account = faker.random.number({
  min: 1000000000,
  max: 9999999999,
}).toString()

/**
 * Mock aws region
 * @type {String}
 */
export const awsRegion = 'us-west-2'

/**
 * Generates a mock dynamo record
 * @param  {String}  params.eventName - event name (INSERT, MODIFY, REMOVE)
 * @param  {String}  params.id        - record id
 * @param  {Boolean} params.marshal   - marshalled/unmarshalled
 * @param  {Object}  params.newImage  - dynamodb.NewImage record data
 * @param  {Object}  params.oldImage  - dynamodb.OldImage record data
 * @param  {String}  params.table     - dynamo table name
 * @return {Object}
 */
export function generateDynamoRecord({
  eventName = 'INSERT',
  id,
  marshal = true,
  newImage,
  oldImage,
  table,
}) {
  const base = {
    eventID: faker.random.number({ min: 1, max: 999999 }).toString(),
    eventVersion: '1.0',
    awsRegion,
    eventName,
    eventSourceARN: `arn:aws:dynamodb:${awsRegion}:${account}:table/${table}`,
    eventSource: 'aws:dynamodb',
  }
  const dynamodb = {
    Keys: { id: { S: id } },
    StreamViewType: 'NEW_AND_OLD_IMAGES',
    SequenceNumber: faker.random.number({ min: 1, max: 999999 }).toString(),
    SizeBytes: faker.random.number({ min: 1, max: 999999 }),
  }
  const { marshall } = AWS.DynamoDB.Converter
  const marshalItem = partial(marshall, _, { convertEmptyValues: true })
  if (eventName === 'INSERT' || eventName === 'MODIFY') {
    if (!newImage) {
      throw new Error('`newImage` is required for INSERT or MODIFY events')
    }
    Object.assign(dynamodb, {
      NewImage: marshal ? marshalItem(newImage) : newImage,
    })
  }
  if (eventName === 'REMOVE' || eventName === 'MODIFY') {
    if (!oldImage) {
      throw new Error('`oldImage`is required for REMOVE or MODIFY events')
    }
    Object.assign(dynamodb, {
      OldImage: marshal ? marshalItem(oldImage) : oldImage,
    })
  }
  return Object.assign(base, { dynamodb })
}
