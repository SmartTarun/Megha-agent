# Megha Agent - Development Guide

Complete guide for developing and extending the Megha Cloud Architect Agent.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- VS Code >= 1.85.0
- TypeScript knowledge
- Terraform knowledge (for module development)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Extension

```bash
npm run compile
```

### 3. Launch Development Mode

Press `F5` in VS Code or run:

```bash
npm run watch
```

This will start the TypeScript compiler in watch mode and reload the extension.

---

## Project Structure

```
megha-agent/
├── src/
│   ├── extension.ts              # Main extension entry point
│   ├── agents/
│   │   └── cloudArchitectAgent.ts # Core agent logic
│   ├── generators/
│   │   ├── diagramGenerator.ts    # Diagram generation
│   │   └── terraformGenerator.ts  # Terraform code generation
│   ├── integration/
│   │   └── copilotIntegration.ts  # GitHub Copilot integration
│   └── test/
│       └── extension.test.ts      # Tests
├── modules/
│   ├── aws/                       # AWS Terraform module
│   ├── azure/                     # Azure Terraform module
│   └── gcp/                       # GCP Terraform module
├── docs/
│   ├── patterns.md                # Architecture patterns
│   ├── security.md                # Security best practices
│   └── cost-optimization.md       # Cost optimization guide
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # User documentation
```

---

## Key Components

### Extension (src/extension.ts)

The main entry point that:
- Registers VS Code commands
- Creates UI views and panels
- Manages the extension lifecycle
- Handles user interactions

**Key functions**:
- `activate()` - Initializes the extension
- `registerCommands()` - Sets up command handlers
- `createSidebarView()` - Creates the activity bar panel

### Cloud Architect Agent (src/agents/cloudArchitectAgent.ts)

The core AI agent with:
- Session management
- Architecture analysis
- Requirement parsing
- Recommendation generation

**Key classes**:
- `MeghaCloudAgent` - Main agent class
- `ArchitectureSession` - Session state management
- `ArchitectureAnalysis` - Analysis results

### Diagram Generator (src/generators/diagramGenerator.ts)

Generates visual diagrams in:
- Mermaid format (text-based)
- Draw.io format (XML-based)
- SVG/PNG formats

**Supported diagram types**:
- Architecture diagrams
- Access flow diagrams
- Flowcharts
- Sequence diagrams
- Class diagrams
- State diagrams
- Deployment diagrams

### Terraform Generator (src/generators/terraformGenerator.ts)

Generates production-ready IaC:
- AWS Terraform configurations
- Azure Terraform configurations
- GCP Terraform configurations
- Multi-cloud setups

**Includes**:
- VPC/Network setup
- Security groups
- Load balancers
- Databases
- Storage
- IAM roles

---

## Adding New Features

### 1. Add a New Command

**File**: `src/extension.ts`

```typescript
// Register the command
context.subscriptions.push(
  vscode.commands.registerCommand('megha-agent.myNewCommand', async () => {
    // Command implementation
    vscode.window.showInformationMessage('My new command works!');
  })
);

// Add to package.json
"contributes": {
  "commands": [
    {
      "command": "megha-agent.myNewCommand",
      "title": "Megha: My New Command",
      "category": "Megha Agent"
    }
  ]
}
```

### 2. Add a New Diagram Type

**File**: `src/generators/diagramGenerator.ts`

```typescript
async generateNewDiagramType(description: string): Promise<DiagramResult> {
  const mermaidCode = this.createMermaidNewType(description);
  return {
    format: 'mermaid',
    code: mermaidCode,
    data: null
  };
}

private createMermaidNewType(description: string): string {
  return `
    graph TB
    A[Start] --> B[Process]
    B --> C[End]
  `;
}
```

### 3. Add Support for New Cloud Provider

**File**: `src/generators/terraformGenerator.ts`

```typescript
async generateTerraformCode(description: string): Promise<string> {
  const platform = this.detectPlatform(description);
  
  switch (platform) {
    case 'oracle':
      return this.generateOracleTerraform(description);
    // ... other cases
  }
}

private generateOracleTerraform(description: string): string {
  // Oracle-specific Terraform code
  return `
    terraform {
      required_providers {
        oci = {
          source = "oracle/oci"
          version = "~> 4.0"
        }
      }
    }
    # ... rest of configuration
  `;
}
```

