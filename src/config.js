/**
 * @module config
 * @overview encrypted configuration provider
 */
import ssmConfig from '@cludden/ssm-config'

export const inject = {
  name: 'config',
  require: ['ssm', 'validation'],
}

export default async function (ssm, validation) {
  const prefix = process.env.CONFIG_PREFIX.split(',')
  const validate = (c) => {
    const err = validation.config(c)
    if (err instanceof Error) throw err
  }
  return ssmConfig({ prefix, ssm, validate })
}
