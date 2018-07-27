variable account_id {
  type        = "string"
  description = "account alias"
}

variable "batch_size" {
  type        = "string"
  description = "lambda function batch size"
  default     = 100
}

variable "caller_arn" {
  type        = "string"
  description = "current caller arn"
}

variable "config_prefix" {
  type        = "string"
  description = "ssm prefix for lambda function configuration"
}

variable "debug" {
  type        = "string"
  description = "lambda function DEBUG environment variable"
  default     = ""
}

variable "dynamo_stream_arn" {
  type        = "string"
  description = "source dynamo stream arn"
}

variable "enabled" {
  type        = "string"
  description = "enable event source mapping for lambda function"
  default     = true
}

variable "kinesis_stream_arn" {
  type        = "string"
  description = "target kinesis stream arn"
}

variable "kinesis_stream_name" {
  type        = "string"
  description = "target kinesis stream name"
}

variable "memory_size" {
  type        = "string"
  description = "lambda function memory limit"
  default     = 256
}

variable "name" {
  type        = "string"
  description = "module name"
}

variable "region" {
  type        = "string"
  description = "aws region"
}

variable "s3_bucket" {
  type        = "string"
  description = "s3 bucket"
}

variable "s3_key" {
  type        = "string"
  description = "s3 key"
}

variable "starting_position" {
  type        = "string"
  description = "lambda subscription starting point"
}

variable "subnet_ids" {
  type        = "list"
  description = "list of subnet ids to use for lambda deployments"
  default     = []
}

variable "timeout" {
  type        = "string"
  description = "lambda function timeout"
  default     = "60"
}

variable "vpc_id" {
  type        = "string"
  description = "vpc id"
}
