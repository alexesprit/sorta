import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
	html {
		box-sizing: border-box;
	}

	body, button, input {
		font: 1rem/1.5 Montserrat, sans-serif;
	}

	body {
		overflow-y: scroll;
	}

	li {
		list-style: none;
	}

	* {
		margin: 0;
		padding: 0;
	}

	*,
	*:before,
	*:after {
		box-sizing: inherit;
	}
`;
