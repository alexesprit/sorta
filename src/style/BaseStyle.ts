import styled from 'styled-components';

export const Button = styled.button`
	background-color: #1db954;
	color: #fff;
	border-radius: 2rem;
	border: none;
	font-weight: 600;
	padding: 1rem 2rem;
	text-decoration: none;
	text-transform: uppercase;

	&:hover {
		cursor: pointer;
	}

	&:focus {
		outline: none;
	}
`;

export const ContentWrapper = styled.div`
	max-width: 576px;
	margin: auto;
	padding: 2rem;
`;

export const CenterWrapper = styled.div`
	text-align: center;
`;

export const ContentHeader = styled.h1`
	border-bottom: 1px solid #ddd;
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

	&:focus {
		box-shadow: 0 0 0 1px #1db954;
		outline: none;
	}
`;

export const Label = styled.label`
	display: block;
	margin-bottom: 0.5rem;
`;

export const SmallButton = styled(Button)`
	padding: 0.5rem 1rem;
`;
