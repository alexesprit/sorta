/* eslint-disable indent */

import SpotifyWebApi from 'spotify-web-api-js';

const spotifyClient = new SpotifyWebApi();

const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
const scopes =
	'playlist-read-private playlist-modify-private playlist-modify-public';
const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

export function authorize(): void {
	const url = `https://accounts.spotify.com/authorize?client_id=${spotifyClientId}&response_type=token&scope=${encodeURIComponent(
		scopes
	)}&redirect_uri=${encodeURIComponent(redirectUri)}`;

	document.location.href = url;
}

export function useAccessToken(token: string): void {
	spotifyClient.setAccessToken(token);
}

export async function getMyPlaylists(): Promise<
	SpotifyApi.PlaylistObjectSimplified[]
> {
	const myId = await getMyId();
	const { items } = await spotifyClient.getUserPlaylists(myId);

	return items;
}

export async function getPlaylistTracks(
	playlistId: string
): Promise<SpotifyApi.PlaylistTrackObject[]> {
	const { items } = await spotifyClient.getPlaylistTracks(playlistId);

	return items;
}

export async function setPlaylistTracks(
	playlistId: string,
	tracks: SpotifyApi.PlaylistTrackObject[]
): Promise<void> {
	const trackIds = tracks.map((track) => `spotify:track:${track.track.id}`);

	await spotifyClient.replaceTracksInPlaylist(playlistId, trackIds);
}

export async function getMyId(): Promise<string> {
	const { id } = await spotifyClient.getMe();

	return id;
}
