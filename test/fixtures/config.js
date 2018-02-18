
const {
  AWS_REGION,
  CONFIG_PREFIX: prefix,
  DYNAMO_TABLE_ONE,
  DYNAMO_TABLE_TWO,
  KINESIS_STREAM_ONE,
  KINESIS_STREAM_TWO,
  LOG_LEVEL,
  NODE_ENV,
} = process.env

export const fanoutMap = {
  Parameter: {
    Name: `${prefix}/fanout/map`,
    Value: JSON.stringify({
      [DYNAMO_TABLE_ONE]: KINESIS_STREAM_ONE,
      [DYNAMO_TABLE_TWO]: KINESIS_STREAM_TWO,
    }),
  },
}

export default {
  Parameters: [
    fanoutMap.Parameter,
    {
      Name: `${prefix}/aws/region`,
      Value: AWS_REGION,
    },
    {
      Name: `${prefix}/log/level`,
      Value: LOG_LEVEL,
    },
    {
      Name: `${prefix}/node/env`,
      Value: NODE_ENV,
    },
  ],
}
