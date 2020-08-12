data aws_ssm_parameter db-master-pass {
  name = "xsrt-db-master"
  with_decryption = true
}

data aws_ssm_parameter db-pass {
  name = "xsrt-db-pass"
  with_decryption = true
}

resource "aws_db_subnet_group" "main-db-subnet-group" {
  subnet_ids = aws_subnet.xsrt-db.*.id
  name = "xsrt-db-subnet-group"
}

resource "aws_rds_cluster" "xsrt-main" {
  cluster_identifier = "xsrt-db-${var.env}"
  engine = "aurora-postgresql"
  engine_mode = "serverless"
  engine_version = "10.7"
  availability_zones = aws_subnet.xsrt-db.*.availability_zone
  database_name = "xsrt"
  master_username = "postgres"
  master_password = data.aws_ssm_parameter.db-master-pass.value
  backup_retention_period = 1
  preferred_backup_window = "07:00-09:00"
  storage_encrypted = true
  vpc_security_group_ids = [aws_security_group.db-sg.id]
  db_subnet_group_name = aws_db_subnet_group.main-db-subnet-group.name
  scaling_configuration {
    auto_pause = true
    max_capacity = 4
    min_capacity = 2
    seconds_until_auto_pause = 900
  }
}

//resource "postgresql_role" "xsrt-user" {
//  name = "xsrt"
//  create_role = false
//  login = true
//  password = data.aws_ssm_parameter.db-pass.value
//}
//
//resource "postgresql_grant" "xsrt-grant" {
//  database = postgresql_database.xsrt-db.name
//  object_type = "database"
//  privileges = ["ALL PRIVILEGES"]
//  role = postgresql_role.xsrt-user
//}
//
//resource "postgresql_database" "xsrt-db" {
//  name = "xsrt"
//  owner = postgresql_role.xsrt-user.name
//}
