import React from 'react';
import styled from 'styled-components';

import { InfoContainer, InfoHeader, InfoText } from '@/style/InfoContainer';

import {
	getSortKeyName,
	getSortKeys,
	getSortOrderName,
	getSortOrders,
	parseSortRules,
} from '@/util/sortRules';
import { SortRulesList } from './SortRulesList';

const SortKeyCode = styled.code`
	background: #e5e5e5;
	border: 1px solid #a5a5a5;
	padding: 0.1rem;
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
		<InfoContainer>
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
		</InfoContainer>
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
