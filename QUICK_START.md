# Quick Start - Megha Cloud Architect Agent (5 Minutes)

Get up and running with Megha Agent in 5 minutes.

## Prerequisites ⚙️

- VS Code (1.85.0+)
- Node.js (18.0+)
- GitHub Copilot extension
- Terraform (for running generated configs)

## Installation (2 minutes)

### Step 1: Clone and Install

```bash
cd d:\Smart\Megha-agent
npm install
npm run compile
```

### Step 2: Launch

In VS Code: Press `F5` to open the extension in a new window

## First Task (3 minutes)

### Generate Architecture Diagram

1. In the new VS Code window, press `Ctrl+Shift+P`
2. Type "Megha: Generate Architecture Diagram"
3. Enter: `"Multi-tier web app with database on AWS"`
4. Wait 3 seconds for the diagram to appear

### Generate Terraform Code

1. Press `Ctrl+Shift+P`
2. Type "Megha: Generate Terraform Configuration"
3. Enter: `"AWS EC2 with RDS PostgreSQL"`
4. Review the generated `megha-generated.tf` file

## Explore Features

### Available Commands

Press `Ctrl+Shift+P` and type "Megha" to see:

- **Start Cloud Architecture Session** - Create a new project
- **Generate Architecture Diagram** - Create architecture visualization
- **Generate User Access Flow** - Design access control flows
- **Generate Terraform Configuration** - Generate IaC code
- **Generate Mermaid Diagram** - Create custom diagrams
- **Open Diagram Editor** - Edit diagrams visually

### Try These Examples

1. **Simple Web App**
   ```
   "Web application with load balancer and database"
   ```

2. **Microservices**
   ```
   "Microservices architecture with API gateway and message queue"
   ```

3. **Serverless**
   ```
   "Serverless application using Lambda and DynamoDB"
   ```

4. **Multi-Cloud**
   ```
   "Multi-cloud architecture with AWS primary and Azure failover"
   ```

## Next Steps

1. **Read Full Docs** → [README.md](./README.md)
2. **Learn Patterns** → [Architecture Patterns](./docs/patterns.md)
3. **Security** → [Security Best Practices](./docs/security.md)
4. **Cost Savings** → [Cost Optimization](./docs/cost-optimization.md)
5. **Develop** → [Development Guide](./DEVELOPMENT.md)

## Common Questions

**Q: Where are my generated files?**
A: Check the workspace folder. Diagrams appear in webview panels, Terraform in files.

**Q: Can I edit generated Terraform?**
A: Yes! They're editable `.tf` files. Modify as needed for your specific needs.

**Q: How do I deploy the generated configs?**
A: Run `terraform init`, `terraform plan`, `terraform apply`

**Q: Can I use these with my existing infrastructure?**
A: Yes, import existing resources with `terraform import`

**Q: How often is this updated?**
A: Check [Changelog](./CHANGELOG.md) for latest features

---

**That's it! You're ready to architect cloud solutions!** 🚀

For more help, see [Full Setup Guide](./SETUP.md)
