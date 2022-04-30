import { EventDispatcher } from "@createjs/easeljs";
import { PuyoConst } from "../../../util/const";
import { NazoTsumoCanvas } from "./canvas/nazoTsumoCanvas";
import { NazoTsumoInterface } from "./nazoTsumoInterface";

/**
 * なぞぷよツモ
 */
export class NazoTsumo extends EventDispatcher {
	// constant
	public static readonly LENGTH = 10;
	public static readonly AXIS = 1;
	public static readonly CHILD = 0;
	public static readonly TYPES = [NazoTsumo.CHILD, NazoTsumo.AXIS];

	// properties
	private _canvas: NazoTsumoCanvas;
	private _array: string[][];

	/**
	 * constructor
	 */
	constructor() {
		super();

		this._canvas = new NazoTsumoCanvas();

		this._array = [];
		for (let i = 0; i < NazoTsumo.LENGTH; i++) {
			const indexArray = [];
			for (const t of NazoTsumo.TYPES) {
				indexArray.push(PuyoConst.Color.N);
			}
			this._array.push(indexArray);
		}

		this._canvas.addEventListener("mousedown", (e) => {
			this.dispatchEvent(e);
		});
	}

	/**
	 * 色を変更する。
	 * @param {NazoTsumoInterface} nazoTsumo なぞぷよツモ
	 * @param {string} color 色 
	 */
	public changeColor(nazoTsumo: NazoTsumoInterface, color: string): void {
		if (color == PuyoConst.Color.J) return;

		this._array[nazoTsumo.index][nazoTsumo.type] = color;

		// view更新
		this._canvas.changeColor(nazoTsumo, color);
	}

	/**
	 * 入力内容の妥当性検証。
	 * @returns {boolean} true：OK、false：NG
	 */
	public validate(): boolean {
		let nflg = false;

		for (let i = 0; i < this._array.length; i++) {
			const axis = this._array[i][NazoTsumo.AXIS];
			const child = this._array[i][NazoTsumo.CHILD];

			// 1. 1ツモ目がなし、なしの場合NG
			if (i == 0 && axis == PuyoConst.Color.N && child == PuyoConst.Color.N) return false;

			// 2. 軸ぷよ子ぷよどちらかがなしの場合NG
			if (axis != PuyoConst.Color.N && child == PuyoConst.Color.N || axis == PuyoConst.Color.N && child != PuyoConst.Color.N) return false;

			// 3. なし、なし以降に色ぷよがある場合NG
			if (axis == PuyoConst.Color.N && child == PuyoConst.Color.N) {
				nflg = true;
				continue;
			}
			if (nflg && (axis != PuyoConst.Color.N || child != PuyoConst.Color.N)) return false;
		}

		return true;
	}

	/**
	 * 文字列を取得する。
	 * @returns {string} なぞぷよツモを表す文字列。[1手目軸ぷよ色][1手目子ぷよ色][2手目軸ぷよ色]・・・
	 */
	public getString(): string {
		let s = "";
		for (let i = 0; i < this._array.length; i++) {
			s += this._array[i][NazoTsumo.AXIS] + this._array[i][NazoTsumo.CHILD];
		}
		return s;
	}
}