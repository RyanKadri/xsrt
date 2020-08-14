resource "aws_security_group" "bastion-sg" {
  name = "xsrt-bastion"
  description = "Allow SSH to bastion host (for port forwarding)"
  vpc_id = aws_vpc.main-vpc.id

  ingress {
    from_port = 22
    protocol = "tcp"
    to_port = 22
    cidr_blocks = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "xsrt-public-api" {
  name = "xsrt-public-api"
  description = "Public-facing XSRT services"
  vpc_id = aws_vpc.main-vpc.id

  ingress {
    from_port = 22
    protocol = "tcp"
    to_port = 22
    security_groups = [aws_security_group.bastion-sg.id]
  }

  ingress {
    from_port = 443
    protocol = "tcp"
    to_port = 443
    cidr_blocks = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
    self = true
  }

  egress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "xsrt-services" {
  name = "xsrt-services"
  description = "Private services"
  vpc_id = aws_vpc.main-vpc.id

  ingress {
    from_port = 22
    protocol = "tcp"
    to_port = 22
    security_groups = [aws_security_group.bastion-sg.id]
  }

  ingress {
    from_port = 443
    protocol = "tcp"
    to_port = 443
    security_groups = [aws_security_group.xsrt-public-api.id]
  }

  egress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "db-sg" {
  name = "xsrt-db-sg"
  description = "Allow Postgres traffic from the services"
  vpc_id = aws_vpc.main-vpc.id

  ingress {
    from_port = 5432
    protocol = "tcp"
    to_port = 5432
    security_groups = [aws_security_group.bastion-sg.id, aws_security_group.xsrt-services.id, aws_security_group.xsrt-public-api.id]
  }

  egress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "elastic-sg" {
  name = "xsrt-elastic-sg"
  description = "Allows HTTPS and direct access from services"
  vpc_id = aws_vpc.main-vpc.id

  dynamic "ingress" {
    for_each = [443, 9200]
    content {
      from_port = ingress.key
      protocol = "tcp"
      to_port = ingress.key
      security_groups = [aws_security_group.xsrt-public-api.id, aws_security_group.xsrt-services.id, aws_security_group.bastion-sg.id]
    }
  }

  egress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
