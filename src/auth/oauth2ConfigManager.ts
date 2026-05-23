import * as vscode from 'vscode';
import { OAuth2Config } from './oauth2Provider';

/**
 * OAuth2 configuration presets for popular providers
 */
export class OAuth2ConfigManager {
	/**
	 * Get GitHub OAuth2 configuration
	 */
	static getGitHubConfig(): OAuth2Config {
		return {
			clientId: vscode.workspace.getConfiguration('megha-agent.auth.github').get('clientId') || '',
			clientSecret: vscode.workspace.getConfiguration('megha-agent.auth.github').get('clientSecret') || '',
			authorizationEndpoint: 'https://github.com/login/oauth/authorize',
			tokenEndpoint: 'https://github.com/login/oauth/access_token',
			redirectUri: 'http://localhost:0/callback',
			scopes: ['user:email', 'read:org'],
			revokeEndpoint: 'https://api.github.com/applications/{clientId}/grants/{token}'
		};
	}

	/**
	 * Get Microsoft Azure AD OAuth2 configuration
	 */
	static getAzureADConfig(): OAuth2Config {
		const tenantId = vscode.workspace.getConfiguration('megha-agent.auth.azure').get('tenantId') || 'common';
		return {
			clientId: vscode.workspace.getConfiguration('megha-agent.auth.azure').get('clientId') || '',
			clientSecret: vscode.workspace.getConfiguration('megha-agent.auth.azure').get('clientSecret') || '',
			authorizationEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
			tokenEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
			redirectUri: 'http://localhost:0/callback',
			scopes: ['https://graph.microsoft.com/.default'],
			revokeEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout`
		};
	}

	/**
	 * Get Google OAuth2 configuration
	 */
	static getGoogleConfig(): OAuth2Config {
		return {
			clientId: vscode.workspace.getConfiguration('megha-agent.auth.google').get('clientId') || '',
			clientSecret: vscode.workspace.getConfiguration('megha-agent.auth.google').get('clientSecret') || '',
			authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
			tokenEndpoint: 'https://oauth2.googleapis.com/token',
			redirectUri: 'http://localhost:0/callback',
			scopes: ['openid', 'email', 'profile'],
			revokeEndpoint: 'https://oauth2.googleapis.com/revoke'
		};
	}

	/**
	 * Get custom OAuth2 configuration
	 */
	static getCustomConfig(provider: string): OAuth2Config | null {
		const config = vscode.workspace.getConfiguration(`megha-agent.auth.custom.${provider}`);
		
		if (!config.get('clientId') || !config.get('tokenEndpoint')) {
			return null;
		}

		return {
			clientId: config.get('clientId') || '',
			clientSecret: config.get('clientSecret') || '',
			authorizationEndpoint: config.get('authorizationEndpoint') || '',
			tokenEndpoint: config.get('tokenEndpoint') || '',
			redirectUri: 'http://localhost:0/callback',
			scopes: config.get('scopes') || [],
			revokeEndpoint: config.get('revokeEndpoint')
		};
	}

	/**
	 * Validate OAuth2 configuration
	 */
	static validateConfig(config: OAuth2Config): { valid: boolean; errors: string[] } {
		const errors: string[] = [];

		if (!config.clientId) {
			errors.push('clientId is required');
		}
		if (!config.clientSecret) {
			errors.push('clientSecret is required');
		}
		if (!config.authorizationEndpoint) {
			errors.push('authorizationEndpoint is required');
		}
		if (!config.tokenEndpoint) {
			errors.push('tokenEndpoint is required');
		}
		if (!config.scopes || config.scopes.length === 0) {
			errors.push('At least one scope is required');
		}

		return {
			valid: errors.length === 0,
			errors
		};
	}
}
