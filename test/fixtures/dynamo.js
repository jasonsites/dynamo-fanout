import AWS from 'aws-sdk'
import faker from 'faker'
import _, { partial, range } from 'lodash'

const awsRegion = 'us-west-2'

export function generateAccount() {
  return range(10).map(() => faker.random.number({ min: 0, max: 9 })).join('')
}

/**
 * Generates a mock dynamo record
 * @param  {String}  params.eventName - event name
 * @param  {Boolean} params.marshal   - determines if data should be marshalled
 * @param  {Object}  params.record    - record data
 * @param  {String}  params.table     - dynamo table name
 * @return {Object}
 */
export function generateDynamoRecord({
  eventName = 'INSERT',
  marshal = true,
  record,
  table,
}) {
  const account = generateAccount()
  const base = {
    eventID: faker.random.number({ min: 1, max: 999999 }).toString(),
    eventVersion: '1.0',
    awsRegion,
    eventName,
    eventSourceARN: `arn:aws:dynamodb:${awsRegion}:${account}:table/${table}`,
    eventSource: 'aws:dynamodb',
  }
  const dynamodb = {
    Keys: { id: { S: record.id } },
    StreamViewType: 'NEW_AND_OLD_IMAGES',
    SequenceNumber: faker.random.number({ min: 1, max: 999999 }).toString(),
    SizeBytes: faker.random.number({ min: 1, max: 999999 }),
  }
  const { marshall } = AWS.DynamoDB.Converter
  const marshalItem = partial(marshall, _, { convertEmptyValues: true })
  if (eventName === 'REMOVE') {
    Object.assign(dynamodb, {
      OldImage: marshal ? marshalItem(record) : record,
    })
  } else {
    Object.assign(dynamodb, {
      NewImage: marshal ? marshalItem(record) : record,
    })
  }
  return Object.assign(base, { dynamodb })
}
