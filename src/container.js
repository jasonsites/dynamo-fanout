/**
 * @file container.js
 * @overview application di/ioc container
 */
import Container from 'app-container'

import * as config from './config'
import * as dynamo from './dynamo'
import * as etl from './etl'
import * as kinesis from './kinesis'
import * as log from './log'
import * as ssm from './ssm'
import * as validation from './validation'

// define modules
const modules = [
  config,
  dynamo,
  etl,
  kinesis,
  log,
  ssm,
  validation,
]

// instantiate new DI container
const container = new Container({
  namespace: 'inject',
  defaults: { singleton: true },
})

// register modules
modules.forEach(m => container.register(m, m.inject.name, m.inject))

export default container
