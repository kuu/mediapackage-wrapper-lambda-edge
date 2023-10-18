import fetch from 'node-fetch'; // For making a request to the origin
import * as HLS from 'hls-parser'; // For reading/writing the HLS manifest

export const handler = async event => {
  // Extract the data from the origin request
  const {uri, querystring, headers: requestHeaders, origin} = event.Records[0].cf.request;
  const {protocol, domainName, port} = origin.custom;

  // Build a request URL and request headers
  const requestUri = `${protocol}://${domainName}:${port}${uri}${querystring}`;
  // console.log(`Request URL: ${requestUri}`);
  const headers = {};
  for (const k of Object.keys(requestHeaders)) {
    const {key, value} = requestHeaders[k];
    headers[key] = value;
  }

  // Define an empty responce
  const response = {
    body: '',
    bodyEncoding: 'text',
    headers: {
      'content-type': [
        {
          key: 'Content-Type',
          value: 'text/plain'
        },
      ],
    },
    status: '200',
  };

  // Make an origin request
  const res = await fetch(requestUri, {headers});
  if (res.ok) {
    // Parse the HLS manifest
    const playlist = HLS.parse(await res.text());
    // Add #EXT-X-START tag
    response.body = HLS.stringify(Object.assign(playlist, {start: {offset: -15.015}}));
    // Add HTTP headers
    response.headers['content-type'] = [{key: 'Content-Type', value: res.headers.get('content-type')}];
    response.headers['date'] = [{key: 'Date', value: res.headers.get('date')}];
    response.headers['cache-control'] = [{key: 'Cache-Control', value: res.headers.get('cache-control')}];
    response.headers['access-control-allow-origin'] = [{key: 'Access-Control-Allow-Origin', value: res.headers.get('access-control-allow-origin')}];
    response.headers['access-control-allow-credentials'] = [{key: 'Access-Control-Allow-Credentials', value: res.headers.get('access-control-allow-credentials')}];
    response.headers['vary'] = [{key: 'Vary', value: res.headers.get('vary')}];
    response.headers['x-mediapackage-manifest-last-sequence'] = [{key: 'X-MediaPackage-Manifest-Last-Sequence', value: res.headers.get('x-mediapackage-manifest-last-sequence')}];
    response.headers['x-mediapackage-manifest-last-updated'] = [{key: 'X-MediaPackage-Manifest-Last-Updated', value: res.headers.get('x-mediapackage-manifest-last-updated')}];
    response.headers['x-mediapackage-request-id'] = [{key: 'X-MediaPackage-Request-Id', value: res.headers.get('x-mediapackage-request-id')}];
  } else {
    response.body = `${res.status} ${res.statusText}\n${requestUri}`;
  }

  // Return response
  return response;
};
