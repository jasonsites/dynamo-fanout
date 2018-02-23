/**
 * @file index.js
 * @overview application entrypoint
 */
import 'source-map-support/register'

import container from './container'

export const MODULES = {
  etl: 'etl',
  log: 'log',
}

/**
 * Lambda event handler that processes dynamo stream records
 * @param {Object} e      - lambda event
 * @param {Object} ctx    - lambda context
 * @param {Function} done - lambda callback
 */
export async function handler(e, ctx, done) {
  const modules = await container.load(MODULES)
  const log = modules.log.child({ req_id: ctx.awsRequestId })
  try {
    const result = await modules.etl.processEvent(e, log)
    log.info({ result })
    done(null, result)
  } catch (err) {
    log.error(err)
    done(err)
  }
}