### 4. Extend Copilot Integration

**File**: `src/integration/copilotIntegration.ts`

```typescript
async askCustomQuestion(topic: string): Promise<string> {
  const prompt = this.buildCustomPrompt(topic);
  return this.askCopilot(prompt);
}

private buildCustomPrompt(topic: string): string {
  return `As a cloud architect, provide expertise on: ${topic}`;
}
```

---

## Testing

### Run Tests

```bash
npm test
```

### Write Tests

**File**: `src/test/extension.test.ts`

```typescript
import * as assert from 'assert';
import { MeghaCloudAgent } from '../agents/cloudArchitectAgent';

describe('Cloud Architect Agent', () => {
  it('should create a session', async () => {
    const agent = new MeghaCloudAgent({} as any);
    const session = await agent.startSession();
    assert.ok(session.id);
  });

  it('should analyze architecture needs', async () => {
    const agent = new MeghaCloudAgent({} as any);
    const analysis = await agent.analyzeArchitectureNeeds(
      'Multi-tier web app on AWS'
    );
    assert.ok(analysis.platforms.includes('AWS'));
  });
});
```

---

## Code Style

### TypeScript Configuration

- Use strict type checking
- No implicit `any`
- Explicit return types for functions
- Use interfaces for object types

### Naming Conventions

```typescript
// Classes - PascalCase
class CloudArchitectAgent {}

// Functions/methods - camelCase
function analyzeRequirements() {}

// Constants - UPPER_CASE
const DEFAULT_REGION = 'us-east-1';

// Variables - camelCase
let sessionId = 'session-123';
```

### Code Organization

```typescript
// 1. Imports
import * as vscode from 'vscode';

// 2. Interfaces/Types
interface MyInterface {}

// 3. Constants
const CONSTANT = 'value';

// 4. Classes
class MyClass {}

// 5. Functions
function myFunction() {}
```

---

## Building and Publishing

### Build for Release

```bash
npm run compile
npm run lint
npm test
npm run package
```

### Create VSIX Package

```bash
npm run package
```

This generates a `.vsix` file that can be distributed or published to the VS Code marketplace.

### Publish to Marketplace

```bash
vsce publish
```

Requires:
- GitHub account with [Personal Access Token](https://github.com/settings/tokens)
- Registered publisher account on VS Code Marketplace

---

## Debugging

### Enable Debug Logging

In `extension.ts`:

```typescript
const DEBUG = true;

function log(message: string) {
  if (DEBUG) {
    console.log(`[Megha] ${message}`);
  }
}
```

### Debug in VS Code

1. Press `F5` to launch debug session
2. Use breakpoints (click on line numbers)
3. View debug console for output
4. Step through code with F10/F11

---

## Common Issues

### Extension won't load
- Run `npm install`
- Check `npm run compile` for errors
- Verify VS Code version >= 1.85.0

### Diagrams not displaying
- Check Mermaid syntax
- Verify CDN access (mermaid.js.org)
- Test in browser console

### Terraform validation fails
- Run `terraform validate` locally
- Check variable types
- Verify module paths

---

## Performance Optimization

### Lazy Load Heavy Dependencies

```typescript
// Instead of
import * as heavyModule from './heavy';

// Use
const heavyModule = await import('./heavy');
```

### Cache Expensive Operations

```typescript
private cache = new Map<string, any>();

async analyzeRequirements(req: string): Promise<any> {
  if (this.cache.has(req)) {
    return this.cache.get(req);
  }
  
  const result = await this.expensiveOperation(req);
  this.cache.set(req, result);
  return result;
}
```

---

## Contributing Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run tests and linting
5. Commit with clear messages
6. Push to your fork
7. Create a Pull Request

---

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [VS Code Extension Examples](https://github.com/Microsoft/vscode-extension-samples)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Terraform Documentation](https://www.terraform.io/docs/)
- [Mermaid Documentation](https://mermaid.js.org/)

---

## Support

- Issues: [GitHub Issues](https://github.com/megha-agent/megha-agent/issues)
- Discussions: [GitHub Discussions](https://github.com/megha-agent/megha-agent/discussions)
- Email: support@megha-agent.dev

---

Happy coding! 🚀
