resource "aws_vpc" "main-vpc" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "xsrt-main"
  }
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
    egress_only_gateway_id = aws_egress_only_internet_gateway.main_eig.id
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

data "aws_ami" "bastion" {
  name_regex = "^amzn2-ami-hvm-2\\..*"
  most_recent = true
  owners = [
    "amazon"
  ]
}

resource "aws_instance" "bastion" {
  ami = data.aws_ami.bastion.id
  instance_type = "t2.micro"
  vpc_security_group_ids = [aws_security_group.bastion-sg.id]
  subnet_id = aws_subnet.xsrt-public[0].id
  key_name = aws_key_pair.bastion-key.key_name
}

resource "aws_eip" "bastion-ip" {
  instance = aws_instance.bastion.id
  depends_on = [aws_internet_gateway.main_ig]
  vpc = true
}

resource "aws_key_pair" "bastion-key" {
  key_name = "xsrt-bastion-${var.env}-key"
  public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDPA0GVVwKesvQAwXS2Nc3F1y441S+t8BHW+Xl+zkcK1aGPf5xpyTbnfmIOe4S5IcgHkR/G7Y8LRtDvXQDq+KAg2pLkyGhJTmC6BZLfSmwl9DAn1iPiX674I1nIaLqypvRS7giezD8+iGimDzpDLsdsYll0A/KlISl/ltAIaPJiaZKXs5j2+73FdVig7A2uFfo2dbLi5zUfrhf9kfaTRDmFf72SVoXosVe7+ktTntWHN5bPPAHSnUKWjlMeYPNsAl8j2uqer6jsCzB2VmAfjE7yftR68JSpDcOyQZWdPvMvSu1PxutlGZ+y8gjN68v2VtXdb94aJhN9zVafnJS4cDih"
}
