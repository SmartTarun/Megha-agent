# Cloud Cost Optimization Guide

Strategies for reducing cloud spending while maintaining performance and reliability.

## Cost Optimization Framework

### The 7 Pillars

1. **Right-Sizing** - Match resource capacity to actual demand
2. **Commitment Discounts** - Prepay for capacity (1-3 year terms)
3. **Spot/Low-Priority** - Use cheaper instances for fault-tolerant workloads
4. **Serverless** - Pay only for what you use
5. **Storage Optimization** - Tier data by access patterns
6. **Data Transfer Optimization** - Minimize egress costs
7. **Resource Cleanup** - Remove unused resources

---

## 1. Right-Sizing Strategy

### Analyze Resource Utilization

```bash
# CloudWatch metrics to track
# - CPU Utilization
# - Memory Usage
# - Network I/O
# - Disk I/O

# Example: Find underutilized EC2 instances
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=i-1234567890abcdef0 \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-31T00:00:00Z \
  --period 3600 \
  --statistics Average
```

### Right-Sizing Recommendations

| Current | Underutilized | Recommendation | Savings |
|---------|--------------|----------------|---------|
| t3.xlarge | <20% CPU avg | t3.medium | 75% |
| t3.large | <10% CPU avg | t3.small | 88% |
| m5.2xlarge | 15-30% CPU | m5.large | 62% |
| r5.4xlarge | 20% memory | r5.2xlarge | 50% |

### Terraform Implementation

```hcl
# Implement auto-scaling instead of fixed capacity
resource "aws_autoscaling_group" "app" {
  name                = "app-asg"
  min_size            = 2
  max_size            = 10
  desired_capacity    = 2
  
  launch_configuration = aws_launch_configuration.app.id
  
  vpc_zone_identifier = [aws_subnet.private_1.id, aws_subnet.private_2.id]
  
  tag {
    key                 = "Name"
    value               = "app-instance"
    propagate_at_launch = true
  }
}

# Scale based on actual demand
resource "aws_autoscaling_policy" "scale_up" {
  name                   = "scale-up"
  scaling_adjustment     = 2
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = aws_autoscaling_group.app.name
}

resource "aws_cloudwatch_metric_alarm" "scale_up" {
  alarm_name          = "scale-up-alarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 70
  
  alarm_actions = [aws_autoscaling_policy.scale_up.arn]
}
```

---

## 2. Commitment Discounts

### Reserved Instances (AWS)

```hcl
# Reserve capacity for predictable baseline
# 1-year term: 30-40% savings
# 3-year term: 50-60% savings

resource "aws_ec2_fleet" "app" {
  spot_options {
    instance_interruption_behavior = "terminate"
  }
  
  launch_template_config {
    launch_template_specification {
      launch_template_id = aws_launch_template.app.id
      version            = "$Latest"
    }
    
    overrides {
      instance_type = "t3.medium"      # Reserve some
      weighted_capacity = "1"
    }
    
    overrides {
      instance_type = "t3a.medium"     # Use Spot for burstiness
      weighted_capacity = "1"
    }
  }
}
```

### Cost Comparison

```
Monthly Cost Comparison for m5.large (1000 hours/month):

On-Demand:          $100/month
1-Year Reserved:    $60/month (40% savings)
3-Year Reserved:    $45/month (55% savings)
Spot (avg):         $30/month (70% savings)
Spot + On-Demand:   $50/month (50% savings)
```

### Coverage Analysis

```bash
# Recommended allocation:
# - 40% Reserved Instances (predictable baseline)
# - 30% Spot Instances (variable workload)
# - 30% On-Demand (burstiness)

# This typically saves 40-50% vs all On-Demand
```

---

## 3. Spot/Low-Priority Instances

### Use Cases for Spot

✓ Batch processing jobs
✓ Development/testing environments
✓ Big data analytics
✓ CI/CD pipelines
✓ Workloads with checkpointing

✗ Databases
✗ Real-time APIs
✗ Interactive applications

### Implementation

```hcl
# Mixed instance type group
resource "aws_autoscaling_group" "app" {
  mixed_instances_policy {
    instances_distribution {
      on_demand_base_capacity                  = 2
      on_demand_percentage_above_base_capacity = 30
      spot_instance_pools                      = 4
      spot_max_price                           = "0.05"
    }
    
    launch_template {
      launch_template_specification {
        launch_template_id = aws_launch_template.app.id
        version            = "$Latest"
      }
      
      override {
        instance_type     = "t3.large"
        weighted_capacity = "1"
      }
      
      override {
        instance_type     = "t3a.large"
        weighted_capacity = "1"
      }
      
      override {
        instance_type     = "m5.large"
        weighted_capacity = "1"
      }
    }
  }
}
```

