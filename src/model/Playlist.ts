export type PlaylistStatus = 'error' | 'ready' | 'sorted' | 'skipped';

export interface Playlist {
	id: string;
	name: string;
	status: PlaylistStatus;
}
