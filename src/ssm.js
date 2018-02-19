/**
 * @module ssm
 * @overview ssm client
 */
import AWS from 'aws-sdk'

export const inject = {
  name: 'ssm',
  type: 'object',
}

/**
 * Configured ssm client
 * @class {AWS.SSM}
 */
export default new AWS.SSM()
