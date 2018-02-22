
const {
  AWS_REGION,
  CONFIG_PREFIX: prefix,
  KINESIS_TARGET,
  LOG_LEVEL,
  NODE_ENV,
} = process.env

export default {
  Parameters: [
    {
      Name: `${prefix}/aws/region`,
      Value: AWS_REGION,
    },
    {
      Name: `${prefix}/kinesis/target`,
      Value: KINESIS_TARGET,
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
