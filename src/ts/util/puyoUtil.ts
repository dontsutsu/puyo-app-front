import { PuyoConst } from "./const";

export class PuyoUtil {
	public static calcOjamaNum(score: number): number {
		return Math.trunc(score / PuyoConst.OJAMA_RATE);
	}
}