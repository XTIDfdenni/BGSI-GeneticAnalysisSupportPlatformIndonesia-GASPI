# common
variable "region" {
  type        = string
  description = "AWS region"
}


variable "common-tags" {
  type        = map(string)
  description = "A set of tags to attach to every created resource."
}

# portal variables
variable "gaspi-guest-username" {
  type        = string
  description = "Value for guest username (must be an email)"
}

variable "gaspi-guest-password" {
  type        = string
  description = "Value for guest password"
}

variable "gaspi-admin-username" {
  type        = string
  description = "Value for admin username  (must be an email)"
}

variable "gaspi-admin-password" {
  type        = string
  description = "Value for admin password"
}

# bucket prefixes
variable "variants-bucket-prefix" {
  type        = string
  description = "Prefix for the variants S3 bucket"
}

variable "metadata-bucket-prefix" {
  type        = string
  description = "Prefix for the metadata S3 bucket"
}

variable "lambda-layers-bucket-prefix" {
  type        = string
  description = "Prefix for the lambda layers S3 bucket"
}

variable "dataportal-bucket-prefix" {
  type        = string
  description = "Prefix for the dataportal S3 bucket"
}

variable "ses-source-email" {
  type        = string
  description = "Address from which to send SES emails"
}

variable "gaspi-admin-email" {
  type = string
  description = "Email address of the administrator to send security alerts"
}

# Will be removed when DNS records are available for use
variable "bui-ssm-parameter-name" {
  type        = string 
  description = "Name of the SSM parameter storing the Beacon UI URL"
  default     = "bui-ssm-beacon-ui-url"
}

variable "enable-security-module" {
  description = "Enables the security module"
  type        = bool
  default     = true
}
