import sinon from 'sinon'

import container from '../../src/container'
import testConfig from '../fixtures/config'

/**
 * Bootstrap test environment
 * @return {Promise}
 */
export async function bootstrap() {
  console.log('Bootstrapping test environment...')
  await bootstrapConfig()
  console.log('Bootstrap test environment complete.')
}

/**
 * Stub underlying ssm module and force it to return test config
 * @return {Promise}
 */
export async function bootstrapConfig() {
  console.log('Bootstrapping config...')
  const ssm = await container.load('ssm')
  sinon.stub(ssm, 'getParametersByPath').returns({
    promise: sinon.stub().resolves(testConfig),
  })
  console.log('Bootstrap config complete.')
}
