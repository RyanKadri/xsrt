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
        "image": "${aws_ecr_repository.api-repo.repository_url}:latest",
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

resource "aws_alb_target_group" "dummy-tg" {
  name = "xsrt-dummy-tg"
  target_type = "instance"
  protocol = "HTTP"
  port = 80
  vpc_id = aws_vpc.main-vpc.id
}

resource "aws_alb_target_group" "api-tg" {
  name = "xsrt-api-${var.env}-tg"
  target_type = "ip"
  protocol = "HTTP"
  port = 8080
  vpc_id = aws_vpc.main-vpc.id
  health_check {
    enabled = true
    healthy_threshold = 5
    unhealthy_threshold = 2
    port = "traffic-port"
    path = "/api/health"
  }
}

resource "aws_alb_target_group" "api-tg-beta" {
  name = "xsrt-api-${var.env}-tg-beta"
  target_type = "ip"
  protocol = "HTTP"
  port = 8080
  vpc_id = aws_vpc.main-vpc.id
  health_check {
    enabled = true
    healthy_threshold = 5
    unhealthy_threshold = 2
    port = "traffic-port"
    path = "/api/health"
  }
}

resource "aws_alb" "api-lb" {
  name = "xsrt-api-${var.env}"
  load_balancer_type = "application"
  internal = false
  ip_address_type = "ipv4"
  enable_http2 = true
  enable_cross_zone_load_balancing = true
  security_groups = [aws_security_group.xsrt-public-api.id]
  subnets = aws_subnet.xsrt-public.*.id
}

resource "aws_alb_listener" "api-listener" {
  load_balancer_arn = aws_alb.api-lb.arn
  port = 443
  protocol = "HTTPS"
  certificate_arn = data.aws_acm_certificate.wildcard-regional-cert.arn
  ssl_policy = "ELBSecurityPolicy-TLS-1-2-2017-01"
  default_action {
    type = "forward"
    target_group_arn = aws_alb_target_group.dummy-tg.arn
  }
}

resource "aws_alb_listener_rule" "api-rule" {
  listener_arn = aws_alb_listener.api-listener.arn
  action {
    type = "forward"
    target_group_arn = aws_alb_target_group.api-tg.arn
  }
  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

resource "aws_ecs_service" "api-service" {
  name = "api"
  cluster = aws_ecs_cluster.api-cluster.id
  task_definition = aws_ecs_task_definition.api-task.arn
  desired_count = 1
  deployment_minimum_healthy_percent = 100 // TODO - Update this in prod
  deployment_maximum_percent = 200

  load_balancer {
    container_name = "api"
    container_port = 8080
    target_group_arn = aws_alb_target_group.api-tg.arn
  }

  deployment_controller {
    type = "CODE_DEPLOY"
  }

  network_configuration {
    subnets = aws_subnet.xsrt-private.*.id
    assign_public_ip = false
    security_groups = [aws_security_group.xsrt-services.id]
  }
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
