variable "beacon-guest-username" {
  type        = string
  description = "Value for guest username (must be an email)"
  default     = "guest@example.com"
}

variable "beacon-guest-password" {
  type        = string
  description = "Value for guest password"
  default     = "guest1234"
}

variable "beacon-admin-username" {
  type        = string
  description = "Value for admin username  (must be an email)"
  default     = "admin@example.com"
}

variable "beacon-admin-password" {
  type        = string
  description = "Value for admin password"
  default     = "admin1234"
}