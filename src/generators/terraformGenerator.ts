export class TerraformGenerator {
	async generateTerraformCode(description: string): Promise<string> {
		const platform = this.detectPlatform(description);
		const isMultiCloud = description.toLowerCase().includes('multi');

		if (isMultiCloud) {
			return this.generateMultiCloudTerraform(description);
		}

		switch (platform) {
			case 'aws':
				return this.generateAWSTerraform(description);
			case 'azure':
				return this.generateAzureTerraform(description);
			case 'gcp':
				return this.generateGCPTerraform(description);
			default:
				return this.generateAWSTerraform(description);
		}
	}

	private detectPlatform(description: string): string {
		const desc = description.toLowerCase();
		if (desc.includes('azure') || desc.includes('vm') || desc.includes('app service')) {
			return 'azure';
		}
		if (desc.includes('gcp') || desc.includes('compute engine') || desc.includes('cloud run')) {
			return 'gcp';
		}
		return 'aws';
	}

	private generateAWSTerraform(description: string): string {
		const hasDatabase = description.toLowerCase().includes('database') || description.toLowerCase().includes('db');
		const hasStorage = description.toLowerCase().includes('storage') || description.toLowerCase().includes('s3');

		return `# Megha-Agent Generated Terraform Configuration
# Cloud Platform: AWS
# Generated: ${new Date().toISOString()}

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "Megha-Agent"
      CreatedDate = "${new Date().toISOString()}"
    }
  }
}

# Variables
variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "megha-project"
}

variable "instance_count" {
  description = "Number of EC2 instances"
  type        = number
  default     = 2
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

# VPC and Networking
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "\${var.project_name}-vpc"
  }
}

resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name = "\${var.project_name}-public-subnet-1"
  }
}

resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = data.aws_availability_zones.available.names[1]
  map_public_ip_on_launch = true

  tags = {
    Name = "\${var.project_name}-public-subnet-2"
  }
}

resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = data.aws_availability_zones.available.names[0]

  tags = {
    Name = "\${var.project_name}-private-subnet-1"
  }
}

resource "aws_subnet" "private_2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = data.aws_availability_zones.available.names[1]

  tags = {
    Name = "\${var.project_name}-private-subnet-2"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "\${var.project_name}-igw"
  }
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block      = "0.0.0.0/0"
    gateway_id      = aws_internet_gateway.main.id
  }

  tags = {
    Name = "\${var.project_name}-public-rt"
  }
}

resource "aws_route_table_association" "public_1" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public.id
}

# Security Groups
resource "aws_security_group" "web" {
  name   = "\${var.project_name}-web-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "\${var.project_name}-web-sg"
  }
}

resource "aws_security_group" "database" {
  name   = "\${var.project_name}-db-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.web.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "\${var.project_name}-db-sg"
  }
}

# Load Balancer
resource "aws_lb" "main" {
  name               = "\${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.web.id]
  subnets            = [aws_subnet.public_1.id, aws_subnet.public_2.id]

  tags = {
    Name = "\${var.project_name}-alb"
  }
}

# EC2 Instances
resource "aws_instance" "web" {
  count                = var.instance_count
  ami                  = data.aws_ami.ubuntu.id
  instance_type        = var.instance_type
  subnet_id            = count.index % 2 == 0 ? aws_subnet.public_1.id : aws_subnet.public_2.id
  security_groups      = [aws_security_group.web.id]
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name

  user_data = base64encode(file("\${path.module}/user_data.sh"))

  tags = {
    Name = "\${var.project_name}-web-\${count.index + 1}"
  }

  depends_on = [aws_internet_gateway.main]
}

${hasDatabase ? `
# RDS Database
resource "aws_db_subnet_group" "main" {
  name       = "\${var.project_name}-db-subnet-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]

  tags = {
    Name = "\${var.project_name}-db-subnet-group"
  }
}

resource "aws_db_instance" "main" {
  identifier     = "\${var.project_name}-db"
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  storage_type          = "gp3"
  storage_encrypted     = true
  
  db_name                    = "meghadb"
  username                   = "admin"
  password                   = random_password.db_password.result
  
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.database.id]
  
  multi_az            = true
  backup_retention_period = 7
  
  skip_final_snapshot = false
  final_snapshot_identifier = "\${var.project_name}-final-snapshot"

  tags = {
    Name = "\${var.project_name}-database"
  }
}

resource "random_password" "db_password" {
  length  = 16
  special = true
}
` : ''}

${hasStorage ? `
# S3 Bucket
resource "aws_s3_bucket" "main" {
  bucket = "\${var.project_name}-\${data.aws_caller_identity.current.account_id}"

  tags = {
    Name = "\${var.project_name}-bucket"
  }
}

resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
` : ''}

# Data Sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

data "aws_caller_identity" "current" {}

# IAM
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "\${var.project_name}-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

resource "aws_iam_role" "ec2_role" {
  name = "\${var.project_name}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ec2_ssm" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Outputs
output "load_balancer_dns" {
  description = "DNS name of the load balancer"
  value       = aws_lb.main.dns_name
}

output "instances" {
  description = "EC2 instance details"
  value = {
    ids           = aws_instance.web[*].id
    private_ips   = aws_instance.web[*].private_ip
    public_ips    = aws_instance.web[*].public_ip
  }
}

${hasDatabase ? `
output "database_endpoint" {
  description = "RDS database endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}
` : ''}
`;
	}

	private generateAzureTerraform(description: string): string {
		return `# Megha-Agent Generated Terraform Configuration
# Cloud Platform: Azure
# Generated: ${new Date().toISOString()}

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Variables
variable "location" {
  description = "Azure location"
  type        = string
  default     = "East US"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "megha-project"
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "\${var.project_name}-rg"
  location = var.location

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Megha-Agent"
  }
}

# Virtual Network
resource "azurerm_virtual_network" "main" {
  name                = "\${var.project_name}-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  tags = azurerm_resource_group.main.tags
}

resource "azurerm_subnet" "public" {
  name                 = "\${var.project_name}-public-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_subnet" "private" {
  name                 = "\${var.project_name}-private-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.2.0/24"]
}

# Network Security Group
resource "azurerm_network_security_group" "main" {
  name                = "\${var.project_name}-nsg"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  security_rule {
    name                       = "AllowHTTP"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "AllowHTTPS"
    priority                   = 101
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  tags = azurerm_resource_group.main.tags
}

# Virtual Machines
resource "azurerm_public_ip" "main" {
  name                = "\${var.project_name}-pip"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = "Static"

  tags = azurerm_resource_group.main.tags
}

resource "azurerm_network_interface" "main" {
  name                = "\${var.project_name}-nic"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  ip_configuration {
    name                          = "testConfiguration"
    subnet_id                     = azurerm_subnet.public.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.main.id
  }

  tags = azurerm_resource_group.main.tags
}

resource "azurerm_linux_virtual_machine" "main" {
  name                = "\${var.project_name}-vm"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  size                = "Standard_B2s"

  admin_username = "azureuser"

  admin_ssh_key {
    username   = "azureuser"
    public_key = file("\${path.module}/id_rsa.pub")
  }

  network_interface_ids = [
    azurerm_network_interface.main.id,
  ]

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "18_04-lts-gen2"
    version   = "latest"
  }

  tags = azurerm_resource_group.main.tags
}

# Outputs
output "vm_public_ip" {
  description = "Public IP address of the VM"
  value       = azurerm_public_ip.main.ip_address
}

output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}
`;
	}

	private generateGCPTerraform(description: string): string {
		return `# Megha-Agent Generated Terraform Configuration
# Cloud Platform: GCP
# Generated: ${new Date().toISOString()}

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP Zone"
  type        = string
  default     = "us-central1-a"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "megha-project"
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# VPC Network
resource "google_compute_network" "main" {
  name                    = "\${var.project_name}-vpc"
  auto_create_subnetworks = false

  depends_on = [google_project_service.compute]
}

resource "google_compute_subnetwork" "public" {
  name          = "\${var.project_name}-public-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region
  network       = google_compute_network.main.id
}

resource "google_compute_subnetwork" "private" {
  name          = "\${var.project_name}-private-subnet"
  ip_cidr_range = "10.0.2.0/24"
  region        = var.region
  network       = google_compute_network.main.id
}

# Firewall Rules
resource "google_compute_firewall" "allow_http_https" {
  name    = "\${var.project_name}-allow-http-https"
  network = google_compute_network.main.name

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  source_ranges = ["0.0.0.0/0"]
}

# Compute Instances
resource "google_compute_instance" "web" {
  name         = "\${var.project_name}-instance"
  machine_type = "e2-medium"
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = "ubuntu-2204-lts"
    }
  }

  network_interface {
    network    = google_compute_network.main.name
    subnetwork = google_compute_subnetwork.public.name

    access_config {}
  }

  metadata_startup_script = file("\${path.module}/startup.sh")

  labels = {
    environment = "production"
    project     = var.project_name
    managed_by  = "megha-agent"
  }

  depends_on = [google_project_service.compute]
}

# Cloud SQL
resource "google_sql_database_instance" "main" {
  name             = "\${var.project_name}-sql"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = "db-f1-micro"

    backup_configuration {
      enabled = true
    }

    ip_configuration {
      require_ssl = true
    }
  }

  depends_on = [google_project_service.sql]
}

resource "google_sql_database" "main" {
  name     = "meghadb"
  instance = google_sql_database_instance.main.name
}

# Cloud Storage
resource "google_storage_bucket" "main" {
  name     = "\${var.project_id}-\${var.project_name}-bucket"
  location = var.region

  versioning {
    enabled = true
  }

  uniform_bucket_level_access = true

  labels = {
    environment = "production"
    project     = var.project_name
  }

  depends_on = [google_project_service.storage]
}

# Enable Required Services
resource "google_project_service" "compute" {
  service = "compute.googleapis.com"
}

resource "google_project_service" "sql" {
  service = "sqladmin.googleapis.com"
}

resource "google_project_service" "storage" {
  service = "storage.googleapis.com"
}

# Outputs
output "instance_public_ip" {
  description = "Public IP address of the instance"
  value       = google_compute_instance.web.network_interface[0].access_config[0].nat_ip
}

output "database_connection_name" {
  description = "Cloud SQL connection name"
  value       = google_sql_database_instance.main.connection_name
}

output "storage_bucket_name" {
  description = "Name of the storage bucket"
  value       = google_storage_bucket.main.name
}
`;
	}

	private generateMultiCloudTerraform(description: string): string {
		return `# Megha-Agent Generated Multi-Cloud Terraform Configuration
# Supporting: AWS (Primary), Azure (Compliance), GCP (Disaster Recovery)
# Generated: ${new Date().toISOString()}

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# AWS Provider (Primary)
provider "aws" {
  region = var.aws_region
  alias  = "primary"
}

# Azure Provider (Compliance)
provider "azurerm" {
  alias    = "compliance"
  features {}
}

# GCP Provider (Disaster Recovery)
provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
  alias   = "dr"
}

# Shared Variables
variable "aws_region" {
  default = "us-east-1"
}

variable "gcp_region" {
  default = "us-central1"
}

variable "gcp_project_id" {
  type = string
}

variable "project_name" {
  default = "megha-multicloud"
}

# AWS Module (Primary)
module "aws_infrastructure" {
  source = "./modules/aws"
  providers = {
    aws = aws.primary
  }
  
  project_name = var.project_name
  region       = var.aws_region
  environment  = "production"
}

# Azure Module (Compliance)
module "azure_infrastructure" {
  source = "./modules/azure"
  providers = {
    azurerm = azurerm.compliance
  }
  
  project_name = var.project_name
  location     = "East US"
  environment  = "compliance"
}

# GCP Module (Disaster Recovery)
module "gcp_infrastructure" {
  source = "./modules/gcp"
  providers = {
    google = google.dr
  }
  
  project_name = var.project_name
  project_id   = var.gcp_project_id
  region       = var.gcp_region
  environment  = "disaster-recovery"
}

# Cross-Cloud Outputs
output "primary_aws_endpoint" {
  value = module.aws_infrastructure.load_balancer_dns
}

output "compliance_azure_endpoint" {
  value = module.azure_infrastructure.public_ip
}

output "dr_gcp_endpoint" {
  value = module.gcp_infrastructure.instance_public_ip
}

output "deployment_summary" {
  value = {
    primary_region      = var.aws_region
    compliance_region   = "East US"
    disaster_recovery   = var.gcp_region
    total_instances     = 6
    managed_by          = "Megha-Agent"
    multi_cloud_enabled = true
  }
}
`;
	}
}
