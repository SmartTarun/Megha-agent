// ─────────────────────────────────────────────────────────────────────────────
// DiagramGenerator – professional, requirement-aware architecture diagrams
// ─────────────────────────────────────────────────────────────────────────────

export class DiagramGenerator {

	// ── Public API ─────────────────────────────────────────────────────────────

	async generateArchitectureDiagram(requirements: string): Promise<DiagramResult> {
		const ctx = this.parseRequirements(requirements);
		return {
			format: 'mermaid',
			code: this.buildArchitectureDiagram(ctx),
			data: ctx
		};
	}

	async generateAccessFlowDiagram(description: string): Promise<DiagramResult> {
		const ctx = this.parseRequirements(description);
		return {
			format: 'mermaid',
			code: this.buildAccessFlowDiagram(ctx),
			data: ctx
		};
	}

	async generateMermaidDiagram(type: string, description: string): Promise<string> {
		const ctx = this.parseRequirements(description);
		switch (type) {
			case 'flowchart':   return this.buildFlowchart(ctx);
			case 'sequence':    return this.buildSequenceDiagram(ctx);
			case 'class':       return this.buildClassDiagram(ctx);
			case 'state':       return this.buildStateDiagram(ctx);
			case 'deployment':  return this.buildDeploymentPipeline(ctx);
			case 'c4':          return this.buildC4ContextDiagram(ctx);
			case 'network':     return this.buildNetworkDiagram(ctx);
			case 'dataflow':    return this.buildDataFlowDiagram(ctx);
			default:            return this.buildArchitectureDiagram(ctx);
		}
	}

	// ── Requirement Parser ─────────────────────────────────────────────────────

	private parseRequirements(raw: string): ArchitectureContext {
		const r = raw.toLowerCase();

		// Cloud platforms
		const clouds: CloudPlatform[] = [];
		if (r.includes('aws') || r.includes('amazon') || r.includes('ec2') || r.includes('lambda') || r.includes('s3')) clouds.push('AWS');
		if (r.includes('azure') || r.includes('microsoft') || r.includes('cosmos') || r.includes('app service')) clouds.push('Azure');
		if (r.includes('gcp') || r.includes('google') || r.includes('bigquery') || r.includes('cloud run') || r.includes('gke')) clouds.push('GCP');
		if (clouds.length === 0) clouds.push('AWS'); // sensible default

		// Architecture pattern
		let pattern: ArchitecturePattern = 'monolith';
		if (r.includes('microservice') || r.includes('micro service')) pattern = 'microservices';
		else if (r.includes('serverless') || r.includes('function') || r.includes('lambda')) pattern = 'serverless';
		else if (r.includes('event') || r.includes('kafka') || r.includes('pubsub') || r.includes('queue')) pattern = 'event-driven';
		else if (r.includes('container') || r.includes('kubernetes') || r.includes('k8s') || r.includes('docker')) pattern = 'containerized';
		else if (r.includes('data') && (r.includes('lake') || r.includes('warehouse') || r.includes('pipeline'))) pattern = 'data-platform';

		// Components
		const components: ComponentFlags = {
			cdn:        r.includes('cdn') || r.includes('cloudfront') || r.includes('static') || r.includes('edge'),
			waf:        r.includes('waf') || r.includes('firewall') || r.includes('ddos'),
			apiGateway: r.includes('api') || r.includes('gateway') || r.includes('rest') || r.includes('graphql'),
			loadBalancer: r.includes('load balanc') || r.includes('elb') || r.includes('alb') || r.includes('traffic'),
			cache:      r.includes('cache') || r.includes('redis') || r.includes('elasticache') || r.includes('memcach'),
			database:   r.includes('database') || r.includes('db') || r.includes('rds') || r.includes('postgres') || r.includes('mysql') || r.includes('mongo'),
			queue:      r.includes('queue') || r.includes('sqs') || r.includes('kafka') || r.includes('rabbitmq') || r.includes('pubsub'),
			storage:    r.includes('storage') || r.includes('s3') || r.includes('blob') || r.includes('bucket') || r.includes('file'),
			search:     r.includes('search') || r.includes('elasticsearch') || r.includes('opensearch'),
			monitoring: r.includes('monitor') || r.includes('observ') || r.includes('metric') || r.includes('datadog') || r.includes('cloudwatch'),
			cicd:       r.includes('ci/cd') || r.includes('pipeline') || r.includes('github action') || r.includes('jenkins') || r.includes('deploy'),
			auth:       r.includes('auth') || r.includes('iam') || r.includes('sso') || r.includes('oauth') || r.includes('cognito'),
			ml:         r.includes('ml') || r.includes('machine learn') || r.includes('ai') || r.includes('sagemaker') || r.includes('model'),
			streaming:  r.includes('stream') || r.includes('kinesis') || r.includes('flink') || r.includes('real-time'),
			multiCloud: clouds.length > 1 || r.includes('multi-cloud') || r.includes('hybrid'),
		};

		// Scale / SLA
		const scale: ScaleProfile = {
			highAvailability: r.includes('ha ') || r.includes('high availab') || r.includes('99.') || r.includes('resilient'),
			multiRegion:      r.includes('multi-region') || r.includes('global') || r.includes('geo'),
			dr:               r.includes('disaster') || r.includes(' dr ') || r.includes('failover') || r.includes('recovery'),
			compliance:       r.includes('hipaa') || r.includes('pci') || r.includes('gdpr') || r.includes('sox') || r.includes('fedramp'),
		};

		// Extract service name hint
		const nameMatch = raw.match(/(?:for|build|design)\s+(?:a|an|the)?\s*([A-Za-z0-9 ]+?)(?:\s+system|\s+platform|\s+app|\s+service|$)/i);
		const projectName = nameMatch ? nameMatch[1].trim() : 'Cloud Architecture';

		return { raw, clouds, pattern, components, scale, projectName };
	}

	// ── Diagram Builders ───────────────────────────────────────────────────────

	private buildArchitectureDiagram(ctx: ArchitectureContext): string {
		switch (ctx.pattern) {
			case 'microservices':  return this.buildMicroservicesArch(ctx);
			case 'serverless':     return this.buildServerlessArch(ctx);
			case 'event-driven':   return this.buildEventDrivenArch(ctx);
			case 'containerized':  return this.buildContainerizedArch(ctx);
			case 'data-platform':  return this.buildDataPlatformArch(ctx);
			default:               return this.buildStandardArch(ctx);
		}
	}

	// ── Standard / Monolith ────────────────────────────────────────────────────

