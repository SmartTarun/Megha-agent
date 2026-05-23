/**
 * JWT token handler for decoding and validating JWT tokens
 */
export interface JWTPayload {
	sub: string;
	aud: string;
	iss: string;
	exp: number;
	iat: number;
	email?: string;
	name?: string;
	[key: string]: any;
}

export class JWTHandler {
	/**
	 * Decode JWT token without verification (client-side only)
	 * For verification, use server-side validation
	 */
	static decode(token: string): JWTPayload | null {
		try {
			const parts = token.split('.');
			if (parts.length !== 3) {
				return null;
			}

			const payload = parts[1];
			const decoded = Buffer.from(payload, 'base64').toString('utf-8');
			return JSON.parse(decoded);
		} catch (error) {
			console.error('Error decoding JWT:', error);
			return null;
		}
	}

	/**
	 * Check if token is expired
	 */
	static isExpired(token: string): boolean {
		const payload = this.decode(token);
		if (!payload) {
			return true;
		}

		const currentTime = Math.floor(Date.now() / 1000);
		return payload.exp < currentTime;
	}

	/**
	 * Get time until token expiration in seconds
	 */
	static getTimeUntilExpiration(token: string): number {
		const payload = this.decode(token);
		if (!payload) {
			return -1;
		}

		const currentTime = Math.floor(Date.now() / 1000);
		return payload.exp - currentTime;
	}

	/**
	 * Check if token should be refreshed (expires in less than 5 minutes)
	 */
	static shouldRefresh(token: string, bufferSeconds: number = 300): boolean {
		const timeRemaining = this.getTimeUntilExpiration(token);
		return timeRemaining < bufferSeconds;
	}

	/**
	 * Extract user information from token
	 */
	static getUserInfo(token: string): { email?: string; name?: string; sub?: string } | null {
		const payload = this.decode(token);
		if (!payload) {
			return null;
		}

		return {
			email: payload.email,
			name: payload.name,
			sub: payload.sub
		};
	}

	/**
	 * Validate token structure
	 */
	static isValid(token: string): boolean {
		return this.decode(token) !== null && !this.isExpired(token);
	}
}
