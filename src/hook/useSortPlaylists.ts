import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import {
	getMyId,
	getMyPlaylists,
	getPlaylistTracks,
	setPlaylistTracks,
} from '@/api/spotify';
import { sortTracks } from '@/util/sortTracks';
import { SortRule } from '@/util/sortRules';

import { Playlist, PlaylistStatus } from '@/model/Playlist';

export function useSortPlaylists(
	sortRules: SortRule[]
): [Playlist[], () => void, boolean] {
	const [isFirstSortRun, setIsFirstSortRun] = useState(true);
	const [isProcessing, setIsProcessing] = useState(false);
	const [playlists, setPlaylists] = usePlaylists();

	function resetPlaylists() {
		setPlaylists(
			playlists.map((playlist) => {
				return { ...playlist, status: 'ready' };
			})
		);
	}

	async function sortPlaylists() {
		setIsProcessing(true);

		if (isFirstSortRun) {
			setIsFirstSortRun(false);
		} else {
			resetPlaylists();
		}

		for (const { id: playlistToSortId } of playlists) {
			const tracks = await getPlaylistTracks(playlistToSortId);

			const areTracksSorted = sortTracks(tracks, sortRules);
			let status: PlaylistStatus = areTracksSorted ? 'sorted' : 'skipped';

			if (areTracksSorted) {
				try {
					await setPlaylistTracks(playlistToSortId, tracks);
				} catch (e) {
					status = 'error';
				}
			}

			setPlaylists((prevValue) => {
				return prevValue.map((playlist) => {
					const { id, name } = playlist;
					if (playlistToSortId === id) {
						return { id, name, status };
					}

					return playlist;
				});
			});
		}

		setIsProcessing(false);
	}

	return [playlists, sortPlaylists, isProcessing];
}

function usePlaylists(): [Playlist[], Dispatch<SetStateAction<Playlist[]>>] {
	const [playlists, setPlaylists] = useState<Playlist[]>([]);

	useEffect(() => {
		let isResultIgnored = false;

		async function loadPlaylists() {
			const myId = await getMyId();
			const spotifyPlaylists = await getMyPlaylists();

			const playlists: Playlist[] = spotifyPlaylists
				.filter(({ owner }) => owner.id === myId)
				.map(({ id, name }) => {
					return { id, name, status: 'ready' };
				});

			if (isResultIgnored) {
				return;
			}

			setPlaylists(playlists);
		}

		loadPlaylists();

		return () => {
			isResultIgnored = true;
		};
	}, []);

	return [playlists, setPlaylists];
}
