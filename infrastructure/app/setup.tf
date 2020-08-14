provider "aws" {
  version = "~> 3.0"
  region  = "us-east-2"
}

provider "aws" {
  version = "~> 3.0"
  region = "us-east-1"
  alias = "us-east-1"
}

//provider "postgresql" {
//  database_username = aws_rds_cluster.xsrt-main.master_username
//  password = aws_rds_cluster.xsrt-main.master_password
//  host = aws_rds_cluster.xsrt-main.endpoint
//}

terraform {
  backend "s3" {
    bucket = "xsrt-iac"
    key = "terraform/terraform.tfstate"
    region = "us-east-2"
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_region" "stack-region" {
  provider = aws
}

data "aws_caller_identity" "current" {}

data aws_acm_certificate wildcard-cert {
  domain = "*.xsrt-app.com"
  statuses = ["ISSUED"]
  provider = aws.us-east-1
}

data aws_acm_certificate wildcard-regional-cert {
  domain = "*.xsrt-app.com"
  statuses = ["ISSUED"]
}
