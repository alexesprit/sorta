import React from 'react';
import styled from 'styled-components';

import { ContentWrapper } from '@/style/BaseStyle';

const StyledHeader = styled.header`
	background-color: #070707;
	color: #fff;
	padding: 0.5rem 2rem;
`;

const HeaderContainer = styled(ContentWrapper)`
	align-items: center;
	display: flex;
	justify-content: space-between;
`;

const SortaName = styled.span`
	font-size: 2rem;
	font-weight: 900;
`;

const UserName = styled.span`
	font-size: 1rem;
`;

interface HeaderProps {
	userId: string;
}

export function Header({ userId }: HeaderProps): JSX.Element {
	return (
		<StyledHeader>
			<HeaderContainer>
				<SortaName>Sorta</SortaName>
				<UserName>{userId}</UserName>
			</HeaderContainer>
		</StyledHeader>
	);
}
