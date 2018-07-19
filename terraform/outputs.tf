output "function_arn" {
  value = "${aws_lambda_function.dynamo_fanout.arn}"
}

output "function_name" {
  value = "${aws_lambda_function.dynamo_fanout.function_name}"
}

output "function_role_arn" {
  value = "${aws_iam_role.dynamo_fanout.arn}"
}

output "function_role_name" {
  value = "${aws_iam_role.dynamo_fanout.name}"
}

output "log_group_arn" {
  value = "${aws_cloudwatch_log_group.dynamo_fanout.arn}"
}

output "log_group_name" {
  value = "${aws_cloudwatch_log_group.dynamo_fanout.name}"
}

output "security_group_id" {
  value = "${aws_security_group.dynamo_fanout.id}"
}
