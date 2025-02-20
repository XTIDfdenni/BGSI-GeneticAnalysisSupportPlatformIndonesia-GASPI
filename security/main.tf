data "aws_caller_identity" "this" {}

resource "aws_inspector2_enabler" "gaspi-inspector-enabler" {
    account_ids = [data.aws_caller_identity.this.account_id]
    resource_types = var.inspector-enabled-resource-types
}

resource "aws_cloudwatch_event_rule" "gaspi-inspector-findings" {
    name = "gaspi-inspector-findings"
    description = "Triggers on new Amazon Inspector Findings"
    event_pattern = jsonencode({
        "source"     : ["aws.inspector"],
        "detail-type": ["Inspector Findings"]
    })
}
