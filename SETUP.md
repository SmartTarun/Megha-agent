# Megha Cloud Architect Agent - Setup Guide

Complete setup instructions for installing and configuring the Megha Agent extension.

## 📋 Prerequisites

### System Requirements
- **OS**: Windows, macOS, or Linux
- **VS Code**: Version 1.85.0 or higher
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher

### Check Your Versions

```bash
# Check VS Code
code --version

# Check Node.js
node --version

# Check npm
npm --version
```

### Required VS Code Extensions
- **GitHub Copilot** (for AI-powered features)
- **GitHub Copilot Chat** (recommended)

---

## 🚀 Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/megha-agent/megha-agent.git
cd megha-agent
```

Or open the folder in VS Code:
- File → Open Folder → Select `d:\Smart\Megha-agent`

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages listed in `package.json`:
- TypeScript compiler
- VS Code Extension API
- Testing frameworks
- Linting tools

### Step 3: Compile the Extension

```bash
npm run compile
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Step 4: Launch in Debug Mode

Press `F5` in VS Code, or run:

```bash
npm run watch
```

This launches the extension in a new VS Code window with:
- Source maps for debugging
- Auto-reload on file changes
- Full access to VS Code extension APIs

### Step 5: Verify Installation

In the new VS Code window:

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
2. Type "Megha" to see available commands
3. Select "Megha: Start Cloud Architecture Session"
4. You should see a success message in the bottom right

---

## 🔧 Configuration

### Global Settings

Create `.megha/config.json` in your workspace:

```json
{
  "defaultCloud": "aws",
  "enableMultiCloud": true,
  "diagramFormat": "mermaid",
  "terraformVersion": "1.5",
  "includeBestPractices": true,
  "securityLevel": "high",
  "costOptimization": "aggressive",
  "defaultRegion": "us-east-1",
  "environment": "production"
}
```

### VS Code Settings

Add to `.vscode/settings.json`:

```json
{
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "megha.defaultCloud": "aws",
  "megha.copilotEnabled": true
}
```

---

## 📦 Project Structure Overview

```
megha-agent/
├── src/                          # Source code
│   ├── extension.ts              # Main entry point
│   ├── agents/                   # AI agent logic
│   ├── generators/               # Code/diagram generators
│   ├── integration/              # External integrations
│   └── test/                     # Unit tests
├── modules/                      # Terraform modules
│   ├── aws/                      # AWS IaC templates
│   ├── azure/                    # Azure IaC templates
│   └── gcp/                      # GCP IaC templates
├── docs/                         # Documentation
│   ├── patterns.md               # Architecture patterns
│   ├── security.md               # Security guide
│   └── cost-optimization.md      # Cost optimization
├── dist/                         # Compiled output (generated)
├── node_modules/                 # Dependencies (generated)
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript config
├── README.md                     # User guide
└── DEVELOPMENT.md                # Developer guide
```

---

## 🎯 First Steps

### 1. Create a Test Workspace

Create a new folder for testing:

```bash
mkdir megha-test-project
cd megha-test-project
```

### 2. Initialize Terraform

```bash
terraform init
```

### 3. Use Megha Agent

1. Open the test folder in VS Code
2. Press `Ctrl+Shift+P`
3. Run "Megha: Generate Architecture Diagram"
4. Enter a description: "Multi-tier web application with database on AWS"
5. Wait for the diagram to generate
6. View the architecture in the diagram panel

### 4. Generate Terraform Code

1. Press `Ctrl+Shift+P`
2. Run "Megha: Generate Terraform Configuration"
3. Enter infrastructure requirements
4. Review the generated `megha-generated.tf` file

---

## 🔐 Security Setup

### Configure AWS Credentials

```bash
# Option 1: AWS CLI
aws configure

# Option 2: Environment variables
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
export AWS_REGION="us-east-1"

# Option 3: Credentials file
# ~/.aws/credentials
[default]
aws_access_key_id = your-key
aws_secret_access_key = your-secret
```

### Configure Terraform Backend (Recommended)

Create `backend.tf`:

