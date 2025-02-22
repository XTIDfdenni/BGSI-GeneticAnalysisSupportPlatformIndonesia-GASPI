provider "aws" {
    region = var.region
    default_tags {
        tags = var.common-tags
    }
}

provider "aws" {
    region = "us-east-1"
    alias  = "us-east-1"
    default_tags {
        tags = var.common-tags
    }
}

data "aws_caller_identity" "this" {}

resource "aws_inspector2_enabler" "gaspi-inspector-enabler" {
    count = var.enable-inspector ? 1 : 0

    account_ids = [data.aws_caller_identity.this.account_id]
    resource_types = var.inspector-enabled-resource-types
}
