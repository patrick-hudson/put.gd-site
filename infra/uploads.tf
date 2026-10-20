# The original put.gd distribution: every uploaded file is served by its key at the root of
# this host, so it stays the default origin. Only the bare "/" (and the page's own files under
# /_site/) are routed to the site bucket: the default root object turns "/" into "/index.html",
# and the "/index.html" behavior sends that to the site bucket. (A viewer-request function
# rewrite cannot do this: it stays on the cache behavior it matched.) Imported on 2026-10-20
# exactly as it was; the blocks marked "landing page" are the additions.

resource "aws_cloudfront_distribution" "uploads" {
  enabled = true
  aliases = ["put.gd", "www.put.gd"]
  # Landing page.
  default_root_object = "index.html"
  http_version        = "http2"
  is_ipv6_enabled     = true
  price_class         = "PriceClass_100"

  # Uploads bucket, public-read objects, legacy S3 origin without OAI or OAC. The provider reads
  # the live origin's empty S3 config as none at all, so none is declared here.
  origin {
    origin_id   = "S3-put.gd"
    domain_name = "put.gd.s3.amazonaws.com"
  }

  # Landing page: the private site bucket through the same OAC app.put.gd uses.
  origin {
    origin_id                = "site"
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  default_cache_behavior {
    target_origin_id       = "S3-put.gd"
    viewer_protocol_policy = "allow-all"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

  }

  # Landing page: the page itself and its assets come from the site bucket.
  dynamic "ordered_cache_behavior" {
    for_each = ["/index.html", "/_site/*"]
    content {
      path_pattern               = ordered_cache_behavior.value
      target_origin_id           = "site"
      viewer_protocol_policy     = "redirect-to-https"
      allowed_methods            = ["GET", "HEAD"]
      cached_methods             = ["GET", "HEAD"]
      compress                   = true
      cache_policy_id            = data.aws_cloudfront_cache_policy.caching_optimized.id
      response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security_headers.id
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = "arn:aws:acm:us-east-1:626193791566:certificate/36eed588-e0ee-4002-a536-b8f1b6d98a6c"
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.1_2016"
  }
}

# www.put.gd was on the certificate and the distribution but had no DNS record.
resource "aws_route53_record" "www" {
  for_each = toset(["A", "AAAA"])

  zone_id = data.aws_route53_zone.zone.zone_id
  name    = "www.${trimsuffix(var.zone_name, ".")}"
  type    = each.key

  alias {
    name                   = aws_cloudfront_distribution.uploads.domain_name
    zone_id                = aws_cloudfront_distribution.uploads.hosted_zone_id
    evaluate_target_health = false
  }
}
