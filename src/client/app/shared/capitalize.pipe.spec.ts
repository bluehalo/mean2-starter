import { CapitalizePipe } from './capitalize.pipe';
describe('CapitalizePipe', () => {

	let capitalize = new CapitalizePipe();

	it('transforms "foo" to "Foo"', () => {
		expect(capitalize.transform('foo')).toBe('Foo');
	});

	it('transforms "fooBar" to "FooBar"', () => {
		expect(capitalize.transform('fooBar')).toBe('FooBar');
	});

	it('transforms "foo bar" to "Foo bar"', () => {
		expect(capitalize.transform('foo bar')).toBe('Foo bar');
	});

});
