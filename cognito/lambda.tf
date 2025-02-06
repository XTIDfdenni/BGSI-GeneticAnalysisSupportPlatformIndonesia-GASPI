#
# custom message lambda trigger
#
module "lambda-customMessageLambdaTrigger" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "sbeacon-backend-customMessageLambdaTrigger"
  description   = "Sends a custom password reset email to the user"
  runtime       = "python3.12"
  handler       = "lambda_function.lambda_handler"
  memory_size   = 512
  timeout       = 24
  source_path   = "${path.module}/lambda/customMessageLambdaTrigger"
  tags          = var.common-tags
}
