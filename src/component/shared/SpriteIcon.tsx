import React from 'react';

import { BrowserSpriteSymbol } from '@/model/BrowserSpriteSymbol';

interface SpriteIconProps {
	icon: BrowserSpriteSymbol;
	width?: string;
	height?: string;
}

export function SpriteIcon(props: SpriteIconProps): JSX.Element {
	const { icon, width, height } = props;

	return (
		<svg
			fill="currentColor"
			focusable="false"
			role="img"
			xmlns="http://www.w3.org/2000/svg"
			height={height}
			viewBox={icon.viewBox}
			width={width}
		>
			<use href={getIconRef(icon)} />
		</svg>
	);
}

function getIconRef(spriteSymbol: BrowserSpriteSymbol) {
	return `#${spriteSymbol.id}`;
}
