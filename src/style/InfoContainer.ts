import styled from 'styled-components';

const foregroundColor = '#586069';

export const InfoContainer = styled.div`
	background-color: #f3f3f3;
	color: ${foregroundColor};
	border: 1px solid #777;
	padding: 1rem 2rem;
`;

export const InfoHeader = styled.h4`
	margin-bottom: 0.25rem;
`;

export const InfoText = styled.div`
	&:not(:last-child) {
		margin-bottom: 1rem;
	}
`;
