locals {
  region-account = "${data.aws_region.stack-region.name}:${data.aws_caller_identity.current.account_id}"
}

data "aws_iam_policy_document" "storage-policy-doc" {
  statement {
    effect = "Allow"
    actions = [
      "s3:DeleteObjectTagging",
      "s3:PutObject",
      "s3:GetObjectAcl",
      "s3:GetObject",
      "s3:GetObjectRetention",
      "s3:PutObjectRetention",
      "s3:DeleteObjectVersion",
      "s3:GetObjectVersionTagging",
      "s3:GetObjectTagging",
      "s3:ListBucket",
      "s3:PutObjectTagging",
      "s3:DeleteObject"
    ]
    resources = [
      aws_s3_bucket.storage-bucket.arn,
      "${aws_s3_bucket.storage-bucket.arn}/*"
    ]
  }
}

resource "aws_iam_policy" "xsrt-storage" {
  policy = data.aws_iam_policy_document.storage-policy-doc.json
  name = "xsrt-storage-${var.env}"
}

data "aws_iam_policy" "code-deploy-ecs" {
  arn = "arn:aws:iam::aws:policy/AWSCodeDeployRoleForECS"
}

data "aws_iam_policy_document" "xsrt-secrets" {
  statement {
    effect = "Allow"
    actions = [
      "ssm:GetParametersByPath",
      "ssm:GetParameters",
      "ssm:GetParameter"
    ]
    resources = [
      data.aws_ssm_parameter.db-pass.arn
    ]
  }
}

resource "aws_iam_policy" "xsrt-secrets" {
  name = "xsrt-secrets-${var.env}"
  policy = data.aws_iam_policy_document.xsrt-secrets.json
}

data "aws_iam_policy_document" "xsrt-queues" {
  statement {
    effect = "Allow"
    actions = [
      "sqs:DeleteMessage",
      "sqs:GetQueueUrl",
      "sqs:ChangeMessageVisibility",
      "sqs:SendMessageBatch",
      "sqs:ReceiveMessage",
      "sqs:SendMessage",
      "sqs:GetQueueAttributes",
      "sqs:ListQueueTags",
      "sqs:ListDeadLetterSourceQueues",
      "sqs:DeleteMessageBatch",
      "sqs:CreateQueue",
      "sqs:ChangeMessageVisibilityBatch",
      "sqs:SetQueueAttributes"
    ]
    resources = [
      aws_sqs_queue.raw-chunks-queue.arn,
      aws_sqs_queue.elastic-queue.arn,
      aws_sqs_queue.snapshot-queue.arn
    ]
  }
  statement {
    effect = "Allow"
    actions = [
      "sqs:ListQueues"
    ]
    resources = [
      "*"
    ]
  }
}

resource "aws_iam_policy" "xsrt-queues" {
  name = "xsrt-queues-${var.env}"
  policy = data.aws_iam_policy_document.xsrt-queues.json
}

data "aws_iam_policy_document" "xsrt-logging" {
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogDelivery",
      "logs:CreateLogStream",
      "logs:DescribeLogGroups",
      "logs:DescribeLogStreams",
      "logs:CreateLogGroup",
      "logs:GetLogDelivery",
      "logs:PutLogEvents",
      "logs:DescribeDestinations"
    ]
    resources = [
      "*"
    ]
  }
}

resource "aws_iam_policy" "xsrt-logging" {
  name = "xsrt-logging-${var.env}"
  policy = data.aws_iam_policy_document.xsrt-logging.json
}

data "aws_iam_policy_document" "xsrt-images" {
  statement {
    effect = "Allow"
    actions = [
      "ecr:DescribeImageScanFindings",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "ecr:DescribeImages",
      "ecr:DescribeRepositories",
      "ecr:ListTagsForResource",
      "ecr:ListImages",
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetRepositoryPolicy"
    ]
    resources = [
      aws_ecr_repository.api-repo.arn,
      aws_ecr_repository.decorators-repo.arn
    ]
  }
}

