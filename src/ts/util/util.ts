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

	/**
	 * ImageDataから指定の座標のRGBA値を取得する。
	 * @param {ImageData} imageData ImageData
	 * @param {Coordinate} coord 座標
	 * @returns {number[]} RGBA値
	 */
	public static getRGBAFromImageData(imageData: ImageData, coord: Coordinate): number[] {
		const index = (coord.x + coord.y * imageData.width) * 4;
		return [imageData.data[index], imageData.data[index+1], imageData.data[index+2], imageData.data[index+3]];
	}

	/**
	 * ImageDataの指定の座標にRGBA値を設定する。
	 * @param {ImageData} imageData 
	 * @param {Coordinate} coord 
	 * @param {number[]} rgba RGBA値
	 */
	public static setRGBAToImageData(imageData: ImageData, coord: Coordinate, rgba: number[]): void {
		if (rgba.length != 4) throw new Error();
		const index = (coord.x + coord.y * imageData.width) * 4;
		for (let i = 0; i < 4; i++) {
			imageData.data[index+i] = rgba[i];
		}
	}

	/**
	 * BitmapをImageDataに変換する。
	 * @param {Bitmap} bmp Bitmap
	 * @returns {ImageData} ImageData
	 */
	public static convertBitmapToImageData(bmp: Bitmap): ImageData {
		const w = bmp.image.width;
		const h = bmp.image.height;
		bmp.cache(0, 0, w, h);
		const bmpcanvas = bmp.cacheCanvas as HTMLCanvasElement;
		const ctx = bmpcanvas.getContext("2d");
		if (ctx === null) throw new Error();
		return ctx.getImageData(0, 0, w, h);
	}
}