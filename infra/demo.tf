# demo.put.gd: the destination the site's screenshots upload to. The app on the lab desktops
# uploads through the putgd-demo-uploader user (ACL "omit"); CloudFront serves the private
# bucket through OAC, so the links in the screenshots are real. Objects expire after 30 days.

resource "aws_s3_bucket" "demo" {
  bucket = var.demo_bucket_name
}

resource "aws_s3_bucket_ownership_controls" "demo" {
  bucket = aws_s3_bucket.demo.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_public_access_block" "demo" {
  bucket                  = aws_s3_bucket.demo.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "demo" {
  bucket = aws_s3_bucket.demo.id

  rule {
    id     = "expire-demo-uploads"
    status = "Enabled"
    filter {}

    expiration {
      days = 30
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 2
    }
  }
}

data "aws_iam_policy_document" "demo_bucket" {
  statement {
    sid       = "AllowCloudFrontRead"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.demo.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.demo.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "demo" {
  bucket = aws_s3_bucket.demo.id
  policy = data.aws_iam_policy_document.demo_bucket.json

  depends_on = [aws_s3_bucket_public_access_block.demo]
}

resource "aws_acm_certificate" "demo" {
  provider          = aws.us_east_1
  domain_name       = var.demo_domain
  validation_method = "DNS"
  key_algorithm     = "EC_prime256v1"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "demo_validation" {
  for_each = {
    for option in aws_acm_certificate.demo.domain_validation_options : option.domain_name => {
      name   = option.resource_record_name
      type   = option.resource_record_type
      record = option.resource_record_value
    }
  }

  zone_id = data.aws_route53_zone.zone.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 300
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "demo" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.demo.arn
  validation_record_fqdns = [for record in aws_route53_record.demo_validation : record.fqdn]
}

resource "aws_cloudfront_origin_access_control" "demo" {
  name                              = "putgd-demo"
  description                       = "put.gd demo destination bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "demo" {
  enabled         = true
  comment         = "demo.put.gd demo uploads"
  aliases         = [var.demo_domain]
  http_version    = "http2and3"
  is_ipv6_enabled = true
  price_class     = "PriceClass_100"

  origin {
    origin_id                = "demo"
    domain_name              = aws_s3_bucket.demo.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.demo.id
  }

  default_cache_behavior {
    target_origin_id           = "demo"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = data.aws_cloudfront_cache_policy.caching_optimized.id
    response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security_headers.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.demo.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

resource "aws_route53_record" "demo" {
  for_each = toset(["A", "AAAA"])

  zone_id = data.aws_route53_zone.zone.zone_id
  name    = var.demo_domain
  type    = each.key

  alias {
    name                   = aws_cloudfront_distribution.demo.domain_name
    zone_id                = aws_cloudfront_distribution.demo.hosted_zone_id
    evaluate_target_health = false
  }
}

# The app signs in as this user. Its access key is created by hand and kept only in the lab
# desktops' keychains, never in state. It can write, read back and delete objects, nothing else.
resource "aws_iam_user" "demo_uploader" {
  name = "putgd-demo-uploader"
}

data "aws_iam_policy_document" "demo_uploader" {
  statement {
    sid = "Objects"
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObject",
      "s3:AbortMultipartUpload",
      "s3:ListMultipartUploadParts",
    ]
    resources = ["${aws_s3_bucket.demo.arn}/*"]
  }

  statement {
    sid       = "Bucket"
    actions   = ["s3:ListBucket", "s3:ListBucketMultipartUploads", "s3:GetBucketVersioning"]
    resources = [aws_s3_bucket.demo.arn]
  }
}

resource "aws_iam_user_policy" "demo_uploader" {
  name   = "upload-demo"
  user   = aws_iam_user.demo_uploader.name
  policy = data.aws_iam_policy_document.demo_uploader.json
}
