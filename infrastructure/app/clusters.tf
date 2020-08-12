resource "aws_ecr_repository" "api-repo" {
  name = "xsrt/api"
}

resource "aws_ecr_repository" "decorators-repo" {
  name = "xsrt/decorators"
}

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
      value = aws_elasticsearch_domain.xsrt-elastic.endpoint
    },
    {
      name = "SQS_BASE_URL",
      value = "https://sqs.us-east-1.amazonaws.com/307651132348"
    },
    {
      name = "USE_S3",
      value = "true"
    },
    {
      name = "USE_SQS",
      value = "true"
    }
  ]
  api-secrets = [
    {
      name = "DB_PASSWORD",
      valueFrom = data.aws_ssm_parameter.db-pass.name
    }
  ]
}

resource "aws_ecs_cluster" "api-cluster" {
  name = "xsrt-public-api"
}

resource "aws_ecs_cluster" "background-cluster" {
  name = "xsrt-services"
}

resource "aws_ecs_task_definition" "api-task" {
  family = "xsrt-api"
  task_role_arn = aws_iam_role.xsrt-services.arn
  execution_role_arn = aws_iam_role.xsrt-services.arn
  network_mode = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu = 512
  memory = 2048
  container_definitions = <<DEF
    [
      {
        "name": "api",
        "image": "dummy",
        "essential": true,
        "logConfiguration": {
          "logDriver": "awslogs",
          "options": {
            "awslogs-group": "/ecs/xsrt-api",
            "awslogs-region": "us-east-1",
            "awslogs-stream-prefix": "ecs"
          }
        },
        "portMappings": [
          {
            "hostPort": 8080,
            "protocol": "tcp",
            "containerPort": 8080
          }
        ],
        "environment": ${ jsonencode(local.api-env) }
      }
    ]
  DEF
}

resource "aws_ecs_task_definition" "decorators-task" {
  family = "xsrt-decorators"
  task_role_arn = aws_iam_role.xsrt-services.arn
  execution_role_arn = aws_iam_role.xsrt-services.arn
  network_mode = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu = 512
  memory = 2048
  container_definitions = <<DEF
    [
      {
        "name": "decorators",
        "image": "dummy",
        "essential": true,
        "logConfiguration": {
          "logDriver": "awslogs",
          "options": {
            "awslogs-group": "/ecs/xsrt-decorators",
            "awslogs-region": "us-east-1",
            "awslogs-stream-prefix": "ecs"
          }
        },
        "portMappings": [
          {
            "hostPort": 8080,
            "protocol": "tcp",
            "containerPort": 8080
          }
        ],
        "environment": ${ jsonencode(local.api-env) }
      }
    ]
  DEF
}
