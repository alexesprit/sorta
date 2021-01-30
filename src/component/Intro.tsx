import React from 'react';
import styled from 'styled-components';

import { Button, ContentWrapper } from '@/style/BaseStyle';

import { authorize } from '@/api/spotify';

const StyledHeader = styled.header`
	background: linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.9)),
		url('https://source.unsplash.com/a44_Rmyo3Cc/1600x900');
	background-size: cover;
	color: #fff;
	display: flex;
	height: 100vh;
	padding: 0 2rem;
	text-align: center;
`;

const SortaBlock = styled.div`
	margin-bottom: 1.5rem;
`;

const SortaName = styled.div`
	font-size: 6rem;
	font-weight: 900;
`;

const SortaDescription = styled.div`
	font-size: 1.3rem;
`;

export function Intro(): JSX.Element {
	return (
		<StyledHeader>
			<ContentWrapper>
				<SortaBlock>
					<SortaName>Sorta</SortaName>
					<SortaDescription>
						A web application for sorting your Spotify playlists
						using custom sort rules.
					</SortaDescription>
				</SortaBlock>

				<Button onClick={() => authorize()}>Sign in to Spotify</Button>
			</ContentWrapper>
		</StyledHeader>
	);
}
