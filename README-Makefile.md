# BGSI-GASPI Deployment Guide

## Overview

This repository contains a Makefile to automate the deployment of the BGSI-GeneticAnalysisSupportPlatformIndonesia-GASPI (BGSI-GASPI) project. The Makefile streamlines the process of cloning the repository, initializing sBeacon, and deploying to different AWS environments (Hub01 and Hub02).

## Prerequisites

Before using this Makefile, ensure you have the following prerequisites installed and configured:

- Git
- Python 3.12
- AWS CLI v2
- Terraform v1.9.4 or newer
- Valid AWS credentials for both Hub01 and Hub02 environments
- SSH access configured for GitHub

## Environment Setup

1. **Python Virtual Environment**:
   ```bash
   python3.12 -m venv ~/py312
   source ~/py312/bin/activate
   ```

2. **AWS Credentials**:
   Ensure your AWS credentials are properly configured in `~/.aws/credentials` with the following profiles:
   ```ini
   [GXC-TF-User-Executor-Hub01]
   aws_access_key_id = your_access_key
   aws_secret_access_key = your_secret_key
   region = ap-southeast-3

   [GXC-TF-User-Executor-Hub02]
   aws_access_key_id = your_access_key
   aws_secret_access_key = your_secret_key
   region = ap-southeast-3
   ```

## Usage

### Basic Commands

1. **Full Deployment to Hub01** (Default):
   ```bash
   make
   ```
   This command will:
   - Clone the repository
   - Initialize submodules
   - Initialize sBeacon
   - Deploy to Hub01

2. **Deploy to Hub02**:
   ```bash
   make deploy-hub02
   ```

3. **View Available Commands**:
   ```bash
   make help
   ```

### Individual Steps

You can also run individual steps of the deployment process:

1. **Clone Repository**:
   ```bash
   make clone
   ```

2. **Init Submodule `sbeacon` & `svep` **:
   ```bash
   make init-submodule
   ```

3. **Initialize sBeacon**:
   ```bash
   make init-sbeacon
   ```

4. **Plan Terraform Changes**:
   ```bash
   make plan
   ```

5. **Apply Terraform Changes**:
   ```bash
   make apply-terraform
   - or -
   make apply-terraform-autoapprove
   ```

6. **View Terraform Output**:
   ```bash
   make output
   ```

7. **Clean Up**:
   ```bash
   make clean
   ```

### Environment-Specific Commands

- **Set Hub01 Environment**:
  ```bash
  make set-hub01-env
  ```

- **Set Hub02 Environment**:
  ```bash
  make set-hub02-env
  ```

## Directory Structure

After cloning, your repository structure should look like this:

```
BGSI-GeneticAnalysisSupportPlatformIndonesia-GASPI/
├── sbeacon/
│   └── init.sh
├── backend.tf
├── terraform.tfvars
└── Makefile
```

## Configuration Files

### Hub01 Configuration

1. **backend.tf**:
   ```hcl
   terraform {
     backend "s3" {
       bucket         = "terraform-states-hub1-gaspi"
       key            = "gaspi-infrastructure-deployment"
       region         = "ap-southeast-3"
       dynamodb_table = "terraform-states-hub1-gaspi"
     }
   }
   ```

2. **terraform.tfvars**:
   ```hcl
   region = "ap-southeast-3"
   common-tags = {
     "Owner"       = "gaspi"
     "Environment" = "dev"
   }
   ```

### Hub02 Configuration

1. **backend.tf**:
   ```hcl
   terraform {
     backend "s3" {
       region         = "ap-southeast-3"
       bucket         = "tf-state-209479276142-ap-southeast-3"
       dynamodb_table = "ddb-tf-state-209479276142-ap-southeast-3"
       key            = "gxc-consortium/209479276142/sbeacon/terraform.tfstate"
       encrypt        = true
     }
   }
   ```

## Troubleshooting

1. **AWS Authentication Issues**:
   - Ensure AWS credentials are properly configured
   - Verify the correct AWS profile is being used
   - Check AWS CLI configuration using `aws configure list`

2. **Python Environment Issues**:
   - Verify Python 3.12 is installed: `python3.12 --version`
   - Ensure virtual environment is activated
   - Check required Python packages are installed

3. **Terraform State Issues**:
   - Verify S3 bucket exists and is accessible
   - Check DynamoDB table permissions
   - Ensure backend configuration is correct

## Support

For issues or questions related to this deployment process, please contact:
- DevOps Team: devops@xapiens.id
