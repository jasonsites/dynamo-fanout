import { expect } from 'chai'
import faker from 'faker'
import { describe, it } from 'mocha'

import dynamo from '../../src/dynamo'

describe('[UNIT] dynamo', function () {
  it('parsePartitionKey (default) should fallback to dynamo key concatenation', async function () {
    const d = await dynamo({ kinesis: { partition: { delimiter: '', mode: 'keys' } } })
    const id = faker.random.uuid()
    const ts = new Date().toISOString()
    const record = {
      dynamodb: {
        Keys: {
          id: {
            S: id,
          },
          ts: {
            S: ts,
          },
        },
      },
    }

    const key = d.parsePartitionKey(record)
    expect(key).to.equal(`${id}-${ts}`)
  })

  it('parsePartitionKey (first) should error if paths are missing', async function () {
    let err
    try {
      await dynamo({ kinesis: { partition: { delimiter: '', mode: 'first' } } })
    } catch (e) {
      err = e
    }

    expect(() => { throw err }).to.throw('missing required \'partitionPaths\'')
  })

  it('parsePartitionKey (first) should use error if no paths are defined', async function () {
    const d = await dynamo({
      kinesis: {
        partition: {
          delimiter: '',
          mode: 'first',
          paths: [
            'dynamodb.NewImage.id',
            'dynamodb.OldImage.id',
          ],
        },
      },
    })
    const id = faker.random.uuid()
    const record = {
      dynamodb: {
        OldImage: {
          partition: id,
        },
      },
    }
    expect(d.parsePartitionKey.bind(null, record)).to.throw('no partition paths matched')
  })

  it('parsePartitionKey (first) should use the first defined path', async function () {
    const d = await dynamo({
      kinesis: {
        partition: {
          delimiter: '',
          mode: 'first',
          paths: [
            'dynamodb.NewImage.partition',
            'dynamodb.OldImage.partition',
          ],
        },
      },
    })
    const id = faker.random.uuid()
    const record = {
      dynamodb: {
        OldImage: {
          partition: id,
        },
      },
    }
    const key = d.parsePartitionKey(record)
    expect(key).to.equal(id)
  })

  it('parsePartitionKey (concat) should error if paths are missing', async function () {
    let err
    try {
      await dynamo({ kinesis: { partition: { delimiter: '', mode: 'concat' } } })
    } catch (e) {
      err = e
    }

    expect(() => { throw err }).to.throw('missing required \'partitionPaths\'')
  })

  it('parsePartitionKey (concat) should use error if no paths are defined', async function () {
    const d = await dynamo({
      kinesis: {
        partition: {
          delimiter: '',
          mode: 'concat',
          paths: [
            'dynamodb.NewImage.id',
            'dynamodb.OldImage.id',
          ],
        },
      },
    })
    const id = faker.random.uuid()
    const record = {
      dynamodb: {
        NewImage: {
          partition: id,
        },
        OldImage: {
          partition: id,
        },
      },
    }
    expect(d.parsePartitionKey.bind(null, record)).to.throw('unable to concatenate')
  })

  it('parsePartitionKey (concat) should use the first defined path', async function () {
    const d = await dynamo({
      kinesis: {
        partition: {
          delimiter: '',
          mode: 'concat',
          paths: [
            'dynamodb.OldImage.partition',
            'dynamodb.OldImage.ts',
          ],
        },
      },
    })
    const id = faker.random.uuid()
    const ts = new Date().toISOString()
    const record = {
      dynamodb: {
        OldImage: {
          partition: id,
          ts,
        },
      },
    }
    const key = d.parsePartitionKey(record)
    expect(key).to.equal(`${id}${ts}`)
  })
})
