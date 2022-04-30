import { MathUtil } from "./mathUtil";

export class FunctionUtil {
	/**
	 * シグモイド関数
	 * @param {number} x x
	 * @returns {number} y
	 */
	public static sigmoid(x: number): number {
		return 1 / (1 + Math.exp(-1 * x));
	}

	/**
	 * シグモイド関数（配列用）
	 * @param {number[]} x x
	 * @returns {number[]} y
	 */
	public static sigmoidForArray(x: number[]): number[] {
		const y = MathUtil.createZero1DArray(x.length);
		for (let i = 0; i < y.length; i++) y[i] = FunctionUtil.sigmoid(x[i]);
		return y;
	}

	/**
	 * シグモイド関数の導関数
	 * @param {number} x x 
	 * @returns {number} y
	 */
	public static dSigmoid(x: number): number {
		return (1 - FunctionUtil.sigmoid(x)) * FunctionUtil.sigmoid(x);
	}

	/**
	 * シグモイド関数の導関数（配列用）
	 * @param {number[]} x x
	 * @returns {number[]} y
	 */
	public static dSigmoidForArray(x: number[]): number[] {
		const y = MathUtil.createZero1DArray(x.length);
		for (let i = 0; i < y.length; i++) y[i] = FunctionUtil.dSigmoid(x[i]);
		return y;
	}

	/**
	 * ソフトマックス関数
	 * @param {number[]} x x
	 * @returns {number[]} y
	 */
	public static softmax(x: number[]): number[] {
		const xe = FunctionUtil.expForArray(x);
		const u = xe.reduce((a, x) => {return a + x});
		const y = MathUtil.createZero1DArray(x.length);
		for (let i = 0; i < y.length; i++) y[i] = xe[i] / u;
		return y;
	}

	/**
	 * 指数関数（配列用）
	 * @param {number[]} x x
	 * @returns {number[]} y
	 */
	public static expForArray(x: number[]): number[] {
		const y = MathUtil.createZero1DArray(x.length);
		for (let i = 0; i < y.length; i++) y[i] = Math.exp(x[i]);
		return y;
	}

	/**
	 * 重み付き和
	 * @param {number} w 重み
	 * @param {number} x 入力
	 * @returns {number} 重み付き和
	 */
	public static weightedSum(w: number[], x: number[]): number {
		if (w.length != x.length) throw new Error();
		let sum = 0;
		for (let i = 0; i < w.length; i++) {
			sum += w[i] * x[i];
		}
		return sum;
	}

	/**
	 * 配列の引き算。
	 * @param {number[]} arr1 引かれる配列
	 * @param {number[]} arr2 引く配列
	 * @returns {number[]} 計算結果
	 */
	public static substract(arr1: number[], arr2: number[]): number[] {
		if (arr1.length != arr2.length) throw new Error();
		const result = MathUtil.createZero1DArray(arr1.length);
		for (let i = 0; i < result.length; i++) result[i] = arr1[i] - arr2[i];
		return result;
	}

	/**
	 * 配列の同じ成分を掛けた結果。
	 * ex: arr1=[1,2,3],arr2=[4,5,6],result=[1*4,2*5,3*6]=[4,10,18]
	 * @param {number[]} arr1 掛けられる配列
	 * @param {number[]} arr2 掛ける配列
	 * @returns {number[]} 計算結果
	 */
	public static multipl(arr1: number[], arr2: number[]): number[] {
		if (arr1.length != arr2.length) throw new Error();
		const result = MathUtil.createZero1DArray(arr1.length);
		for (let i = 0; i < result.length; i++) result[i] = arr1[i] * arr2[i];
		return result;
	}
}