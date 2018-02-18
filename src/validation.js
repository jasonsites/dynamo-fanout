/**
 * @module validation
 * @overview application resource validation
 */
import Ajv from 'ajv'

import config from '../schemas/config.json'
import fanout from '../schemas/fanout-map-item.json'
import { ValidationError } from './errors'

export const inject = {
  name: 'validation',
}

export default function () {
  // create ajv instance
  const ajv = new Ajv({
    $data: true,
    coerceTypes: true,
    useDefaults: true,
  })

  // expose bound validation methods
  return {
    config: validate.bind(null, ajv, ajv.compile(config)),
    fanout: validate.bind(null, ajv, ajv.compile(fanout)),
  }
}

/**
 * Validate a value using a compiled json schema validation function
 * @param  {Object}   ajv - ajv instance
 * @param  {Function} fn  - compiled validation function
 * @param  {*}        val - value to validate
 * @return {Error}
 */
export function validate(ajv, fn, val) {
  const valid = fn(val)
  if (!valid) {
    return new ValidationError(ajv.errorsText(fn.errors))
  }
  return undefined
}
