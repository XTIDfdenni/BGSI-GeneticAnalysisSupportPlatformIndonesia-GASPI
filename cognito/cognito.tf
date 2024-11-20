# 
# Pool and client
# 
resource "aws_cognito_user_pool" "beacon_user_pool" {
  name = "sbeacon-users"

  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  password_policy {
    minimum_length                   = 6
    require_lowercase                = false
    require_numbers                  = false
    require_symbols                  = false
    require_uppercase                = false
    temporary_password_validity_days = 7
  }

  schema {
    name                     = "terraform"
    attribute_data_type      = "Boolean"
    developer_only_attribute = false
    mutable                  = false
    required                 = false
  }
}

resource "aws_cognito_user_pool_client" "beacon_user_pool_client" {
  name = "sbeacon-users-client"

  user_pool_id = aws_cognito_user_pool.beacon_user_pool.id

  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_ADMIN_USER_PASSWORD_AUTH",
    "ALLOW_USER_PASSWORD_AUTH"
  ]
}

# 
# groups
# 
resource "aws_cognito_user_group" "admin-group" {
  name         = "admininstrators"
  user_pool_id = aws_cognito_user_pool.beacon_user_pool.id
  description  = "Group of users who can has admin privileges"
  role_arn     = aws_iam_role.admin-group-role.arn
}

data "aws_iam_policy_document" "admin-group-assume-role-policy" {
  statement {
    principals {
      type        = "Federated"
      identifiers = ["cognito-identity.amazonaws.com"]
    }

    actions = ["sts:AssumeRoleWithWebIdentity"]

    condition {
      test     = "StringEquals"
      variable = "cognito-identity.amazonaws.com:aud"
      values   = [aws_cognito_identity_pool.beacon_identity_pool.id]
    }

    condition {
      test     = "ForAnyValue:StringLike"
      variable = "cognito-identity.amazonaws.com:amr"
      values   = ["authenticated"]
    }
  }
}

resource "aws_iam_role" "admin-group-role" {
  name               = "sbeacon-admin-group-role"
  assume_role_policy = data.aws_iam_policy_document.admin-group-assume-role-policy.json
}

data "aws_iam_policy_document" "admin-group-role-policy" {
  # project access
  statement {
    actions = [
      "s3:*"
    ]
    resources = [
      "${aws_s3_bucket.dataportal-bucket.arn}/projects/*",
    ]
  }

  # private access
  statement {
    effect = "Allow"

    actions = [
      "s3:ListBucket",
    ]

    resources = [
      aws_s3_bucket.dataportal-bucket.arn,
    ]

    condition {
      test     = "StringLike"
      variable = "s3:prefix"
      values = [
        "private/$${cognito-identity.amazonaws.com:sub}/",
        "private/$${cognito-identity.amazonaws.com:sub}/*",
      ]
    }
  }

  # private access
  statement {
    effect = "Allow"

    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]

    resources = [
      "${aws_s3_bucket.dataportal-bucket.arn}/private/$${cognito-identity.amazonaws.com:sub}/*",
    ]
  }
}

resource "aws_iam_policy" "admin-group-role-policy" {
  name        = "sbeacon-admin-group-role-policy"
  description = "admin group permissions"
  policy      = data.aws_iam_policy_document.admin-group-role-policy.json

}

resource "aws_iam_role_policy_attachment" "admin-group-role-policy-attachment" {
  role       = aws_iam_role.admin-group-role.name
  policy_arn = aws_iam_policy.admin-group-role-policy.arn
}

# 
# default users
# 
resource "aws_cognito_user" "guest" {
  user_pool_id = aws_cognito_user_pool.beacon_user_pool.id
  username     = var.beacon-guest-username
  password     = var.beacon-guest-password

  attributes = {
    terraform      = true
    email          = var.beacon-guest-username
    email_verified = true
    given_name     = "Guest"
    family_name    = "Guest"
  }
}

resource "aws_cognito_user" "admin" {
  user_pool_id = aws_cognito_user_pool.beacon_user_pool.id
  username     = var.beacon-admin-username
  password     = var.beacon-admin-password

  attributes = {
    terraform      = true
    given_name     = "Admin"
    family_name    = "Admin"
    email          = var.beacon-admin-username
    email_verified = true
  }
}

# 
# group assignments
# 
# admin
resource "aws_cognito_user_in_group" "admin-admin-access" {
  user_pool_id = aws_cognito_user_pool.beacon_user_pool.id
  group_name   = aws_cognito_user_group.admin-group.name
  username     = aws_cognito_user.admin.username
}