	private buildStandardArch(ctx: ArchitectureContext): string {
		const { clouds, components, scale } = ctx;
		const primary = clouds[0];
		const svc = this.cloudServices(primary);

		const cdnBlock       = components.cdn        ? `CDN["🌍 ${svc.cdn}\\nCDN / Edge Cache"]` : '';
		const wafBlock       = components.waf        ? `WAF["🛡️ ${svc.waf}\\nWeb Application Firewall"]` : '';
		const lbBlock        = components.loadBalancer ? `LB["⚖️ ${svc.lb}\\nLoad Balancer"]` : '';
		const cacheBlock     = components.cache      ? `CACHE["⚡ ${svc.cache}\\nIn-Memory Cache"]` : '';
		const dbBlock        = components.database   ? `DB["🗄️ ${svc.db}\\nManaged Database"]` : '';
		const storageBlock   = components.storage    ? `STORE["📦 ${svc.storage}\\nObject Storage"]` : '';
		const monitorBlock   = components.monitoring ? `MON["📊 ${svc.monitoring}\\nMonitoring & Alerts"]` : '';
		const authBlock      = components.auth       ? `AUTH["🔐 ${svc.auth}\\nIdentity & Access"]` : '';
		const queueBlock     = components.queue      ? `QUEUE["📨 ${svc.queue}\\nMessage Queue"]` : '';

		const drBlock = scale.dr && clouds.length > 1 ? `
    subgraph DR ["☁️ ${clouds[1]} — Disaster Recovery"]
        direction TB
        DR_APP["${this.cloudServices(clouds[1]).compute}\\nStandby Application"]
        DR_DB["${this.cloudServices(clouds[1]).db}\\nReplica Database"]
    end` : '';

		return `%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1a73e8', 'primaryTextColor': '#ffffff',
  'primaryBorderColor': '#0d47a1', 'lineColor': '#546e7a',
  'secondaryColor': '#e8f0fe', 'tertiaryColor': '#f1f8e9',
  'background': '#fafafa', 'mainBkg': '#ffffff',
  'nodeBorder': '#90a4ae', 'clusterBkg': '#f5f5f5'
}}}%%
graph TB
    USER(["👤 End Users\\n/ Clients"])

    ${cdnBlock}
    ${wafBlock}

    subgraph INET ["🌐 Internet Zone"]
        direction TB
        ${components.cdn ? 'CDN' : ''}
        ${components.waf ? 'WAF' : ''}
    end

    subgraph PRIMARY ["☁️ ${primary} — Primary Region"]
        direction TB
        ${lbBlock}
        subgraph COMPUTE ["🖥️ Compute Tier"]
            APP1["${svc.compute}\\nApp Server (AZ-1)"]
            APP2["${svc.compute}\\nApp Server (AZ-2)"]
        end
        ${authBlock}
        ${cacheBlock}
        ${queueBlock}
        subgraph DATA ["💾 Data Tier"]
            ${dbBlock}
            ${storageBlock}
        end
        ${monitorBlock}
    end

    ${drBlock}

    USER -->|HTTPS| ${components.cdn ? 'CDN' : components.waf ? 'WAF' : 'LB'}
    ${components.cdn && components.waf ? 'CDN --> WAF' : ''}
    ${components.cdn || components.waf ? `${components.waf ? 'WAF' : 'CDN'} --> ${components.loadBalancer ? 'LB' : 'APP1'}` : ''}
    ${components.loadBalancer ? 'LB --> APP1\n    LB --> APP2' : ''}
    ${components.auth ? 'APP1 --> AUTH\n    APP2 --> AUTH' : ''}
    ${components.cache ? 'APP1 --> CACHE\n    APP2 --> CACHE' : ''}
    ${components.queue ? 'APP1 --> QUEUE\n    APP2 --> QUEUE' : ''}
    ${components.database ? `APP1 -->|Write| DB\n    CACHE -.->|Cache miss| DB` : ''}
    ${components.storage ? 'APP1 -->|Static assets| STORE' : ''}
    ${components.monitoring ? 'APP1 -.->|Metrics & Logs| MON\n    APP2 -.->|Metrics & Logs| MON' : ''}
    ${scale.dr && clouds.length > 1 ? 'DB -.->|Async replication| DR_DB\n    APP1 -.->|Failover| DR_APP' : ''}

    classDef internet fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    classDef compute fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef data fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#bf360c
    classDef security fill:#fce4ec,stroke:#880e4f,stroke-width:2px,color:#880e4f
    classDef monitoring fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#4a148c
    classDef dr fill:#eceff1,stroke:#455a64,stroke-width:2px,stroke-dasharray:5 5

    class USER internet
    ${components.cdn ? 'class CDN internet' : ''}
    ${components.waf ? 'class WAF security' : ''}
    ${components.loadBalancer ? 'class LB compute' : ''}
    class APP1,APP2 compute
    ${components.database ? 'class DB data' : ''}
    ${components.storage ? 'class STORE data' : ''}
    ${components.cache ? 'class CACHE data' : ''}
    ${components.auth ? 'class AUTH security' : ''}
    ${components.monitoring ? 'class MON monitoring' : ''}
    ${scale.dr && clouds.length > 1 ? 'class DR_APP,DR_DB dr' : ''}
`;
	}

	// ── Microservices ──────────────────────────────────────────────────────────

	private buildMicroservicesArch(ctx: ArchitectureContext): string {
		const { clouds, components } = ctx;
		const primary = clouds[0];
		const svc = this.cloudServices(primary);

		return `%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1a73e8', 'primaryTextColor': '#ffffff',
  'lineColor': '#546e7a', 'background': '#fafafa'
}}}%%
graph TB
    USER(["👤 Clients"])

    subgraph EDGE ["🌐 Edge Layer"]
        ${components.cdn ? `CDN["🌍 ${svc.cdn}\\nCDN"]` : ''}
        ${components.waf ? `WAF["🛡️ ${svc.waf}\\nWAF"]` : ''}
        APIGW["📡 ${svc.apiGateway}\\nAPI Gateway"]
    end

    ${components.auth ? `AUTH["🔐 ${svc.auth}\\nAuth Service"]` : ''}

    subgraph SERVICES ["🧩 Microservices Tier"]
        direction LR
        SVC_USER["👤 User\\nService"]
        SVC_ORDER["📦 Order\\nService"]
        SVC_PAYMENT["💳 Payment\\nService"]
        SVC_NOTIFY["🔔 Notification\\nService"]
        SVC_SEARCH["🔍 Search\\nService"]
    end

    subgraph MESSAGING ["📨 Event Bus"]
        ${components.queue ? `QUEUE["${svc.queue}\\nMessage Broker"]` : 'QUEUE["📨 Message Broker"]'}
    end

    subgraph DATASTORES ["💾 Data Stores (per service)"]
        direction LR
        DB_USER["🗄️ Users DB\\n(PostgreSQL)"]
        DB_ORDER["🗄️ Orders DB\\n(PostgreSQL)"]
        DB_PAYMENT["🗄️ Payments DB\\n(MySQL)"]
        ${components.search ? `ES["🔍 ${svc.search}\\nSearch Index"]` : ''}
        ${components.cache ? `CACHE["⚡ ${svc.cache}\\nSession Cache"]` : ''}
    end

    subgraph OPS ["📊 Observability"]
        ${components.monitoring ? `MON["${svc.monitoring}\\nMonitoring"]` : 'MON["📊 Monitoring"]'}
        TRACE["🔎 Distributed\\nTracing"]
        LOG["📋 Centralized\\nLogging"]
    end

    USER -->|HTTPS| ${components.cdn ? 'CDN' : 'APIGW'}
    ${components.cdn ? `CDN --> ${components.waf ? 'WAF' : 'APIGW'}` : ''}
    ${components.waf ? 'WAF --> APIGW' : ''}
    ${components.auth ? 'APIGW -->|JWT validate| AUTH' : ''}
    APIGW --> SVC_USER
    APIGW --> SVC_ORDER
    APIGW --> SVC_PAYMENT
    APIGW --> SVC_SEARCH

    SVC_USER --- DB_USER
    SVC_ORDER --- DB_ORDER
    SVC_PAYMENT --- DB_PAYMENT
    ${components.search ? 'SVC_SEARCH --- ES' : ''}
    ${components.cache ? 'SVC_USER -.->|Cache| CACHE' : ''}

    SVC_ORDER -->|order.created| QUEUE
    SVC_PAYMENT -->|payment.processed| QUEUE
    QUEUE -->|subscribe| SVC_NOTIFY

    SVC_USER -.->|Metrics| MON
    SVC_ORDER -.->|Metrics| MON
    SVC_PAYMENT -.->|Metrics| MON
    SVC_USER -.->|Traces| TRACE
    SVC_ORDER -.->|Logs| LOG

    classDef edge fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    classDef service fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef data fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#bf360c
    classDef security fill:#fce4ec,stroke:#880e4f,stroke-width:2px,color:#880e4f
    classDef ops fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#4a148c
    classDef bus fill:#fffde7,stroke:#f57f17,stroke-width:2px,color:#e65100

    class USER edge
    ${components.cdn ? 'class CDN edge' : ''}
    ${components.waf ? 'class WAF security' : ''}
    class APIGW edge
    ${components.auth ? 'class AUTH security' : ''}
    class SVC_USER,SVC_ORDER,SVC_PAYMENT,SVC_NOTIFY,SVC_SEARCH service
    class DB_USER,DB_ORDER,DB_PAYMENT data
    ${components.search ? 'class ES data' : ''}
    ${components.cache ? 'class CACHE data' : ''}
    class QUEUE bus
    class MON,TRACE,LOG ops
`;
	}

