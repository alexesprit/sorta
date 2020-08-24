import { useState } from 'react';

import {
	convertToRawSortRules,
	parseSortRules,
	SortRule,
} from '@/util/sortRules';

const sortRulesStorageKey = 'sortRules';

export function useSortRules(
	defaultRawSortRules: string
): [SortRule[], (value: SortRule[]) => void] {
	const [rawSortRules, setRawSortRules] = useLocalStorage(
		sortRulesStorageKey,
		defaultRawSortRules
	);
	const [sortRules, setSortRules] = useState(() => {
		try {
			return parseSortRules(rawSortRules);
		} catch (e) {
			return [];
		}
	});

	function setSortRulesValue(value: SortRule[]): void {
		setSortRules(value);
		setRawSortRules(convertToRawSortRules(value));
	}

	return [sortRules, setSortRulesValue];
}

function useLocalStorage<T>(
	key: string,
	initialValue: T
): [T, (arg0: T) => void] {
	function getValue(): T {
		try {
			const item = localStorage.getItem(key);
			return item ? (JSON.parse(item) as T) : initialValue;
		} catch (error) {
			return initialValue;
		}
	}

	function setValue(value: T): void {
		try {
			setStoredValue(value);
			localStorage.setItem(key, JSON.stringify(value));
		} catch (error) {}
	}

	const [storedValue, setStoredValue] = useState<T>(getValue);
	return [storedValue, setValue];
}
