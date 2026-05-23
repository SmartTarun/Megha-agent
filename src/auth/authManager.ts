import * as vscode from 'vscode';
import { TokenStorage } from './tokenStorage';
import { JWTHandler } from './jwtHandler';
import { OAuth2Provider, OAuth2Config, OAuth2Token } from './oauth2Provider';

/**
 * Authentication manager for OAuth2 and JWT handling
 */
export class AuthManager {
	private tokenStorage: TokenStorage;
	private oauth2Provider: OAuth2Provider | null = null;
	private config: OAuth2Config | null = null;
	private authStatusBar: vscode.StatusBarItem;
	private onAuthChangedEmitter = new vscode.EventEmitter<{ isAuthenticated: boolean }>();

	readonly onAuthChanged = this.onAuthChangedEmitter.event;

	constructor(private context: vscode.ExtensionContext) {
		this.tokenStorage = new TokenStorage();
		this.authStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
		this.updateAuthStatus();
	}

	/**
	 * Initialize OAuth2 configuration
	 */
	initializeOAuth2(config: OAuth2Config): void {
		this.config = config;
		this.oauth2Provider = new OAuth2Provider(config);
	}

	/**
	 * Start OAuth2 authentication flow
	 */
	async authenticate(): Promise<boolean> {
		if (!this.oauth2Provider) {
			vscode.window.showErrorMessage('OAuth2 provider not configured');
			return false;
		}

		try {
			vscode.window.showInformationMessage('Opening browser for authentication...');
			const token = await this.oauth2Provider.startAuthorizationFlow();
			await this.storeToken(token);
			this.updateAuthStatus();
			this.onAuthChangedEmitter.fire({ isAuthenticated: true });
			vscode.window.showInformationMessage('Authentication successful!');
			return true;
		} catch (error) {
			vscode.window.showErrorMessage(`Authentication failed: ${error}`);
			return false;
		}
	}

	/**
	 * Store OAuth2 token
	 */
	private async storeToken(token: OAuth2Token): Promise<void> {
		await this.tokenStorage.storeTokens(
			token.access_token,
			token.refresh_token,
			token.id_token
		);
	}

	/**
	 * Get valid access token, refreshing if necessary
	 */
	async getAccessToken(): Promise<string | null> {
		const accessToken = await this.tokenStorage.getAccessToken();

		if (!accessToken) {
			return null;
		}

		// Check if token needs refresh
		if (JWTHandler.shouldRefresh(accessToken)) {
			const refreshToken = await this.tokenStorage.getRefreshToken();
			if (refreshToken) {
				await this.refreshToken(refreshToken);
				return await this.tokenStorage.getAccessToken();
			}
		}

		return accessToken;
	}

	/**
	 * Refresh access token using refresh token
	 */
	private async refreshToken(refreshToken: string): Promise<boolean> {
		if (!this.oauth2Provider) {
			return false;
		}

		try {
			const newToken = await this.oauth2Provider.refreshAccessToken(refreshToken);
			await this.storeToken(newToken);
			return true;
		} catch (error) {
			console.error('Token refresh failed:', error);
			return false;
		}
	}

	/**
	 * Check if user is authenticated
	 */
	async isAuthenticated(): Promise<boolean> {
		const token = await this.tokenStorage.getAccessToken();
		return token !== null && JWTHandler.isValid(token);
	}

	/**
	 * Get user information from token
	 */
	async getUserInfo(): Promise<{ email?: string; name?: string; sub?: string } | null> {
		const token = await this.tokenStorage.getAccessToken();
		if (!token) {
			return null;
		}

		return JWTHandler.getUserInfo(token);
	}

	/**
	 * Logout and clear tokens
	 */
	async logout(): Promise<void> {
		const refreshToken = await this.tokenStorage.getRefreshToken();
		
		// Revoke token if refresh token exists
		if (refreshToken && this.oauth2Provider) {
			try {
				await this.oauth2Provider.revokeToken(refreshToken);
			} catch (error) {
				console.error('Failed to revoke token:', error);
			}
		}

		// Clear stored tokens
		await this.tokenStorage.clearTokens();
		this.updateAuthStatus();
		this.onAuthChangedEmitter.fire({ isAuthenticated: false });
		vscode.window.showInformationMessage('Logged out successfully');
	}

	/**
	 * Update authentication status bar
	 */
	private async updateAuthStatus(): Promise<void> {
		const isAuth = await this.isAuthenticated();
		
		if (isAuth) {
			const userInfo = await this.getUserInfo();
			this.authStatusBar.text = `$(person-filled) ${userInfo?.email || userInfo?.name || 'Authenticated'}`;
			this.authStatusBar.command = 'megha-agent.logout';
			this.authStatusBar.tooltip = 'Click to logout';
		} else {
			this.authStatusBar.text = '$(person) Megha: Not Authenticated';
			this.authStatusBar.command = 'megha-agent.authenticate';
			this.authStatusBar.tooltip = 'Click to authenticate';
		}

		this.authStatusBar.show();
	}

	/**
	 * Get status bar item for display
	 */
	getStatusBar(): vscode.StatusBarItem {
		return this.authStatusBar;
	}

	/**
	 * Dispose resources
	 */
	dispose(): void {
		this.authStatusBar.dispose();
		this.oauth2Provider?.closeLocalServer();
		this.onAuthChangedEmitter.dispose();
	}
}
