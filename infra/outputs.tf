output "distribution_id" {
  description = "CloudFront distribution for app.put.gd; with uploads_distribution_id it forms the CLOUDFRONT_DISTRIBUTION_IDS repository variable."
  value       = aws_cloudfront_distribution.site.id
}

output "distribution_domain" {
  value = aws_cloudfront_distribution.site.domain_name
}

output "deploy_role_arn" {
  description = "Goes in the AWS_DEPLOY_ROLE_ARN repository variable."
  value       = aws_iam_role.deploy.arn
}

output "key_value_store_arn" {
  description = "Goes in the CLOUDFRONT_KVS_ARN repository variable."
  value       = aws_cloudfront_key_value_store.downloads.arn
}

output "bucket" {
  description = "Goes in the SITE_BUCKET repository variable."
  value       = aws_s3_bucket.site.bucket
}

output "uploads_distribution_id" {
  description = "The put.gd distribution, whose root now serves the page."
  value       = aws_cloudfront_distribution.uploads.id
}

output "pkg_bucket" {
  description = "Bucket the package signer writes; goes in the signer's configuration."
  value       = aws_s3_bucket.pkg.bucket
}

output "pkg_distribution_id" {
  description = "CloudFront distribution for pkg.put.gd; the signer invalidates it."
  value       = aws_cloudfront_distribution.pkg.id
}

output "pkg_publish_role_arn" {
  description = "Role the package signer assumes (role_arn in its AWS profile)."
  value       = aws_iam_role.pkg_publish.arn
}

output "pkg_signer_user" {
  description = "IAM user whose hand-made access key the signer's source profile holds."
  value       = aws_iam_user.pkg_signer.name
}

output "demo_bucket" {
  description = "Bucket of the demo destination the site's screenshots upload to."
  value       = aws_s3_bucket.demo.bucket
}
