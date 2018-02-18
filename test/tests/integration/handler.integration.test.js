import Bluebird from 'bluebird'
import { expect } from 'chai'
import faker from 'faker'
// import { cloneDeep, extend, omit } from 'lodash'
import { describe, it } from 'mocha'
import sinon from 'sinon'

import { handler } from '../../../src'
import container from '../../../src/container'
import { generateDynamoRecord } from '../../fixtures/dynamo'
import { bootstrap } from '../../utils'

const {
  DYNAMO_TABLE_ONE,
  KINESIS_STREAM_ONE,
} = process.env

describe('[INTEGRATION] handler', function () {
  this.timeout(10000)

  before(async function () {
    await bootstrap()
    this.kinesis = await container.load('kinesis')
  })

  it('transforms to kinesis shape', function () {
    const stub = sinon.stub(this.kinesis.client, 'putRecord').returns({
      promise: sinon.stub().resolves(),
    })
    const entityId = faker.random.uuid()
    const entity = {
      id: entityId,
      prop1: 'prop1 value',
      prop2: true,
    }
    const record = generateDynamoRecord({
      record: entity,
      table: DYNAMO_TABLE_ONE,
    })
    const e = { Records: [record] }
    return Bluebird.fromCallback(done => handler(e, {}, done))
      .then(() => {
        const { Data, PartitionKey, StreamName } = stub.lastCall.args[0]
        expect(PartitionKey).to.equal(entityId)
        expect(StreamName).to.equal(KINESIS_STREAM_ONE)
        const data = JSON.parse(Data.toString())
        expect(data).to.be.an('object')
          .with.all.keys(['eventID', 'eventVersion', 'dynamodb', 'awsRegion', 'eventName', 'eventSourceARN', 'eventSource'])
        const {
          eventID,
          eventVersion,
          dynamodb,
          awsRegion,
          eventName,
          eventSourceARN,
          eventSource,
        } = data
        expect(eventID).to.equal(record.eventID)
        expect(eventVersion).to.equal(record.eventVersion)
        expect(awsRegion).to.equal(record.awsRegion)
        expect(eventName).to.equal(record.eventName)
        expect(eventSourceARN).to.equal(record.eventSourceARN)
        expect(eventSource).to.equal(record.eventSource)
        expect(dynamodb).to.be.an('object')
          .with.all.keys(['Keys', 'NewImage', 'StreamViewType', 'SequenceNumber', 'SizeBytes'])
        const { NewImage, StreamViewType, SequenceNumber, SizeBytes } = dynamodb
        expect(StreamViewType).to.equal(record.dynamodb.StreamViewType)
        expect(SequenceNumber).to.equal(record.dynamodb.SequenceNumber)
        expect(SizeBytes).to.equal(record.dynamodb.SizeBytes)
        expect(NewImage).to.be.an('object')
          .with.all.keys(['id', 'prop1', 'prop2'])
        const { id } = NewImage
        expect(id).to.equal(entityId)
      })
      .finally(() => stub.restore())
  })
})
