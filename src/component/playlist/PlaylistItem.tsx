import React from 'react';
import styled from 'styled-components';

import { SpriteIcon } from '@/component/shared/SpriteIcon';

import { Playlist, PlaylistStatus } from '@/model/Playlist';

import iconCircle from 'bootstrap-icons/icons/circle.svg';
import iconCheckCircle from 'bootstrap-icons/icons/check-circle.svg';
import iconSlashCircle from 'bootstrap-icons/icons/slash-circle.svg';
import iconXCircle from 'bootstrap-icons/icons/x-circle.svg';

interface PlaylistItemProps {
	playlist: Playlist;
}

const PlaylistItemContainer = styled.li`
	margin: 0.5rem 0;
`;

const IconContainer = styled.div`
	display: inline-block;
	height: 1.5rem;
	margin-right: 0.5rem;
	vertical-align: middle;
	width: 1.5rem;
`;

const ErrorIconContainer = styled(IconContainer)`
	color: #FF4F62;
`;
const ReadyIconContainer = styled(IconContainer)`
	color: #586069;
`;

const SortedIconContainer = styled(IconContainer)`
	color: #1db954;
`;

const SkippedIconContainer = styled(IconContainer)`
	color: #586069;
`;

export function PlaylistItem({ playlist }: PlaylistItemProps): JSX.Element {
	const statusIconContainer = getStatusIconContainer(playlist.status);

	return (
		<PlaylistItemContainer>
			{statusIconContainer}
			{playlist.name}
		</PlaylistItemContainer>
	);
}

function getStatusIconContainer(status: PlaylistStatus): JSX.Element {
	switch (status) {
		case 'error':
			return (
				<ErrorIconContainer title="An error occurred during sorting this playlist">
					<SpriteIcon icon={iconXCircle} />
				</ErrorIconContainer>
			);

		case 'ready':
			return (
				<ReadyIconContainer title="This playlist is ready for sorting">
					<SpriteIcon icon={iconCircle} />
				</ReadyIconContainer>
			);

		case 'sorted':
			return (
				<SortedIconContainer title="This playlist is sorted successfully">
					<SpriteIcon icon={iconCheckCircle} />
				</SortedIconContainer>
			);

		case 'skipped':
			return (
				<SkippedIconContainer title="This playlist is already sorted">
					<SpriteIcon icon={iconSlashCircle} />
				</SkippedIconContainer>
			);
	}
}
