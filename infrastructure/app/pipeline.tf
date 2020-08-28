locals {
  api-env = [
    {
      name = "ASSET_BUCKET",
      value = aws_s3_bucket.storage-bucket.bucket
    },
    {
      name = "AWS_REGION",
      value = data.aws_region.stack-region.name
    },
    {
      name = "DB_HOST",
      value = aws_route53_record.db-record.name
    },
    {
      name = "DB_USER",
      value = "xsrt"
    },
    {
      name = "ELASTIC_HOST",
      value = "https://${aws_elasticsearch_domain.xsrt-elastic.endpoint}"
    },
    {
      name = "FRONTEND_HOST"
      value = "https://${aws_route53_record.viewer-frontend.fqdn}"
    },
    {
      name = "STATIC_HOST"
      value = "https://${aws_route53_record.storage-dist.fqdn}"
    },
    {
      name = "RAW_CHUNK_QUEUE",
      value = aws_sqs_queue.raw-chunks-queue.id
    },
    {
      name = "SNAPSHOT_QUEUE",
      value = aws_sqs_queue.snapshot-queue.id
    },
    {
      name = "ELASTIC_QUEUE",
      value = aws_sqs_queue.elastic-queue.id
    },
    {
      name = "USE_S3",
      value = "true"
    },
    {
      name = "USE_SQS",
      value = "true"
    },
    {
      name = "DB_PASSWORD",
      value = data.aws_ssm_parameter.db-pass.name
    },
    {
      name = "TASK_DEF_FAMILY",
      value = aws_ecs_task_definition.api-task.family
    },
    {
      name = "TASK_ROLE",
      value = aws_iam_role.xsrt-services.arn
    },
    {
      name = "EXECUTION_ROLE",
      value = aws_iam_role.xsrt-builder.arn
    }
  ]
}

data "aws_ssm_parameter" "github-token" {
  name = "github-token"
  with_decryption = true
}

resource "aws_s3_bucket" "pipeline-bucket" {
  bucket = "xsrt-pipeline-${var.env}"
}

resource "aws_codebuild_project" "xsrt-api-build" {
  name = "xsrt-api-${var.env}"
  service_role = aws_iam_role.xsrt-builder.arn

  source {
    type = "GITHUB"
    location = "https://github.com/RyanKadri/xsrt"
    git_clone_depth = 1
    buildspec = "infrastructure/pipeline/ecs-buildspec.yml"
    auth {
      type = "OAUTH"
    }
  }

  source_version = "master"

  vpc_config {
    security_group_ids = [aws_security_group.xsrt-services.id]
    subnets = aws_subnet.xsrt-private.*.id
    vpc_id = aws_vpc.main-vpc.id
  }

  artifacts {
    type = "NO_ARTIFACTS"
  }

  cache {
    type = "LOCAL"
    modes = ["LOCAL_DOCKER_LAYER_CACHE", "LOCAL_SOURCE_CACHE"]
  }

  logs_config {
    cloudwatch_logs {
      group_name = "/xsrt/build/${var.env}"
      stream_name = "api-build"
      status = "ENABLED"
    }
  }

  environment {
    compute_type = "BUILD_GENERAL1_SMALL"
    image = "aws/codebuild/standard:4.0"
    type = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode = true

    environment_variable {
      name = "DEFAULT_AWS_REGION"
      value = data.aws_region.stack-region.name
    }
    environment_variable {
      name = "IMAGE_REPO"
      value = "xsrt/api"
    }
    environment_variable {
      name = "AWS_ACCOUNT_ID"
      value = data.aws_caller_identity.current.account_id
    }
    environment_variable {
      name = "DOCKER_TARGET"
      value = "api"
    }
    environment_variable {
      name = "TASK_CONTAINER_NAME"
      value = "api"
    }
    environment_variable {
      name = "PRIVATE_SUBNETS"
      value = jsonencode(aws_subnet.xsrt-private.*.id)
    }
    environment_variable {
      name = "API_SECURITY_GROUPS"
      value = jsonencode([aws_security_group.xsrt-public-api.id])
    }
    dynamic "environment_variable" {
      for_each = local.api-env
      content {
        name = environment_variable.value.name
        value = environment_variable.value.value
      }
    }
  }

}

