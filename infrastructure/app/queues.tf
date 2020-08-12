resource "aws_sqs_queue" "raw-chunks-queue" {
  name = "xsrt-raw-chunk-queue"
  fifo_queue = false
  content_based_deduplication = false
  delay_seconds = 0
}

resource "aws_sqs_queue" "elastic-queue" {
  name = "xsrt-elasticsearch-queue"
  fifo_queue = false
  content_based_deduplication = false
  delay_seconds = 0
}

resource "aws_sqs_queue" "snapshot-queue" {
  name = "xsrt-snapshot-queue"
  fifo_queue = false
  content_based_deduplication = false
  delay_seconds = 0
}
