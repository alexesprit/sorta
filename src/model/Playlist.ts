export type PlaylistStatus = 'error' | 'ready' | 'sorted' | 'skipped';

export interface Playlist {
	id: string;
	href: string;
	name: string;
	status: PlaylistStatus;
}