resource "aws_codebuild_project" "xsrt-decorators-build" {
  name = "xsrt-decorators-${var.env}"
  service_role = aws_iam_role.xsrt-builder.arn

  source {
    type = "GITHUB"
    location = "https://github.com/RyanKadri/xsrt"
    git_clone_depth = 1
    buildspec = "infrastructure/pipeline/ecs-buildspec.yml"
    auth {
      type = "OAUTH"
    }
  }

  source_version = "master"

  vpc_config {
    security_group_ids = [aws_security_group.xsrt-services.id]
    subnets = aws_subnet.xsrt-private.*.id
    vpc_id = aws_vpc.main-vpc.id
  }

  artifacts {
    type = "NO_ARTIFACTS"
  }

  cache {
    type = "LOCAL"
    modes = ["LOCAL_DOCKER_LAYER_CACHE", "LOCAL_SOURCE_CACHE"]
  }

  logs_config {
    cloudwatch_logs {
      group_name = "/xsrt/build/${var.env}"
      stream_name = "decorators-build"
      status = "ENABLED"
    }
  }

  environment {
    compute_type = "BUILD_GENERAL1_SMALL"
    image = "aws/codebuild/standard:4.0"
    type = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode = true

    environment_variable {
      name = "DEFAULT_AWS_REGION"
      value = data.aws_region.stack-region.name
    }
    environment_variable {
      name = "IMAGE_REPO"
      value = "xsrt/decorators"
    }
    environment_variable {
      name = "AWS_ACCOUNT_ID"
      value = data.aws_caller_identity.current.account_id
    }
    environment_variable {
      name = "DOCKER_TARGET"
      value = "decorators"
    }
    environment_variable {
      name = "TASK_CONTAINER_NAME"
      value = "decorators"
    }
    environment_variable {
      name = "PRIVATE_SUBNETS"
      value = jsonencode(aws_subnet.xsrt-private.*.id)
    }
    environment_variable {
      name = "API_SECURITY_GROUPS"
      value = jsonencode([aws_security_group.xsrt-services.id])
    }
    dynamic "environment_variable" {
      for_each = local.api-env
      content {
        name = environment_variable.value.name
        value = environment_variable.value.value
      }
    }
  }

}

resource "aws_codebuild_project" "xsrt-viewer-build" {
  name = "xsrt-viewer-${var.env}"
  service_role = aws_iam_role.xsrt-builder.arn

  source {
    type = "GITHUB"
    location = "https://github.com/RyanKadri/xsrt"
    git_clone_depth = 1
    buildspec = "infrastructure/pipeline/ui-buildspec.yml"
    auth {
      type = "OAUTH"
    }
  }

  source_version = "master"

  artifacts {
    type = "NO_ARTIFACTS"
  }

  cache {
    type = "LOCAL"
    modes = ["LOCAL_SOURCE_CACHE"]
  }

  logs_config {
    cloudwatch_logs {
      group_name = "/xsrt/build/${var.env}"
      stream_name = "viewer-build"
      status = "ENABLED"
    }
  }

  environment {
    compute_type = "BUILD_GENERAL1_SMALL"
    image = "aws/codebuild/standard:4.0"
    type = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"

    environment_variable {
      name = "API_HOST"
      value = "https://${aws_route53_record.api.fqdn}"
    }

    environment_variable {
      name = "STATIC_HOST"
      value = "https://${aws_route53_record.storage-dist.fqdn}"
    }
  }

}

resource "aws_codedeploy_app" "api" {
  name = "xsrt-api-${var.env}"
  compute_platform = "ECS"
}

