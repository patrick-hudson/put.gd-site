# pkg.put.gd: the signed apt and dnf repositories, the update feed and (later) the Flatpak repo
# (put.gd-desktop #293 phase 2, #83). A signer on a lab builder writes everything here through
# the putgd-pkg-publish role; CloudFront serves the private bucket through OAC.

resource "aws_s3_bucket" "pkg" {
  bucket = var.pkg_bucket_name
}

resource "aws_s3_bucket_ownership_controls" "pkg" {
  bucket = aws_s3_bucket.pkg.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_public_access_block" "pkg" {
  bucket                  = aws_s3_bucket.pkg.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# A bad sync can be rolled back to the previous objects for two weeks.
resource "aws_s3_bucket_versioning" "pkg" {
  bucket = aws_s3_bucket.pkg.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "pkg" {
  bucket = aws_s3_bucket.pkg.id

  rule {
    id     = "expire-replaced-objects"
    status = "Enabled"
    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 14
    }

    expiration {
      expired_object_delete_marker = true
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 2
    }
  }

  depends_on = [aws_s3_bucket_versioning.pkg]
}

# Only CloudFront reads the bucket: pkg.put.gd, and app.put.gd for /update/* once the feed moves.
data "aws_iam_policy_document" "pkg_bucket" {
  statement {
    sid       = "AllowCloudFrontRead"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.pkg.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.pkg.arn, aws_cloudfront_distribution.site.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "pkg" {
  bucket = aws_s3_bucket.pkg.id
  policy = data.aws_iam_policy_document.pkg_bucket.json

  depends_on = [aws_s3_bucket_public_access_block.pkg]
}

resource "aws_acm_certificate" "pkg" {
  provider          = aws.us_east_1
  domain_name       = var.pkg_domain
  validation_method = "DNS"
  key_algorithm     = "EC_prime256v1"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "pkg_validation" {
  for_each = {
    for option in aws_acm_certificate.pkg.domain_validation_options : option.domain_name => {
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

resource "aws_acm_certificate_validation" "pkg" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.pkg.arn
  validation_record_fqdns = [for record in aws_route53_record.pkg_validation : record.fqdn]
}

resource "aws_cloudfront_origin_access_control" "pkg" {
  name                              = "putgd-pkg"
  description                       = "put.gd package repository bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Caching follows each object's Cache-Control, which the signer sets: packages and hashed
# repodata are immutable, InRelease, repomd.xml and the feeds get five minutes and are
# invalidated on every publish. No access logging, as the privacy section of #293 states.
resource "aws_cloudfront_distribution" "pkg" {
  enabled         = true
  comment         = "pkg.put.gd package repositories"
  aliases         = [var.pkg_domain]
  http_version    = "http2and3"
  is_ipv6_enabled = true
  price_class     = "PriceClass_100"

  origin {
    origin_id                = "pkg"
    domain_name              = aws_s3_bucket.pkg.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.pkg.id
  }

  default_cache_behavior {
    target_origin_id           = "pkg"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = data.aws_cloudfront_cache_policy.caching_optimized.id
    response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security_headers.id
  }

  # A missing key comes back from S3 as 403 when the bucket cannot be listed; apt and dnf expect 404.
  custom_error_response {
    error_code            = 403
    response_code         = 404
    error_caching_min_ttl = 60
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.pkg.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

resource "aws_route53_record" "pkg" {
  for_each = toset(["A", "AAAA"])

  zone_id = data.aws_route53_zone.zone.zone_id
  name    = var.pkg_domain
  type    = each.key

  alias {
    name                   = aws_cloudfront_distribution.pkg.domain_name
    zone_id                = aws_cloudfront_distribution.pkg.hosted_zone_id
    evaluate_target_health = false
  }
}

# The signer on the lab builder signs in as this user, whose only right is to assume the
# publish role. Its access key is created by hand and kept on the builder, never in state.
resource "aws_iam_user" "pkg_signer" {
  name = "putgd-pkg-signer"
}

data "aws_iam_policy_document" "pkg_signer" {
  statement {
    sid       = "AssumePublishRole"
    actions   = ["sts:AssumeRole"]
    resources = [aws_iam_role.pkg_publish.arn]
  }
}

resource "aws_iam_user_policy" "pkg_signer" {
  name   = "assume-pkg-publish"
  user   = aws_iam_user.pkg_signer.name
  policy = data.aws_iam_policy_document.pkg_signer.json
}

data "aws_iam_policy_document" "pkg_publish_trust" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "AWS"
      identifiers = [aws_iam_user.pkg_signer.arn]
    }
  }
}

resource "aws_iam_role" "pkg_publish" {
  name                 = "putgd-pkg-publish"
  description          = "The put.gd package signer publishes repositories and feeds to pkg.put.gd"
  max_session_duration = 3600
  assume_role_policy   = data.aws_iam_policy_document.pkg_publish_trust.json
}

data "aws_iam_policy_document" "pkg_publish" {
  statement {
    sid       = "ListPkg"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.pkg.arn]
  }

  statement {
    sid       = "WritePkg"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.pkg.arn}/*"]
  }

  statement {
    sid     = "Invalidate"
    actions = ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation"]
    resources = [
      aws_cloudfront_distribution.pkg.arn,
      aws_cloudfront_distribution.site.arn,
    ]
  }
}

resource "aws_iam_role_policy" "pkg_publish" {
  name   = "publish-pkg"
  role   = aws_iam_role.pkg_publish.id
  policy = data.aws_iam_policy_document.pkg_publish.json
}
