type URLParams = Record<string, string>;

export interface CallbackParams {
	code?: string;
	state?: string;
	error?: string;
	accessToken?: string;
}

export function getCallbackParams(): CallbackParams {
	// Check for query parameters first (authorization code flow)
	const queryParams = new URLSearchParams(window.location.search);
	const code = queryParams.get('code');
	const state = queryParams.get('state');
	const error = queryParams.get('error');

	if (code || error) {
		return { code, state, error };
	}

	// Fallback to hash parameters (legacy implicit flow support)
	const hashParams = parseHashParams();
	const accessToken = hashParams['access_token'];

	if (accessToken) {
		return { accessToken };
	}

	return {};
}

function parseHashParams(): URLParams {
	const rawParams = document.location.hash.slice(1);

	if (!rawParams) {
		return {};
	}

	return rawParams.split('&').reduce((pairs, rawPair) => {
		const [key, value] = rawPair.split('=');
		if (key && value) {
			pairs[key] = value;
		}
		return pairs;
	}, {} as URLParams);
}
