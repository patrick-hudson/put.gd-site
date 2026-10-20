// CloudFront Function (viewer request) for app.put.gd.
//
// Permanent download links:
//   /dl/stable/ubuntu24.04   -> 302 to the current stable DEB for Ubuntu 24.04
//   /dl/nightly/fedora44     -> 302 to the newest nightly RPM
//   /dl/stable/checksums     -> 302 to that release's SHA256SUMS
//   /dl/stable               -> 302 to the release page
//
// Targets live in the function's KeyValueStore, written by the deploy workflow
// from releases.json. Keys are "<channel>/<package>"; values are URLs.
// Anything else falls through to the site bucket, with "/" mapped to index.html.
import cf from 'cloudfront';

var kvs = cf.kvs();

async function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri === '' || uri === '/') {
    request.uri = '/index.html';
    return request;
  }

  if (uri.indexOf('/dl/') === 0) {
    var key = uri.slice(4).replace(/\/+$/, '');
    if (key.indexOf('/') === -1) {
      key = key + '/release';
    }
    try {
      var target = await kvs.get(key);
      return {
        statusCode: 302,
        statusDescription: 'Found',
        headers: {
          location: { value: target },
          'cache-control': { value: 'no-store' }
        }
      };
    } catch (err) {
      return {
        statusCode: 404,
        statusDescription: 'Not Found',
        headers: { 'content-type': { value: 'text/plain; charset=utf-8' } },
        body: 'No download is published under ' + uri + '. See https://github.com/patrick-hudson/put.gd-desktop/releases\n'
      };
    }
  }

  return request;
}
