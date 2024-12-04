# Keep User sagemaker Usage information
resource "aws_dynamodb_table" "sbeacon-dataportal-users-quota" {
  name           = "sbeacon-dataportal-users-quota"
  billing_mode   = "PAY_PER_REQUEST" # on demand
  #read_capacity  = 5
  #write_capacity = 5
  hash_key       = "IdentityUser"
  range_key      = "Updatedat"

  attribute {
    name = "IdentityUser"
    type = "S"
  }

  attribute {
    name = "CostEstimation"
    type = "S"       
  }

  attribute {
    name = "Usage"
    type = "S"
  }

  attribute {
    name = "Updatedat"
    type = "S"
  }

    tags = {
    Ownwe       = "gaspi"
    Environment = "dev"
    Name        = "sbeacon-backend"
  }
}