resource "aws_iam_policy" "xsrt-images" {
  name = "xsrt-images-${var.env}"
  policy = data.aws_iam_policy_document.xsrt-images.json
}

data "aws_iam_policy_document" "xsrt-container-builder" {
  statement {
    effect = "Allow"
    actions = [
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "ecr:CompleteLayerUpload",
      "ecr:DescribeImages",
      "ecr:UploadLayerPart",
      "ecr:InitiateLayerUpload",
      "ecr:BatchCheckLayerAvailability",
      "ecr:PutImage"
    ]
    resources = [
      aws_ecr_repository.api-repo.arn,
      aws_ecr_repository.decorators-repo.arn
    ]
  }
  statement {
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "xsrt-container-builder" {
  name = "xsrt-container-builder-${var.env}"
  policy = data.aws_iam_policy_document.xsrt-container-builder.json
}

data "aws_iam_policy_document" "xsrt-pipeline-bucket-access" {
  statement {
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObjectVersion",
      "s3:GetObjectVersionTagging",
      "s3:PutObjectVersionTagging",
      "s3:GetObjectTagging",
      "s3:PutObjectTagging",
      "s3:DeleteObject",
      "s3:GetBucketPolicy",
      "s3:GetObjectVersion"
    ]
    resources = [
      aws_s3_bucket.pipeline-bucket.arn,
      "${aws_s3_bucket.pipeline-bucket.arn}/*",
      aws_s3_bucket.viewer-bucket.arn,
      "${aws_s3_bucket.viewer-bucket.arn}/*"
    ]
  }
  statement {
    effect = "Allow"
    actions = ["s3:HeadBucket"]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "xsrt-pipeline-bucket-access" {
  name = "xsrt-pipeline-bucket-access-${var.env}"
  policy = data.aws_iam_policy_document.xsrt-pipeline-bucket-access.json
}

data "aws_iam_policy_document" "xsrt-pipeline-ecs-deploy" {
  statement {
    effect = "Allow"
    actions = [
      "codedeploy:GetDeploymentInstance",
      "codedeploy:CreateDeployment",
      "codedeploy:GetApplicationRevision",
      "codedeploy:GetDeploymentConfig",
      "ecs:StartTask",
      "ecs:RegisterContainerInstance",
      "codedeploy:CreateDeploymentConfig",
      "codedeploy:UpdateDeploymentGroup",
      "codedeploy:CreateDeploymentGroup",
      "ecs:UpdateService",
      "ecs:CreateService",
      "ecs:RunTask",
      "ecs:ListTasks",
      "ecs:StopTask",
      "ecs:DescribeServices",
      "ecs:DescribeContainerInstances",
      "ecs:DeregisterContainerInstance",
      "ecs:DescribeTasks",
      "codedeploy:GetApplication",
      "codedeploy:GetDeploymentGroup",
      "codedeploy:UpdateApplication",
      "codedeploy:DeleteDeploymentConfig",
      "codedeploy:RegisterApplicationRevision",
      "ecs:DeleteService",
      "ecs:DescribeClusters",
      "codedeploy:DeleteDeploymentGroup",
      "codedeploy:GetDeployment"
    ]
    resources = [
      "*" // TODO - Fix this before prod
    ]
  }
  statement {
    effect = "Allow"
    actions = [
      "ecs:DeregisterTaskDefinition",
      "ecs:ListServices",
      "ecs:RegisterTaskDefinition",
      "codedeploy:GetDeploymentTarget",
      "codedeploy:StopDeployment",
      "codedeploy:ContinueDeployment",
      "ecs:ListTaskDefinitions",
      "ecs:DescribeTaskDefinition"
    ]
    resources = [
      "*" // TODO - Fix this before prod
    ]
  }
}

resource "aws_iam_policy" "xsrt-pipeline-ecs-deploy" {
  policy = data.aws_iam_policy_document.xsrt-pipeline-ecs-deploy.json
  name = "xsrt-pipeline-ecs-delpoy-${var.env}"
}

data aws_iam_policy_document xsrt-pipeline-network-access {
  statement {
    effect = "Allow"
    actions = [
      "ec2:CreateNetworkInterface",
      "ec2:DescribeDhcpOptions",
      "ec2:DescribeNetworkInterfaces",
      "ec2:DeleteNetworkInterface",
      "ec2:DescribeSubnets",
      "ec2:DescribeSecurityGroups",
      "ec2:DescribeVpcs"
    ]
    resources = ["*"]
  }
  statement {
    effect = "Allow"
    actions = [
      "ec2:CreateNetworkInterfacePermission"
    ]
    resources = [
      "arn:aws:ec2:${local.region-account}:network-interface/*"
    ]
    condition {
      test = "StringEquals"
      values = aws_subnet.xsrt-private.*.arn
      variable = "ec2:Subnet"
    }
    condition {
      test = "StringEquals"
      values = ["codebuild.amazonaws.com"]
      variable = "ec2:AuthorizedService"
    }
  }
}

resource "aws_iam_policy" "xsrt-pipeline-network-access" {
  name = "xsrt-pipeline-network-access-${var.env}"
  policy = data.aws_iam_policy_document.xsrt-pipeline-network-access.json
}

data "aws_iam_policy_document" "xsrt-pipeline-logging" {
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogDelivery",
      "logs:CreateLogStream",
      "logs:DescribeLogGroups",
      "logs:DescribeLogStreams",
      "logs:CreateLogGroup",
      "logs:GetLogDelivery",
      "logs:PutLogEvents",
      "logs:DescribeDestinations"
    ]
    resources = [
      "arn:aws:logs:${local.region-account}:log-group:/xsrt/build/${var.env}",
      "arn:aws:logs:${local.region-account}:log-group:/xsrt/build/${var.env}:*",
      "*"
    ]
  }
}

resource "aws_iam_policy" "xsrt-pipeline-logging" {
  name = "xsrt-pipeline-logging-${var.env}"
  policy = data.aws_iam_policy_document.xsrt-pipeline-logging.json
}

data "aws_iam_policy_document" "xsrt-pipeline-base" {
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup"
    ]
    resources = ["*"] //TODO - Prodify
  }
  statement {
    effect = "Allow"
    actions = [
      "codebuild:BatchGetProjects",
      "codebuild:BatchGetReports",
      "codebuild:DescribeTestCases",
      "codebuild:StopBuild",
      "s3:GetBucketAcl",
      "logs:PutLogEvents",
      "codebuild:BatchGetBuilds",
      "codebuild:CreateReportGroup",
      "codebuild:CreateReport",
      "logs:CreateLogStream",
      "codebuild:UpdateReport",
      "codebuild:StartBuild",
      "codebuild:BatchGetReportGroups",
      "codebuild:BatchPutTestCases",
      "s3:GetBucketLocation"
    ]
    resources = [
      "arn:aws:codebuild:${local.region-account}:report-group/xsrt-*",
      aws_codebuild_project.xsrt-api-build.arn,
      aws_codebuild_project.xsrt-viewer-build.arn,
      aws_codebuild_project.xsrt-decorators-build.arn,
      aws_s3_bucket.pipeline-bucket.arn,
      aws_s3_bucket.viewer-bucket.arn,
      "arn:aws:logs:${local.region-account}:log-group:/aws/codebuild/xsrt-api",
      "arn:aws:logs:${local.region-account}:log-group:/aws/codebuild/xsrt-api:*"
    ]
  }
  statement {
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:GetObjectVersion"
    ]
    resources = [
      "${aws_s3_bucket.pipeline-bucket.arn}/*",
      "${aws_s3_bucket.viewer-bucket.arn}/*"
    ]
  }
  statement {
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:GetBucketAcl",
      "s3:GetBucketLocation",
      "s3:GetObjectVersion"
    ]
    resources = [
      "arn:aws:s3:::codepipeline-${data.aws_region.stack-region.name}-*"
    ]
  }
}

