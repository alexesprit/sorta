/**
 * Sort key type.
 */
export type SortKey = 'artist' | 'title' | 'album' | 'date';

/**
 * Sort oder type.
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Sort rule type.
 */
export type SortRule = [SortKey, SortOrder];

/**
 * Parse given raw sort rules and return an array of sort rules.
 *
 * Raw sort rules have the following format: `key/order key/order ...`.
 * All rules are separated by a space symbol.
 *
 * If the sort order is omitted, the `defaultOrder` will be used by default.
 *
 * @param rawSortRules Raw rules
 *
 * @return Array of parsed sort rules
 */
export function parseSortRules(rawSortRules: string): SortRule[] {
	if (rawSortRules.length === 0) {
		throw new TypeError('Empty sort rules');
	}

	return rawSortRules.split(sortRuleSeparator).map(parseSortRule);
}

export function convertToRawSortRules(sortRules: SortRule[]): string {
	return sortRules.map(convertToRawSortRule).join(sortRuleSeparator);
}

/**
 * Return a list of supported sort keys.
 *
 * @return List of sort keys
 */
export function getSortKeys(): ReadonlyArray<SortKey> {
	return validSortKeys;
}

/**
 * Return a list of supported sort orders.
 *
 * @return List of sort keys
 */
export function getSortOrders(): ReadonlyArray<SortOrder> {
	return validSortOrders;
}

/**
 * Return a string representation of the given sort key.
 *
 * @param sortKey Sort key
 *
 * @return String representation of the sort key
 */
export function getSortKeyName(sortKey: SortKey): string {
	return `sort by ${sortKey}`;
}

/**
 * Return a string representation of the given sort order.
 *
 * @param sortOrder Sort order
 *
 * @return String representation of the sort order
 */
export function getSortOrderName(sortOrder: SortOrder): string {
	return sortOrderName[sortOrder];
}

/**
 * Return a string representation of the given sort rule.
 *
 * @param sortRule Sort rule
 *
 * @return String representation of the sort rule
 */
export function getSortRuleDescription(sortRule: SortRule): string {
	const [sortKey, sortOrder] = sortRule;

	return `${getSortKeyName(sortKey)}, ${getSortOrderName(sortOrder)}`;
}

/* Internal */

const sortRuleSeparator = ' ';
const sortKeyOrderSeparator = '/';

const validSortKeys: SortKey[] = ['artist', 'album', 'date', 'title'];
const validSortOrders: SortOrder[] = ['asc', 'desc'];

const defaultSortOrder: SortOrder = 'asc';

const sortOrderName: Record<SortOrder, string> = {
	asc: 'ascending order',
	desc: 'descending order',
};

/**
 * Parse a given raw rule and return a sort rule object.
 *
 * Raw rule is a string which have the following format: `key/order`.
 *
 * If the sort order is omitted, the `defaultOrder` will be used by default.
 *
 * @param rawSortRule Raw sort rule
 *
 * @return Sort rule
 */
function parseSortRule(rawSortRule: string): SortRule {
	const [sortKey, sortOrder] = rawSortRule.split(sortKeyOrderSeparator);

	if (!validSortKeys.includes(sortKey as SortKey)) {
		throw new TypeError(`Invalid sort key: ${sortKey}`);
	}

	if (sortOrder && !validSortOrders.includes(sortOrder as SortOrder)) {
		throw new TypeError(
			`Invalid sort order: ${sortOrder} ('${sortKey}' key)`
		);
	}

	return [sortKey, sortOrder || defaultSortOrder] as SortRule;
}

function convertToRawSortRule(sortRule: SortRule) {
	const [sortKey, sortOrder] = sortRule;

	if (sortOrder === defaultSortOrder) {
		return sortKey;
	}

	return `${sortKey}${sortKeyOrderSeparator}${sortOrder}`;
}
