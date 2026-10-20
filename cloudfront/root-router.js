// CloudFront Function (viewer request) for the put.gd distribution.
//
// put.gd serves every uploaded file by its key at the root, so only the bare
// root path may be taken over by the landing page. Everything else, including
// keys that happen to look like paths, keeps going to the uploads bucket.
//
// Attached to the default cache behavior; the "/_site/*" behavior points at the
// site bucket directly and needs no function.
function handler(event) {
  var request = event.request;
  if (request.uri === '' || request.uri === '/') {
    request.uri = '/index.html';
  }
  return request;
}