---

## 4. Serverless Optimization

### Function Sizing

```hcl
# Lambda cost is: (# requests × duration × memory) / 1M × $0.0000166667

# Example: 1M requests/month, 1s avg duration, 512MB

# Current: 512MB × 1s
# Cost: (1M × 1 × 512) / 1M × $0.0000166667 = $8.53/month

# Optimized: 256MB × 0.5s
# Cost: (1M × 0.5 × 256) / 1M × $0.0000166667 = $2.13/month
# Savings: 75%

resource "aws_lambda_function" "api" {
  filename         = "function.zip"
  function_name    = "api-handler"
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  memory_size      = 256  # Right-sized
  timeout          = 30
  
  ephemeral_storage {
    size = 512  # 512 MB
  }
}
```

### Cost-Effective Alternatives

```hcl
# Instead of always-on containers
# Use: Lambda + API Gateway

resource "aws_api_gateway_rest_api" "api" {
  name = "serverless-api"
}

# Add auto-scaling to save when load decreases
resource "aws_appautoscaling_target" "lambda_concurrency" {
  max_capacity       = 100
  min_capacity       = 1
  resource_id        = "function:${aws_lambda_function.api.function_name}:provisioned-concurrency-config"
  scalable_dimension = "lambda:function:ProvisionedConcurrentExecutions"
  service_namespace  = "lambda"
}
```

---

## 5. Storage Optimization

### S3 Tiering Strategy

```hcl
resource "aws_s3_bucket" "data" {
  bucket = "company-data"
}

# Intelligent-Tiering saves up to 70% on infrequently accessed data
resource "aws_s3_bucket_intelligent_tiering_configuration" "main" {
  bucket = aws_s3_bucket.data.id
  name   = "auto-tiering"
  
  tiering {
    days          = 90
    access_tier   = "ARCHIVE_ACCESS"
  }
  
  tiering {
    days          = 180
    access_tier   = "DEEP_ARCHIVE_ACCESS"
  }
}

# Lifecycle policies
resource "aws_s3_bucket_lifecycle_configuration" "main" {
  bucket = aws_s3_bucket.data.id
  
  rule {
    id = "archive-old-data"
    
    filter {
      prefix = "logs/"
    }
    
    # Standard → IA after 30 days (saves 50%)
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    
    # IA → Glacier after 90 days (saves 80%)
    transition {
      days          = 90
      storage_class = "GLACIER"
    }
    
    # Delete after 1 year
    expiration {
      days = 365
    }
  }
}
```

### Storage Cost Savings

```
Monthly Storage Costs (100GB data):

All Standard:           $2.30
With IA (30 days):      $1.50 (35% savings)
With Glacier (90 days): $0.90 (61% savings)
With Intelligent-Tier:  $1.20 (48% savings, automatic)
```

---

## 6. Data Transfer Optimization

### Minimize Egress Costs

```hcl
# Use CloudFront CDN to reduce origin bandwidth costs
resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = aws_s3_bucket.content.bucket_regional_domain_name
    origin_id   = "s3-origin"
  }
  
  # Egress cost from origin: $0.085/GB
  # CloudFront distribution: $0.085/GB
  # + CDN: $0.085/GB (but cached)
  # = Net savings for repeated requests
  
  enabled = true
  
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "s3-origin"
    
    forwarded_values {
      query_string = false
      
      cookies {
        forward = "none"
      }
    }
    
    viewer_protocol_policy = "https-only"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
```

### VPC Endpoints (Avoid NAT Gateway costs)

```hcl
# NAT Gateway cost: $32/month + data transfer
# VPC Endpoint cost: $7.20/month + data transfer

resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.us-east-1.s3"
  route_table_ids   = [aws_route_table.private.id]
  policy            = data.aws_iam_policy_document.s3_policy.json
  
  # S3 Gateway endpoint = FREE
  vpc_endpoint_type = "Gateway"
}

# Access S3 without going through NAT Gateway
# Savings: $32/month + 100GB transfer @ $0.045/GB = $32 + $4.50 = $36.50/month
```

---

## 7. Resource Cleanup

