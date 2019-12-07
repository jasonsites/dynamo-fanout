# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.3.4](https://github.com/jasonsites/dynamo-fanout/compare/v0.3.3...v0.3.4) (2019-12-07)


### Bug Fixes

* **security:** updates packages to remove security vulnerabilities ([f3c4021](https://github.com/jasonsites/dynamo-fanout/commit/f3c4021eb7c969f1c021ad5f87239877c0b4f0f3))

### [0.3.3](https://github.com/jasonsites/dynamo-fanout/compare/v0.3.2...v0.3.3) (2019-07-16)


### Bug Fixes

* **security:** updates packages ([483200a](https://github.com/jasonsites/dynamo-fanout/commit/483200a))
* updates docker to install against node v10 ([6e279c2](https://github.com/jasonsites/dynamo-fanout/commit/6e279c2))
* **security:** updates packages to remove security vulnerabilities ([483ef07](https://github.com/jasonsites/dynamo-fanout/commit/483ef07))



<a name="0.3.2"></a>
## [0.3.2](https://github.com/jasonsites/dynamo-fanout/compare/v0.3.1...v0.3.2) (2018-09-13)


### Bug Fixes

* **terraform:** removes provider for terraform enterprise compatability ([31e85b1](https://github.com/jasonsites/dynamo-fanout/commit/31e85b1))



<a name="0.3.1"></a>
## [0.3.1](https://github.com/jasonsites/dynamo-fanout/compare/v0.3.0...v0.3.1) (2018-07-27)


### Bug Fixes

* removes `version` variable due to breaking changes in terraform 0.11 ([bcceb19](https://github.com/jasonsites/dynamo-fanout/commit/bcceb19))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/jasonsites/dynamo-fanout/compare/v0.2.6...v0.3.0) (2018-07-27)


### Features

* adds support for custom partition key logic ([49b03d1](https://github.com/jasonsites/dynamo-fanout/commit/49b03d1))



<a name="0.2.6"></a>
## [0.2.6](https://github.com/jasonsites/dynamo-fanout/compare/v0.2.5...v0.2.6) (2018-02-28)


### Bug Fixes

* removes Object.entries ([c7b2624](https://github.com/jasonsites/dynamo-fanout/commit/c7b2624))



<a name="0.2.5"></a>
## [0.2.5](https://github.com/jasonsites/dynamo-fanout/compare/v0.2.4...v0.2.5) (2018-02-28)


### Bug Fixes

* adds babel polyfills ([a090f3c](https://github.com/jasonsites/dynamo-fanout/commit/a090f3c))



<a name="0.2.4"></a>
## [0.2.4](https://github.com/jasonsites/dynamo-fanout/compare/v0.2.3...v0.2.4) (2018-02-28)


### Bug Fixes

* allows for aws region to be configured via user or environment ([919a6b6](https://github.com/jasonsites/dynamo-fanout/commit/919a6b6))



<a name="0.2.3"></a>
## [0.2.3](https://github.com/jasonsites/dynamo-fanout/compare/v0.2.2...v0.2.3) (2018-02-28)


### Bug Fixes

* refactors to catch module loading errors ([a098e29](https://github.com/jasonsites/dynamo-fanout/commit/a098e29))



<a name="0.2.2"></a>
## [0.2.2](https://github.com/jasonsites/dynamo-fanout/compare/v0.2.1...v0.2.2) (2018-02-28)


### Bug Fixes

* adds terraform managed ssm parameter for target kinesis stream name ([2cd9510](https://github.com/jasonsites/dynamo-fanout/commit/2cd9510))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/jasonsites/dynamo-fanout/compare/v0.2.0...v0.2.1) (2018-02-23)


### Bug Fixes

* adds additional terraform outputs for `function_role_arn` and `function_role_name` ([d024262](https://github.com/jasonsites/dynamo-fanout/commit/d024262))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/jasonsites/dynamo-fanout/compare/v0.1.1...v0.2.0) (2018-02-23)


### Bug Fixes

* **dynamo:** allows for dynamic hash and range keys ([4e6b257](https://github.com/jasonsites/dynamo-fanout/commit/4e6b257))
* **etl:** refactors to handle batch writes to kinesis ([ee229c6](https://github.com/jasonsites/dynamo-fanout/commit/ee229c6))


### Features

* **terraform:** adds initial terraform configuration files ([8b10539](https://github.com/jasonsites/dynamo-fanout/commit/8b10539))



<a name="0.1.1"></a>
## [0.1.1](https://github.com/jasonsites/dynamo-fanout/compare/v0.1.0...v0.1.1) (2018-02-19)


### Bug Fixes

* refactors for noop at the individual record level ([839783e](https://github.com/jasonsites/dynamo-fanout/commit/839783e))



<a name="0.1.0"></a>
# 0.1.0 (2018-02-19)
