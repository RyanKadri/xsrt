resource "aws_s3_bucket" "pipeline-bucket" {
  bucket = "xsrt-pipeline-${var.env}"

}

//resource "aws_codebuild_project" "xsrt-api-build" {
//  name = "xsrt-api-${var.env}"
//  service_role = ""
//  artifacts {
//    type = ""
//  }
//  environment {
//    compute_type = ""
//    image = ""
//    type = ""
//  }
//  source {
//    type = ""
//  }
//}
