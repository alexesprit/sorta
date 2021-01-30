import React, { Fragment } from 'react';

import { Header } from '@/component/Header';
import { Intro } from '@/component/Intro';
import { Content } from '@/component/Content';

import { GlobalStyle } from '@/style/GlobalStyle';

import { getTokenFromLocation } from './util/util';
import { useAccessToken as setAccessToken } from './api/spotify';
import { useUserId } from './hook/useUserId';

export function App(): JSX.Element {
	const accessToken = getTokenFromLocation();
	setAccessToken(accessToken);

	const isSignedIn = accessToken !== null;
	const userId = useUserId();

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
