import { BigNumberPipe } from './big-number.pipe';

export class BigNumberFormatter {
	private static bigNumberPipe = new BigNumberPipe();
	public static format(n: number): string {
		return BigNumberFormatter.bigNumberPipe.transform(n);
	}
}
