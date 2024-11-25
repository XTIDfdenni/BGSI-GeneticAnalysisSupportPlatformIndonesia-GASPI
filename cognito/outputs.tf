output "cognito_client_id" {
  value       = aws_cognito_user_pool_client.gaspi_user_pool_client.id
  description = "Cognito client Id for user registration and login."
}

output "cognito_user_pool_id" {
  value       = aws_cognito_user_pool.gaspi_user_pool.id
  description = "Cognito user pool Id."
}

output "cognito_identity_pool_id" {
  value       = aws_cognito_identity_pool.gaspi_identity_pool.id
  description = "Cognito identity pool Id."
}

output "cognito_user_pool_arn" {
  value       = aws_cognito_user_pool.gaspi_user_pool.arn
  description = "Cognito user pool ARN."
}

output "cognito_admin_group_name" {
  value       = aws_cognito_user_group.admin_group.name
  description = "Cognito administrator group name"
}

output "admin_login_command" {
  value       = "aws cognito-idp admin-initiate-auth --user-pool-id ${aws_cognito_user_pool.gaspi_user_pool.id} --region ${var.region} --client-id ${aws_cognito_user_pool_client.gaspi_user_pool_client.id} --auth-flow ADMIN_USER_PASSWORD_AUTH --auth-parameters USERNAME=${var.gaspi-admin-username},PASSWORD=${var.gaspi-admin-password} --output json --query AuthenticationResult.IdToken"
  description = "Command to sign in an admin"
}

output "guest_login_command" {
  value       = "aws cognito-idp admin-initiate-auth --user-pool-id ${aws_cognito_user_pool.gaspi_user_pool.id} --region ${var.region} --client-id ${aws_cognito_user_pool_client.gaspi_user_pool_client.id} --auth-flow ADMIN_USER_PASSWORD_AUTH --auth-parameters USERNAME=${var.gaspi-guest-username},PASSWORD=${var.gaspi-guest-password} --output json --query AuthenticationResult.IdToken"
  description = "Command to sign in a guest"
}


