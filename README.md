# dynamo-fanout
Lambda function to fan out DynamoDB stream messages to Kinesis streams

DynamoDB Streams should have no more than 2 attached processes per shard to avoid throttling. This lambda function acts as a DynamoDB Streams consumer that first unmarshalls the NewImage/OldImage data from the stream record, then writes the result to Kinesis.

## Installation
Clone the repo and install dependencies
```shell
$ git clone git@github.com:jasonsites/dynamo-fanout.git
$ cd dynamo-fanout && npm i
```

## Testing
**Run full test suite with code coverage:** *(requires [Docker v1.12+ and Compose v1.7+](https://store.docker.com/search?type=edition&offering=community))*
```shell
$ docker-compose run dynamo-fanout
```

## Contribute
1. Clone it (`git clone git@github.com:jasonsites/dynamo-fanout.git`)
1. Create your feature branch (`git checkout -b my-new-feature`)
1. Commit your changes using [conventional changelog standards](https://github.com/bcoe/conventional-changelog-standard/blob/master/convention.md) (`git commit -am 'feat(US1234): adds my new feature'`)
1. Push to the branch (`git push origin my-new-feature`)
1. Ensure linting/security/tests are all passing
1. Create new Pull Request

## Release
1. Merge fixes & features to master
1. Run lint check `npm run lint`
1. Run security check `npm run sec`
1. Run full test suite `docker-compose run dynamo-fanout`
1. Run release script `npm run release`
1. Push release & release tag to github `git push --follow-tags`
1. [Publish new release](https://help.github.com/articles/creating-releases/) in github, using the release notes from the [CHANGELOG](./CHANGELOG.md)

## License
Copyright (c) 2018 Jason Sites

Licensed under the [MIT License](LICENSE.md)
