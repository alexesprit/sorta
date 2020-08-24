import React from 'react';

import { ContentHeader, ContentSection } from '@/style/BaseStyle';

import { Playlist } from '@/model/Playlist';
import { PlaylistItem } from './PlaylistItem';

export interface PlaylistViewProps {
	playlists: Playlist[];
}

export function PlaylistsView({ playlists }: PlaylistViewProps): JSX.Element {
	const playlistItems = playlists.map((playlist) => (
		<PlaylistItem key={playlist.id} playlist={playlist} />
	));
	const playlistContainer = <ul>{playlistItems}</ul>;
	const noPlaylistsItem = <div>No playlists loaded.</div>;

	return (
		<ContentSection>
			<ContentHeader>Your playlists</ContentHeader>
			{playlists.length > 0 ? playlistContainer : noPlaylistsItem}
		</ContentSection>
	);
}
