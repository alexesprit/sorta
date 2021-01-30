import React, { useState } from 'react';

import {
	ContentHeader,
	ContentSection,
	ContentSubSection,
	Input,
	InputGroup,
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
import { ErrorText, InfoHeader, InfoText } from '@/style/InfoContainer';

interface SortRulesViewProps {
	sortRules: SortRule[];
	setSortRules: (value: SortRule[]) => void;
}

export function SortRulesView(props: SortRulesViewProps): JSX.Element {
	const { sortRules, setSortRules } = props;
	const rawSortRules = convertToRawSortRules(sortRules);

	const [errorMessage, setErrorMessage] = useState<string>(null);
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
			<ContentHeader>Settings</ContentHeader>
			<ContentSubSection>
				<form onSubmit={handleSubmit}>
					<Label>Sort rules</Label>
					<InputGroup>
						<Input
							type="text"
							value={inputValue}
							onChange={(event) =>
								setInputValue(event.currentTarget.value)
							}
						/>
						<SmallButton type="submit">Set</SmallButton>
					</InputGroup>
				</form>
			</ContentSubSection>

			<ContentSubSection>
				{sortRules.length > 0 && (
					<>
						<InfoHeader>Current sort order</InfoHeader>
						<InfoText>
							<SortRulesList
								sortRules={sortRules}
							></SortRulesList>
						</InfoText>
					</>
				)}
			</ContentSubSection>

			<ContentSubSection>
				{errorMessage && (
					<ErrorText>
						Unable to parse sort rules: {errorMessage}.
					</ErrorText>
				)}
			</ContentSubSection>

			<SortRulesTips />
		</ContentSection>
	);
}
