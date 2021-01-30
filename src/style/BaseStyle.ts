import styled from 'styled-components';

export const Button = styled.button`
	background-color: #1db954;
	border: 1px solid #1db954;
	border-radius: 2rem;
	color: #fff;
	font-weight: 600;
	padding: 1rem 2rem;
	text-decoration: none;
	text-transform: uppercase;
	transition-duration: 0.3s;
	transition-property: background-color, border-color;

	&:hover {
		background-color: #1ed760;
		border-color: #1ed760;
		cursor: pointer;
	}

	&:focus {
		outline: none;
	}
`;

export const ContentWrapper = styled.div`
	margin: auto;
	max-width: 576px;
`;

export const CenterWrapper = styled.div`
	text-align: center;
`;

export const ContentHeader = styled.h1`
	border-bottom: 1px solid rgba(0, 0, 0, 15%);
	margin-bottom: 1rem;
`;

export const ContentSection = styled.div`
	&:not(:last-child) {
		margin-bottom: 2rem;
	}
`;

export const ContentSubSection = styled.div`
	&:not(:last-child) {
		margin-bottom: 1rem;
	}
`;

export const Input = styled.input`
	border: 1px solid #1db954;
	border-radius: 2rem;
	padding: 0.5rem 1rem;
	transition-duration: 0.3s;
	transition-property: box-shadow;

	&:focus {
		box-shadow: 0 0 0 1px #1db954;
		outline: none;
	}
`;

export const InputGroup = styled.div`
	display: flex;
	width: 100%;

	> input {
		flex: 1 1 auto;
	}

	> :not(:last-child) {
		border-bottom-right-radius: 0;
		border-top-right-radius: 0;
	}

	> :not(:first-child) {
		border-bottom-left-radius: 0;
		border-top-left-radius: 0;
		margin-left: -1px;
	}
`;

export const Label = styled.label`
	display: block;
	margin-bottom: 0.5rem;
`;

export const SmallButton = styled(Button)`
	padding: 0.5rem 1rem;
`;