	// ── Serverless ─────────────────────────────────────────────────────────────

	private buildServerlessArch(ctx: ArchitectureContext): string {
		const { clouds, components } = ctx;
		const primary = clouds[0];
		const svc = this.cloudServices(primary);

		return `%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#ff6d00', 'primaryTextColor': '#ffffff',
  'lineColor': '#546e7a', 'background': '#fafafa'
}}}%%
graph TB
    USER(["👤 Clients"])

    subgraph EDGE ["🌐 Edge / API Layer"]
        CDN["🌍 ${svc.cdn}\\nEdge CDN"]
        APIGW["📡 ${svc.apiGateway}\\nHTTP API Gateway"]
    end

    ${components.auth ? `AUTH["🔐 ${svc.auth}\\nAuthorizer Lambda"]` : ''}

    subgraph FUNCTIONS ["⚡ Serverless Functions (${svc.lambda})"]
        direction LR
        FN_READ["λ Read\\nHandler"]
        FN_WRITE["λ Write\\nHandler"]
        FN_EVENT["λ Event\\nProcessor"]
        FN_SCHED["λ Scheduled\\nJob"]
    end

    subgraph DATA ["💾 Managed Data Services"]
        direction LR
        ${components.database ? `DB["🗄️ ${svc.nosql}\\nNoSQL / Document DB"]` : ''}
        ${components.cache ? `CACHE["⚡ ${svc.cache}\\nCache"]` : ''}
        STORE["📦 ${svc.storage}\\nObject Storage"]
    end

    subgraph EVENTS ["📨 Event Sources"]
        ${components.queue ? `QUEUE["${svc.queue}\\nEvent Queue"]` : 'QUEUE["📨 Event Queue"]'}
        SCHED["⏰ Scheduler\\n(cron)"]
    end

    MON["📊 ${svc.monitoring}\\nServerless Monitoring"]

    USER -->|HTTPS| CDN
    CDN --> APIGW
    ${components.auth ? 'APIGW -->|Authorize| AUTH\n    AUTH --> FN_READ\n    AUTH --> FN_WRITE' : 'APIGW --> FN_READ\n    APIGW --> FN_WRITE'}

    ${components.database ? 'FN_READ -->|DynamoDB SDK| DB\n    FN_WRITE -->|DynamoDB SDK| DB' : ''}
    ${components.cache ? 'FN_READ -.->|Cache| CACHE' : ''}
    FN_WRITE -->|Put Object| STORE
    STORE -->|S3 Event| QUEUE
    QUEUE -->|Trigger| FN_EVENT
    SCHED -->|Trigger| FN_SCHED

    FN_READ -.->|Logs/Metrics| MON
    FN_WRITE -.->|Logs/Metrics| MON
    FN_EVENT -.->|Logs/Metrics| MON

    classDef edge fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    classDef fn fill:#fff8e1,stroke:#ff6d00,stroke-width:2px,color:#e65100
    classDef data fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef event fill:#fce4ec,stroke:#880e4f,stroke-width:2px,color:#880e4f
    classDef ops fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#4a148c
    classDef security fill:#fce4ec,stroke:#880e4f,stroke-width:2px

    class USER,CDN,APIGW edge
    ${components.auth ? 'class AUTH security' : ''}
    class FN_READ,FN_WRITE,FN_EVENT,FN_SCHED fn
    ${components.database ? 'class DB data' : ''}
    ${components.cache ? 'class CACHE data' : ''}
    class STORE data
    class QUEUE,SCHED event
    class MON ops
`;
	}

	// ── Event-Driven ───────────────────────────────────────────────────────────

	private buildEventDrivenArch(ctx: ArchitectureContext): string {
		const { clouds, components } = ctx;
		const primary = clouds[0];
		const svc = this.cloudServices(primary);

		return `%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#6a1b9a', 'primaryTextColor': '#ffffff',
  'lineColor': '#546e7a', 'background': '#fafafa'
}}}%%
graph LR
    subgraph PRODUCERS ["📤 Event Producers"]
        direction TB
        WEB["🌐 Web Application"]
        MOBILE["📱 Mobile App"]
        IOT["🔌 IoT / Sensors"]
        SCHED["⏰ Scheduled Jobs"]
    end

    subgraph BUS ["📨 Event Streaming — ${svc.queue}"]
        direction TB
        TOPIC_USER["Topic:\\nuser.events"]
        TOPIC_ORDER["Topic:\\norder.events"]
        TOPIC_DATA["Topic:\\ndata.events"]
        DLQ["☠️ Dead Letter\\nQueue"]
    end

    subgraph CONSUMERS ["📥 Event Consumers"]
        direction TB
        SVC_PROCESS["⚙️ Processing\\nService"]
        SVC_NOTIFY["🔔 Notification\\nService"]
        SVC_ANALYTICS["📊 Analytics\\nService"]
        SVC_AUDIT["📋 Audit\\nService"]
    end

    subgraph DATASTORES ["💾 Data Stores"]
        direction TB
        ${components.database ? `OLTP["🗄️ ${svc.db}\\nTransactional DB"]` : ''}
        DWH["🏛️ Data Warehouse\\n/ Analytics"]
        ${components.storage ? `LAKE["📦 ${svc.storage}\\nData Lake"]` : ''}
        ${components.cache ? `CACHE["⚡ ${svc.cache}\\nRead Cache"]` : ''}
    end

    MON["📊 ${svc.monitoring}\\n+ Alerting"]

    WEB & MOBILE -->|Events| TOPIC_USER
    WEB & MOBILE -->|Events| TOPIC_ORDER
    IOT -->|Events| TOPIC_DATA
    SCHED -->|Events| TOPIC_DATA

    TOPIC_USER -->|Subscribe| SVC_PROCESS
    TOPIC_USER -->|Subscribe| SVC_AUDIT
    TOPIC_ORDER -->|Subscribe| SVC_NOTIFY
    TOPIC_ORDER -->|Subscribe| SVC_ANALYTICS
    TOPIC_DATA -->|Subscribe| SVC_ANALYTICS
    TOPIC_USER & TOPIC_ORDER & TOPIC_DATA -.->|Failed| DLQ

    ${components.database ? 'SVC_PROCESS --> OLTP' : ''}
    SVC_ANALYTICS --> DWH
    ${components.storage ? 'SVC_ANALYTICS --> LAKE' : ''}
    ${components.cache ? 'SVC_PROCESS -.-> CACHE' : ''}

    SVC_PROCESS & SVC_NOTIFY & SVC_ANALYTICS -.->|Metrics| MON

    classDef producer fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    classDef bus fill:#ede7f6,stroke:#4a148c,stroke-width:2px,color:#4a148c
    classDef consumer fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef data fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#bf360c
    classDef ops fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#4a148c
    classDef dlq fill:#ffebee,stroke:#b71c1c,stroke-width:2px,color:#b71c1c

    class WEB,MOBILE,IOT,SCHED producer
    class TOPIC_USER,TOPIC_ORDER,TOPIC_DATA bus
    class DLQ dlq
    class SVC_PROCESS,SVC_NOTIFY,SVC_ANALYTICS,SVC_AUDIT consumer
    ${components.database ? 'class OLTP data' : ''}
    class DWH data
    ${components.storage ? 'class LAKE data' : ''}
    ${components.cache ? 'class CACHE data' : ''}
    class MON ops
`;
	}

