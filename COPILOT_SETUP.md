# GitHub Copilot Pro Setup for Megha Agent

Complete guide to set up and use GitHub Copilot Pro with your Megha Agent VS Code extension.

## ✅ What's Been Prepared For You

I've created 3 files in your project to make Copilot Pro work perfectly:

1. **`.vscode/copilot-instructions.md`** - Custom instructions telling Copilot about your project
2. **`.vscode/settings.json`** - VS Code settings optimized for Copilot
3. **`install-extensions.ps1`** - PowerShell script to install extensions automatically

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Subscribe to Copilot Pro (5 minutes)

1. Open browser: https://github.com/copilot/pro
2. Click **"Subscribe to Copilot Pro"**
3. Complete payment ($20/month)
4. Confirm your GitHub account

**Note**: You need an active subscription for Pro features.

### Step 2: Run the Installation Script (2 minutes)

Open PowerShell in the Megha Agent folder and run:

```powershell
# Navigate to project
cd d:\Smart\Megha-agent

# Run the installation script
.\install-extensions.ps1

# If you get permission error:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\install-extensions.ps1
```

**This installs:**
- ✅ GitHub Copilot
- ✅ GitHub Copilot Chat
- ✅ Prettier (code formatter)
- ✅ ESLint (code linter)
- ✅ TypeScript support

### Step 3: Authenticate in VS Code (2 minutes)

1. Open VS Code with the Megha Agent project
2. Look for a prompt to sign in with GitHub
3. Click **"Sign in with GitHub"**
4. Complete authentication in browser
5. Return to VS Code - **you're done!**

Alternative: Press `Ctrl+Shift+P` → Type `GitHub: Authorize` → Click

---

## 🎯 How to Use Copilot Pro with Megha Agent

### Access Point 1: Copilot Chat (Best for Questions)

**Open Chat:**
- Press `Ctrl+Alt+I` (fastest)
- Or click the Copilot Chat icon in left sidebar
- Or press `Ctrl+Shift+P` → "Copilot Chat: Open"

**Example Questions:**
```
"Explain the CloudArchitectAgent.ts file"
"Generate TypeScript code for adding Oracle Cloud support"
"How do I add Kubernetes manifest generation?"
"Review this Terraform code for security issues"
"Generate test cases for the DiagramGenerator"
"Create documentation for the cost optimization guide"
```

### Access Point 2: Inline Suggestions (While Typing)

**How it works:**
1. Start typing code
2. Copilot shows suggestions (grayed out)
3. Press `Tab` to accept
4. Press `Escape` to dismiss
5. Press `Alt+[` or `Alt+]` to cycle suggestions

**Example:**
```typescript
// Start typing:
async function analyze

// Copilot suggests the full function
async function analyzeRequirements(requirements: string): Promise<Analysis> {
  // ... implementation
}
```

### Access Point 3: Code Actions

**Right-click on code** and select from Copilot menu:
- Explain This
- Generate Tests
- Fix This
- Refactor

**Or press `Ctrl+I`** to open inline chat for selected code.

---

## 💡 Smart Prompts for Your Project

### For Architecture Agent Development

```
"In the cloudArchitectAgent.ts file, the analyzeArchitectureNeeds method needs to
detect additional cloud patterns. Generate code to identify:
- Kubernetes patterns
- Serverless patterns
- GraphQL/REST API patterns
- Event-driven patterns"
```

### For Terraform Module Enhancement

```
"Look at the AWS Terraform module (modules/aws/main.tf). Add support for:
1. RDS database with encryption
2. VPC endpoints to reduce NAT costs
3. CloudFront distribution for CDN
4. Auto-scaling groups for EC2

Include security best practices and outputs."
```

### For Security Analysis

```
"Review the Terraform configurations I've generated. Check for:
1. Overly permissive security groups
2. Missing encryption
3. Database exposure
4. IAM policy issues
5. Missing backups

Suggest fixes for each issue."
```

### For Test Generation

