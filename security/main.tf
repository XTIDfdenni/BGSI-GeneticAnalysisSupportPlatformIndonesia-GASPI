data "aws_caller_identity" "this" {}

resource "aws_inspector2_enabler" "gaspi-inspector-enabler" {
    account_ids = [data.aws_caller_identity.this.account_id]
    resource_types = var.inspector-enabled-resource-types
}
