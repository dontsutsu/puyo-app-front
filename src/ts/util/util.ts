import { Bitmap } from "@createjs/easeljs";
import { Coordinate } from "../math/coordinate";

/**
 * Utilityクラス
 */
export class Util {
	/**
	 * 配列をシャッフルする。
	 * @param {T[]} array 配列
	 * @returns {T[]} 引数の配列をシャッフルした配列
	 */
	public static shuffle<T>(array: T[]): T[] {
		for (let i = array.length - 1; i >= 0; i--) {
			const j = Math.random() * (i + 1) | 0;
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	/**
	 * 0 ～ size-1 の範囲の整数をランダムに取得する。
	 * @param {number} size 
	 * @returns {number} ランダムな整数
	 */
	public static getRandomNumber(size: number): number {
		return Math.random() * size | 0;
	}
}