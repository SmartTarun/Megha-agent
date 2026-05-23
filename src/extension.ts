import * as vscode from 'vscode';
import { MeghaCloudAgent } from './agents/cloudArchitectAgent';
import { DiagramGenerator } from './generators/diagramGenerator';
import { TerraformGenerator } from './generators/terraformGenerator';
import { CopilotIntegration } from './integration/copilotIntegration';

let cloudAgent: MeghaCloudAgent;
let diagramGenerator: DiagramGenerator;
let terraformGenerator: TerraformGenerator;
let copilotIntegration: CopilotIntegration;

export async function activate(context: vscode.ExtensionContext) {
	console.log('Megha Cloud Agent Extension is now active!');

	// Initialize core components
	cloudAgent = new MeghaCloudAgent(context);
	diagramGenerator = new DiagramGenerator();
	terraformGenerator = new TerraformGenerator();
	copilotIntegration = new CopilotIntegration();

	// Register commands
	registerCommands(context);

	// Create sidebar view
	createSidebarView(context);

	// Show welcome message
	vscode.window.showInformationMessage('Megha Cloud Architect Agent activated! Use Ctrl+Shift+P to access Megha commands.');
}

function registerCommands(context: vscode.ExtensionContext) {
	// Start session command
	context.subscriptions.push(
		vscode.commands.registerCommand('megha-agent.start', async () => {
			const session = await cloudAgent.startSession();
			vscode.window.showInformationMessage(`Cloud Architecture Session Started: ${session.id}`);
		})
	);

	// Generate architecture diagram
	context.subscriptions.push(
		vscode.commands.registerCommand('megha-agent.generateArchitecture', async () => {
			const requirements = await vscode.window.showInputBox({
				placeHolder: 'Describe your cloud architecture needs (e.g., "Multi-tier web app with database on AWS")',
				prompt: 'Enter architecture requirements'
			});

			if (!requirements) return;

			vscode.window.withProgress(
				{ location: vscode.ProgressLocation.Notification, title: 'Generating Architecture Diagram...' },
				async () => {
					const diagram = await diagramGenerator.generateArchitectureDiagram(requirements);
					await displayDiagram(diagram, 'Architecture');
				}
			);
		})
	);

	// Generate access flow diagram
	context.subscriptions.push(
		vscode.commands.registerCommand('megha-agent.generateAccessFlow', async () => {
			const description = await vscode.window.showInputBox({
				placeHolder: 'Describe user access flows (e.g., "Admin -> Web -> API -> Database")',
				prompt: 'Enter access flow description'
			});

			if (!description) return;

			vscode.window.withProgress(
				{ location: vscode.ProgressLocation.Notification, title: 'Generating Access Flow...' },
				async () => {
					const diagram = await diagramGenerator.generateAccessFlowDiagram(description);
					await displayDiagram(diagram, 'AccessFlow');
				}
			);
		})
	);

	// Generate Terraform configuration
	context.subscriptions.push(
		vscode.commands.registerCommand('megha-agent.generateTerraform', async () => {
			const description = await vscode.window.showInputBox({
				placeHolder: 'Describe infrastructure (e.g., "AWS EC2 with RDS and S3")',
				prompt: 'Enter infrastructure description'
			});

			if (!description) return;

			vscode.window.withProgress(
				{ location: vscode.ProgressLocation.Notification, title: 'Generating Terraform Configuration...' },
				async () => {
					const tfConfig = await terraformGenerator.generateTerraformCode(description);
					await saveTerraformFile(tfConfig);
				}
			);
		})
	);

	// Generate Mermaid diagram
	context.subscriptions.push(
		vscode.commands.registerCommand('megha-agent.generateMermaid', async () => {
			const type = await vscode.window.showQuickPick(
				['flowchart', 'sequence', 'class', 'state', 'deployment'],
				{ placeHolder: 'Select diagram type' }
			);

			if (!type) return;

			const description = await vscode.window.showInputBox({
				placeHolder: 'Describe what you want to diagram',
				prompt: `Enter ${type} description`
			});

			if (!description) return;

			vscode.window.withProgress(
				{ location: vscode.ProgressLocation.Notification, title: 'Generating Mermaid Diagram...' },
				async () => {
					const mermaidCode = await diagramGenerator.generateMermaidDiagram(type, description);
					await displayMermaidDiagram(mermaidCode);
				}
			);
		})
	);

	// Open diagram editor
	context.subscriptions.push(
		vscode.commands.registerCommand('megha-agent.openDiagramEditor', async () => {
			const panel = vscode.window.createWebviewPanel(
				'megha-diagram-editor',
				'Megha Diagram Editor',
				vscode.ViewColumn.Beside,
				{ enableScripts: true }
			);

			panel.webview.html = getDiagramEditorHTML();
		})
	);
}