```
"Generate comprehensive test cases for the DiagramGenerator class.
Include tests for:
- Each of the 7 diagram types
- Error handling
- Edge cases
- Integration with the extension

Follow the existing test pattern in src/test/extension.test.ts"
```

### For Documentation

```
"Generate a comprehensive guide on multi-cloud Terraform strategies.
Include:
1. Architecture patterns
2. Cost comparison
3. Security considerations
4. Terraform module examples
5. Disaster recovery setup"
```

---

## 📝 Using Custom Instructions

The `.vscode/copilot-instructions.md` file tells Copilot about your project. It includes:

- ✅ Project structure and tech stack
- ✅ Code style and naming conventions
- ✅ Architecture patterns to implement
- ✅ Security requirements
- ✅ Testing standards
- ✅ Terraform generation requirements

**How Copilot uses it:**
- Automatically follows your code style
- Suggests patterns consistent with your project
- Remembers your architecture preferences
- Maintains consistency across generated code

**You can customize it:**
- Edit `.vscode/copilot-instructions.md`
- Save changes
- Copilot will follow new instructions immediately

---

## 🎓 Example Workflows

### Workflow 1: Add AWS Lambda Support

**Step 1: Ask Copilot**
```
Open Copilot Chat (Ctrl+Alt+I)

"How should I add AWS Lambda support to the Terraform generator?
Show me:
1. Updated TerraformGenerator class
2. Lambda function example
3. IAM role template
4. Test cases"
```

**Step 2: Review Suggestions**
- Copilot provides code structure
- Check against your architecture patterns
- Verify security practices

**Step 3: Implement**
- Copy code into your project
- Follow the suggestions
- Run tests to verify

### Workflow 2: Generate Test Cases

**Step 1: Select Code**
```typescript
// Select your new function
async function generateKubernetesManifests(requirements: string) {
  // ...
}
```

**Step 2: Ask Copilot**
```
Open inline chat (Ctrl+I)

"Generate comprehensive test cases for this function.
Include success cases, error cases, and edge cases.
Use the existing Mocha test pattern from this project."
```

**Step 3: Review & Adjust**
- Copilot generates test cases
- Review for correctness
- Add any specific test scenarios
- Run tests: `npm test`

### Workflow 3: Optimize Terraform

**Step 1: Copy Terraform Code**
```
Paste your generated Terraform in Copilot Chat
```

**Step 2: Ask for Optimization**
```
"Optimize this Terraform for:
1. Cost (use spot instances where possible)
2. Performance (caching, CDN, connection pooling)
3. Security (encryption, least privilege, segmentation)

Explain each change and its benefit."
```

**Step 3: Implement Changes**
- Review Copilot's suggestions
- Verify they match your requirements
- Test with: `terraform validate`

---

## ⌨️ Essential Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Copilot Chat | `Ctrl+Alt+I` |
| Open inline chat | `Ctrl+I` |
| Accept suggestion | `Tab` |
| Reject suggestion | `Escape` |
| Next suggestion | `Alt+]` |
| Previous suggestion | `Alt+[` |
| Trigger autocomplete | `Ctrl+Space` |
| Fix error (if available) | `Ctrl+Shift+M` on error |

---

## 🔍 Tips for Better Results

### 1. **Be Specific**
```
❌ "Generate Terraform code"
✅ "Generate Terraform code for a production-ready AWS VPC with:
   - Multiple AZs
   - Public and private subnets
   - NAT Gateway for private subnet internet access
   - VPC endpoints for AWS services
   - Security group with least privilege rules"
```

### 2. **Provide Context**
```
❌ "How do I fix this error?"
✅ "I'm getting this error in the diagramGenerator.ts file:
   [paste error message]
   The code is trying to generate a Mermaid diagram for..."
```

### 3. **Show Examples**
```
❌ "Generate a test"
✅ "Generate a test case following this pattern:
   [paste example test from the codebase]
   For this function: [paste function]"
```

