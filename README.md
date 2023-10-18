# mediapackage-wrapper-lambda-edge

## Prerequisites
* Install [Node.js](https://nodejs.org/en)
* Install [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* Install [AWS CDK Toolkit](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html)

## Run
```
$ git clone https://github.com/kuu/mediapackage-wrapper-lambda-edge.git
$ cd mediapackage-wrapper-lambda-edge
Edit lib/medipackage-wrapper-lambda-edge-stack.ts
==> Replace the value of HLS_ENDPOINT_URL with your MediaPackage endpoint
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