resource "aws_codedeploy_deployment_group" "api" {
  app_name = aws_codedeploy_app.api.name
  deployment_group_name = "xsrt-api-${var.env}-dg"
  service_role_arn = aws_iam_role.xsrt-builder.arn
  deployment_config_name = "CodeDeployDefault.ECSAllAtOnce"

  auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE"]
  }

  blue_green_deployment_config {
    deployment_ready_option {
      action_on_timeout = "CONTINUE_DEPLOYMENT"
    }
    terminate_blue_instances_on_deployment_success {
      action = "TERMINATE"
      termination_wait_time_in_minutes = 5
    }
  }

  deployment_style {
    deployment_option = "WITH_TRAFFIC_CONTROL"
    deployment_type   = "BLUE_GREEN"
  }

  ecs_service {
    cluster_name = aws_ecs_cluster.api-cluster.name
    service_name = aws_ecs_service.api-service.name
  }

  load_balancer_info {
    target_group_pair_info {
      prod_traffic_route {
        listener_arns = [aws_alb_listener.api-listener.arn]
      }

      target_group {
        name = aws_alb_target_group.api-tg.name
      }

      target_group {
        name = aws_alb_target_group.api-tg-beta.name
      }
    }
  }
}

resource "aws_codepipeline" "xsrt-api" {
  lifecycle {
    ignore_changes = [stage[0].action[0].configuration]
  }
  name = "xsrt-api-${var.env}"
  role_arn = aws_iam_role.xsrt-builder.arn
  artifact_store {
    location = aws_s3_bucket.pipeline-bucket.bucket
    type = "S3"
  }
  stage {
    name = "Source"
    action {
      name = "Source"
      category = "Source"
      owner = "ThirdParty"
      provider = "GitHub"
      version = "1"
      output_artifacts = ["source_output"]
      configuration = {
        Owner = "RyanKadri"
        Repo = "xsrt"
        Branch = "master"
        OAuthToken = data.aws_ssm_parameter.github-token.value
      }
    }
  }
  stage {
    name = "Build"
    action {
      category = "Build"
      name = "BuildAPI"
      owner = "AWS"
      provider = "CodeBuild"
      input_artifacts = ["source_output"]
      output_artifacts = ["build_output"]
      version = "1"
      configuration = {
        ProjectName = aws_codebuild_project.xsrt-api-build.name
      }
    }
    action {
      category = "Build"
      name = "BuildUI"
      owner = "AWS"
      provider = "CodeBuild"
      input_artifacts = ["source_output"]
      output_artifacts = ["ui_output"]
      version = "1"
      configuration = {
        ProjectName = aws_codebuild_project.xsrt-viewer-build.name
      }
    }
    action {
      category = "Build"
      name = "BuildDecorators"
      owner = "AWS"
      provider = "CodeBuild"
      input_artifacts = ["source_output"]
      output_artifacts = ["decorators_output"]
      version = "1"
      configuration = {
        ProjectName = aws_codebuild_project.xsrt-decorators-build.name
      }
    }
  }
  stage {
    name = "Deploy"
    action {
      category = "Deploy"
      name = "DeployAPI"
      owner = "AWS"
      provider = "CodeDeployToECS"
      version = "1"
      input_artifacts = ["build_output"]
      configuration = {
        ApplicationName = aws_codedeploy_app.api.name
        DeploymentGroupName = aws_codedeploy_deployment_group.api.deployment_group_name
        TaskDefinitionTemplateArtifact = "build_output"
        TaskDefinitionTemplatePath = "api-taskdef.json"
        AppSpecTemplateArtifact = "build_output"
        AppSpecTemplatePath = "api-appspec.yml"
        Image1ArtifactName = "build_output"
        Image1ContainerName = "API_IMAGE_NAME"
      }
    }
    action {
      category = "Deploy"
      name = "DeployDecorators"
      owner = "AWS"
      provider = "ECS"
      version = "1"
      input_artifacts = ["decorators_output"]
      configuration = {
        ClusterName = aws_ecs_cluster.background-cluster.name
        ServiceName = aws_ecs_service.decorators-service.name
        FileName = "imagedefinitions.json"
      }
    }
    action {
      category = "Deploy"
      name = "DeployUI"
      owner = "AWS"
      provider = "S3"
      version = "1"
      input_artifacts = ["ui_output"]
      configuration = {
        BucketName = aws_s3_bucket.viewer-bucket.bucket
        Extract = true
      }
    }
  }
}
