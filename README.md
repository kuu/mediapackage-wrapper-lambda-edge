# mediapackage-wrapper-lambda-edge
* This AWS CDK app deploys a CloudFront distribution with a Lambda@Edge function.
* The app accepts a MediaPackage HLS endpoint URL.
* The Lambda@Edge function manipulates the HLS playlist fetched from the URL.
* #EXT-X-START tag will be added to the HLS playlist.

## Prerequisites
* Install [Node.js](https://nodejs.org/en)
* Install [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* Install [AWS CDK Toolkit](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html)

## Run
```
$ git clone https://github.com/kuu/mediapackage-wrapper-lambda-edge.git
$ cd mediapackage-wrapper-lambda-edge
$ npm install
$ (cd handlers/manipulate-manifest/ ; npm install)
Edit lib/medipackage-wrapper-lambda-edge-stack.ts
==> Replace the value of HLS_ENDPOINT_URL with your MediaPackage endpoint
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

## Clean up
```
$ cdk destroy --all
```
