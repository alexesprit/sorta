import React from 'react';
import styled from 'styled-components';

import { Button, CenterWrapper, ContentWrapper } from '@/style/BaseStyle';

import { PlaylistsView } from '@/component/playlist/PlaylistsView';
import { SortRulesView } from '@/component/sort/SortRulesView';

import { useSortPlaylists } from '@/hook/useSortPlaylists';
import { useSortRules } from '@/hook/useSortRules';

const StyledContent = styled.main`
	background-color: #fff;
`;

const defaultRawSortRules = 'artist date album title';

export function Content(): JSX.Element {
	const [sortRules, setSortRules] = useSortRules(defaultRawSortRules);
	const [playlists, sortPlaylists, isProcessing] = useSortPlaylists(
		sortRules
	);

	const canSortPlaylists = sortRules.length > 0;

	return (
		<StyledContent>
			<ContentWrapper>
				<SortRulesView
					sortRules={sortRules}
					setSortRules={setSortRules}
				/>
				<PlaylistsView playlists={playlists}></PlaylistsView>

				{playlists.length > 0 && (
					<CenterWrapper>
						<Button
							disabled={isProcessing || !canSortPlaylists}
							onClick={() => sortPlaylists()}
						>
							Sort playlists
						</Button>
					</CenterWrapper>
				)}
			</ContentWrapper>
		</StyledContent>
	);
}
