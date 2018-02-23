/**
 * @file errors.js
 * @overview application errors
 */
import ExtendableError from 'es6-error'

export class ConfigurationError extends ExtendableError { }

export class MalformedEventError extends ExtendableError { }

export class UnsupportedEventError extends ExtendableError {}

export class ValidationError extends ExtendableError { }
