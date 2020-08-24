data "aws_route53_zone" "xsrt-zone" {
  name = "xsrt-app.com"
}

resource "aws_route53_record" "db-record" {
  name = "db-${var.env}.${data.aws_route53_zone.xsrt-zone.name}"
  type = "CNAME"
  ttl = 300
  zone_id = data.aws_route53_zone.xsrt-zone.zone_id
  records = [aws_rds_cluster.xsrt-main.endpoint]
}

resource "aws_route53_record" "viewer-frontend" {
  name = "viewer-${var.env}.${data.aws_route53_zone.xsrt-zone.name}"
  type = "A"
  zone_id = data.aws_route53_zone.xsrt-zone.zone_id
  alias {
    evaluate_target_health = false
    name = aws_cloudfront_distribution.viewer-dist.domain_name
    zone_id = aws_cloudfront_distribution.viewer-dist.hosted_zone_id
  }
}

resource "aws_route53_record" "storage-dist" {
  name = "storage-${var.env}.${data.aws_route53_zone.xsrt-zone.name}"
  type = "A"
  zone_id = data.aws_route53_zone.xsrt-zone.zone_id
  alias {
    evaluate_target_health = false
    name = aws_cloudfront_distribution.xsrt-storage-dist.domain_name
    zone_id = aws_cloudfront_distribution.xsrt-storage-dist.hosted_zone_id
  }
}

resource "aws_route53_record" "bastion-eip" {
  name = "bastion-${var.env}.${data.aws_route53_zone.xsrt-zone.name}"
  type = "A"
  zone_id = data.aws_route53_zone.xsrt-zone.zone_id
  records = [
    aws_eip.bastion-ip.public_ip
  ]
  ttl = 300
}

resource "aws_route53_record" "api" {
  name = "api-${var.env}.${data.aws_route53_zone.xsrt-zone.name}"
  type = "A"
  zone_id = data.aws_route53_zone.xsrt-zone.zone_id
  alias {
    evaluate_target_health = false
    name = aws_alb.api-lb.dns_name
    zone_id = aws_alb.api-lb.zone_id
  }
}
