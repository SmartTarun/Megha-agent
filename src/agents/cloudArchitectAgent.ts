import * as vscode from 'vscode';
import { v4 as uuidv4 } from 'uuid';

export class MeghaCloudAgent {
	private sessions: Map<string, ArchitectureSession> = new Map();
	private expertise = {
		years: 10,
		platforms: ['AWS', 'Azure', 'GCP'],
		specialties: [
			'Multi-cloud architecture',
			'Microservices design',
			'DevOps & Infrastructure',
			'Security & Compliance',
			'Cost Optimization',
			'High Availability',
			'Disaster Recovery'
		]
	};

	constructor(private context: vscode.ExtensionContext) {}

	async startSession(): Promise<ArchitectureSession> {
		const sessionId = uuidv4();
		const session: ArchitectureSession = {
			id: sessionId,
			createdAt: new Date(),
			diagrams: [],
			terraformConfigs: [],
			history: [],
			metadata: {
				cloud: '',
				projectName: '',
				requirements: []
			}
		};

		this.sessions.set(sessionId, session);

		// Log session start
		const message = `Started new architecture session with Megha Agent (${this.expertise.years} years expertise)`;
		session.history.push({
			timestamp: new Date(),
			type: 'session_start',
			message
		});

		return session;
	}

	async analyzeArchitectureNeeds(requirements: string): Promise<ArchitectureAnalysis> {
		return {
			platforms: this.detectPlatforms(requirements),
			patterns: this.detectPatterns(requirements),
			recommendation: this.generateRecommendation(requirements),
			risks: this.identifyRisks(requirements)
		};
	}

	private detectPlatforms(requirements: string): string[] {
		const platforms = [];
		const reqLower = requirements.toLowerCase();

		if (reqLower.includes('aws') || reqLower.includes('ec2') || reqLower.includes('lambda')) {
			platforms.push('AWS');
		}
		if (reqLower.includes('azure') || reqLower.includes('vm') || reqLower.includes('app service')) {
			platforms.push('Azure');
		}
		if (reqLower.includes('gcp') || reqLower.includes('compute engine') || reqLower.includes('cloud run')) {
			platforms.push('GCP');
		}

		return platforms.length > 0 ? platforms : ['AWS', 'Azure', 'GCP'];
	}

	private detectPatterns(requirements: string): string[] {
		const patterns = [];
		const reqLower = requirements.toLowerCase();

		const patternMap: { [key: string]: string } = {
			'microservice': 'Microservices',
			'serverless': 'Serverless',
			'container': 'Containerized',
			'traditional': 'Monolithic',
			'event': 'Event-Driven',
			'real-time': 'Real-Time Processing',
			'data': 'Data Lake',
			'ml': 'Machine Learning',
			'iot': 'IoT'
		};

		Object.keys(patternMap).forEach(key => {
			if (reqLower.includes(key)) {
				patterns.push(patternMap[key]);
			}
		});

		return patterns;
	}

