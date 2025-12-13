import React, { Fragment, useEffect, useState } from 'react';

import { Header } from '@/component/Header';
import { Intro } from '@/component/Intro';
import { Content } from '@/component/Content';

import { GlobalStyle } from '@/style/GlobalStyle';

import { getCallbackParams } from './util/util';
import {
	useAccessToken as setAccessToken,
	exchangeCodeForToken,
} from './api/spotify';
import { useUserId } from './hook/useUserId';

export function App(): JSX.Element {
	const [accessToken, setAccessTokenState] = useState<string | null>(null);
	const [authError, setAuthError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const handleCallback = async () => {
			const params = getCallbackParams();

			// Handle authorization errors
			if (params.error) {
				setAuthError(params.error);
				setIsLoading(false);
				// Clean up URL
				window.history.replaceState({}, document.title, '/');
				return;
			}

			// Handle authorization code (new PKCE flow)
			if (params.code) {
				const storedState = sessionStorage.getItem('oauth_state');

				// Validate state to prevent CSRF attacks
				if (params.state !== storedState) {
					setAuthError('state_mismatch');
					setIsLoading(false);
					window.history.replaceState({}, document.title, '/');
					return;
				}

				try {
					const token = await exchangeCodeForToken(params.code);
					setAccessToken(token);
					setAccessTokenState(token);
					// Clean up URL after successful token exchange
					window.history.replaceState({}, document.title, '/');
				} catch (error) {
					setAuthError(
						error instanceof Error ? error.message : 'token_exchange_failed'
					);
				}
			}
			// Handle legacy access token from hash (for backwards compatibility)
			else if (params.accessToken) {
				setAccessToken(params.accessToken);
				setAccessTokenState(params.accessToken);
				window.history.replaceState({}, document.title, '/');
			}

			setIsLoading(false);
		};

		handleCallback();
	}, []);

	const isSignedIn = accessToken !== null;
	const userId = useUserId();

	if (isLoading) {
		return (
			<Fragment>
				<GlobalStyle />
				<div>Loading...</div>
			</Fragment>
		);
	}

	if (authError) {
		return (
			<Fragment>
				<GlobalStyle />
				<div>
					Authentication error: {authError}
					<br />
					<button onClick={() => window.location.reload()}>
						Try again
					</button>
				</div>
			</Fragment>
		);
	}

	return (
		<Fragment>
			<GlobalStyle />

			{isSignedIn && (
				<>
					<Header userId={userId} />
					<Content />
				</>
			)}
			{!isSignedIn && <Intro />}
		</Fragment>
	);
}
