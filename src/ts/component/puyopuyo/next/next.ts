import { NextCanvas } from "./canvas/nextCanvas";
import { NextLogic } from "./logic/nextLogic";

/**
 * Next
 */
export class Next {
	// properties
	private _canvas: NextCanvas;
	private _logic: NextLogic;

	/**
	 * constructor
	 * @param {string} canvasId canvasのID 
	 */
	constructor(canvasId: string) {
		this._canvas = new NextCanvas(canvasId);
		this._logic = new NextLogic(this._canvas);
	}

	/**
	 * 初期化する。
	 */
	public init(): void {
		this._logic.init();
	}

	/**
	 * 次のツモの色を取得する。
	 * @returns {{axis: string, child: string}} 次のツモの色
	 */
	public getNextColor(): {axis: string, child: string} {
		return this._logic.getNextColor();
	}

	/**
	 * ひとつ前のツモを返す。
	 * @returns {{axis: string, child: string}} 前のツモの色
	 */
	public back(): {axis: string, child: string} {
		return this._logic.back();
	}

	public set(tsumos: {axis: string, child: string}[]): void {
		this._logic.set(tsumos);
	}
}