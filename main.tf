module "cognito" {
  source               = "./cognito"
  region               = var.region
  common-tags          = var.common-tags
  gaspi-guest-username = var.gaspi-guest-username
  gaspi-guest-password = var.gaspi-guest-password
  gaspi-admin-username = var.gaspi-admin-username
  gaspi-admin-password = var.gaspi-admin-password
  dataportal-bucket-prefix = var.dataportal-bucket-prefix
}

# module "webgui" {
#   source = "./webgui/terraform-aws"
# }