	// ── Containerized / Kubernetes ─────────────────────────────────────────────

	private buildContainerizedArch(ctx: ArchitectureContext): string {
		const { clouds, components } = ctx;
		const primary = clouds[0];
		const svc = this.cloudServices(primary);

		return `%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#326ce5', 'primaryTextColor': '#ffffff',
  'lineColor': '#546e7a', 'background': '#fafafa'
}}}%%
graph TB
    USER(["👤 Clients"])

    subgraph EDGE ["🌐 Edge / Ingress"]
        ${components.cdn ? `CDN["🌍 ${svc.cdn}"]` : ''}
        ${components.waf ? `WAF["🛡️ ${svc.waf}"]` : ''}
        INGRESS["🔀 Ingress Controller\\n(NGINX / Istio)"]
    end

    subgraph K8S ["☸️ ${svc.kubernetes} Cluster"]
        direction TB
        subgraph NS_APP ["Namespace: app"]
            POD_FE["📦 Frontend\\nPods (x3)"]
            POD_API["📦 API\\nPods (x3)"]
            POD_WORKER["📦 Worker\\nPods (x2)"]
        end
        subgraph NS_INFRA ["Namespace: infra"]
            HPA["📈 HPA / KEDA\\nAuto-Scaler"]
            MESH["🕸️ Service Mesh\\n(Istio)"]
        end
        subgraph NS_MON ["Namespace: monitoring"]
            PROM["📊 Prometheus"]
            GRAF["📉 Grafana"]
            JAEGER["🔎 Jaeger\\nTracing"]
        end
    end

    subgraph MANAGED ["☁️ Managed Services — ${primary}"]
        direction LR
        ${components.database ? `DB["🗄️ ${svc.db}\\nManaged DB"]` : ''}
        ${components.cache ? `CACHE["⚡ ${svc.cache}\\nCache Cluster"]` : ''}
        ${components.queue ? `QUEUE["📨 ${svc.queue}\\nMessage Queue"]` : ''}
        ${components.storage ? `STORE["📦 ${svc.storage}\\nObject Storage"]` : ''}
        REGISTRY["📋 Container\\nRegistry"]
    end

    subgraph CICD_BLOCK ["🔧 CI/CD"]
        GITOPS["🔄 GitOps\\n(ArgoCD)"]
        CICD["⚙️ ${svc.cicd}\\nBuild Pipeline"]
    end

    USER -->|HTTPS| ${components.cdn ? 'CDN' : 'INGRESS'}
    ${components.cdn ? `CDN --> ${components.waf ? 'WAF' : 'INGRESS'}` : ''}
    ${components.waf ? 'WAF --> INGRESS' : ''}
    INGRESS --> POD_FE
    POD_FE -->|REST/gRPC| POD_API
    POD_API -->|Jobs| POD_WORKER
    ${components.database ? 'POD_API -->|JDBC/SDK| DB\n    POD_WORKER -->|JDBC/SDK| DB' : ''}
    ${components.cache ? 'POD_API -.->|Cache| CACHE' : ''}
    ${components.queue ? 'POD_API -->|Publish| QUEUE\n    QUEUE -->|Consume| POD_WORKER' : ''}
    ${components.storage ? 'POD_WORKER -->|Upload| STORE' : ''}
    MESH -.->|mTLS + Traffic| POD_API & POD_FE
    HPA -.->|Scale| POD_API & POD_WORKER
    POD_API -.->|Metrics| PROM
    PROM --> GRAF
    POD_API -.->|Traces| JAEGER
    CICD -->|Push image| REGISTRY
    REGISTRY -->|Pull image| K8S
    GITOPS -->|Apply manifests| K8S

    classDef edge fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    classDef k8s fill:#e8eaf6,stroke:#283593,stroke-width:2px,color:#1a237e
    classDef managed fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef cicd fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#bf360c
    classDef obs fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#4a148c

    class USER,INGRESS edge
    ${components.cdn ? 'class CDN edge' : ''}
    ${components.waf ? 'class WAF edge' : ''}
    class POD_FE,POD_API,POD_WORKER,HPA,MESH k8s
    class PROM,GRAF,JAEGER obs
    ${components.database ? 'class DB managed' : ''}
    ${components.cache ? 'class CACHE managed' : ''}
    ${components.queue ? 'class QUEUE managed' : ''}
    ${components.storage ? 'class STORE managed' : ''}
    class REGISTRY managed
    class GITOPS,CICD cicd
`;
	}

	// ── Data Platform ──────────────────────────────────────────────────────────

	private buildDataPlatformArch(ctx: ArchitectureContext): string {
		const { clouds, components } = ctx;
		const primary = clouds[0];
		const svc = this.cloudServices(primary);

		return `%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#0288d1', 'primaryTextColor': '#ffffff',
  'lineColor': '#546e7a', 'background': '#fafafa'
}}}%%
graph LR
    subgraph INGEST ["📥 Data Ingestion"]
        direction TB
        BATCH["📂 Batch\\n(ETL / ELT)"]
        STREAM["⚡ Streaming\\n(${svc.streaming})"]
        CDC["🔄 Change Data\\nCapture"]
        API_SRC["📡 API / Webhooks"]
    end

    subgraph LAKE ["🏞️ Data Lake — ${svc.storage}"]
        direction TB
        RAW["📦 Raw Zone\\n(Bronze)"]
        CURATED["✨ Curated Zone\\n(Silver)"]
        ENRICHED["💎 Enriched Zone\\n(Gold)"]
    end

    subgraph PROCESS ["⚙️ Processing Engine"]
        direction TB
        ETL_ENGINE["🔄 ${svc.etl}\\nETL / Spark"]
        ML_TRAIN["🤖 ${svc.ml}\\nML Training"]
    end

    subgraph SERVE ["📤 Serving Layer"]
        direction TB
        DWH["🏛️ ${svc.warehouse}\\nData Warehouse"]
        FEATURE["🎯 Feature Store"]
        CACHE_SERVE["⚡ ${svc.cache}\\nQuery Cache"]
    end

    subgraph CONSUME ["👁️ Consumers"]
        direction TB
        BI["📊 BI Dashboards\\n(Tableau / Looker)"]
        DS["👩‍🔬 Data Science\\n(Notebooks)"]
        APP["🌐 Applications\\n(APIs)"]
    end

    GOV["🛡️ Data Catalog\\n& Governance"]
    MON["📊 ${svc.monitoring}\\nPipeline Monitoring"]

    BATCH & API_SRC --> RAW
    STREAM --> RAW
    CDC --> RAW
    RAW -->|Transform| ETL_ENGINE
    ETL_ENGINE --> CURATED
    CURATED -->|Enrich| ETL_ENGINE
    ETL_ENGINE --> ENRICHED
    ENRICHED --> DWH
    ENRICHED --> ML_TRAIN
    ML_TRAIN --> FEATURE
    DWH --> CACHE_SERVE
    DWH --> BI
    FEATURE --> APP
    CACHE_SERVE --> DS
    CACHE_SERVE --> BI

    GOV -.->|Catalog & Policy| LAKE
    GOV -.->|Lineage| PROCESS
    MON -.->|Track| INGEST & PROCESS

    classDef ingest fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    classDef lake fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef process fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#bf360c
    classDef serve fill:#ede7f6,stroke:#4a148c,stroke-width:2px,color:#4a148c
    classDef consume fill:#e0f7fa,stroke:#006064,stroke-width:2px,color:#006064
    classDef gov fill:#fce4ec,stroke:#880e4f,stroke-width:2px,color:#880e4f

    class BATCH,STREAM,CDC,API_SRC ingest
    class RAW,CURATED,ENRICHED lake
    class ETL_ENGINE,ML_TRAIN process
    class DWH,FEATURE,CACHE_SERVE serve
    class BI,DS,APP consume
    class GOV,MON gov
`;
	}

