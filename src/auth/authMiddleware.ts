/**
 * Middleware for adding authentication to HTTP requests
 */
export class AuthMiddleware {
	/**
	 * Add authorization header to fetch request
	 */
	static async addAuthHeader(init?: RequestInit, token?: string): Promise<RequestInit> {
		const headers = new Headers(init?.headers);
		if (token) {
			headers.set('Authorization', `Bearer ${token}`);
		}
		return {
			...init,
			headers
		};
	}

	/**
	 * Create authenticated fetch wrapper
	 */
	static createAuthenticatedFetch(getToken: () => Promise<string | null>) {
		return async (url: string, init?: RequestInit): Promise<Response> => {
			const token = await getToken();
			const authInit = await this.addAuthHeader(init, token || undefined);
			return fetch(url, authInit);
		};
	}

	/**
	 * Intercept API calls and add authentication
	 */
	static async withAuth<T>(
		apiCall: (headers: Headers) => Promise<T>,
		token: string
	): Promise<T> {
		const headers = new Headers({
			'Authorization': `Bearer ${token}`,
			'Content-Type': 'application/json'
		});
		return apiCall(headers);
	}
}
