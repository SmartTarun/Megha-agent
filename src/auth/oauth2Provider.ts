import * as vscode from 'vscode';
import * as http from 'http';
import * as url from 'url';

/**
 * OAuth2 provider configuration
 */
export interface OAuth2Config {
	clientId: string;
	clientSecret: string;
	authorizationEndpoint: string;
	tokenEndpoint: string;
	redirectUri: string;
	scopes: string[];
	revokeEndpoint?: string;
}

/**
 * OAuth2 token response
 */
export interface OAuth2Token {
	access_token: string;
	refresh_token?: string;
	id_token?: string;
	token_type: string;
	expires_in: number;
}

/**
 * OAuth2 provider implementation
 */
export class OAuth2Provider {
	private config: OAuth2Config;
	private localServer: http.Server | null = null;
	private serverPort: number = 0;

	constructor(config: OAuth2Config) {
		this.config = config;
	}

	/**
	 * Start the OAuth2 authorization flow
	 */
	async startAuthorizationFlow(): Promise<OAuth2Token> {
		// Start local server to receive callback
		const authCode = await this.waitForAuthorizationCode();

		// Exchange code for tokens
		const token = await this.exchangeCodeForToken(authCode);
		return token;
	}

	/**
	 * Wait for authorization code from callback
	 */
	private waitForAuthorizationCode(): Promise<string> {
		return new Promise((resolve, reject) => {
			const server = http.createServer((req, res) => {
				const parsedUrl = url.parse(req.url || '', true);
				const code = parsedUrl.query.code as string;
				const error = parsedUrl.query.error as string;

				if (code) {
					res.writeHead(200, { 'Content-Type': 'text/html' });
					res.end('<h1>Authorization successful</h1><p>You can close this window and return to VS Code.</p>');
					this.localServer = null;
					server.close();
					resolve(code);
				} else if (error) {
					res.writeHead(400, { 'Content-Type': 'text/html' });
					res.end(`<h1>Authorization failed</h1><p>Error: ${error}</p>`);
					this.localServer = null;
					server.close();
					reject(new Error(`Authorization failed: ${error}`));
				}
			});

			server.listen(0, 'localhost', () => {
				const addr = server.address();
				if (addr && typeof addr === 'object') {
					this.serverPort = addr.port;
					const redirectUri = `http://localhost:${this.serverPort}/callback`;
					this.config.redirectUri = redirectUri;
					this.openAuthorizationUrl();
				}
				this.localServer = server;
			});

			server.on('error', reject);
		});
	}

	/**
	 * Open authorization URL in browser
	 */
	private async openAuthorizationUrl(): Promise<void> {
		const params = new URLSearchParams({
			client_id: this.config.clientId,
			redirect_uri: this.config.redirectUri,
			scope: this.config.scopes.join(' '),
			response_type: 'code',
			response_mode: 'query'
		});

		const authUrl = `${this.config.authorizationEndpoint}?${params.toString()}`;
		await vscode.env.openExternal(vscode.Uri.parse(authUrl));
	}

	/**
	 * Exchange authorization code for tokens
	 */
	private async exchangeCodeForToken(code: string): Promise<OAuth2Token> {
		const params = new URLSearchParams({
			grant_type: 'authorization_code',
			code,
			client_id: this.config.clientId,
			client_secret: this.config.clientSecret,
			redirect_uri: this.config.redirectUri
		});

		try {
			const response = await fetch(this.config.tokenEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: params.toString()
			});

			if (!response.ok) {
				throw new Error(`Token exchange failed: ${response.statusText}`);
			}

			const token: OAuth2Token = await response.json();
			return token;
		} catch (error) {
			throw new Error(`Failed to exchange code for token: ${error}`);
		}
	}

	/**
	 * Refresh access token
	 */
	async refreshAccessToken(refreshToken: string): Promise<OAuth2Token> {
		const params = new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: refreshToken,
			client_id: this.config.clientId,
			client_secret: this.config.clientSecret
		});

		try {
			const response = await fetch(this.config.tokenEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: params.toString()
			});

			if (!response.ok) {
				throw new Error(`Token refresh failed: ${response.statusText}`);
			}

			const token: OAuth2Token = await response.json();
			return token;
		} catch (error) {
			throw new Error(`Failed to refresh token: ${error}`);
		}
	}

	/**
	 * Revoke refresh token (logout)
	 */
	async revokeToken(refreshToken: string): Promise<void> {
		if (!this.config.revokeEndpoint) {
			console.warn('Revoke endpoint not configured');
			return;
		}

		const params = new URLSearchParams({
			token: refreshToken,
			client_id: this.config.clientId,
			client_secret: this.config.clientSecret
		});

		try {
			await fetch(this.config.revokeEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: params.toString()
			});
		} catch (error) {
			console.error('Failed to revoke token:', error);
		}
	}

	/**
	 * Close local server if running
	 */
	closeLocalServer(): void {
		if (this.localServer) {
			this.localServer.close();
			this.localServer = null;
		}
	}
}