	// ── Access Flow Diagram ────────────────────────────────────────────────────

	private buildAccessFlowDiagram(ctx: ArchitectureContext): string {
		const { clouds, components } = ctx;
		const primary = clouds[0];
		const svc = this.cloudServices(primary);

		return `%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1a73e8', 'primaryTextColor': '#ffffff',
  'lineColor': '#546e7a', 'background': '#fafafa'
}}}%%
graph TD
    subgraph ACTORS ["👥 Principals"]
        ADMIN(["🔴 Admin\\n(Full Access)"])
        MANAGER(["🟡 Manager\\n(Read + Limited Write)"])
        DEVELOPER(["🟢 Developer\\n(Dev Resources)"])
        USER(["🔵 End User\\n(App Access Only)"])
        SVC_ACCOUNT(["⚙️ Service Account\\n(Automated)"])
    end

    subgraph AUTHN ["🔐 Authentication — ${svc.auth}"]
        IDP["🏛️ Identity Provider\\n(SAML / OIDC)"]
        MFA["📱 MFA / TOTP"]
        JWT_SVC["🎫 Token Service\\n(JWT / OAuth2)"]
    end

    subgraph AUTHZ ["🛡️ Authorization — ${svc.iam}"]
        RBAC["📋 RBAC Policies"]
        ABAC["🏷️ ABAC / Context-Aware\\nAccess"]
        POLICY["📜 Policy Engine"]
    end

    subgraph RESOURCES ["☁️ Protected Resources — ${primary}"]
        direction LR
        APP_PLANE["🌐 Application Tier"]
        DATA_PLANE["💾 Data Tier"]
        ADMIN_PLANE["⚙️ Admin / Ops Plane"]
        INFRA["🏗️ Infrastructure\\n(IaC)"]
    end

    AUDIT["📋 Audit Log &\\nSIEM Integration"]

    ADMIN & MANAGER & DEVELOPER & USER -->|Login request| IDP
    IDP -->|Challenge| MFA
    MFA -->|Verified| JWT_SVC
    SVC_ACCOUNT -->|Service token| JWT_SVC

    JWT_SVC -->|Bearer token| RBAC
    RBAC --> ABAC
    ABAC --> POLICY

    POLICY -->|Admin: allow all| ADMIN_PLANE
    POLICY -->|Manager: read + approve| APP_PLANE & DATA_PLANE
    POLICY -->|Developer: dev env only| APP_PLANE & INFRA
    POLICY -->|User: app only| APP_PLANE
    POLICY -->|Service: scoped| DATA_PLANE

    APP_PLANE & DATA_PLANE & ADMIN_PLANE & INFRA -.->|All actions| AUDIT
    JWT_SVC -.->|Token events| AUDIT
    POLICY -.->|Deny events| AUDIT

    classDef admin fill:#ffcdd2,stroke:#b71c1c,stroke-width:2px,color:#b71c1c
    classDef manager fill:#fff9c4,stroke:#f57f17,stroke-width:2px,color:#e65100
    classDef dev fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef user fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    classDef svc fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#4a148c
    classDef authn fill:#e8eaf6,stroke:#283593,stroke-width:2px,color:#1a237e
    classDef authz fill:#fce4ec,stroke:#880e4f,stroke-width:2px,color:#880e4f
    classDef resource fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef audit fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#bf360c

    class ADMIN admin
    class MANAGER manager
    class DEVELOPER dev
    class USER user
    class SVC_ACCOUNT svc
    class IDP,MFA,JWT_SVC authn
    class RBAC,ABAC,POLICY authz
    class APP_PLANE,DATA_PLANE,ADMIN_PLANE,INFRA resource
    class AUDIT audit
`;
	}

	// ── Generic Flowchart ──────────────────────────────────────────────────────

	private buildFlowchart(ctx: ArchitectureContext): string {
		return `%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1a73e8', 'primaryTextColor': '#ffffff', 'lineColor': '#546e7a'
}}}%%
flowchart TD
    START(["▶ Start — ${ctx.projectName}"])

    subgraph VALIDATE ["✅ Validation"]
        CHECK_AUTH{"🔐 Authenticated?"}
        CHECK_PERM{"🛡️ Authorized?"}
        CHECK_RATE{"⏱️ Rate Limit OK?"}
    end

    subgraph PROCESS ["⚙️ Processing"]
        FETCH["📥 Fetch / Read Data"]
        TRANSFORM["🔄 Transform / Compute"]
        VALIDATE_DATA{"📋 Data Valid?"}
        PERSIST["💾 Persist Result"]
    end

    subgraph RESPONSE ["📤 Response"]
        SUCCESS(["✅ 200 OK"])
        ERR_AUTH(["❌ 401 Unauthorized"])
        ERR_PERM(["❌ 403 Forbidden"])
        ERR_RATE(["❌ 429 Too Many Requests"])
        ERR_DATA(["❌ 422 Validation Error"])
    end

    START --> CHECK_AUTH
    CHECK_AUTH -->|No| ERR_AUTH
    CHECK_AUTH -->|Yes| CHECK_PERM
    CHECK_PERM -->|No| ERR_PERM
    CHECK_PERM -->|Yes| CHECK_RATE
    CHECK_RATE -->|Exceeded| ERR_RATE
    CHECK_RATE -->|OK| FETCH
    FETCH --> TRANSFORM
    TRANSFORM --> VALIDATE_DATA
    VALIDATE_DATA -->|Invalid| ERR_DATA
    VALIDATE_DATA -->|Valid| PERSIST
    PERSIST --> SUCCESS

    classDef start fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef process fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    classDef success fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef error fill:#ffebee,stroke:#b71c1c,stroke-width:2px,color:#b71c1c
    classDef decision fill:#fff9c4,stroke:#f57f17,stroke-width:2px,color:#e65100

    class START start
    class FETCH,TRANSFORM,PERSIST process
    class SUCCESS success
    class ERR_AUTH,ERR_PERM,ERR_RATE,ERR_DATA error
    class CHECK_AUTH,CHECK_PERM,CHECK_RATE,VALIDATE_DATA decision
`;
	}

	// ── Sequence Diagram ───────────────────────────────────────────────────────

	private buildSequenceDiagram(ctx: ArchitectureContext): string {
		const { clouds, components } = ctx;
		const svc = this.cloudServices(clouds[0]);

		return `%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1a73e8', 'primaryTextColor': '#000000',
  'activationBorderColor': '#0d47a1', 'lineColor': '#546e7a'
}}}%%
sequenceDiagram
    autonumber
    actor User as 👤 Client
    participant CDN as 🌍 CDN
    participant GW as 📡 API Gateway
    participant Auth as 🔐 Auth Service
    participant API as ⚙️ Application
    participant Cache as ⚡ ${svc.cache}
    participant DB as 🗄️ ${svc.db}
    participant Queue as 📨 ${svc.queue}

    User->>CDN: HTTPS Request
    CDN-->>User: Serve cached (if static)
    CDN->>GW: Forward dynamic request

    GW->>Auth: Validate JWT / OAuth2 token
    Auth-->>GW: Token claims { userId, roles }
    GW->>API: Authorized request + claims

    API->>Cache: GET key
    alt Cache Hit
        Cache-->>API: Cached response
        API-->>GW: 200 OK (cached)
        GW-->>User: 200 OK
    else Cache Miss
        Cache-->>API: nil
        API->>DB: SELECT query (read replica)
        DB-->>API: Result set
        API->>Cache: SET key TTL=300s
        API-->>GW: 200 OK
        GW-->>User: 200 OK
    end

    Note over API,Queue: Async side-effect (non-blocking)
    API-)Queue: Publish domain event
    Queue-)API: (worker) Consume event
    API->>DB: UPDATE / write operation
    DB-->>API: Commit ack
`;
	}

