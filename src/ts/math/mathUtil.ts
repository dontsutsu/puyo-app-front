/**
 * 計算関係のUtilityクラス
 */
export class MathUtil {
	/**
	 * 角度（度数法）から正弦を取得する。
	 * @param {number} degree 角度（度数法）
	 * @returns {number} 正弦
	 */
	public static sinDeg(degree: number): number {
		return Math.sin(degree * (Math.PI / 180));
	}

	/**
	 * 角度（度数法）から余弦を取得する。
	 * @param {number} degree 角度（度数法） 
	 * @returns {number} 余弦
	 */
	public static cosDeg(degree: number): number {
		return Math.cos(degree * (Math.PI / 180));
	}

	/**
	 * ゼロ埋めの1次元配列を生成する。
	 * @param {number} size サイズ
	 * @returns {number} ゼロ埋めの1次元配列
	 */
	public static createZero1DArray(size: number): number[] {
		const arr: number[] = [];
		for (let i = 0; i < size; i++) {
			arr.push(0);
		}
		return arr;
	}

	/**
	 * ゼロ埋めの2次元配列を生成する。
	 * @param {number} rowSize 行サイズ
	 * @param {number} columnSize 列サイズ
	 * @returns {number[][]} ゼロ埋めの2次元配列
	 */
	public static createZero2DArray(rowSize: number, columnSize: number): number[][] {
		const arr: number[][] = [];
		for (let i = 0; i < rowSize; i++) {
			arr.push(MathUtil.createZero1DArray(columnSize));
		}
		return arr;
	}

	/**
	 * 正規乱数を生成する。
	 * @returns {number} 正規乱数
	 */
	public static rnorm(): number {
		return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
	}

	/**
	 * 2次元配列の縦方向の配列を取得する。
	 * @param {number[][]} matrix 2次元配列
	 * @param {number} col 列
	 * @returns {number[]} 縦方向の配列
	 */
	public static getVerticalArray(matrix: number[][], col: number): number[] {
		const v = MathUtil.createZero1DArray(matrix.length);
		for (let i = 0; i < matrix.length; i++) v[i] = matrix[i][col];
		return v;
	}
}