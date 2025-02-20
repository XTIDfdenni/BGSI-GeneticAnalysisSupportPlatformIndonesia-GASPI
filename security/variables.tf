
# AWS region variable
variable "region" {
  type        = string
  description = "Deployment region."
}

# AWS configuration
variable "common-tags" {
  type        = map(string)
  description = "A set of tags to attach to every created resource."
}

# Inspector variables
variable "inspector-enabled-resource-types" {
    description = "List of resource types to enable Inspector on"
    type        = list(string)
    default     = ["ECR", "LAMBDA", "LAMBDA_CODE"]
}

# SES variables
variable "ses-source-email" {
  type        = string
  description = "Address from which to send emails"
}

variable "gaspi-administrator-email" {
  type = string
  description = "Email address of the administrator to send security alerts."
}