output "distribution_id" {
  description = "CloudFront distribution for app.put.gd; goes in the CLOUDFRONT_DISTRIBUTION_IDS repository variable."
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