### 4. **Ask Follow-up Questions**
```
"Generate Terraform for load balancing"
↓
"Can you explain each resource you created?"
↓
"How would I add auto-scaling?"
↓
"What's the estimated monthly cost?"
```

### 5. **Use Chat History**
Copilot remembers context in the same chat session. You can:
- Ask a question
- Get code
- Ask to refine it
- Ask to test it
- Continue refining

---

## 🚨 Common Issues & Fixes

### Issue: "Copilot extension not working"

**Solution:**
```powershell
# Reinstall the extension
code --uninstall-extension GitHub.copilot
code --install-extension GitHub.copilot

# Restart VS Code
```

### Issue: "Not authenticated with GitHub"

**Solution:**
```
1. Press Ctrl+Shift+P
2. Type: "GitHub: Sign Out"
3. Press Ctrl+Shift+P
4. Type: "GitHub: Authorize"
5. Complete browser authentication
```

### Issue: "No Copilot suggestions appearing"

**Solution:**
1. Check subscription at https://github.com/copilot/pro
2. Verify extension is installed: `code --list-extensions | findstr copilot`
3. Restart VS Code (`Ctrl+Shift+P` → Reload Window)

### Issue: "Inline suggestions too frequent"

**Solution:**
Edit `.vscode/settings.json`:
```json
{
  "editor.inlineSuggest.enabled": true,
  "github.copilot.enable": {
    "*": true,
    "plaintext": false
  }
}
```

---

## 💪 Advanced Usage

### Use @workspace Reference
In Copilot Chat, reference workspace files:
```
"@workspace Create a test for the DiagramGenerator class"
```

### Use @vscode Reference
Ask about VS Code extension APIs:
```
"@vscode How do I create a webview panel in an extension?"
```

### Chat Modes
Click the chat mode dropdown for:
- **Fast**: Quick responses
- **Balanced**: Recommended (default)
- **Deep**: Thorough analysis

---

## 📊 What to Ask Copilot About

### ✅ Good Use Cases
- Generate boilerplate code
- Write test cases
- Refactor for readability
- Explain complex code
- Review for issues
- Document code
- Generate examples
- Optimize performance
- Fix bugs
- Design architecture

### ❌ Not Good For
- Replace reading documentation
- Complex business logic (verify yourself)
- Security-critical decisions (review carefully)
- Architectural decisions (think it through)

**Always review generated code before committing!**

---

## 📚 Next Steps

1. **Run the setup script:**
   ```powershell
   .\install-extensions.ps1
   ```

2. **Authenticate with GitHub:**
   - VS Code will prompt
   - Or press `Ctrl+Shift+P` → "GitHub: Authorize"

3. **Open Copilot Chat:**
   - Press `Ctrl+Alt+I`

4. **Ask Your First Question:**
   ```
   "Explain the architecture of the Megha Cloud Architect Agent"
   ```

5. **Start Coding:**
   - Use inline suggestions while typing
   - Use chat for questions
   - Follow the custom instructions

---

## 🎯 Success Indicators

You'll know Copilot Pro is working when you see:

- ✅ Suggestions appear in gray while typing
- ✅ Copilot Chat opens when pressing `Ctrl+Alt+I`
- ✅ Responses reference your project files
- ✅ Generated code follows your style
- ✅ Suggestions improve over time

---

## 📞 Need Help?

### Copilot Help
- Ask in Copilot Chat: `"How do I use Copilot Pro?"`
- Open GitHub: https://github.com/copilot

### Megha Agent Help
- See README.md for project overview
- See DEVELOPMENT.md for code structure
- See docs/ for guides

---

## 🎉 You're All Set!

You now have:
- ✅ GitHub Copilot Pro subscription
- ✅ VS Code extensions installed
- ✅ Custom project instructions loaded
- ✅ Optimized VS Code settings
- ✅ Ready to use AI-powered coding

**Start asking Copilot questions and watch your productivity soar!** 🚀

---

**Last Updated**: May 23, 2026
**For**: Megha Cloud Architect Agent v0.1.0
