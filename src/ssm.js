/**
 * @module ssm
 * @overview exposes underlying SSM client for test purposes
 */
import AWS from 'aws-sdk'

export const inject = {
  name: 'ssm',
  type: 'object',
}

export default new AWS.SSM()
