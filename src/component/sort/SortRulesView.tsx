import React, { useState } from 'react';

import {
	ContentHeader,
	ContentSection,
	ContentSubSection,
	Input,
	Label,
	SmallButton,
} from '@/style/BaseStyle';

import {
	convertToRawSortRules,
	parseSortRules,
	SortRule,
} from '@/util/sortRules';

import { SortRulesList } from './SortRulesList';
import { SortRulesTips } from './SortRulesTips';
import { ErrorContainer } from '@/style/ErrorContainer';
import { InfoContainer, InfoHeader } from '@/style/InfoContainer';

interface SortRulesViewProps {
	sortRules: SortRule[];
	setSortRules: (value: SortRule[]) => void;
}

export function SortRulesView(props: SortRulesViewProps): JSX.Element {
	const { sortRules, setSortRules } = props;
	const rawSortRules = convertToRawSortRules(sortRules);

	const [errorMessage, setErrorMessage] = useState<string>(null);
	const [areTipsVisible, setTipsVisible] = useState(false);
	const [inputValue, setInputValue] = useState(rawSortRules);

	function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
		event.preventDefault();

		try {
			setSortRules(parseSortRules(inputValue));
			setErrorMessage(null);
		} catch (e) {
			setSortRules([]);
			setErrorMessage((e as Error).message);
		}
	}

	return (
		<ContentSection>
			<ContentHeader>Sort rules</ContentHeader>
			<ContentSubSection>
				<form onSubmit={handleSubmit}>
					<Label>Sort rules</Label>
					<Input
						type="text"
						value={inputValue}
						onChange={(event) =>
							setInputValue(event.currentTarget.value)
						}
					/>
					<SmallButton type="submit">Set</SmallButton>
					<SmallButton
						type="button"
						onClick={() => setTipsVisible((value) => !value)}
					>
						{ areTipsVisible ? 'Hide tips' : 'Show tips' }
					</SmallButton>
				</form>
			</ContentSubSection>
			<ContentSubSection>
				{sortRules.length > 0 && (
					<InfoContainer>
						<InfoHeader>Current sort order</InfoHeader>
						<SortRulesList sortRules={sortRules}></SortRulesList>
					</InfoContainer>
				)}
			</ContentSubSection>
			<ContentSubSection>
				{errorMessage && (
					<ErrorContainer>
						Unable to parse sort rules: {errorMessage}.
					</ErrorContainer>
				)}
			</ContentSubSection>
			<ContentSubSection>
				{areTipsVisible && <SortRulesTips />}
			</ContentSubSection>
		</ContentSection>
	);
}
