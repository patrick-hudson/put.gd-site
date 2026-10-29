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

# The repository uses GitHub's immutable OIDC subject, so the token's "sub" carries the owner and
# repository ids: repo:OWNER@OWNER_ID/REPO@REPO_ID:environment:NAME. Read them with
# `gh api users/patrick-hudson -q .id` and `gh api repos/patrick-hudson/put.gd-site -q .id`.
variable "github_owner_id" {
  description = "Numeric id of the GitHub account that owns the repository."
  type        = number
  default     = 5728403
}

variable "github_repository_id" {
  description = "Numeric id of the GitHub repository."
  type        = number
  default     = 1426482917
}

variable "github_environment" {
  description = "GitHub Actions environment the deploy job runs in."
  type        = string
  default     = "production"
}

variable "pkg_domain" {
  description = "Host name the package repositories, update feed and Flatpak repo are served on."
  type        = string
  default     = "pkg.put.gd"
}

variable "pkg_bucket_name" {
  description = "Private bucket that holds the package repositories; only CloudFront reads it."
  type        = string
  default     = "putgd-pkg"
}

variable "tags" {
  description = "Tags on every resource."
  type        = map(string)
  default     = { project = "put.gd-site" }
}

variable "map_domain" {
  description = "Host name the put.gd-desktop surface map is served on."
  type        = string
  default     = "map.put.gd"
}

variable "map_bucket_name" {
  description = "Private bucket behind map.put.gd; only CloudFront reads it."
  type        = string
  default     = "putgd-map"
}

variable "desktop_repository" {
  description = "GitHub repository whose nightly workflow publishes the surface map."
  type        = string
  default     = "patrick-hudson/put.gd-desktop"
}

# `gh api repos/patrick-hudson/put.gd-desktop -q .id`
variable "desktop_repository_id" {
  description = "Numeric id of the desktop repository, for its immutable OIDC subject."
  type        = number
  default     = 1409524888
}
