/* eslint-disable indent */

import SpotifyWebApi from 'spotify-web-api-js';

const spotifyClient = new SpotifyWebApi();

const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
const scopes =
	'playlist-read-private playlist-modify-private playlist-modify-public';
const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

const maxTracksToSave = 100;

// PKCE helper functions
function generateRandomString(length: number): string {
	const possible =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const values = crypto.getRandomValues(new Uint8Array(length));
	return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
	const encoder = new TextEncoder();
	const data = encoder.encode(plain);
	return crypto.subtle.digest('SHA-256', data);
}

function base64urlencode(a: ArrayBuffer): string {
	let str = '';
	const bytes = new Uint8Array(a);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		str += String.fromCharCode(bytes[i]);
	}
	return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
	const hashed = await sha256(codeVerifier);
	return base64urlencode(hashed);
}

export async function authorize(): Promise<void> {
	// Generate code verifier and challenge for PKCE
	const codeVerifier = generateRandomString(64);
	const codeChallenge = await generateCodeChallenge(codeVerifier);
	const state = generateRandomString(16);

	// Store code verifier and state in sessionStorage for later use
	sessionStorage.setItem('code_verifier', codeVerifier);
	sessionStorage.setItem('oauth_state', state);

	const params = new URLSearchParams({
		client_id: spotifyClientId,
		response_type: 'code',
		redirect_uri: redirectUri,
		code_challenge_method: 'S256',
		code_challenge: codeChallenge,
		state: state,
		scope: scopes,
	});

	const url = `https://accounts.spotify.com/authorize?${params.toString()}`;
	document.location.href = url;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
	const codeVerifier = sessionStorage.getItem('code_verifier');

	if (!codeVerifier) {
		throw new Error('Code verifier not found');
	}

	const params = new URLSearchParams({
		client_id: spotifyClientId,
		grant_type: 'authorization_code',
		code: code,
		redirect_uri: redirectUri,
		code_verifier: codeVerifier,
	});

	const response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: params.toString(),
	});

	if (!response.ok) {
		throw new Error(`Token exchange failed: ${response.statusText}`);
	}

	const data = await response.json();

	// Clear stored values after successful exchange
	sessionStorage.removeItem('code_verifier');
	sessionStorage.removeItem('oauth_state');

	return data.access_token;
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
