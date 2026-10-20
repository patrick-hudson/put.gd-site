# The GitHub OIDC provider already exists in the account and is shared with other repositories.
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

data "aws_caller_identity" "current" {}

locals {
  # owner@OWNER_ID/repo@REPO_ID, the immutable form GitHub puts in the OIDC subject for this repository.
  github_subject_repo = format("%s@%d/%s@%d",
    split("/", var.github_repository)[0], var.github_owner_id,
  split("/", var.github_repository)[1], var.github_repository_id)
}

data "aws_iam_policy_document" "deploy_trust" {
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
      values = [
        "repo:${local.github_subject_repo}:environment:${var.github_environment}",
        "repo:${local.github_subject_repo}:ref:refs/heads/main",
      ]
    }
  }
}

resource "aws_iam_role" "deploy" {
  name                 = "putgd-site-deploy"
  description          = "GitHub Actions deploys put.gd-site to S3 and CloudFront"
  max_session_duration = 3600
  assume_role_policy   = data.aws_iam_policy_document.deploy_trust.json
}

data "aws_iam_policy_document" "deploy" {
  statement {
    sid       = "ListSite"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.site.arn]
  }

  statement {
    sid       = "WriteSite"
    actions   = ["s3:PutObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]
  }

  statement {
    sid     = "Invalidate"
    actions = ["cloudfront:CreateInvalidation"]
    resources = [
      aws_cloudfront_distribution.site.arn,
      "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${var.uploads_distribution_id}",
    ]
  }

  statement {
    sid = "Permalinks"
    actions = [
      "cloudfront-keyvaluestore:DescribeKeyValueStore",
      "cloudfront-keyvaluestore:ListKeys",
      "cloudfront-keyvaluestore:GetKey",
      "cloudfront-keyvaluestore:UpdateKeys",
      "cloudfront-keyvaluestore:PutKey",
      "cloudfront-keyvaluestore:DeleteKey",
    ]
    resources = [aws_cloudfront_key_value_store.downloads.arn]
  }

  statement {
    sid       = "DescribeKvs"
    actions   = ["cloudfront:DescribeKeyValueStore"]
    resources = [aws_cloudfront_key_value_store.downloads.arn]
  }
}

resource "aws_iam_role_policy" "deploy" {
  name   = "deploy-site"
  role   = aws_iam_role.deploy.id
  policy = data.aws_iam_policy_document.deploy.json
}
