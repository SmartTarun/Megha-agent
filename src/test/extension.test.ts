import * as assert from 'assert';
import * as vscode from 'vscode';
import { MeghaCloudAgent } from '../../agents/cloudArchitectAgent';
import { DiagramGenerator } from '../../generators/diagramGenerator';
import { TerraformGenerator } from '../../generators/terraformGenerator';
import { CopilotIntegration } from '../../integration/copilotIntegration';

suite('Megha Cloud Agent Tests', () => {
  let cloudAgent: MeghaCloudAgent;
  let diagramGenerator: DiagramGenerator;
  let terraformGenerator: TerraformGenerator;

  setup(() => {
    // Initialize test instances
    cloudAgent = new MeghaCloudAgent({} as any);
    diagramGenerator = new DiagramGenerator();
    terraformGenerator = new TerraformGenerator();
  });

  teardown(() => {
    // Cleanup after tests
  });

  // Cloud Architect Agent Tests
  suite('CloudArchitectAgent', () => {
    test('should create a new session', async () => {
      const session = await cloudAgent.startSession();
      assert.ok(session.id, 'Session ID should be generated');
      assert.ok(session.createdAt, 'Session should have creation date');
      assert.strictEqual(session.diagrams.length, 0, 'New session should have no diagrams');
    });

    test('should analyze AWS architecture requirements', async () => {
      const analysis = await cloudAgent.analyzeArchitectureNeeds(
        'Web application with EC2 and RDS database'
      );
      assert.ok(analysis.platforms.includes('AWS'), 'Should detect AWS');
      assert.ok(analysis.recommendation, 'Should provide recommendation');
      assert.ok(Array.isArray(analysis.risks), 'Should identify risks');
    });

    test('should analyze multi-cloud requirements', async () => {
      const analysis = await cloudAgent.analyzeArchitectureNeeds(
        'Multi-cloud setup with AWS, Azure, and GCP'
      );
      assert.ok(analysis.platforms.includes('AWS'), 'Should detect AWS');
      assert.ok(analysis.platforms.includes('Azure'), 'Should detect Azure');
      assert.ok(analysis.platforms.includes('GCP'), 'Should detect GCP');
    });

    test('should detect security risks', async () => {
      const analysis = await cloudAgent.analyzeArchitectureNeeds(
        'Simple web server without backup'
      );
      const risks = analysis.risks.filter((r) => r.severity === 'high');
      assert.ok(risks.length > 0, 'Should identify high-severity risks');
    });

    test('should retrieve existing session', async () => {
      const session1 = await cloudAgent.startSession();
      const session2 = cloudAgent.getSession(session1.id);
      assert.deepStrictEqual(session1.id, session2?.id, 'Should retrieve same session');
    });

    test('should delete session', async () => {
      const session = await cloudAgent.startSession();
      const deleted = cloudAgent.deleteSession(session.id);
      assert.ok(deleted, 'Should return true when deletion succeeds');
      const retrieved = cloudAgent.getSession(session.id);
      assert.strictEqual(retrieved, undefined, 'Session should be removed');
    });
  });

  // Diagram Generator Tests
  suite('DiagramGenerator', () => {
    test('should generate architecture diagram', async () => {
      const diagram = await diagramGenerator.generateArchitectureDiagram(
        'Multi-tier application on AWS'
      );
      assert.strictEqual(diagram.format, 'mermaid', 'Should generate Mermaid format');
      assert.ok(diagram.code, 'Should contain diagram code');
      assert.ok(diagram.code.includes('graph'), 'Should contain Mermaid graph');
    });

    test('should generate access flow diagram', async () => {
      const diagram = await diagramGenerator.generateAccessFlowDiagram(
        'User -> Web -> API -> Database'
      );
      assert.ok(diagram.code, 'Should contain diagram code');
      assert.ok(diagram.code.includes('graph'), 'Should be valid Mermaid');
    });

    test('should generate flowchart', async () => {
      const code = await diagramGenerator.generateMermaidDiagram(
        'flowchart',
        'Process data and store results'
      );
      assert.ok(code.includes('flowchart'), 'Should contain flowchart keyword');
    });

    test('should generate sequence diagram', async () => {
      const code = await diagramGenerator.generateMermaidDiagram(
        'sequence',
        'User requests data from API'
      );
      assert.ok(code.includes('sequenceDiagram'), 'Should contain sequence diagram syntax');
    });

    test('should generate class diagram', async () => {
      const code = await diagramGenerator.generateMermaidDiagram('class', 'Cloud services');
      assert.ok(code.includes('classDiagram'), 'Should contain class diagram syntax');
    });

    test('should generate state diagram', async () => {
      const code = await diagramGenerator.generateMermaidDiagram(
        'state',
        'Application lifecycle'
      );
      assert.ok(code.includes('stateDiagram'), 'Should contain state diagram syntax');
    });

    test('should generate deployment diagram', async () => {
      const code = await diagramGenerator.generateMermaidDiagram(
        'deployment',
        'CI/CD pipeline'
      );
      assert.ok(code.length > 0, 'Should generate valid diagram');
    });
  });

  // Terraform Generator Tests
  suite('TerraformGenerator', () => {
    test('should generate AWS Terraform configuration', async () => {
      const code = await terraformGenerator.generateTerraformCode('EC2 instance with RDS');
      assert.ok(code.includes('aws'), 'Should contain AWS provider');
      assert.ok(code.includes('terraform'), 'Should contain terraform block');
      assert.ok(code.includes('resource'), 'Should contain resources');
    });

    test('should generate Azure Terraform configuration', async () => {
      const code = await terraformGenerator.generateTerraformCode(
        'Azure virtual machine and database'
      );
      assert.ok(code.includes('azurerm'), 'Should contain Azure provider');
      assert.ok(code.includes('terraform'), 'Should contain terraform block');
    });

    test('should generate GCP Terraform configuration', async () => {
      const code = await terraformGenerator.generateTerraformCode(
        'Google Cloud Platform compute engine'
      );
      assert.ok(code.includes('google'), 'Should contain GCP provider');
      assert.ok(code.includes('terraform'), 'Should contain terraform block');
    });

    test('should generate multi-cloud configuration', async () => {
      const code = await terraformGenerator.generateTerraformCode(
        'Multi-cloud setup with AWS, Azure, and GCP'
      );
      assert.ok(code.includes('aws'), 'Should include AWS provider');
      assert.ok(code.includes('azurerm'), 'Should include Azure provider');
      assert.ok(code.includes('google'), 'Should include GCP provider');
    });

    test('should include variables in Terraform config', async () => {
      const code = await terraformGenerator.generateTerraformCode('Simple web server');
      assert.ok(code.includes('variable'), 'Should define variables');
      assert.ok(code.includes('output'), 'Should define outputs');
    });

    test('should include security configurations', async () => {
      const code = await terraformGenerator.generateTerraformCode(
        'Secure database with encryption'
      );
      assert.ok(code.includes('encrypt'), 'Should include encryption');
    });
  });

  // Copilot Integration Tests
  suite('CopilotIntegration', () => {
    let copilotIntegration: CopilotIntegration;

    setup(() => {
      copilotIntegration = new CopilotIntegration();
    });

    test('should provide architecture recommendations', async () => {
      const advice = await copilotIntegration.askArchitectureAdvice(
        'High-traffic web application'
      );
      assert.ok(advice, 'Should return advice');
      assert.ok(advice.length > 0, 'Should contain meaningful advice');
    });

    test('should provide Terraform best practices', async () => {
      const advice = await copilotIntegration.askTerraformAdvice(
        'resource "aws_instance" "example" { ami = "ami-123" }'
      );
      assert.ok(advice, 'Should return advice');
    });

    test('should provide security recommendations', async () => {
      const advice = await copilotIntegration.askSecurityRecommendations(
        'VPC with public subnets'
      );
      assert.ok(advice, 'Should return security advice');
      assert.ok(
        advice.toLowerCase().includes('security') ||
          advice.toLowerCase().includes('encrypt'),
        'Should mention security'
      );
    });

    test('should provide cost optimization tips', async () => {
      const advice = await copilotIntegration.askCostOptimization(
        '10 always-on t3.large instances'
      );
      assert.ok(advice, 'Should return optimization advice');
    });
  });

  // Integration Tests
  suite('Integration Tests', () => {
    test('should handle complete workflow', async () => {
      // Start session
      const session = await cloudAgent.startSession();
      assert.ok(session.id);

      // Analyze requirements
      const analysis = await cloudAgent.analyzeArchitectureNeeds(
        'Scalable web application on AWS'
      );
      assert.ok(analysis.platforms.includes('AWS'));

      // Generate diagram
      const diagram = await diagramGenerator.generateArchitectureDiagram(
        'AWS web application'
      );
      assert.ok(diagram.code);

      // Generate Terraform
      const tfCode = await terraformGenerator.generateTerraformCode('AWS web application');
      assert.ok(tfCode);

      // Verify all components worked together
      assert.ok(session.id);
      assert.ok(analysis.recommendation);
      assert.ok(diagram.code);
      assert.ok(tfCode);
    });
  });
});
