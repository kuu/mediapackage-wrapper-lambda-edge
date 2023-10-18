# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template


## Prerequisites
* Install [Node.js](https://nodejs.org/en)
* Install [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* Install [AWS CDK Toolkit](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html)

## Run
```
$ git clone https://github.com/kuu/mediapackage-wrapper-lambda-edge.git
$ cd mediapackage-wrapper-lambda-edge
Edit lib/medipackage-wrapper-lambda-edge-stack.ts
==> Replace the value of HLS_ENDPOINT_URL
$ npm install
$ npm run build
$ cdk synthesize
$ cdk deploy --all
```
The following AWS resources will be deployed:
* CloudFront distribution
* Lambda function

## Outputs
```
MedipackageWrapperLambdaEdgeStack.CloudFrontDistributionHLS = <<HLS endpoint URL>>
MedipackageWrapperLambdaEdgeStack.CloudFrontDistributionId = <<CloudFront distribution ID>>
```
Playback the URL and check if the manifest is manipulated.
