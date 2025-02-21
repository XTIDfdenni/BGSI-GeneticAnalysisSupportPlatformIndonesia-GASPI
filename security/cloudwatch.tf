resource "aws_cloudwatch_event_rule" "gaspi-inspector-findings" {
    name = "gaspi-inspector-findings"
    description = "Triggers on new Amazon Inspector Findings"
    event_pattern = jsonencode({
        "source"     : ["aws.inspector2"],
        "detail-type": ["Inspector2 Finding"]
    })
}

resource "aws_cloudwatch_event_target" "gaspi-inspector-findings" {
  rule = aws_cloudwatch_event_rule.gaspi-inspector-findings.name
  arn  = module.lambda-sendSecurityAlert.lambda_function_arn
}