	// ── Class Diagram ──────────────────────────────────────────────────────────

	private buildClassDiagram(ctx: ArchitectureContext): string {
		return `%%{init: {'theme': 'base'}}%%
classDiagram
    direction TB

    class ArchitectureDesigner {
        <<interface>>
        +analyze(requirements: string) Analysis
        +generateDiagram(ctx: Context) Diagram
        +generateIaC(ctx: Context) IaCConfig
    }

    class CloudArchitectAgent {
        -sessions: Map~string, Session~
        -expertise: ExpertiseProfile
        +startSession() Session
        +analyzeNeeds(req: string) Analysis
        +detectPlatforms(req: string) Platform[]
        +detectPatterns(req: string) Pattern[]
        +identifyRisks(req: string) Risk[]
    }

    class DiagramGenerator {
        +generateArchitectureDiagram(req: string) DiagramResult
        +generateAccessFlowDiagram(desc: string) DiagramResult
        +generateMermaidDiagram(type: string, desc: string) string
        -parseRequirements(raw: string) ArchitectureContext
        -buildMicroservicesArch(ctx: Context) string
        -buildServerlessArch(ctx: Context) string
        -buildEventDrivenArch(ctx: Context) string
        -buildContainerizedArch(ctx: Context) string
        -buildDataPlatformArch(ctx: Context) string
    }

    class TerraformGenerator {
        +generateTerraform(platform: Platform, req: string) TerraformConfig
        +generateModules(ctx: Context) Module[]
    }

    class ArchitectureContext {
        +raw: string
        +clouds: CloudPlatform[]
        +pattern: ArchitecturePattern
        +components: ComponentFlags
        +scale: ScaleProfile
        +projectName: string
    }

    class DiagramResult {
        +format: DiagramFormat
        +code: string
        +data: ArchitectureContext
    }

    class Risk {
        +severity: Severity
        +issue: string
        +recommendation: string
    }

    ArchitectureDesigner <|.. CloudArchitectAgent
    CloudArchitectAgent --> DiagramGenerator
    CloudArchitectAgent --> TerraformGenerator
    DiagramGenerator --> ArchitectureContext
    DiagramGenerator --> DiagramResult
    CloudArchitectAgent --> Risk
`;
	}

	// ── State Diagram ──────────────────────────────────────────────────────────

	private buildStateDiagram(ctx: ArchitectureContext): string {
		return `%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1a73e8', 'primaryTextColor': '#ffffff'
}}}%%
stateDiagram-v2
    [*] --> RequirementsGathering : New Request

    state RequirementsGathering {
        [*] --> CollectingInputs
        CollectingInputs --> ValidatingRequirements
        ValidatingRequirements --> [*]
    }

    RequirementsGathering --> ArchitectureDesign : Requirements Approved

    state ArchitectureDesign {
        [*] --> PatternSelection
        PatternSelection --> ComponentMapping
        ComponentMapping --> SecurityReview
        SecurityReview --> CostEstimation
        CostEstimation --> [*]
    }

    ArchitectureDesign --> DiagramGeneration : Design Approved
    ArchitectureDesign --> RequirementsGathering : Rejected — Revise

    state DiagramGeneration {
        [*] --> GeneratingArchDiagram
        GeneratingArchDiagram --> GeneratingSeqDiagram
        GeneratingSeqDiagram --> GeneratingNetworkDiagram
        GeneratingNetworkDiagram --> [*]
    }

    DiagramGeneration --> IaCGeneration : Diagrams Approved
    DiagramGeneration --> ArchitectureDesign : Revisions Needed

    state IaCGeneration {
        [*] --> TerraformModules
        TerraformModules --> PipelineConfig
        PipelineConfig --> SecurityPolicies
        SecurityPolicies --> [*]
    }

    IaCGeneration --> Review : IaC Generated
    Review --> Deployment : Approved
    Review --> IaCGeneration : Changes Required
    Deployment --> Monitoring : Deployed
    Monitoring --> [*] : Project Complete
    Monitoring --> ArchitectureDesign : Major Re-design
`;
	}

	// ── Deployment Pipeline ────────────────────────────────────────────────────

	private buildDeploymentPipeline(ctx: ArchitectureContext): string {
		const { clouds } = ctx;
		const svc = this.cloudServices(clouds[0]);

		return `%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1a73e8', 'primaryTextColor': '#ffffff',
  'lineColor': '#546e7a', 'background': '#fafafa'
}}}%%
graph LR
    subgraph DEV ["👩‍💻 Development"]
        CODE["📝 Source Code\\n(Git)"]
        PR["🔀 Pull Request\\n+ Code Review"]
    end

    subgraph CI ["🔄 Continuous Integration — ${svc.cicd}"]
        direction TB
        LINT["🔍 Lint &\\nFormat Check"]
        TEST_UNIT["🧪 Unit Tests\\n(Coverage ≥ 80%)"]
        TEST_INT["🔗 Integration\\nTests"]
        SEC_SCAN["🔐 SAST / SCA\\nSecurity Scan"]
        BUILD["🏗️ Build &\\nDockerize"]
        PUSH_REG["📦 Push to\\nContainer Registry"]
    end

    subgraph CD_STAGING ["🧪 Staging Environment"]
        DEPLOY_STG["🚀 Deploy to\\nStaging"]
        SMOKE["💨 Smoke Tests"]
        PERF["⚡ Performance\\nTests"]
        APPROVE["✅ Manual\\nApproval Gate"]
    end

    subgraph CD_PROD ["🚀 Production — ${clouds[0]}"]
        direction TB
        CANARY["🐦 Canary Release\\n(5% traffic)"]
        ROLLOUT["📈 Progressive\\nRollout (25→50→100%)"]
        VERIFY["🔎 Automated\\nVerification"]
    end

    subgraph OPS ["📊 Post-Deployment"]
        MON["${svc.monitoring}\\nMonitoring"]
        ALERT["🚨 Alerting\\n(PagerDuty)"]
        ROLLBACK["⏪ Auto-Rollback\\n(on error threshold)"]
    end

    CODE -->|git push| PR
    PR -->|merge to main| LINT
    LINT --> TEST_UNIT
    TEST_UNIT --> TEST_INT
    TEST_INT --> SEC_SCAN
    SEC_SCAN -->|Pass| BUILD
    SEC_SCAN -->|Fail| CODE
    BUILD --> PUSH_REG
    PUSH_REG --> DEPLOY_STG
    DEPLOY_STG --> SMOKE
    SMOKE --> PERF
    PERF --> APPROVE
    APPROVE -->|Approved| CANARY
    APPROVE -->|Rejected| CODE
    CANARY --> VERIFY
    VERIFY -->|Healthy| ROLLOUT
    VERIFY -->|Issues| ROLLBACK
    ROLLOUT --> MON
    MON --> ALERT
    ALERT -->|Critical| ROLLBACK
    ROLLBACK --> CODE

    classDef dev fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    classDef ci fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef staging fill:#fff9c4,stroke:#f57f17,stroke-width:2px,color:#e65100
    classDef prod fill:#fce4ec,stroke:#880e4f,stroke-width:2px,color:#880e4f
    classDef ops fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#4a148c
    classDef fail fill:#ffebee,stroke:#b71c1c,stroke-width:2px,color:#b71c1c

    class CODE,PR dev
    class LINT,TEST_UNIT,TEST_INT,SEC_SCAN,BUILD,PUSH_REG ci
    class DEPLOY_STG,SMOKE,PERF,APPROVE staging
    class CANARY,ROLLOUT,VERIFY prod
    class MON,ALERT ops
    class ROLLBACK fail
`;
	}

