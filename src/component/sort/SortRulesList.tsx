import React from 'react';
import styled from 'styled-components';

import { getSortRuleDescription, SortRule } from '@/util/sortRules';

const SortRulesOrderedList = styled.ol`
	padding-left: 1.5rem;
`;

const SortRulesItem = styled.li`
	list-style: decimal;
`;

interface SortRulesListProps {
	sortRules: SortRule[];
}

export function SortRulesList({ sortRules }: SortRulesListProps): JSX.Element {
	const ruleItems = sortRules.map((sortRule) => {
		const sortRuleDesc = getSortRuleDescription(sortRule);

		return <SortRulesItem key={sortRule[0]}>{sortRuleDesc}</SortRulesItem>;
	});

	return <SortRulesOrderedList>{ruleItems}</SortRulesOrderedList>;
}
