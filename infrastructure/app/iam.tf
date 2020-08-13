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

resource "aws_iam_policy" "pipeline-access" {
  name = "xsrt-pipeline-bucket-access-${var.env}"
  policy = data.aws_iam_policy_document.xsrt-pipeline-bucket-access.json
}

data "aws_iam_policy_document" "xsrt-ecs-deploy" {
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
