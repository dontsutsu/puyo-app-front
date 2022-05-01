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
}