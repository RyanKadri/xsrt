provider "aws" {
  version = "~> 3.0"
  region  = "us-east-2"
}

provider "aws" {
  version = "~> 3.0"
  region = "us-east-1"
  alias = "us-east-1"
}

terraform {
  backend "s3" {
    bucket = "xsrt-iac"
    key = "terraform/terraform.tfstate"
    region = "us-east-2"
  }
}

resource "aws_vpc" "main-vpc" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "xsrt-main"
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_subnet" "xsrt-public" {
  count                   = length(var.public_subnets)
  vpc_id                  = aws_vpc.main-vpc.id
  cidr_block              = var.public_subnets[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = {
    Name = "xsrt-public-${count.index}"
  }
}

resource "aws_subnet" "xsrt-private" {
  count                   = length(var.private_subnets)
  vpc_id                  = aws_vpc.main-vpc.id
  cidr_block              = var.private_subnets[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = {
    Name = "xsrt-private-${count.index}"
  }
}

resource "aws_subnet" "xsrt-db" {
  count                   = length(var.db_subnets)
  vpc_id                  = aws_vpc.main-vpc.id
  cidr_block              = var.db_subnets[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = {
    Name = "xsrt-db-${count.index}"
  }
}

resource "aws_internet_gateway" "main_ig" {
  vpc_id = aws_vpc.main-vpc.id
  tags = {
    Name = "xsrt-ig"
  }
}

resource "aws_egress_only_internet_gateway" "main_eig" {
  vpc_id = aws_vpc.main-vpc.id
  tags = {
    Name = "xsrt-eig"
  }
}

resource "aws_route_table" "public_table" {
  vpc_id = aws_vpc.main-vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main_ig.id
  }

  route {
    ipv6_cidr_block = "::/0"
    gateway_id = aws_internet_gateway.main_ig.id
  }

  tags = {
    Name = "xsrt-public-route-table"
  }
}
resource "aws_route_table_association" "public_routes" {
  count = length(var.public_subnets)
  subnet_id = aws_subnet.xsrt-public.*.id[count.index]
  route_table_id = aws_route_table.public_table.id
}

resource "aws_route_table" "private_table" {
  vpc_id = aws_vpc.main-vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main-nat.id
  }

  route {
    ipv6_cidr_block = "::/0"
    gateway_id = aws_egress_only_internet_gateway.main_eig.id
  }

  tags = {
    Name = "xsrt-private-route-table"
  }
}

resource "aws_route_table_association" "private_routes" {
  count = length(var.private_subnets)
  subnet_id = aws_subnet.xsrt-private.*.id[count.index]
  route_table_id = aws_route_table.private_table.id
}

resource "aws_eip" "nat-eip" {
  vpc = true
  tags = {
    Name = "xsrt-nat-eip"
  }
}

resource "aws_nat_gateway" "main-nat" {
  subnet_id = aws_subnet.xsrt-public.*.id[0]
  allocation_id = aws_eip.nat-eip.id
  tags = {
    Name = "xsrt-nat-gateway"
  }
}

