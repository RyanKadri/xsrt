resource "aws_s3_bucket" "viewer-bucket" {
  bucket = "xsrt-viewer-${var.env}"
}

resource "aws_s3_bucket" "storage-bucket" {
  bucket = "xsrt-storage-${var.env}"
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_s3_bucket_policy" "viewer-bucket-policy" {
  bucket = aws_s3_bucket.viewer-bucket.bucket
  policy = data.aws_iam_policy_document.viewer_policy.json
}

resource "aws_s3_bucket_policy" "storage-bucket-policy" {
  bucket = aws_s3_bucket.storage-bucket.bucket
  policy = data.aws_iam_policy_document.storage_policy.json
}

resource "aws_cloudfront_origin_access_identity" "viewer-access" {
  comment = "Used by cloudfront to access XSRT static assets"
}

data "aws_iam_policy_document" "viewer_policy" {
  statement {
    actions = ["s3:GetObject"]
    effect = "Allow"
    resources = [
      "${aws_s3_bucket.viewer-bucket.arn}/*"
    ]
    principals {
      identifiers = [
        aws_cloudfront_origin_access_identity.viewer-access.iam_arn
      ]
      type = "AWS"
    }
  }
}

data "aws_iam_policy_document" "storage_policy" {
  statement {
    actions = ["s3:GetObject"]
    effect = "Allow"
    resources = [
      "${aws_s3_bucket.storage-bucket.arn}/*"
    ]
    principals {
      identifiers = [
        aws_cloudfront_origin_access_identity.viewer-access.iam_arn
      ]
      type = "AWS"
    }
  }
}

resource "aws_cloudfront_distribution" "viewer-dist" {
  enabled = true
  aliases = ["viewer-${var.env}.xsrt-app.com"]
  comment = "CDN for XSRT viewer site"
  default_root_object = "index.html"
  http_version = "http2"
  is_ipv6_enabled = true
  price_class = "PriceClass_All"
  default_cache_behavior {
    allowed_methods = ["GET", "HEAD"]
    cached_methods = ["GET", "HEAD"]
    target_origin_id = "S3-xsrt-viewer"
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  origin {
    domain_name = aws_s3_bucket.viewer-bucket.bucket_domain_name
    origin_id = "S3-xsrt-viewer"
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.viewer-access.cloudfront_access_identity_path
    }
  }
  ordered_cache_behavior {
    allowed_methods = ["GET", "HEAD"]
    cached_methods = ["GET", "HEAD"]
    path_pattern = "/index.html"
    target_origin_id = "S3-xsrt-viewer"
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    min_ttl = 0
    max_ttl = 0
    default_ttl = 0
  }
  custom_error_response {
    error_code = 404
    error_caching_min_ttl = 60
    response_code = 200
    response_page_path = "/index.html"
  }
  custom_error_response {
    error_code = 403
    error_caching_min_ttl = 60
    response_code = 200
    response_page_path = "/index.html"
  }
  viewer_certificate {
    minimum_protocol_version = "TLSv1.2_2018"
    ssl_support_method = "sni-only"
    acm_certificate_arn = data.aws_acm_certificate.wildcard-cert.arn
  }
  tags = {
    Name = "viewer-distribution"
  }
}

resource "aws_cloudfront_distribution" "xsrt-storage-dist" {
  enabled = true
  aliases = ["storage-${var.env}.xsrt-app.com"]
  comment = "CDN for XSRT viewer static assets"
  http_version = "http2"
  is_ipv6_enabled = true
  price_class = "PriceClass_All"
  default_cache_behavior {
    allowed_methods = ["GET", "HEAD"]
    cached_methods = ["GET", "HEAD"]
    target_origin_id = "S3-xsrt-storage"
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  origin {
    domain_name = aws_s3_bucket.storage-bucket.bucket_domain_name
    origin_id = "S3-xsrt-storage"
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.viewer-access.cloudfront_access_identity_path
    }
  }
  ordered_cache_behavior {
    allowed_methods = ["GET", "HEAD"]
    cached_methods = ["GET", "HEAD"]
    path_pattern = "/index.html"
    target_origin_id = "S3-xsrt-storage"
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }
  viewer_certificate {
    minimum_protocol_version = "TLSv1.2_2018"
    ssl_support_method = "sni-only"
    acm_certificate_arn = data.aws_acm_certificate.wildcard-cert.arn
  }
  tags = {
    Name = "storage-distribution"
  }
}
