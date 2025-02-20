#
#  Lambda Function
#
resource "aws_lambda_permission" "inspectorAlertLambdaTrigger" {
  statement_id  = "SecurityAllowInspectorAlertLambdaTriggerInvoke"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda-inspectorAlertTrigger.lambda_function_arn
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.gaspiInspectorAlerts.arn 
}
