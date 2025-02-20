resource "aws_cloudwatch_event_target" "gaspi-inspector-findings" {
    rule = aws_cloudwatch_event_rule.gaspi-inspector-findings.name
    arn  = aws_sns_topic.gaspi-inspector-alerts.arn
}