```hcl
terraform {
  backend "s3" {
    bucket         = "megha-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

---

## 🧪 Testing the Setup

### Run Unit Tests

```bash
npm test
```

### Lint Code

```bash
npm run lint
```

### Check for Issues

```bash
npm run compile
# Look for any TypeScript errors
```

---

## 📊 Verify Each Component

### Extension Activation
- [ ] VS Code loads without errors
- [ ] Megha commands appear in command palette
- [ ] Sidebar shows "Megha Cloud Agent"

### Diagram Generation
- [ ] Mermaid diagrams render correctly
- [ ] Diagrams display in webview panel
- [ ] Export buttons work (if implemented)

### Terraform Generation
- [ ] Generated .tf files are syntactically valid
- [ ] `terraform validate` passes
- [ ] All required variables are defined

### Copilot Integration
- [ ] GitHub Copilot extension is installed
- [ ] Copilot Chat is enabled
- [ ] Can ask Copilot questions

---

## 🚨 Troubleshooting

### "Extension failed to load"
```bash
# Rebuild the extension
npm run compile

# Check for errors
npm run lint
```

### "Copilot Chat not found"
- Install GitHub Copilot Chat extension
- Reload VS Code (`Ctrl+R`)
- Check GitHub subscription is active

### "Terraform validation fails"
```bash
# Check Terraform syntax
terraform validate

# Review generated .tf file
terraform fmt -check megha-generated.tf
```

### "Diagrams don't display"
- Check internet connection (needs CDN access)
- Try in a different browser
- Check browser console for errors (`F12`)

### "Port already in use"
- Another instance of VS Code is running
- Or another development server is using the port
- Kill the process or use a different port

---

## 📈 Performance Tips

### Optimize Initial Load
- Disable unnecessary VS Code extensions
- Increase Node.js memory limit:
  ```bash
  export NODE_OPTIONS="--max-old-space-size=4096"
  ```

### Speed up Compilation
```bash
npm run watch
# Faster incremental compilation
```

### Clear Cache if Needed
```bash
rm -rf node_modules dist
npm install
npm run compile
```

---

## 🔄 Updating the Extension

### Pull Latest Changes

```bash
git pull origin main
```

### Update Dependencies

```bash
npm update
```

### Rebuild

```bash
npm run compile
```

---

## 📚 Next Steps

1. **Read the README** - [README.md](./README.md)
2. **Review Architecture Patterns** - [docs/patterns.md](./docs/patterns.md)
3. **Security Guide** - [docs/security.md](./docs/security.md)
4. **Cost Optimization** - [docs/cost-optimization.md](./docs/cost-optimization.md)
5. **Development Guide** - [DEVELOPMENT.md](./DEVELOPMENT.md)

---

## 🤝 Support & Resources

### Documentation
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Terraform Documentation](https://www.terraform.io/docs/)
- [Mermaid Diagram Syntax](https://mermaid.js.org/)
- [AWS Best Practices](https://aws.amazon.com/architecture/well-architected/)

### Community
- GitHub Issues: Report bugs and request features
- GitHub Discussions: Ask questions and share ideas
- Stack Overflow: Tag questions with `megha-agent`

### Contact
- Email: support@megha-agent.dev
- Twitter: @megha_agent
- LinkedIn: [Megha Agent](https://linkedin.com/company/megha-agent)

---

## ✅ Setup Checklist

- [ ] Prerequisites installed (Node.js, npm, VS Code)
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Extension compiled (`npm run compile`)
- [ ] Extension launched in debug mode (`F5`)
- [ ] Commands visible in palette (`Ctrl+Shift+P`)
- [ ] Test diagram generated successfully
- [ ] Test Terraform config generated
- [ ] GitHub Copilot installed and authenticated
- [ ] AWS credentials configured (optional)
- [ ] Unit tests passing (`npm test`)
- [ ] Linting passes (`npm run lint`)

---

## 🎉 You're Ready!

Congratulations! Your Megha Cloud Architect Agent is set up and ready to use.

Start by:
1. Creating a new workspace folder
2. Running "Megha: Start Cloud Architecture Session"
3. Describing your cloud requirements
4. Generating architecture diagrams and Terraform code

For more information, see [README.md](./README.md) and the [DEVELOPMENT.md](./DEVELOPMENT.md) guide.

---

**Happy architecting! ☁️🚀**
