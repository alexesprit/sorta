import React, { Fragment } from 'react';

import { Header } from '@/component/Header';
import { Content } from '@/component/Content';

import { GlobalStyle } from '@/style/GlobalStyle';

import { getTokenFromLocation } from './util/util';
import { useAccessToken as setAccessToken } from './api/spotify';
import { useUserId } from './hook/useUserId';

export function App(): JSX.Element {
	setAccessToken(getTokenFromLocation());

	const userId = useUserId();

	return (
		<Fragment>
			<GlobalStyle />

			<Header userId={userId} />
			<Content />
		</Fragment>
	);
}
