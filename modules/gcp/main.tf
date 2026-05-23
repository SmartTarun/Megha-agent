# GCP Infrastructure Module
# Megha-Agent Generated Terraform Module

terraform {
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

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP zone"
  type        = string
  default     = "us-central1-a"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# VPC Network
resource "google_compute_network" "main" {
  name                    = "${var.project_name}-vpc"
  auto_create_subnetworks = false

  depends_on = [google_project_service.compute]
}

# Subnets
resource "google_compute_subnetwork" "main" {
  count         = 2
  name          = "${var.project_name}-subnet-${count.index + 1}"
  ip_cidr_range = "10.0.${count.index + 1}.0/24"
  region        = var.region
  network       = google_compute_network.main.id
}

# Firewall Rules
resource "google_compute_firewall" "allow_http_https" {
  name    = "${var.project_name}-allow-http-https"
  network = google_compute_network.main.name

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  source_ranges = ["0.0.0.0/0"]
}

resource "google_compute_firewall" "allow_internal" {
  name    = "${var.project_name}-allow-internal"
  network = google_compute_network.main.name

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }

  source_ranges = ["10.0.0.0/16"]
}

# Compute Instance
resource "google_compute_instance" "main" {
  count        = 2
  name         = "${var.project_name}-instance-${count.index + 1}"
  machine_type = "e2-medium"
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = "ubuntu-2204-lts"
    }
  }

  network_interface {
    network    = google_compute_network.main.name
    subnetwork = google_compute_subnetwork.main[count.index].name

    access_config {}
  }

  labels = {
    environment = var.environment
    project     = var.project_name
    managed_by  = "megha-agent"
  }

  depends_on = [google_project_service.compute]
}

# Enable Required Services
resource "google_project_service" "compute" {
  service = "compute.googleapis.com"

  disable_on_destroy = false
}

resource "google_project_service" "sql" {
  service = "sqladmin.googleapis.com"

  disable_on_destroy = false
}

# Outputs
output "vpc_id" {
  value = google_compute_network.main.id
}

output "subnet_ids" {
  value = google_compute_subnetwork.main[*].id
}

output "instance_ids" {
  value = google_compute_instance.main[*].id
}

output "instance_public_ips" {
  value = google_compute_instance.main[*].network_interface[0].access_config[0].nat_ip
}
