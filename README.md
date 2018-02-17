# lambda-fanout
lambda fanout for dynamo/kinesis streams

## Installation
```shell
# clone the repo and install dependencies
$ git clone git@github.com:jasonsites/lambda-fanout.git
$ cd lambda-fanout && npm i
```

## Testing
**Run full test suite with code coverage:** *(requires [Docker v1.12+ and Compose v1.7+](https://store.docker.com/search?type=edition&offering=community))*
```shell
$ docker-compose run lambda-fanout
```

## Contribute
1. Clone it (`git clone git@github.com:jasonsites/lambda-fanout.git`)
1. Create your feature branch (`git checkout -b my-new-feature`)
1. Commit your changes using [conventional changelog standards](https://github.com/bcoe/conventional-changelog-standard/blob/master/convention.md) (`git commit -am 'feat(US1234): adds my new feature'`)
1. Push to the branch (`git push origin my-new-feature`)
1. Ensure linting/security/tests are all passing
1. Create new Pull Request

## Release
1. Merge fixes & features to master
1. Run lint check `npm run lint`
1. Run security check `npm run sec`
1. Run full test suite `docker-compose run lambda-fanout`
1. Run release script `npm run release`
1. Push release & release tag to github `git push --follow-tags`
1. [Publish new release](https://help.github.com/articles/creating-releases/) in github, using the release notes from the [CHANGELOG](./CHANGELOG.md)

## Configuration

## License
Copyright (c) 2018 Jason Sites

Licensed under the [MIT License](LICENSE.md)
