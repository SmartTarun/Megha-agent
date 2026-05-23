import * as vscode from 'vscode';

/**
 * Secure token storage using VS Code's keytar integration
 */
export class TokenStorage {
	private readonly SERVICE_NAME = 'megha-agent-auth';
	private readonly ACCESS_TOKEN_KEY = 'access_token';
	private readonly REFRESH_TOKEN_KEY = 'refresh_token';
	private readonly ID_TOKEN_KEY = 'id_token';

	constructor() {}

	/**
	 * Store tokens securely
	 */
	async storeTokens(accessToken: string, refreshToken?: string, idToken?: string): Promise<void> {
		try {
			const keytar = await import('keytar');
			await keytar.setPassword(this.SERVICE_NAME, this.ACCESS_TOKEN_KEY, accessToken);
			if (refreshToken) {
				await keytar.setPassword(this.SERVICE_NAME, this.REFRESH_TOKEN_KEY, refreshToken);
			}
			if (idToken) {
				await keytar.setPassword(this.SERVICE_NAME, this.ID_TOKEN_KEY, idToken);
			}
		} catch (error) {
			// Fallback to workspace storage if keytar is not available
			const workspace = vscode.workspace.getConfiguration('megha-agent.auth');
			workspace.update('accessToken', accessToken, vscode.ConfigurationTarget.Global);
			if (refreshToken) {
				workspace.update('refreshToken', refreshToken, vscode.ConfigurationTarget.Global);
			}
			if (idToken) {
				workspace.update('idToken', idToken, vscode.ConfigurationTarget.Global);
			}
		}
	}

	/**
	 * Retrieve access token
	 */
	async getAccessToken(): Promise<string | null> {
		try {
			const keytar = await import('keytar');
			return await keytar.getPassword(this.SERVICE_NAME, this.ACCESS_TOKEN_KEY);
		} catch (error) {
			const workspace = vscode.workspace.getConfiguration('megha-agent.auth');
			return workspace.get('accessToken') || null;
		}
	}

	/**
	 * Retrieve refresh token
	 */
	async getRefreshToken(): Promise<string | null> {
		try {
			const keytar = await import('keytar');
			return await keytar.getPassword(this.SERVICE_NAME, this.REFRESH_TOKEN_KEY);
		} catch (error) {
			const workspace = vscode.workspace.getConfiguration('megha-agent.auth');
			return workspace.get('refreshToken') || null;
		}
	}

	/**
	 * Retrieve ID token
	 */
	async getIdToken(): Promise<string | null> {
		try {
			const keytar = await import('keytar');
			return await keytar.getPassword(this.SERVICE_NAME, this.ID_TOKEN_KEY);
		} catch (error) {
			const workspace = vscode.workspace.getConfiguration('megha-agent.auth');
			return workspace.get('idToken') || null;
		}
	}

	/**
	 * Clear all stored tokens
	 */
	async clearTokens(): Promise<void> {
		try {
			const keytar = await import('keytar');
			await keytar.deletePassword(this.SERVICE_NAME, this.ACCESS_TOKEN_KEY);
			await keytar.deletePassword(this.SERVICE_NAME, this.REFRESH_TOKEN_KEY);
			await keytar.deletePassword(this.SERVICE_NAME, this.ID_TOKEN_KEY);
		} catch (error) {
			const workspace = vscode.workspace.getConfiguration('megha-agent.auth');
			workspace.update('accessToken', undefined, vscode.ConfigurationTarget.Global);
			workspace.update('refreshToken', undefined, vscode.ConfigurationTarget.Global);
			workspace.update('idToken', undefined, vscode.ConfigurationTarget.Global);
		}
	}

	/**
	 * Check if tokens exist
	 */
	async hasTokens(): Promise<boolean> {
		const accessToken = await this.getAccessToken();
		return accessToken !== null && accessToken !== '';
	}
}
