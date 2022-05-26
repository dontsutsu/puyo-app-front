import { EventDispatcher } from "@createjs/easeljs";
import { Coordinate } from "../../../math/coordinate";
import { TsumoInterface } from "../tsumo/logic/tsumoInterface";
import { FieldCanvas } from "./canvas/fieldCanvas";
import { ChainInfoInterface } from "./logic/chainInfoInterface";
import { FieldLogic } from "./logic/fieldLogic";

/**
 * Field
 */
export class Field extends EventDispatcher {
	// properties
	private _canvas: FieldCanvas;	// view
	private _logic: FieldLogic;		// model

	/**
	 * constructor
	 * @param {string} canvasId canvasのID
	 * @param {boolean} mouseEvent フィールドのマウスイベントon/off
	 */
	constructor(canvasId: string, mouseEvent: boolean) {
		super();

		this._canvas = new FieldCanvas(canvasId, mouseEvent);
		this._logic = new FieldLogic(this._canvas);

		this._canvas.addEventListener("mousedown", (e) => {
			this.dispatchEvent(e);
		});
	}

	// method
	/**
	 * 色を変更する。
	 * @param {Coordinate} coord 座標
	 * @param {string} color 色
	 */
	public changeColor(coord: Coordinate, color: string): void {
		this._logic.changeColor(coord, color);
	}

	/**
	 * 連鎖処理を実行する。
	 */
	public start(): void {
		this._logic.start();
	}

	/**
	 * ツモをフィールドに落とせるかどうかを返す。
	 * ツモを落とす先が12以下なら落とせる。
	 * @param {TsumoInterface} tsumo ツモ 
	 * @returns {boolean} true：落とせる、false：落とせない
	 */
	public canDrop(tsumo: TsumoInterface): boolean {
		return this._logic.canDrop(tsumo);
	}

	/**
	 * ツモをフィールドに落とす。
	 * @param {TsumoInterface} tsumo ツモ
	 */
	public dropTsumo(tsumo: TsumoInterface): void {
		this._logic.dropTsumo(tsumo);
	}

	/**
	 * フィールドの文字列を取得する。
	 * @returns {string} フィールドを表す文字列
	 */
	public getFieldString(): string {
		return this._logic.getFieldString();
	}

	/**
	 * 文字列からフィールドを設定する。
	 * @param {string} fieldStr フィールドを表す文字列
	 */
	public setField(fieldStr: string): void {
		this._logic.setField(fieldStr);
	}

	/**
	 * ばたんきゅ～かどうか。
	 * @returns {boolean} true：ばたんきゅ～、false：ばたんきゅ～でない
	 */
	public isDead(): boolean {
		return this._logic.isDead();
	}

	/**
	 * スコアを取得する。
	 * @returns {number} スコア
	 */
	public getScore(): number {
		return this._logic.totalScore;
	}

	/**
	 * スコアを設定する。
	 * @param {number} score スコア
	 */
	public setScore(score: number): void {
		this._logic.setScore(score);
	}

	public setGuide(tsumo: TsumoInterface): void {
		this._logic.setGuide(tsumo);
	}

	public removeGuide(): void {
		this._canvas.removeGuide();
	}

	public getLastChainInfo(): ChainInfoInterface[] {
		return this._logic.lastChainInfo;
	}

	/**
	 * 設置時の一時停止処理。
	 * ステップ実行の場合のみ一時停止する。アニメーション実行の場合は一時停止しない。
	 */
	public landingPause(): void {
		this._canvas.landingPause();
	}
}