/**
 * @file errors.js
 * @overview application errors
 */

/* eslint-disable max-classes-per-file */

import ExtendableError from 'es6-error'

export class ConfigurationError extends ExtendableError { }

export class MalformedEventError extends ExtendableError { }

export class ValidationError extends ExtendableError { }
