import React from 'react';
import styled from 'styled-components';

import { CenterWrapper, ContentWrapper, SmallButton } from '@/style/BaseStyle';

import { PlaylistsView } from '@/component/playlist/PlaylistsView';
import { SortRulesView } from '@/component/sort/SortRulesView';

import { useSortPlaylists } from '@/hook/useSortPlaylists';
import { useSortRules } from '@/hook/useSortRules';

const MainContent = styled.main`
	background-color: #fff;
	padding: 1rem 2rem;
`;

const defaultRawSortRules = 'artist date album title';

export function Content(): JSX.Element {
	const [sortRules, setSortRules] = useSortRules(defaultRawSortRules);
	const [playlists, sortPlaylists, isProcessing] = useSortPlaylists(
		sortRules
	);

	const canSortPlaylists = sortRules.length > 0;

	return (
		<MainContent>
			<ContentWrapper>
				<SortRulesView
					sortRules={sortRules}
					setSortRules={setSortRules}
				/>
				<PlaylistsView playlists={playlists}></PlaylistsView>

				{playlists.length > 0 && (
					<CenterWrapper>
						<SmallButton
							disabled={isProcessing || !canSortPlaylists}
							onClick={() => sortPlaylists()}
						>
							Sort playlists
						</SmallButton>
					</CenterWrapper>
				)}
			</ContentWrapper>
		</MainContent>
	);
}