function createSidebarView(context: vscode.ExtensionContext) {
	const provider = new MeghaViewProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			MeghaViewProvider.viewType,
			provider,
			{ webviewOptions: { retainContextWhenHidden: true } }
		)
	);
}

async function displayDiagram(diagram: any, type: string) {
	const panel = vscode.window.createWebviewPanel(
		`megha-diagram-${type}`,
		`Megha ${type} Diagram`,
		vscode.ViewColumn.Beside,
		{ enableScripts: true }
	);

	if (diagram.format === 'mermaid') {
		panel.webview.html = getMermaidViewerHTML(diagram.code);
	} else if (diagram.format === 'drawio') {
		panel.webview.html = getDrawIOViewerHTML(diagram.data);
	}
}

async function displayMermaidDiagram(code: string) {
	const panel = vscode.window.createWebviewPanel(
		'megha-mermaid-diagram',
		'Megha Mermaid Diagram',
		vscode.ViewColumn.Beside,
		{ enableScripts: true }
	);

	panel.webview.html = getMermaidViewerHTML(code);
}

async function saveTerraformFile(tfCode: string) {
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	if (!workspaceFolder) {
		vscode.window.showErrorMessage('No workspace folder found');
		return;
	}

	const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, 'megha-generated.tf');
	const encoder = new TextEncoder();
	await vscode.workspace.fs.writeFile(fileUri, encoder.encode(tfCode));
	vscode.window.showInformationMessage(`Terraform file saved to ${fileUri.fsPath}`);

	const doc = await vscode.workspace.openTextDocument(fileUri);
	await vscode.window.showTextDocument(doc);
}

function getMermaidViewerHTML(mermaidCode: string): string {
	return `
		<!DOCTYPE html>
		<html>
		<head>
			<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
			<style>
				body { margin: 20px; font-family: Arial, sans-serif; }
				.mermaid { display: flex; justify-content: center; }
			</style>
		</head>
		<body>
			<h2>Architecture Diagram</h2>
			<div class="mermaid">
${mermaidCode}
			</div>
			<script>
				mermaid.initialize({ startOnLoad: true, theme: 'default' });
				mermaid.contentLoaded();
			</script>
		</body>
		</html>
	`;
}

function getDrawIOViewerHTML(data: string): string {
	return `
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				body { margin: 0; padding: 0; }
				iframe { width: 100%; height: 100vh; border: none; }
			</style>
		</head>
		<body>
			<p>Draw.io diagram viewer (requires draw.io integration)</p>
		</body>
		</html>
	`;
}

function getDiagramEditorHTML(): string {
	return `
		<!DOCTYPE html>
		<html>
		<head>
			<title>Megha Diagram Editor</title>
			<style>
				body { margin: 20px; font-family: Arial, sans-serif; }
				textarea { width: 100%; height: 300px; }
				button { padding: 10px 20px; margin: 10px 5px 10px 0; }
			</style>
		</head>
		<body>
			<h2>Megha Diagram Editor</h2>
			<p>Draw.io and Mermaid diagram editor coming soon...</p>
			<textarea placeholder="Enter mermaid diagram code here..."></textarea>
			<br>
			<button>Preview</button>
			<button>Export as PNG</button>
			<button>Export as SVG</button>
		</body>
		</html>
	`;
}

class MeghaViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'megha-explorer';

	constructor(private extensionUri: vscode.Uri) {}

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		_context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken
	) {
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this.extensionUri]
		};

		webviewView.webview.html = this.getHtml(webviewView.webview);
	}

	private getHtml(webview: vscode.Webview): string {
		return `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					body { padding: 10px; font-family: Arial, sans-serif; }
					button { display: block; width: 100%; padding: 10px; margin: 5px 0; }
				</style>
			</head>
			<body>
				<h3>Megha Cloud Agent</h3>
				<p>10+ years of cloud architecture expertise</p>
				<button onclick="vscode.postMessage({command: 'start'})">Start Session</button>
				<button onclick="vscode.postMessage({command: 'architecture'})">Generate Architecture</button>
				<button onclick="vscode.postMessage({command: 'accessflow'})">Access Flow</button>
				<button onclick="vscode.postMessage({command: 'terraform'})">Terraform Config</button>
				<button onclick="vscode.postMessage({command: 'mermaid'})">Mermaid Diagram</button>
				<hr>
				<h4>Supported Platforms</h4>
				<ul>
					<li>AWS</li>
					<li>Azure</li>
					<li>GCP</li>
				</ul>
			</body>
			</html>
		`;
	}
}

export function deactivate() {}
