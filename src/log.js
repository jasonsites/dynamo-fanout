/**
 * @module log
 * @overview application logging provider
 */
import createLogger from 'bunyan'

import { name, version } from '../package.json'

export const inject = {
  name: 'log',
  require: ['config'],
}

export const log = createLogger({ name, version })

export default function (config) {
  const { log: { level } } = config
  if (level) log.level(level)
  return log
}
