import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
	/* @import url('https://fonts.googleapis.com/css?family=Open+Sans'); */

	html {
		box-sizing: border-box;
	}

	body, button, input {
		font: 1rem/1.5 'Open Sans', sans-serif;
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
