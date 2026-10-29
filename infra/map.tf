# map.put.gd: the put.gd-desktop surface map, a static page of every surface and interaction
# of the app coloured by acceptance coverage (put.gd-desktop tools/lab/surface_map). The
# desktop repository's nightly workflow renders it from the published nightly's UI catalog and
# syncs it here through the putgd-map-publish role; CloudFront serves the private bucket
# through OAC, like pkg.put.gd.

resource "aws_s3_bucket" "map" {
  bucket = var.map_bucket_name
}

resource "aws_s3_bucket_ownership_controls" "map" {
  bucket = aws_s3_bucket.map.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_public_access_block" "map" {
  bucket                  = aws_s3_bucket.map.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# A broken render can be rolled back to the previous nightly's page for two weeks.
resource "aws_s3_bucket_versioning" "map" {
  bucket = aws_s3_bucket.map.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "map" {
  bucket = aws_s3_bucket.map.id

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

  depends_on = [aws_s3_bucket_versioning.map]
}

data "aws_iam_policy_document" "map_bucket" {
  statement {
    sid       = "AllowCloudFrontRead"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.map.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.map.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "map" {
  bucket = aws_s3_bucket.map.id
  policy = data.aws_iam_policy_document.map_bucket.json

  depends_on = [aws_s3_bucket_public_access_block.map]
}

resource "aws_acm_certificate" "map" {
  provider          = aws.us_east_1
  domain_name       = var.map_domain
  validation_method = "DNS"
  key_algorithm     = "EC_prime256v1"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "map_validation" {
  for_each = {
    for option in aws_acm_certificate.map.domain_validation_options : option.domain_name => {
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

resource "aws_acm_certificate_validation" "map" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.map.arn
  validation_record_fqdns = [for record in aws_route53_record.map_validation : record.fqdn]
}

resource "aws_cloudfront_origin_access_control" "map" {
  name                              = "putgd-map"
  description                       = "put.gd surface map bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Caching follows each object's Cache-Control, which the nightly workflow sets: the page and
# its data get five minutes and an invalidation on every publish, the pictures are hashed by
# content and immutable. No access logging.
resource "aws_cloudfront_distribution" "map" {
  enabled             = true
  comment             = "map.put.gd surface map"
  aliases             = [var.map_domain]
  default_root_object = "index.html"
  http_version        = "http2and3"
  is_ipv6_enabled     = true
  price_class         = "PriceClass_100"

  origin {
    origin_id                = "map"
    domain_name              = aws_s3_bucket.map.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.map.id
  }

  default_cache_behavior {
    target_origin_id           = "map"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = data.aws_cloudfront_cache_policy.caching_optimized.id
    response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security_headers.id
  }

  # A missing key comes back from S3 as 403 when the bucket cannot be listed; browsers expect
  # 404. The workflow uploads /404.html.
  custom_error_response {
    error_code            = 403
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 60
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.map.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

resource "aws_route53_record" "map" {
  for_each = toset(["A", "AAAA"])

  zone_id = data.aws_route53_zone.zone.zone_id
  name    = var.map_domain
  type    = each.key

  alias {
    name                   = aws_cloudfront_distribution.map.domain_name
    zone_id                = aws_cloudfront_distribution.map.hosted_zone_id
    evaluate_target_health = false
  }
}

# put.gd-desktop's nightly workflow (scheduled on its default branch, nightly) assumes this
# role through the shared GitHub OIDC provider. The subject uses GitHub's immutable form, as
# the site's own deploy role does.
locals {
  desktop_subject_repo = format("%s@%d/%s@%d",
    split("/", var.desktop_repository)[0], var.github_owner_id,
  split("/", var.desktop_repository)[1], var.desktop_repository_id)
}

data "aws_iam_policy_document" "map_publish_trust" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${local.desktop_subject_repo}:ref:refs/heads/nightly"]
    }
  }
}

resource "aws_iam_role" "map_publish" {
  name                 = "putgd-map-publish"
  description          = "put.gd-desktop's nightly workflow publishes the surface map to map.put.gd"
  max_session_duration = 3600
  assume_role_policy   = data.aws_iam_policy_document.map_publish_trust.json
}

data "aws_iam_policy_document" "map_publish" {
  statement {
    sid       = "ListMap"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.map.arn]
  }

  statement {
    sid       = "WriteMap"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.map.arn}/*"]
  }

  statement {
    sid       = "Invalidate"
    actions   = ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation"]
    resources = [aws_cloudfront_distribution.map.arn]
  }
}

resource "aws_iam_role_policy" "map_publish" {
  name   = "publish-map"
  role   = aws_iam_role.map_publish.id
  policy = data.aws_iam_policy_document.map_publish.json
}
