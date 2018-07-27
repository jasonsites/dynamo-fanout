# define lambda function
resource "aws_lambda_function" "dynamo_fanout" {
  function_name = "${var.name}"
  runtime       = "nodejs6.10"
  role          = "${aws_iam_role.dynamo_fanout.arn}"
  handler       = "index.handler"
  s3_bucket     = "${var.s3_bucket}"
  s3_key        = "${var.s3_key}"
  timeout       = "${var.timeout}"
  memory_size   = "${var.memory_size}"

  vpc_config = {
    security_group_ids = ["${aws_security_group.dynamo_fanout.id}"]
    subnet_ids         = ["${var.subnet_ids}"]
  }

  environment = {
    variables = {
      "CONFIG_PREFIX" = "${var.config_prefix}"
      "DEBUG"         = "${var.debug}"
      "NODE_ENV"      = "production"
    }
  }
}

# subscribe lambda function to source dynamo streams
resource "aws_lambda_event_source_mapping" "dynamo_stream" {
  event_source_arn  = "${var.dynamo_stream_arn}"
  enabled           = "${var.enabled}"
  function_name     = "${aws_lambda_function.dynamo_fanout.arn}"
  starting_position = "${var.starting_position}"
  batch_size        = "${var.batch_size}"
}

###############################################################################
## security group
###############################################################################

# define security group
resource "aws_security_group" "dynamo_fanout" {
  name        = "${var.name}"
  description = "security group for dynamo fanout"
  vpc_id      = "${var.vpc_id}"

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

###############################################################################
## iam resources
###############################################################################

# define iam role for lambda function
resource "aws_iam_role" "dynamo_fanout" {
  name               = "${var.name}"
  assume_role_policy = "${data.aws_iam_policy_document.assume_role.json}"
}

# allow lambda and terraform to assume role
data "aws_iam_policy_document" "assume_role" {
  statement {
    actions = [
      "sts:AssumeRole",
    ]

    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = ["${var.caller_arn}"]
    }

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# define iam policy for lambda function
resource "aws_iam_policy" "dynamo_fanout" {
  name   = "${var.name}"
  policy = "${data.aws_iam_policy_document.dynamo_fanout.json}"
}

data "aws_iam_policy_document" "dynamo_fanout" {
  # allow function to pull configuration from ssm
  statement {
    actions = [
      "ssm:DescribeParameters",
    ]

    effect = "Allow"

    resources = ["*"]
  }

  statement {
    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:GetParametersByPath",
    ]

    effect = "Allow"

    resources = [
      "arn:aws:ssm:${var.region}:${var.account_id}:parameter${var.config_prefix}",
      "arn:aws:ssm:${var.region}:${var.account_id}:parameter${var.config_prefix}/*",
    ]
  }

  # allow function to write to kinesis
  statement {
    actions = [
      "kinesis:PutRecords",
    ]

    effect = "Allow"

    resources = [
      "${var.kinesis_stream_arn}",
    ]
  }

  # allow function to join vpc
  statement {
    actions = [
      "ec2:CreateNetworkInterface",
      "ec2:DescribeNetworkInterfaces",
      "ec2:DeleteNetworkInterface",
    ]

    effect = "Allow"

    resources = ["*"]
  }

  # allow function to manage cloudwatch logs
  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    effect = "Allow"

    resources = ["*"]
  }
}

# attach policy to role
resource "aws_iam_policy_attachment" "dynamo_fanout" {
  name       = "${var.name}"
  roles      = ["${aws_iam_role.dynamo_fanout.name}"]
  policy_arn = "${aws_iam_policy.dynamo_fanout.arn}"
  depends_on = ["aws_iam_role.dynamo_fanout"]
}

# allow function to be invoked by dynamo
resource "aws_iam_role_policy_attachment" "execution_role" {
  role       = "${aws_iam_role.dynamo_fanout.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaDynamoDBExecutionRole"
  depends_on = ["aws_iam_role.dynamo_fanout"]
}

###############################################################################
## cloudwatch logs
###############################################################################

# include cloudwatch log group resource definition in order to ensure it is
# removed with function removal
resource "aws_cloudwatch_log_group" "dynamo_fanout" {
  name              = "/aws/lambda/${aws_lambda_function.dynamo_fanout.function_name}"
  retention_in_days = "365"
}

###############################################################################
## ssm permissions
###############################################################################

resource "aws_ssm_parameter" "kinesis_target_stream_name" {
  name      = "${var.config_prefix}/kinesis/target/stream-name"
  type      = "String"
  value     = "${var.kinesis_stream_name}"
  overwrite = true
}
