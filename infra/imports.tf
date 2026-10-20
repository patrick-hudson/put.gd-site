# The resources were first created by hand on 2026-10-20. These import blocks let the
# first `terraform plan` adopt them instead of creating duplicates. They are inert once
# the resources are in state and can be deleted after the first apply.

import {
  to = aws_acm_certificate.site
  id = "arn:aws:acm:us-east-1:626193791566:certificate/3d7240e0-b74c-4ef6-a9f2-b330143aaa76"
}

import {
  to = aws_route53_record.validation["app.put.gd"]
  id = "Z3VEAD5PHPVT9M__d822616db2b7e35d0463fcb63f0b3728.app.put.gd._CNAME"
}

import {
  to = aws_route53_record.site["A"]
  id = "Z3VEAD5PHPVT9M_app.put.gd_A"
}

import {
  to = aws_route53_record.site["AAAA"]
  id = "Z3VEAD5PHPVT9M_app.put.gd_AAAA"
}

import {
  to = aws_s3_bucket.site
  id = "putgd-site"
}

import {
  to = aws_s3_bucket_ownership_controls.site
  id = "putgd-site"
}

import {
  to = aws_s3_bucket_public_access_block.site
  id = "putgd-site"
}

import {
  to = aws_s3_bucket_policy.site
  id = "putgd-site"
}

import {
  to = aws_cloudfront_key_value_store.downloads
  id = "putgd-site-downloads"
}

import {
  to = aws_cloudfront_function.router
  id = "putgd-site-router"
}

import {
  to = aws_cloudfront_origin_access_control.site
  id = "EBKCHF27EOCA1"
}

import {
  to = aws_cloudfront_distribution.site
  id = "EP85P0MVCKASG"
}

import {
  to = aws_iam_role.deploy
  id = "putgd-site-deploy"
}

import {
  to = aws_iam_role_policy.deploy
  id = "putgd-site-deploy:deploy-site"
}
