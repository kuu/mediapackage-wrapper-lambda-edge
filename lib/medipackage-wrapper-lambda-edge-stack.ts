import {
  Aws,
  Stack,
  StackProps,
  Duration,
  CfnOutput,
  aws_iam as iam,
  aws_lambda as lambda,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  Fn,
} from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from 'constructs';

const path = require("node:path");
const process = require('node:process');

const HLS_ENDPOINT_URL = "<< HLS endpoint URL>>";
// const DASH_ENDPOINT_URL = "<<DASH endpoint URL>>";

export class MedipackageWrapperLambdaEdgeStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Role to be used by MediaPackage for CDN Authorization
    const role4mediapackage = new iam.Role(this, "MyMediaPackageRole", {
        description: "A role to be assumed by MediaPackage",
        assumedBy: new iam.ServicePrincipal('mediapackage.amazonaws.com'),
        maxSessionDuration: Duration.hours(1),
    });

    // Create CloudFront distribution
    const cloudfront = new CloudFront(
      this,
      "MyCloudFrontDistribution",
      HLS_ENDPOINT_URL,
      // DASH_ENDPOINT_URL,
    );

    // Generating Cfn output
    new CfnOutput(this, "CloudFrontDistributionId", {
      value: cloudfront.myDistribId,
    });
    new CfnOutput(this, "CloudFrontDistribution-HLS", {
      value: cloudfront.hlsPlayback,
    });
    /*
    new CfnOutput(this, "CloudFrontDistribution-DASH", {
      value: cloudfront.dashPlayback,
    });
    */
  }
}

export class CloudFront extends Construct {
  // Public variables to export on CloudFormation
  public readonly hlsPlayback: string;
  // public readonly dashPlayback: string;
  public readonly myDistribId: string;
  public readonly myDistribHostname: string;

  // Private variable
  private readonly CDNHEADER = "MediaPackageCDNIdentifier"

  constructor(
    scope: Construct,
    id: string,
    hlsEndpoint: string,
    // dashEndpoint: string,
  ){
    super(scope, id);

    // EMP origin hostname
    const mediaPackageHostname = Fn.select(2, Fn.split("/", hlsEndpoint));

    // Create Origin Request Policy with CloudFront Header
    const myOriginRequestPolicy = new cloudfront.OriginRequestPolicy(this, 'OriginRequestPolicy',
        {
          originRequestPolicyName: `${Aws.STACK_NAME}Viewer-Country-City`,
          comment: "Policy to FWD CloudFront headers",
          headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList(
            "CloudFront-Viewer-Address",
            "CloudFront-Viewer-Country",
            "CloudFront-Viewer-City",
            "Referer",
            "User-Agent",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
          ),
          queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
        }
      );

    // Create EMP origin
    const mediaPackageOrigin = new origins.HttpOrigin(
        mediaPackageHostname,
        {
          originSslProtocols: [cloudfront.OriginSslPolicy.SSL_V3],
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
        }
    );

    // Create Lambda@Edge function
    const lambdaFunction = new cloudfront.experimental.EdgeFunction(this, "MyFunction", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join("./handlers/manipulate-manifest/")),
    });

    // Create CloudFront distribution
    const distribution = new cloudfront.Distribution(this, "Distribution", {
      comment: `${Aws.STACK_NAME} - CDK deployment Secure Media Delivery`,
      defaultRootObject: "",
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2016,
      defaultBehavior: {
        origin: mediaPackageOrigin,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        originRequestPolicy : myOriginRequestPolicy,
      },
      additionalBehaviors: {
        "*.m3u8": {
          origin: mediaPackageOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.ELEMENTAL_MEDIA_PACKAGE,
          originRequestPolicy : myOriginRequestPolicy,
          edgeLambdas : [{
            eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
            functionVersion: lambdaFunction.currentVersion,
            includeBody: false,
          }],
        },
      },
    });
  
    // Get EMP path
    const hlsPath = Fn.select(1, Fn.split("/out/", hlsEndpoint));
    // const dashPath = Fn.select(1, Fn.split("/out/", dashEndpoint));
    this.hlsPlayback = `https://${distribution.domainName}/out/${hlsPath}`;
    // this.dashPlayback = `https://${distribution.domainName}/out/${dashPath}`;

    this.myDistribId = distribution.distributionId;
    this.myDistribHostname = distribution.distributionDomainName;
  }  
}
