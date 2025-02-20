#
# custom message lambda trigger
#
module "lambda-inspectorAlertTrigger" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "security-inspectorAlertTrigger"
  description   = "Logs and alerts of any inspector findings"
  runtime       = "python3.12"
  handler       = "lambda_function.lambda_handler"
  memory_size   = 512
  timeout       = 24
  source_path   = "${path.module}/lambda/inspectorAlertTrigger"
  tags          = var.common-tags
  
  environment_variables = {
    SES_SOURCE_EMAIL = var.ses-source-email
    GASPI_ADMINISTRATOR_EMAIL = var.gaspi-administrator-email
  }
}