	// ── C4 Context Diagram ─────────────────────────────────────────────────────

	private buildC4ContextDiagram(ctx: ArchitectureContext): string {
		const { projectName, clouds } = ctx;
		const primary = clouds[0];

		return `%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1168bd', 'primaryTextColor': '#ffffff',
  'lineColor': '#707070', 'background': '#fafafa'
}}}%%
graph TB
    subgraph EXTERNAL ["🌐 External Actors"]
        USER(["👤 End User\\nWeb / Mobile Client"])
        ADMIN(["👨‍💼 Administrator\\nInternal Staff"])
        EXT_SVC(["🔌 External Services\\nPayment / Email / SMS"])
    end

    subgraph BOUNDARY ["📦 System Boundary — ${projectName}"]
        direction TB
        WEBAPP["🌐 Web Application\\nFrontend SPA / PWA"]
        BACKEND["⚙️ Backend System\\nAPI & Business Logic"]
        WORKER["🔄 Background Workers\\nAsync Processing"]
    end

    subgraph CLOUD ["☁️ ${primary} — Managed Services"]
        direction LR
        DB[("🗄️ Databases\\nRelational + NoSQL")]
        STORAGE["📦 Object Storage\\nFiles & Media"]
        QUEUE["📨 Message Queue\\nAsync Events"]
    end

    USER -->|"Uses (HTTPS)"| WEBAPP
    ADMIN -->|"Manages (HTTPS + MFA)"| WEBAPP
    WEBAPP -->|"REST / GraphQL"| BACKEND
    BACKEND -->|"Reads / Writes"| DB
    BACKEND -->|"Stores assets"| STORAGE
    BACKEND -->|"Publishes events"| QUEUE
    QUEUE -->|"Triggers"| WORKER
    WORKER -->|"Reads / Writes"| DB
    BACKEND -->|"API calls"| EXT_SVC
    EXT_SVC -.->|"Webhooks / Callbacks"| BACKEND

    classDef external fill:#c8c8c8,stroke:#707070,stroke-width:2px,color:#000000
    classDef system fill:#1168bd,stroke:#0b4884,stroke-width:2px,color:#ffffff
    classDef cloud fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20

    class USER,ADMIN,EXT_SVC external
    class WEBAPP,BACKEND,WORKER system
    class DB,STORAGE,QUEUE cloud
`;
	}

	// ── Network / Security Zones Diagram ──────────────────────────────────────

	private buildNetworkDiagram(ctx: ArchitectureContext): string {
		const { clouds, components } = ctx;
		const primary = clouds[0];
		const svc = this.cloudServices(primary);

		return `%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1a73e8', 'primaryTextColor': '#ffffff',
  'lineColor': '#546e7a', 'background': '#fafafa'
}}}%%
graph TB
    INTERNET(["🌐 Internet\\n0.0.0.0/0"])

    subgraph VPC ["🏗️ VPC — 10.0.0.0/16 (${primary})"]
        direction TB

        subgraph PUB_SUBNET ["📡 Public Subnets — 10.0.1.0/24 + 10.0.2.0/24"]
            IGW["🚪 Internet Gateway"]
            ${components.waf ? `WAF["🛡️ ${svc.waf}\\nDDoS + OWASP rules"]` : ''}
            NGW["🔀 NAT Gateway"]
            ${components.loadBalancer ? `ALB["⚖️ ${svc.lb}\\n(Public)"]` : ''}
        end

        subgraph PRIV_SUBNET ["🔒 Private App Subnets — 10.0.3.0/24 + 10.0.4.0/24"]
            APP_A["💻 App Server\\nAZ-A (10.0.3.10)"]
            APP_B["💻 App Server\\nAZ-B (10.0.4.10)"]
            ${components.cache ? `CACHE["⚡ ${svc.cache}\\n(10.0.3.20)"]` : ''}
        end

        subgraph DATA_SUBNET ["🔐 Private Data Subnets — 10.0.5.0/24 + 10.0.6.0/24"]
            ${components.database ? `DB_PRI["🗄️ ${svc.db} Primary\\n(10.0.5.10)"]
            DB_REP["🗄️ ${svc.db} Replica\\n(10.0.6.10)"]` : ''}
        end

        subgraph MGMT_SUBNET ["⚙️ Management Subnet — 10.0.7.0/24"]
            BASTION["🔑 Bastion Host\\n(SSH Jump)"]
            MON_SERVER["📊 ${svc.monitoring}\\nAgent"]
        end

        SG_WEB["🔒 SG: web-tier\\n:443 from 0.0.0.0/0"]
        SG_APP["🔒 SG: app-tier\\n:8080 from web-tier only"]
        SG_DB["🔒 SG: data-tier\\n:5432 from app-tier only"]
    end

    INTERNET -->|Port 443| IGW
    ${components.waf ? 'IGW --> WAF\n        WAF --> ALB' : `IGW --> ${components.loadBalancer ? 'ALB' : 'APP_A'}`}
    ${components.loadBalancer ? 'ALB --> APP_A\n        ALB --> APP_B' : ''}
    APP_A & APP_B -->|Egress| NGW
    NGW --> INTERNET
    ${components.cache ? 'APP_A & APP_B --> CACHE' : ''}
    ${components.database ? 'APP_A & APP_B --> DB_PRI\n        DB_PRI -.->|Sync repl| DB_REP' : ''}
    BASTION -.->|SSH| APP_A & APP_B
    MON_SERVER -.->|Metrics pull| APP_A & APP_B

    SG_WEB -. governs .-> ALB
    SG_APP -. governs .-> APP_A & APP_B
    SG_DB -. governs .-> DB_PRI

    classDef internet fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    classDef public fill:#fff9c4,stroke:#f57f17,stroke-width:2px,color:#e65100
    classDef private fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef data fill:#fce4ec,stroke:#880e4f,stroke-width:2px,color:#880e4f
    classDef mgmt fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#4a148c
    classDef sg fill:#eceff1,stroke:#455a64,stroke-width:1px,stroke-dasharray:5 5,color:#455a64

    class INTERNET internet
    ${components.waf ? 'class WAF public' : ''}
    class IGW,NGW public
    ${components.loadBalancer ? 'class ALB public' : ''}
    class APP_A,APP_B private
    ${components.cache ? 'class CACHE private' : ''}
    ${components.database ? 'class DB_PRI,DB_REP data' : ''}
    class BASTION,MON_SERVER mgmt
    class SG_WEB,SG_APP,SG_DB sg
`;
	}

	// ── Data Flow Diagram ──────────────────────────────────────────────────────

