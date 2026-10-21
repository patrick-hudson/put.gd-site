# Download permalinks: "<channel>/<package>" -> URL, written by tools/update-kvs.py at deploy time.
resource "aws_cloudfront_key_value_store" "downloads" {
  name    = "putgd-site-downloads"
  comment = "put.gd download permalinks: <channel>/<package> -> URL"
}

# "/" -> index.html and "/dl/..." -> 302 to the current asset. Same file the workflow lints.
resource "aws_cloudfront_function" "router" {
  name    = "putgd-site-router"
  runtime = "cloudfront-js-2.0"
  comment = "app.put.gd: / -> index.html, /dl/<channel>/<package> -> current release asset"
  publish = true
  code    = file("${path.module}/../cloudfront/download-redirect.js")

  key_value_store_associations = [aws_cloudfront_key_value_store.downloads.arn]
}

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "putgd-site"
  description                       = "put.gd landing site bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_response_headers_policy" "security_headers" {
  name = "Managed-SecurityHeadersPolicy"
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  comment             = "app.put.gd landing site"
  aliases             = [var.domain]
  default_root_object = "index.html"
  http_version        = "http2and3"
  is_ipv6_enabled     = true
  price_class         = "PriceClass_100"

  origin {
    origin_id                = "site"
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  # Update feed v1 (put.gd-desktop #293): the package signer writes update/v1/<channel>.json and
  # its .minisig to the pkg bucket only after the apt and dnf repositories carry the release, so
  # the URL phase 1 builds read now comes from there.
  origin {
    origin_id                = "pkg"
    domain_name              = aws_s3_bucket.pkg.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.pkg.id
  }

  ordered_cache_behavior {
    path_pattern               = "/update/*"
    target_origin_id           = "pkg"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = data.aws_cloudfront_cache_policy.caching_optimized.id
    response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security_headers.id
  }

  # AppImage .zsync permalinks (put.gd-desktop #293 phase 3, #297): the package signer writes
  # dl/<channel>/appimage.zsync to the pkg bucket only after it has mirrored the image the .zsync
  # names (pkg.put.gd/releases/<tag>/), so AppImageUpdate, Gear Lever and put.gd's own updater never
  # get a .zsync whose image isn't there. The object is served directly, without the router's 302.
  ordered_cache_behavior {
    path_pattern               = "/dl/*/appimage.zsync"
    target_origin_id           = "pkg"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = false
    cache_policy_id            = data.aws_cloudfront_cache_policy.caching_optimized.id
    response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security_headers.id
  }

  default_cache_behavior {
    target_origin_id           = "site"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = data.aws_cloudfront_cache_policy.caching_optimized.id
    response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security_headers.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.router.arn
    }
  }

  # A missing key comes back from S3 as 403 when the bucket cannot be listed; show the 404 page for both.
  dynamic "custom_error_response" {
    for_each = [403, 404]
    content {
      error_code            = custom_error_response.value
      response_code         = 404
      response_page_path    = "/404.html"
      error_caching_min_ttl = 60
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.site.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}
