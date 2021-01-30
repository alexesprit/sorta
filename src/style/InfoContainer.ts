import styled from 'styled-components';

export const InfoHeader = styled.h4`
	margin-bottom: 0.25rem;
`;

export const InfoText = styled.div`
	border-left: 0.25rem solid #1db954;
	margin-left: 0.25rem;
	padding: 0.25rem;
	padding-left: 0.75rem;

	&:not(:last-child) {
		margin-bottom: 1rem;
	}
`;

export const ErrorText = styled(InfoText)`
	background-color: #ffb5bb;
	border-color: #ff5263;
`;