	private buildDataFlowDiagram(ctx: ArchitectureContext): string {
		const { clouds, components } = ctx;
		const svc = this.cloudServices(clouds[0]);

		return `%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#0288d1', 'primaryTextColor': '#ffffff',
  'lineColor': '#546e7a', 'background': '#fafafa'
}}}%%
graph LR
    USER(["👤 User"])

    subgraph COLLECT ["📥 Collection"]
        API_IN["📡 API\\nIngestion"]
        VALID["✅ Schema\\nValidation"]
        SANITIZE["🧹 Data\\nSanitization"]
    end

    subgraph STORE_RAW ["💾 Raw Storage"]
        RAW_DB["🗄️ ${svc.db}\\nRaw Records"]
        ${components.storage ? `RAW_STORE["📦 ${svc.storage}\\nRaw Files"]` : ''}
    end

    subgraph TRANSFORM ["🔄 Transformation"]
        ENRICH["✨ Enrichment\\n(Lookup join)"]
        NORMALIZE["📐 Normalization\\n(Schema map)"]
        AGGREGATE["📊 Aggregation\\n(Rollups)"]
    end

    subgraph SERVE_LAYER ["📤 Serving"]
        ${components.cache ? `CACHE_LAYER["⚡ ${svc.cache}\\nRead Cache"]` : ''}
        SEARCH_IDX["🔍 Search\\nIndex"]
        ANALYTICS_DB["🏛️ Analytics\\nStore"]
    end

    subgraph CONSUMER ["👁️ Consumers"]
        API_OUT["📡 Query API"]
        REPORT["📊 Reports &\\nDashboards"]
        EXPORT["📤 Data\\nExport"]
    end

    ENCRYPT["🔐 Encryption\\n(at-rest + in-transit)"]
    LINEAGE["📋 Data Lineage\\n& Audit"]

    USER -->|Submit data| API_IN
    API_IN --> VALID
    VALID -->|Invalid| USER
    VALID -->|Valid| SANITIZE
    SANITIZE --> RAW_DB
    ${components.storage ? 'SANITIZE --> RAW_STORE' : ''}
    RAW_DB --> ENRICH
    ENRICH --> NORMALIZE
    NORMALIZE --> AGGREGATE
    AGGREGATE --> ANALYTICS_DB
    AGGREGATE --> SEARCH_IDX
    ${components.cache ? 'AGGREGATE --> CACHE_LAYER' : ''}
    ${components.cache ? 'CACHE_LAYER --> API_OUT' : 'ANALYTICS_DB --> API_OUT'}
    SEARCH_IDX --> API_OUT
    ANALYTICS_DB --> REPORT
    ANALYTICS_DB --> EXPORT
    API_OUT -->|Response| USER

    ENCRYPT -.->|Protects| RAW_DB & ANALYTICS_DB
    LINEAGE -.->|Tracks| COLLECT & TRANSFORM

    classDef user fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    classDef collect fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef raw fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#bf360c
    classDef transform fill:#ede7f6,stroke:#4a148c,stroke-width:2px,color:#4a148c
    classDef serve fill:#e0f7fa,stroke:#006064,stroke-width:2px,color:#006064
    classDef consume fill:#fce4ec,stroke:#880e4f,stroke-width:2px,color:#880e4f
    classDef security fill:#eceff1,stroke:#455a64,stroke-width:1px,stroke-dasharray:5 5

    class USER user
    class API_IN,VALID,SANITIZE collect
    class RAW_DB raw
    ${components.storage ? 'class RAW_STORE raw' : ''}
    class ENRICH,NORMALIZE,AGGREGATE transform
    ${components.cache ? 'class CACHE_LAYER serve' : ''}
    class SEARCH_IDX,ANALYTICS_DB serve
    class API_OUT,REPORT,EXPORT consume
    class ENCRYPT,LINEAGE security
`;
	}

	// ── Cloud Service Catalogue ────────────────────────────────────────────────

	private cloudServices(platform: CloudPlatform): CloudServiceMap {
		const catalogue: Record<CloudPlatform, CloudServiceMap> = {
			AWS: {
				compute:    'EC2 / ECS',
				lambda:     'AWS Lambda',
				kubernetes: 'EKS',
				apiGateway: 'API Gateway',
				lb:         'ALB / NLB',
				db:         'RDS (Aurora)',
				nosql:      'DynamoDB',
				cache:      'ElastiCache (Redis)',
				storage:    'S3',
				cdn:        'CloudFront',
				waf:        'AWS WAF',
				queue:      'SQS / SNS',
				streaming:  'Kinesis',
				monitoring: 'CloudWatch',
				cicd:       'CodePipeline',
				auth:       'Cognito',
				iam:        'IAM',
				ml:         'SageMaker',
				warehouse:  'Redshift',
				etl:        'AWS Glue',
				search:     'OpenSearch',
			},
			Azure: {
				compute:    'App Service / VM',
				lambda:     'Azure Functions',
				kubernetes: 'AKS',
				apiGateway: 'API Management',
				lb:         'Application Gateway',
				db:         'Azure SQL / PostgreSQL',
				nosql:      'Cosmos DB',
				cache:      'Azure Cache for Redis',
				storage:    'Blob Storage',
				cdn:        'Azure CDN / Front Door',
				waf:        'Azure WAF',
				queue:      'Service Bus',
				streaming:  'Event Hubs',
				monitoring: 'Azure Monitor',
				cicd:       'Azure DevOps',
				auth:       'Azure AD B2C',
				iam:        'Azure AD / RBAC',
				ml:         'Azure ML',
				warehouse:  'Synapse Analytics',
				etl:        'Data Factory',
				search:     'Cognitive Search',
			},
			GCP: {
				compute:    'Compute Engine / Cloud Run',
				lambda:     'Cloud Functions',
				kubernetes: 'GKE',
				apiGateway: 'Apigee / Cloud Endpoints',
				lb:         'Cloud Load Balancing',
				db:         'Cloud SQL / AlloyDB',
				nosql:      'Firestore / Bigtable',
				cache:      'Memorystore (Redis)',
				storage:    'Cloud Storage (GCS)',
				cdn:        'Cloud CDN',
				waf:        'Cloud Armor',
				queue:      'Pub/Sub',
				streaming:  'Dataflow',
				monitoring: 'Cloud Monitoring',
				cicd:       'Cloud Build',
				auth:       'Identity Platform',
				iam:        'Cloud IAM',
				ml:         'Vertex AI',
				warehouse:  'BigQuery',
				etl:        'Dataflow / Dataproc',
				search:     'Vertex AI Search',
			}
		};
		return catalogue[platform] ?? catalogue['AWS'];
	}
}

// ── Types ──────────────────────────────────────────────────────────────────────

type CloudPlatform = 'AWS' | 'Azure' | 'GCP';
type ArchitecturePattern = 'monolith' | 'microservices' | 'serverless' | 'event-driven' | 'containerized' | 'data-platform';

interface ComponentFlags {
	cdn: boolean;
	waf: boolean;
	apiGateway: boolean;
	loadBalancer: boolean;
	cache: boolean;
	database: boolean;
	queue: boolean;
	storage: boolean;
	search: boolean;
	monitoring: boolean;
	cicd: boolean;
	auth: boolean;
	ml: boolean;
	streaming: boolean;
	multiCloud: boolean;
}

interface ScaleProfile {
	highAvailability: boolean;
	multiRegion: boolean;
	dr: boolean;
	compliance: boolean;
}

interface ArchitectureContext {
	raw: string;
	clouds: CloudPlatform[];
	pattern: ArchitecturePattern;
	components: ComponentFlags;
	scale: ScaleProfile;
	projectName: string;
}

interface CloudServiceMap {
	compute: string;
	lambda: string;
	kubernetes: string;
	apiGateway: string;
	lb: string;
	db: string;
	nosql: string;
	cache: string;
	storage: string;
	cdn: string;
	waf: string;
	queue: string;
	streaming: string;
	monitoring: string;
	cicd: string;
	auth: string;
	iam: string;
	ml: string;
	warehouse: string;
	etl: string;
	search: string;
}

export interface DiagramResult {
	format: 'mermaid' | 'drawio' | 'svg' | 'png';
	code: string;
	data: ArchitectureContext | null;
}
