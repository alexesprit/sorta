import { parseSortRules } from './sortRules';

test('should parse a single sort rule', () => {
	const result = parseSortRules('artist/asc');

	expect(result).toEqual([['artist', 'asc']]);
});

test('should parse multiple sort rules', () => {
	const result = parseSortRules('artist/asc title/desc');

	expect(result).toEqual([
		['artist', 'asc'],
		['title', 'desc'],
	]);
});

test('should parse sort rules with order omitted', () => {
	const result = parseSortRules('artist/asc title');

	expect(result).toEqual([
		['artist', 'asc'],
		['title', 'asc'],
	]);
});

test('should throw an error if empty input is received', () => {
	expect(() => {
		parseSortRules('Empty sort rules');
	}).toThrow();
});

test('should throw an error if invalid sort key is found', () => {
	expect(() => {
		parseSortRules('artist/asc invalid');
	}).toThrow('Invalid sort key: invalid');
});

test('should throw an error if invalid sort order is found', () => {
	expect(() => {
		parseSortRules('artist/invalid');
	}).toThrow('Invalid sort order: invalid');
});
