/* eslint-disable indent */

import SpotifyWebApi from 'spotify-web-api-js';

const spotifyClient = new SpotifyWebApi();

const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
const scopes =
	'playlist-read-private playlist-modify-private playlist-modify-public';
const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

const maxTracksToSave = 100;

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
	const tracks: SpotifyApi.PlaylistTrackObject[] = [];

	let limit = 0;
	let offset = 0;
	let total = 0;

	do {
		const response = await spotifyClient.getPlaylistTracks(playlistId, {
			offset: offset + limit,
		});
		({ limit, offset, total } = response);

		tracks.push(...response.items);
	} while (total > limit + offset);

	return tracks;
}

export async function setPlaylistTracks(
	playlistId: string,
	tracks: SpotifyApi.PlaylistTrackObject[]
): Promise<void> {
	const trackIds = tracks.map((track) => `spotify:track:${track.track.id}`);

	for (let offset = 0; offset < trackIds.length; offset += maxTracksToSave) {
		const tracksSlice = trackIds.slice(offset, offset + maxTracksToSave);

		if (offset === 0) {
			await spotifyClient.replaceTracksInPlaylist(
				playlistId,
				tracksSlice
			);
		} else {
			await spotifyClient.addTracksToPlaylist(playlistId, tracksSlice);
		}
	}
}

export async function getMyId(): Promise<string> {
	const { id } = await spotifyClient.getMe();

	return id;
}
