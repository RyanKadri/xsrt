data "aws_iam_role" "es" {
  name = "AWSServiceRoleForAmazonElasticsearchService"
}

resource "aws_elasticsearch_domain" "xsrt-elastic" {
  domain_name = "xsrt-elasticsearch"
  elasticsearch_version = "7.4"

  vpc_options {
    security_group_ids = [aws_security_group.elastic-sg.id]
    subnet_ids = [aws_subnet.xsrt-private[0].id]
  }
  cluster_config {
    instance_type = "t2.small.elasticsearch"
    instance_count = 1
    zone_awareness_enabled = false
  }
  ebs_options {
    ebs_enabled = true
    volume_size = 10
  }
  snapshot_options {
    automated_snapshot_start_hour = 23
  }
  tags = {
    Name = "xsrt-elasticsearch"
  }
}
