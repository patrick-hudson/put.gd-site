terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.80"
    }
  }

  # Dedicated, versioned state bucket; locking uses S3's own lock file, so no DynamoDB table.
  backend "s3" {
    bucket       = "putgd-site-terraform-state"
    key          = "site/terraform.tfstate"
    region       = "us-east-2"
    use_lockfile = true
    encrypt      = true
  }
}

# The site bucket lives next to the uploads bucket in us-east-2.
provider "aws" {
  region = var.region
  default_tags { tags = var.tags }
}

# CloudFront only accepts certificates from us-east-1.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
  default_tags { tags = var.tags }
}