resource "aws_iam_policy" "xsrt-pipeline-base" {
  policy = data.aws_iam_policy_document.xsrt-pipeline-base.json
  name = "xsrt-pipeline-base-${var.env}"
}

data "aws_iam_policy_document" "xsrt-services-assume" {
  statement {
    actions = [
      "sts:AssumeRole"
    ]
    principals {
      identifiers = ["ecs-tasks.amazonaws.com"]
      type = "Service"
    }
  }
}

resource "aws_iam_role" "xsrt-services" {
  name = "xsrt-services-${var.env}"
  assume_role_policy = data.aws_iam_policy_document.xsrt-services-assume.json
}

resource "aws_iam_role_policy_attachment" "xsrt-services-storage" {
  policy_arn = aws_iam_policy.xsrt-storage.arn
  role = aws_iam_role.xsrt-services.name
}

resource "aws_iam_role_policy_attachment" "xsrt-services-secrets" {
  policy_arn = aws_iam_policy.xsrt-secrets.arn
  role = aws_iam_role.xsrt-services.name
}

resource "aws_iam_role_policy_attachment" "xsrt-services-queues" {
  policy_arn = aws_iam_policy.xsrt-queues.arn
  role = aws_iam_role.xsrt-services.name
}

resource "aws_iam_role_policy_attachment" "xsrt-services-logging" {
  policy_arn = aws_iam_policy.xsrt-logging.arn
  role = aws_iam_role.xsrt-services.name
}

