import { TsumoCanvas } from "./canvas/tsumoCanvas";
import { TsumoInterface } from "./logic/tsumoInterface";
import { TsumoLogic } from "./logic/tsumoLogic";

/**
 * Tsumo
 */
export class Tsumo {
	// properties
	private _canvas: TsumoCanvas;
	private _logic: TsumoLogic;

	/**
	 * constructor
	 * @param {string} canvasId canvasのID 
	 */
	constructor(canvasId: string) {
		this._canvas = new TsumoCanvas(canvasId);
		this._logic = new TsumoLogic(this._canvas);
	}

	/**
	 * 移動する。
	 * @param {number} vec ベクトル（ex. 左に2：-2　右に3：3）
	 */
	public move(vec: number): void {
		this._logic.move(vec);
	}

	/**
	 * 回す。
	 * @param {boolean} clockwise true：時計回り、false：反時計回り
	 */
	public rotate(clockwise: boolean) {
		this._logic.rotate(clockwise);
	}

	/**
	 * ツモの状態を取得する。
	 * @returns {{axis: TsumoInterface, child: TsumoInterface}} ツモ
	 */
	public getTsumo(): {axis: TsumoInterface, child: TsumoInterface} {
		return this._logic.getTsumo();
	}

	/**
	 * ツモをフィールドに落とす。
	 * フィールドに渡す用のツモの情報を返す
	 * @returns {{axis: TsumoInterface, child: TsumoInterface}} ツモ
	 */
	public drop(): {axis: TsumoInterface, child: TsumoInterface} {
		return this._logic.drop();
	}

	/**
	 * ネクストのぷよをツモに設定する。
	 * @param {string} axisColor 軸ぷよの色 
	 * @param {string} childColor 子ぷよの色
	 */
	public set(axisColor: string, childColor: string): void {
		this._logic.set(axisColor, childColor, false);
	}

	/**
	 * ツモを変更する。
	 * @param {string} axisColor 軸ぷよの色 
	 * @param {string} childColor 子ぷよの色
	 */
	public change(axisColor: string, childColor: string): void {
		this._logic.change(axisColor, childColor);
	}

	/**
	 * ネクストのぷよをツモに設定する（初期化時）。
	 * @param {string} axisColor 軸ぷよの色 
	 * @param {string} childColor 子ぷよの色
	 */
	public init(axisColor: string, childColor: string): void {
		this._logic.set(axisColor, childColor, true);
	}
}