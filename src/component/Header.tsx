import React from 'react';
import styled from 'styled-components';

import { Button, ContentWrapper } from '@/style/BaseStyle';

import { authorize } from '@/api/spotify';

const StyledHeader = styled.header`
	background-color: #070707;
	color: #fff;
	text-align: center;
`;

const SortaBlock = styled.div`
	margin-bottom: 1.5rem;
`;

const SortaName = styled.div`
	font-weight: 600;
	font-size: 4rem;
`;

const SortaDescription = styled.div`
	font-size: 1rem;
`;

const SignedInLabel = styled.div`
	font-size: 1rem;
`;

interface HeaderProps {
	userId: string;
}

export function Header({ userId }: HeaderProps): JSX.Element {
	const isSignedIn = userId !== null;

	return (
		<StyledHeader>
			<ContentWrapper>
				<SortaBlock>
					<SortaName>Sorta</SortaName>
					<SortaDescription>
						A tool for sorting your Spotify playlists using custom
						sort rules.
					</SortaDescription>
				</SortaBlock>

				{!isSignedIn && (
					<Button onClick={() => authorize()}>
						Sign in to Spotify
					</Button>
				)}
				{isSignedIn && (
					<SignedInLabel>
						You are signed in as {userId}.
					</SignedInLabel>
				)}
			</ContentWrapper>
		</StyledHeader>
	);
}
