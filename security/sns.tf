resource "aws_sns_topic" "gaspiInspectorAlerts" {
    name = "inspectorAlerts"
}

resource "aws_sns_topic_subscription" "gaspiInspectorAlerts" {
  topic_arn = aws_sns_topic.gaspiInspectorAlerts.arn
  protocol  = "lambda"
  endpoint  = module.lambda-inspectorAlerts.lambda_function_arn
}