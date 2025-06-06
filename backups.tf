# 
# Backup vault for AWS
resource "aws_backup_vault" "gaspi_backup_vault" {
  name = "gaspi_backup_vault"

  tags = var.common-tags
}
# 

# 
# Backup plan for AWS
#
resource "aws_backup_plan" "gaspi_backup_plan" {
  name = "gaspi_backup_plan"

  rule {
    rule_name         = "gaspi_backup_rule"
    target_vault_name = aws_backup_vault.gaspi_backup_vault.name

    schedule = "cron(0 19 * * ? *)"

    lifecycle {
      delete_after = 30
    }
  }
}

#
# Backup selection for AWS
#
data "aws_iam_policy_document" "gaspi_backup_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["backup.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "gaspi_backup_role" {
  name               = "gaspi_backup_role"
  assume_role_policy = data.aws_iam_policy_document.gaspi_backup_assume_role.json
}

resource "aws_iam_role_policy_attachment" "gaspi_backup_role_attachment" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
  role       = aws_iam_role.gaspi_backup_role.name
}

resource "aws_backup_selection" "gaspi_backup_selection" {
  iam_role_arn = aws_iam_role.gaspi_backup_role.arn
  name         = "gaspi_backup_resource_selection"
  plan_id      = aws_backup_plan.gaspi_backup_plan.id

  selection_tag {
    type  = "STRINGEQUALS"
    key   = "backup"
    value = "true"
  }
}