### Unused Resource Audit

```hcl
# AWS Config rules to find unused resources
resource "aws_config_config_rule" "unused_ebs_volumes" {
  name = "unused-ebs-volumes"
  
  source {
    owner             = "AWS"
    source_identifier = "EC2_VOLUME_INUSE_CHECK"
  }
}

resource "aws_config_config_rule" "unused_security_groups" {
  name = "unused-security-groups"
  
  source {
    owner             = "AWS"
    source_identifier = "EC2_SECURITY_GROUP_IN_USE"
  }
}
```

### Automated Cleanup

```python
# Script to identify and tag unused resources
import boto3
from datetime import datetime, timedelta

ec2 = boto3.client('ec2')
cloudwatch = boto3.client('cloudwatch')

# Find EC2 instances with zero CPU utilization for 7 days
def find_idle_instances():
    instances = ec2.describe_instances()
    
    for reservation in instances['Reservations']:
        for instance in reservation['Instances']:
            instance_id = instance['InstanceId']
            
            # Check CPU metrics
            response = cloudwatch.get_metric_statistics(
                Namespace='AWS/EC2',
                MetricName='CPUUtilization',
                Dimensions=[{'Name': 'InstanceId', 'Value': instance_id}],
                StartTime=datetime.utcnow() - timedelta(days=7),
                EndTime=datetime.utcnow(),
                Period=86400,
                Statistics=['Average']
            )
            
            avg_cpu = sum([dp['Average'] for dp in response['Datapoints']]) / len(response['Datapoints'])
            
            if avg_cpu < 5:
                print(f"Instance {instance_id} is idle (avg CPU: {avg_cpu}%)")
                # Tag for review/deletion
                ec2.create_tags(
                    Resources=[instance_id],
                    Tags=[{'Key': 'scheduled-for-termination', 'Value': 'true'}]
                )
```

---

## Cost Monitoring & Alerts

### CloudWatch Cost Anomaly Detection

```hcl
resource "aws_ce_anomaly_monitor" "spending" {
  monitor_type   = "DIMENSIONAL"
  monitor_dimension = "SERVICE"
  monitor_specification = jsonencode({
    or = [
      { tags = { key = "Environment", values = ["production"] } }
    ]
  })
}

resource "aws_ce_anomaly_subscription" "alert" {
  threshold           = 100  # Alert if spending anomaly > $100
  frequency           = "DAILY"
  monitor_arn         = aws_ce_anomaly_monitor.spending.arn
  
  subscriber_email_addresses = ["finance@company.com"]
}
```

### Cost Explorer Queries

```bash
# Get daily cost trend
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity DAILY \
  --metrics "UnblendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE

# Top 10 services by cost
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE
```

---

## Expected Savings

### Typical Multi-Cloud Deployment

**Before Optimization**:
- AWS: $5,000/month
- Azure: $2,000/month
- GCP: $1,500/month
- **Total: $8,500/month**

**After Optimization**:
- Right-sizing: -30% ($2,550)
- Reserved instances: -25% ($2,125)
- Spot instances: -20% ($1,700)
- Serverless: -15% ($1,275)
- Storage tiering: -10% ($850)

**New Total: $3,400/month (60% savings)**

---

## ROI Timeline

| Month | Savings | Cumulative |
|-------|---------|-----------|
| 1 | $5,100 | $5,100 |
| 2 | $5,100 | $10,200 |
| 3 | $5,100 | $15,300 |
| 6 | $5,100 | $30,600 |
| 12 | $5,100 | $61,200 |

**Cost of optimization effort**: ~$10,000 one-time
**Payback period**: ~6 weeks
**Annual savings**: $61,200

---

## Cost Optimization Checklist

- [ ] Analyze current resource utilization
- [ ] Right-size all instances
- [ ] Purchase Reserved Instances for baseline
- [ ] Implement Spot Instances for variable load
- [ ] Enable auto-scaling groups
- [ ] Migrate suitable workloads to serverless
- [ ] Set up S3 lifecycle policies
- [ ] Enable Intelligent-Tiering
- [ ] Deploy CloudFront for static content
- [ ] Use VPC endpoints instead of NAT Gateway
- [ ] Clean up unused resources
- [ ] Set up cost anomaly alerts
- [ ] Review monthly cost trends
- [ ] Implement FinOps governance

---

See [Security Best Practices](./security.md) for balancing cost savings with security requirements.
