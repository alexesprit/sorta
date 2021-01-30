import React from 'react';
import styled from 'styled-components';

import { InfoHeader, InfoText } from '@/style/InfoContainer';

import {
	getSortKeyName,
	getSortKeys,
	getSortOrderName,
	getSortOrders,
	parseSortRules,
} from '@/util/sortRules';
import { SortRulesList } from './SortRulesList';

const SortKeyCode = styled.code`
	background: rgba(0, 0, 0, 8%);
	border: 1px solid rgba(0, 0, 0, 15%);
	border-radius: 0.2rem;
	padding: 0.2rem;
`;

const SortRuleExampleItem = styled.li`
	&:not(:last-child) {
		margin-bottom: 1rem;
	}
`;

const SortRulesSubBlock = styled.div`
	&:not(:last-child) {
		margin-bottom: 1rem;
	}
`;

const HelpSummary = styled.summary`
	cursor: pointer;
	font-weight: 600;
	outline: none;
`;

const rawSortRulesExamples = ['artist album title', 'artist date/desc'];

export function SortRulesTips(): JSX.Element {
	const sortKeysItems = getSortKeys().map((sortKey) => [
		sortKey,
		getSortKeyName(sortKey),
	]);

	const sortOrderItems = getSortOrders().map((sortOrder) => [
		sortOrder,
		getSortOrderName(sortOrder),
	]);

	const rawSortRulesItems = rawSortRulesExamples.map(
		(exampleRawSortRules) => {
			const sortRules = parseSortRules(exampleRawSortRules);

			return (
				<SortRuleExampleItem key={exampleRawSortRules}>
					<SortKeyCode>{exampleRawSortRules}</SortKeyCode>
					<SortRulesList sortRules={sortRules}></SortRulesList>
				</SortRuleExampleItem>
			);
		}
	);

	return (
		<details>
			<HelpSummary>Help</HelpSummary>
			<SortRulesSubBlock>
				<InfoHeader>Sort keys</InfoHeader>
				<InfoText>
					<ul>{createHelpItems(sortKeysItems)}</ul>
				</InfoText>
			</SortRulesSubBlock>

			<SortRulesSubBlock>
				<InfoHeader>Sort orders</InfoHeader>
				<InfoText>
					<ul>{createHelpItems(sortOrderItems)}</ul>
				</InfoText>
			</SortRulesSubBlock>

			<SortRulesSubBlock>
				<InfoHeader>Examples</InfoHeader>
				<InfoText>
					<ul>{rawSortRulesItems}</ul>
				</InfoText>
			</SortRulesSubBlock>
		</details>
	);
}

function createHelpItems(sortItems: string[][]): JSX.Element[] {
	return sortItems.map((item) => {
		const [code, desc] = item;

		return (
			<li key={code}>
				<SortKeyCode>{code}</SortKeyCode> — {desc}
			</li>
		);
	});
}
