# Makefile for BGSI-GASPI Deployment
# ================================================

# Variables
REPO_NAME = BGSI-GeneticAnalysisSupportPlatformIndonesia-GASPI
REPO_URL = git@github.com:GSI-Xapiens-CSIRO/$(REPO_NAME).git
PYTHON_ENV = ~/py312/bin/activate
AWS_REGION = ap-southeast-3

# Default target
.PHONY: all
all: clone init-sbeacon deploy-hub01

# Clone repository
.PHONY: clone
clone:
	@echo "Cloning repository..."
	git clone $(REPO_URL)
	cd $(REPO_NAME) && git submodule update --init --recursive

# Initialize submodules
.PHONY: init-submodule
init-submodule:
	@echo "Initializing submodule sbeacon & svep ..."
	git submodule update --init --recursive

# Initialize sBeacon
.PHONY: init-sbeacon
init-sbeacon:
	@echo "Initializing sBeacon..."
	cd $(REPO_NAME)/sbeacon && ./init.sh

# Deploy to Hub01
.PHONY: deploy-hub01
deploy-hub01: set-hub01-env init-submodule init-terraform apply-terraform

# Deploy to Hub02
.PHONY: deploy-hub02
deploy-hub02: set-hub02-env init-submodule init-terraform apply-terraform

# Set Hub01 environment
.PHONY: set-hub01-env
set-hub01-env:
	@echo "Setting Hub01 environment..."
	unset AWS_SESSION_TOKEN AWS_SECRET_ACCESS_KEY AWS_ACCESS_KEY_ID
	export AWS_PROFILE=GXC-TF-User-Executor-Hub01
	export AWS_DEFAULT_REGION=$(AWS_REGION)
	aws sts get-caller-identity --profile $$AWS_PROFILE
	source $(PYTHON_ENV)

# Set Hub02 environment
.PHONY: set-hub02-env
set-hub02-env:
	@echo "Setting Hub02 environment..."
	unset AWS_SESSION_TOKEN AWS_SECRET_ACCESS_KEY AWS_ACCESS_KEY_ID
	export AWS_PROFILE=GXC-TF-User-Executor-Hub02
	export AWS_DEFAULT_REGION=$(AWS_REGION)
	aws sts get-caller-identity --profile $$AWS_PROFILE
	source $(PYTHON_ENV)

# Initialize Terraform
.PHONY: init-terraform
init-terraform:
	@echo "Initializing Terraform..."
	terraform init
	terraform workspace new staging || true
	terraform workspace select staging

# Plan Terraform changes
.PHONY: plan
plan:
	@echo "Planning Terraform changes..."
	terraform plan

# Apply Terraform changes
.PHONY: apply-terraform
apply-terraform:
	@echo "Applying Terraform changes..."
	terraform apply

apply-terraform-autoapprove:
	@echo "Applying Terraform (Auto-Approve) changes..."
	terraform apply -auto-approve

# Show Terraform output
.PHONY: output
output:
	@echo "Showing Terraform output..."
	terraform output

# Clean up
.PHONY: clean
clean:
	@echo "Cleaning up..."
	rm -rf $(REPO_NAME)

# Help target
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  all              - Clone repository and deploy to Hub01 (default)"
	@echo "  clone            - Clone the repository and init submodules"
	@echo "  init-sbeacon     - Initialize sBeacon"
	@echo "  deploy-hub01     - Deploy to Hub01"
	@echo "  deploy-hub02     - Deploy to Hub02"
	@echo "  plan             - Run terraform plan"
	@echo "  output           - Show terraform output"
	@echo "  clean            - Clean up repository"
	@echo "  help             - Show this help message"