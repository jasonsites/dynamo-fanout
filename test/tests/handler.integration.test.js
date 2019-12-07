import Bluebird from 'bluebird'
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import faker from 'faker'
import { describe, it } from 'mocha'
import sinon from 'sinon'

import { handler } from '../../src'
import container from '../../src/container'
import { MalformedEventError } from '../../src/errors'
import { generateDynamoRecord } from '../fixtures/dynamo'
import { bootstrap } from '../utils'

chai.use(chaiAsPromised)

const DYNAMO_TABLE = 'test-table-name'

describe('[INTEGRATION] handler', function () {
  const sandbox = sinon.sandbox.create()
  this.timeout(10000)

  before(async function () {
    await bootstrap()
    this.kinesis = await container.load('kinesis')
  })

  afterEach(function () {
    sandbox.restore()
  })

  describe('failure scenarios', function () {
    it('fails (error) on invalid dynamo stream message', function () {
      const e = { Records: 'should-fail' }
      return expect(Bluebird.fromCallback((done) => handler(e, {}, done)))
        .to.be.rejectedWith(MalformedEventError)
    })

    it('fails (no op) on records not originating from dynamo', function () {
      const recordId = faker.random.uuid()
      const newImage = { id: recordId }
      const record = generateDynamoRecord({
        id: recordId,
        newImage,
        table: DYNAMO_TABLE,
      })
      record.eventSource = 'should-fail'
      const e = { Records: [record] }
      return expect(Bluebird.fromCallback((done) => handler(e, {}, done)))
        .to.eventually.deep.equal({ n: 0 })
    })

    it('fails (no op) on invalid record (StreamViewType)', function () {
      const recordId = faker.random.uuid()
      const newImage = { id: recordId }
      const record = generateDynamoRecord({
        id: recordId,
        newImage,
        table: DYNAMO_TABLE,
      })
      record.dynamodb.StreamViewType = 'should-fail'
      const e = { Records: [record] }
      return expect(Bluebird.fromCallback((done) => handler(e, {}, done)))
        .to.eventually.deep.equal({ n: 0 })
    })
  })

  describe('success scenarios', function () {
    it('writes unmarshalled dynamo data to kinesis (INSERT)', function () {
      const stub = sandbox.stub(this.kinesis.client, 'putRecords').returns({
        promise: sandbox.stub().resolves({ FailedRecordCount: 0 }),
      })
      const recordId = faker.random.uuid()
      const newImage = {
        id: recordId,
        prop1: faker.lorem.word(),
        prop2: faker.random.boolean(),
        requestId: faker.random.uuid(),
      }
      const record = generateDynamoRecord({
        id: recordId,
        newImage,
        table: DYNAMO_TABLE,
      })
      const e = { Records: [record] }
      return Bluebird.fromCallback((done) => handler(e, {}, done))
        .then(() => {
          const { Data, PartitionKey } = stub.lastCall.args[0].Records[0]
          expect(PartitionKey).to.equal(recordId)
          const data = JSON.parse(Data.toString())
          expect(data).to.be.an('object')
            .with.all.keys(['awsRegion', 'dynamodb', 'eventID', 'eventName', 'eventSource', 'eventSourceARN', 'eventVersion'])
          const {
            awsRegion,
            dynamodb,
            eventID,
            eventName,
            eventSource,
            eventSourceARN,
            eventVersion,
          } = data
          expect(awsRegion).to.equal(record.awsRegion)
          expect(eventID).to.equal(record.eventID)
          expect(eventName).to.equal(record.eventName)
          expect(eventSource).to.equal(record.eventSource)
          expect(eventSourceARN).to.equal(record.eventSourceARN)
          expect(eventVersion).to.equal(record.eventVersion)
          expect(dynamodb).to.be.an('object')
            .with.all.keys(['Keys', 'NewImage', 'SequenceNumber', 'SizeBytes', 'StreamViewType'])
          const { Keys, NewImage, SequenceNumber, SizeBytes, StreamViewType } = dynamodb
          expect(Keys).to.deep.equal(record.dynamodb.Keys)
          expect(SequenceNumber).to.equal(record.dynamodb.SequenceNumber)
          expect(SizeBytes).to.equal(record.dynamodb.SizeBytes)
          expect(StreamViewType).to.equal(record.dynamodb.StreamViewType)
          expect(NewImage).to.be.an('object')
            .with.all.keys(['id', 'prop1', 'prop2', 'requestId'])
          const { id, prop1, prop2, requestId } = NewImage
          expect(id).to.equal(recordId)
          expect(prop1).to.equal(newImage.prop1)
          expect(prop2).to.equal(newImage.prop2)
          expect(requestId).to.equal(newImage.requestId)
        })
    })

    it('writes unmarshalled dynamo data to kinesis (MODIFY)', function () {
      const stub = sandbox.stub(this.kinesis.client, 'putRecords').returns({
        promise: sandbox.stub().resolves({ FailedRecordCount: 0 }),
      })
      const recordId = faker.random.uuid()
      const oldImage = {
        id: recordId,
        prop1: faker.lorem.word(),
        prop2: faker.random.boolean(),
        requestId: faker.random.uuid(),
      }
      const newImage = {
        id: recordId,
        prop1: faker.lorem.word(),
        prop2: faker.random.boolean(),
        requestId: faker.random.uuid(),
      }
      const record = generateDynamoRecord({
        eventName: 'MODIFY',
        id: recordId,
        newImage,
        oldImage,
        table: DYNAMO_TABLE,
      })
      const e = { Records: [record] }
      return Bluebird.fromCallback((done) => handler(e, {}, done))
        .then(() => {
          const { Data, PartitionKey } = stub.lastCall.args[0].Records[0]
          expect(PartitionKey).to.equal(recordId)
          const data = JSON.parse(Data.toString())
          expect(data).to.be.an('object')
            .with.all.keys(['awsRegion', 'dynamodb', 'eventID', 'eventName', 'eventSource', 'eventSourceARN', 'eventVersion'])
          const {
            awsRegion,
            dynamodb,
            eventID,
            eventName,
            eventSource,
            eventSourceARN,
            eventVersion,
          } = data
          expect(awsRegion).to.equal(record.awsRegion)
          expect(eventID).to.equal(record.eventID)
          expect(eventName).to.equal(record.eventName)
          expect(eventSource).to.equal(record.eventSource)
          expect(eventSourceARN).to.equal(record.eventSourceARN)
          expect(eventVersion).to.equal(record.eventVersion)
          expect(dynamodb).to.be.an('object')
            .with.all.keys(['Keys', 'NewImage', 'OldImage', 'SequenceNumber', 'SizeBytes', 'StreamViewType'])
          const { Keys, NewImage, OldImage, SequenceNumber, SizeBytes, StreamViewType } = dynamodb
          expect(Keys).to.deep.equal(record.dynamodb.Keys)
          expect(NewImage).to.be.an('object')
            .with.all.keys(['id', 'prop1', 'prop2', 'requestId'])
          const { id: newId, prop1: newProp1, prop2: newProp2, requestId: newRequestId } = NewImage
          expect(newId).to.equal(recordId)
          expect(newProp1).to.equal(newImage.prop1)
          expect(newProp2).to.equal(newImage.prop2)
          expect(newRequestId).to.equal(newImage.requestId)
          expect(OldImage).to.be.an('object')
            .with.all.keys(['id', 'prop1', 'prop2', 'requestId'])
          const { id: oldId, prop1: oldProp1, prop2: oldProp2, requestId: oldRequestId } = OldImage
          expect(oldId).to.equal(recordId)
          expect(oldProp1).to.equal(oldImage.prop1)
          expect(oldProp2).to.equal(oldImage.prop2)
          expect(oldRequestId).to.equal(oldImage.requestId)
          expect(SequenceNumber).to.equal(record.dynamodb.SequenceNumber)
          expect(SizeBytes).to.equal(record.dynamodb.SizeBytes)
          expect(StreamViewType).to.equal(record.dynamodb.StreamViewType)
        })
    })

    it('writes unmarshalled dynamo data to kinesis (REMOVE)', function () {
      const stub = sandbox.stub(this.kinesis.client, 'putRecords').returns({
        promise: sandbox.stub().resolves({ FailedRecordCount: 0 }),
      })
      const recordId = faker.random.uuid()
      const oldImage = {
        id: recordId,
        prop1: faker.lorem.word(),
        prop2: faker.random.boolean(),
        requestId: faker.random.uuid(),
      }
      const record = generateDynamoRecord({
        eventName: 'REMOVE',
        id: recordId,
        oldImage,
        table: DYNAMO_TABLE,
      })
      const e = { Records: [record] }
      return Bluebird.fromCallback((done) => handler(e, {}, done))
        .then(() => {
          const { Data, PartitionKey } = stub.lastCall.args[0].Records[0]
          expect(PartitionKey).to.equal(recordId)
          const data = JSON.parse(Data.toString())
          expect(data).to.be.an('object')
            .with.all.keys(['awsRegion', 'dynamodb', 'eventID', 'eventName', 'eventSource', 'eventSourceARN', 'eventVersion'])
          const {
            awsRegion,
            dynamodb,
            eventID,
            eventName,
            eventSource,
            eventSourceARN,
            eventVersion,
          } = data
          expect(awsRegion).to.equal(record.awsRegion)
          expect(eventID).to.equal(record.eventID)
          expect(eventName).to.equal(record.eventName)
          expect(eventSource).to.equal(record.eventSource)
          expect(eventSourceARN).to.equal(record.eventSourceARN)
          expect(eventVersion).to.equal(record.eventVersion)
          expect(dynamodb).to.be.an('object')
            .with.all.keys(['Keys', 'OldImage', 'SequenceNumber', 'SizeBytes', 'StreamViewType'])
          const { Keys, OldImage, SequenceNumber, SizeBytes, StreamViewType } = dynamodb
          expect(Keys).to.deep.equal(record.dynamodb.Keys)
          expect(OldImage).to.be.an('object')
            .with.all.keys(['id', 'prop1', 'prop2', 'requestId'])
          const { id, prop1, prop2, requestId } = OldImage
          expect(id).to.equal(recordId)
          expect(prop1).to.equal(oldImage.prop1)
          expect(prop2).to.equal(oldImage.prop2)
          expect(requestId).to.equal(oldImage.requestId)
          expect(SequenceNumber).to.equal(record.dynamodb.SequenceNumber)
          expect(SizeBytes).to.equal(record.dynamodb.SizeBytes)
          expect(StreamViewType).to.equal(record.dynamodb.StreamViewType)
        })
    })
  })
})