resource "aws_iam_role_policy_attachment" "xsrt-services-images" {
  policy_arn = aws_iam_policy.xsrt-images.arn
  role = aws_iam_role.xsrt-services.name
}

data "aws_iam_policy_document" "xsrt-builder-assume" {
  statement {
    actions = [
      "sts:AssumeRole"
    ]
    principals {
      identifiers = [
        "codedeploy.amazonaws.com",
        "codebuild.amazonaws.com",
        "codepipeline.amazonaws.com",
        "ecs-tasks.amazonaws.com"
      ]
      type = "Service"
    }
  }
}

resource "aws_iam_role" "xsrt-builder" {
  assume_role_policy = data.aws_iam_policy_document.xsrt-builder-assume.json
  name = "xsrt-builder-${var.env}"
}

resource "aws_iam_role_policy_attachment" "xsrt-builder-codedeploy" {
  policy_arn = data.aws_iam_policy.code-deploy-ecs.arn
  role = aws_iam_role.xsrt-builder.name
}

resource "aws_iam_role_policy_attachment" "xsrt-builder-container-build" {
  policy_arn = aws_iam_policy.xsrt-container-builder.arn
  role = aws_iam_role.xsrt-builder.name
}

resource "aws_iam_role_policy_attachment" "xsrt-builder-network" {
  policy_arn = aws_iam_policy.xsrt-pipeline-network-access.arn
  role = aws_iam_role.xsrt-builder.name
}

resource "aws_iam_role_policy_attachment" "xsrt-builder-pipeline-buckets" {
  policy_arn = aws_iam_policy.xsrt-pipeline-bucket-access.arn
  role = aws_iam_role.xsrt-builder.name
}

resource "aws_iam_role_policy_attachment" "xsrt-builder-ecs-deploy" {
  policy_arn = aws_iam_policy.xsrt-pipeline-ecs-deploy.arn
  role = aws_iam_role.xsrt-builder.name
}

resource "aws_iam_role_policy_attachment" "xsrt-builder-logging" {
  policy_arn = aws_iam_policy.xsrt-pipeline-logging.arn
  role = aws_iam_role.xsrt-builder.name
}

resource "aws_iam_role_policy_attachment" "xsrt-builder-base" {
  policy_arn = aws_iam_policy.xsrt-pipeline-base.arn
  role = aws_iam_role.xsrt-builder.name
}

resource "aws_iam_role_policy_attachment" "xsrt-pipeline-secrets" {
  policy_arn = aws_iam_policy.xsrt-secrets.arn
  role = aws_iam_role.xsrt-builder.name
}
