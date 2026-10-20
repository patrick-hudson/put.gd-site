variable "region" {
  description = "Region for the site bucket. The uploads bucket is in us-east-2, so the site bucket is too."
  type        = string
  default     = "us-east-2"
}

variable "domain" {
  description = "Host name the landing page is served on."
  type        = string
  default     = "app.put.gd"
}

variable "zone_name" {
  description = "Existing Route 53 hosted zone that holds the domain."
  type        = string
  default     = "put.gd."
}

variable "bucket_name" {
  description = "Private bucket that holds the site files; only CloudFront reads it."
  type        = string
  default     = "putgd-site"
}

variable "github_repository" {
  description = "GitHub repository allowed to assume the deploy role through OIDC."
  type        = string
  default     = "patrick-hudson/put.gd-site"
}

variable "github_environment" {
  description = "GitHub Actions environment the deploy job runs in."
  type        = string
  default     = "production"
}

variable "uploads_distribution_id" {
  description = "The existing put.gd distribution in front of the uploads bucket. The deploy role may invalidate it, for the day its root is routed to this site."
  type        = string
  default     = "E2UO5E3WJ8BRV9"
}

variable "extra_reader_distribution_arns" {
  description = "Other CloudFront distributions allowed to read the site bucket (the put.gd distribution once its root serves the page)."
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Tags on every resource."
  type        = map(string)
  default     = { project = "put.gd-site" }
}
