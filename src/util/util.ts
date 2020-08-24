const accessTokenParam = 'access_token';

type URLParams = Record<string, string>;

export function getTokenFromLocation(): string {
	const params = parseLocationParams();

	return params[accessTokenParam];
}

function parseLocationParams(): URLParams {
	const rawParams = document.location.hash.slice(1);

	return rawParams.split('&').reduce((pairs, rawPair) => {
		const [key, value] = rawPair.split('=');
		pairs[key] = value;

		return pairs;
	}, {} as URLParams);
}