	private generateRecommendation(requirements: string): string {
		const r = requirements.toLowerCase();

		const pattern =
			r.includes('microservice') ? 'Microservices' :
			r.includes('serverless') || r.includes('lambda') ? 'Serverless' :
			r.includes('event') || r.includes('kafka') ? 'Event-Driven' :
			r.includes('container') || r.includes('kubernetes') ? 'Containerized (Kubernetes)' :
			r.includes('data lake') || r.includes('data warehouse') ? 'Data Platform' :
			'Standard Multi-Tier';

		const primary =
			r.includes('azure') ? 'Azure' :
			r.includes('gcp') || r.includes('google') ? 'GCP' :
			'AWS';

		const diagramSuggestions = [
			r.includes('microservice') || r.includes('event') ? '`c4` — C4 context diagram' : null,
			r.includes('auth') || r.includes('iam') || r.includes('rbac') ? '`accessflow` — RBAC access flow diagram' : null,
			r.includes('network') || r.includes('vpc') || r.includes('subnet') ? '`network` — VPC & security-zone diagram' : null,
			r.includes('pipeline') || r.includes('ci/cd') || r.includes('deploy') ? '`deployment` — CI/CD pipeline diagram' : null,
			r.includes('stream') || r.includes('data') ? '`dataflow` — Data flow diagram' : null,
		].filter(Boolean).join('\n- ');

		return [
			`**Recommended Pattern:** ${pattern}`,
			`**Primary Cloud:** ${primary} — best fit based on detected keywords`,
			`**Key Architecture Decisions:**`,
			`- Use Terraform modules (modules/aws|azure|gcp) for IaC`,
			r.includes('microservice') ? `- Apply Database-per-Service to avoid tight coupling` : '',
			r.includes('serverless') ? `- Use API Gateway + Lambda for event-triggered compute` : '',
			r.includes('event') ? `- Implement Dead Letter Queues for poison-message handling` : '',
			r.includes('cache') || r.includes('redis') ? `- Add Redis cache tier to reduce DB read pressure` : '',
			r.includes('auth') ? `- Enforce JWT + MFA; use short-lived tokens (15 min)` : '',
			`**Suggested Diagram Types to Generate:**`,
			diagramSuggestions ? `- ${diagramSuggestions}` : '- `architecture` — full architecture overview'
		].filter(Boolean).join('\n');
	}

	private identifyRisks(requirements: string): Risk[] {
		const risks: Risk[] = [];
		const reqLower = requirements.toLowerCase();

		if (!reqLower.includes('backup') && !reqLower.includes('recovery')) {
			risks.push({
				severity: 'high',
				issue: 'No disaster recovery strategy mentioned',
				recommendation: 'Implement multi-region failover'
			});
		}

		if (!reqLower.includes('security') && !reqLower.includes('vpc')) {
			risks.push({
				severity: 'high',
				issue: 'Limited security architecture details',
				recommendation: 'Implement VPC, security groups, and encryption'
			});
		}

		if (!reqLower.includes('monitor') && !reqLower.includes('log')) {
			risks.push({
				severity: 'medium',
				issue: 'No monitoring/logging mentioned',
				recommendation: 'Implement CloudWatch, Stackdriver, or Azure Monitor'
			});
		}

		return risks;
	}

	getSession(sessionId: string): ArchitectureSession | undefined {
		return this.sessions.get(sessionId);
	}

	getAllSessions(): ArchitectureSession[] {
		return Array.from(this.sessions.values());
	}

	deleteSession(sessionId: string): boolean {
		return this.sessions.delete(sessionId);
	}
}

export interface ArchitectureSession {
	id: string;
	createdAt: Date;
	diagrams: Diagram[];
	terraformConfigs: TerraformConfig[];
	history: HistoryEntry[];
	metadata: SessionMetadata;
}

export interface Diagram {
	id: string;
	type: 'architecture' | 'accessflow' | 'mermaid' | 'drawio' | 'c4' | 'network' | 'dataflow' | 'sequence' | 'deployment';
	name: string;
	code: string;
	format: 'mermaid' | 'drawio' | 'svg' | 'png';
	createdAt: Date;
}

export interface TerraformConfig {
	id: string;
	name: string;
	platform: 'AWS' | 'Azure' | 'GCP';
	code: string;
	modules: string[];
	createdAt: Date;
}

export interface HistoryEntry {
	timestamp: Date;
	type: 'session_start' | 'diagram_created' | 'terraform_generated' | 'analysis' | 'comment';
	message: string;
}

export interface SessionMetadata {
	cloud: string;
	projectName: string;
	requirements: string[];
}

export interface ArchitectureAnalysis {
	platforms: string[];
	patterns: string[];
	recommendation: string;
	risks: Risk[];
}

export interface Risk {
	severity: 'low' | 'medium' | 'high';
	issue: string;
	recommendation: string;
}
