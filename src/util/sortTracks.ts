import { SortKey, SortRule } from '@/util/sortRules';

type PlaylistTrack = SpotifyApi.PlaylistTrackObject;

type CompareFunction = (trackA: PlaylistTrack, trackB: PlaylistTrack) => number;

const rulesCompareFunctions: Record<SortKey, CompareFunction> = {
	artist: compareArtists,
	title: compareTitles,
	album: compareAlbums,
	date: compareReleaseDates,
};

export function sortTracks(
	tracks: PlaylistTrack[],
	sortRules: SortRule[]
): boolean {
	let isArrayChanged = false;

	tracks.sort((trackA, trackB) => {
		for (const [sortRule, sortOrder] of sortRules) {
			const compareFn = rulesCompareFunctions[sortRule];

			const compareResult = compareFn(trackA, trackB);
			if (compareResult !== 0) {
				const compareResultValue =
					sortOrder === 'asc' ? compareResult : -compareResult;
				if (compareResultValue < 0) {
					isArrayChanged = true;
				}

				return compareResultValue;
			}
		}

		return 0;
	});

	return isArrayChanged;
}

function compareAlbums(trackA: PlaylistTrack, trackB: PlaylistTrack): number {
	return compareStrings(getAlbumName(trackA), getAlbumName(trackB));
}

function compareArtists(trackA: PlaylistTrack, trackB: PlaylistTrack): number {
	const trackAInfo = trackA.track as SpotifyApi.TrackObjectFull;
	const trackBInfo = trackB.track as SpotifyApi.TrackObjectFull;

	return compareStrings(
		trackAInfo.artists[0].name,
		trackBInfo.artists[0].name
	);
}
function compareReleaseDates(
	trackA: PlaylistTrack,
	trackB: PlaylistTrack
): number {
	return compareStrings(getReleaseDate(trackA), getReleaseDate(trackB));
}

function compareTitles(trackA: PlaylistTrack, trackB: PlaylistTrack): number {
	return compareStrings(trackA.track.name, trackB.track.name);
}

function compareStrings(str1: string, str2: string): number {
	if (!str1) {
		return -1;
	}

	if (!str2) {
		return 1;
	}

	return str1.localeCompare(str2);
}

function getReleaseDate(track: PlaylistTrack): string {
	if ('album' in track.track) {
		const albumInfo = track.track.album;

		if ('release_date' in albumInfo) {
			return (<SpotifyApi.AlbumObjectFull>albumInfo).release_date;
		}
	}

	return null;
}

function getAlbumName(track: PlaylistTrack): string {
	if ('album' in track.track) {
		return track.track.album.name;
	}

	return null;
}
