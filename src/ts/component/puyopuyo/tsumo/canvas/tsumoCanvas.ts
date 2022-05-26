import { PuyoConst } from "../../../../util/const";
import { Coordinate } from "../../../../math/coordinate";
import { FieldCanvas } from "../../field/canvas/fieldCanvas";
import { GridCellShape } from "../../../canvasparts/gridCellShape";
import { PuyoShape } from "../../../canvasparts/puyoShape";
import { TimelineQueue } from "../../../../timeline/timelineQueue";
import { TsumoInterface } from "../logic/tsumoInterface";

import { Container, Stage } from "@createjs/easeljs";
import { Ticker, Tween, Timeline, Ease } from "@createjs/tweenjs";
import $ from "jquery";

/**
 * Tsumo (UI)
 */
export class TsumoCanvas {
	// constant
	private static readonly PUYO_SIZE = 25;
	private static readonly Y_SIZE = 3;
	private static readonly DROP_V = 50;
	private static readonly MOVE_V = 80;
	private static readonly ROTATE_TIME = 80;

	// properties
	private _stage: Stage;
	private _container: Container;
	private _axis!: PuyoShape;
	private _child!: PuyoShape;

	/**
	 * constructor
	 * @param {string} canvasId canvasのID 
	 */
	constructor(canvasId: string) {
		// canvas init
		this._stage = new Stage(canvasId);
		Ticker.addEventListener("tick", this._stage);
		const xPad = FieldCanvas.F_O_PAD + FieldCanvas.F_I_PAD;
		const w = TsumoCanvas.PUYO_SIZE * PuyoConst.Field.X_SIZE + xPad * 2;
		const h = TsumoCanvas.PUYO_SIZE * TsumoCanvas.Y_SIZE;
		$("#" + canvasId).attr("width", 1 + Math.ceil(w));
		$("#" + canvasId).attr("height", 1 + Math.ceil(h));

		// container
		this._container = new Container;
		this._stage.addChild(this._container);
		this._container.x = xPad;

		// grid
		for (let y = 0; y < TsumoCanvas.Y_SIZE; y++) {
			for (let x = 0; x < PuyoConst.Field.X_SIZE; x++) {
				const cell = TsumoCanvas.createGridCellShape(new Coordinate(x, y));
				this._container.addChild(cell);
			}
		}
	}

	// method
	/**
	 * 移動する。
	 * @param {Coordinate} fromAxisCoord 軸ぷよ移動元座標
	 * @param {Coordinate} fromChildCoord 子ぷよ移動元座標
	 * @param {Coordinate} toAxisCoord 軸ぷよ移動先座標
	 * @param {Coordinate} toChildCoord 子ぷよ移動先座標
	 */
	public move(fromAxisCoord: Coordinate, fromChildCoord: Coordinate, toAxisCoord: Coordinate, toChildCoord: Coordinate): void {
		const mode = TimelineQueue.instance.mode;

		const diff = Math.abs(toAxisCoord.x- fromAxisCoord.x);

		const axisTween = Tween.get(this._axis)
			.to({x: TsumoCanvas.getCanvasCoordinate(fromAxisCoord).x})
			.to({x: TsumoCanvas.getCanvasCoordinate(toAxisCoord).x}, diff * TsumoCanvas.MOVE_V * mode);

		const childTween = Tween.get(this._child)
			.to({x: TsumoCanvas.getCanvasCoordinate(fromChildCoord).x})
			.to({x: TsumoCanvas.getCanvasCoordinate(toChildCoord).x}, diff * TsumoCanvas.MOVE_V * mode);
		
		const timeline = new Timeline({paused: true});
		timeline.addTween(axisTween, childTween);
		TimelineQueue.instance.push(timeline);
	}

	/**
	 * 回す。
	 * @param {Coordinate} fromAxisCoord 軸ぷよ移動元座標
	 * @param {Coordinate} fromChildCoord 子ぷよ移動元座標
	 * @param {Coordinate} toAxisCoord 軸ぷよ移動先座標
	 * @param {Coordinate} toChildCoord 子ぷよ移動先座標
	 */
	public rotate(fromAxisCoord: Coordinate, fromChildCoord: Coordinate, toAxisCoord: Coordinate, toChildCoord: Coordinate): void {
		const mode = TimelineQueue.instance.mode;

		const xEase = fromChildCoord.y == 1 ? Ease.sineIn : Ease.sineOut;
		const yEase = fromChildCoord.y == 1 ? Ease.sineOut : Ease.sineIn;

		const axisTween = Tween.get(this._axis)
			.to({x: TsumoCanvas.getCanvasCoordinate(fromAxisCoord).x})
			.to({x: TsumoCanvas.getCanvasCoordinate(toAxisCoord).x}, TsumoCanvas.ROTATE_TIME * mode);
		
		const childTweenX = Tween.get(this._child)
			.to({x: TsumoCanvas.getCanvasCoordinate(fromChildCoord).x})
			.to({x: TsumoCanvas.getCanvasCoordinate(toChildCoord).x}, TsumoCanvas.ROTATE_TIME * mode, xEase);

		const childTweenY = Tween.get(this._child)
			.to({y: TsumoCanvas.getCanvasCoordinate(fromChildCoord).y})
			.to({y: TsumoCanvas.getCanvasCoordinate(toChildCoord).y}, TsumoCanvas.ROTATE_TIME * mode, yEase);

		const timeline = new Timeline({paused: true});
		timeline.addTween(axisTween, childTweenX, childTweenY);
		TimelineQueue.instance.push(timeline);
	}

	/**
	 * 落とす。
	 * @param {Coordinate} fromAxisCoord 軸ぷよ移動元座標
	 * @param {Coordinate} fromChildCoord 子ぷよ移動元座標
	 */
	public drop(fromAxisCoord: Coordinate, fromChildCoord: Coordinate): void {
		const mode = TimelineQueue.instance.mode;

		const axisPuyo = this._axis;
		const childPuyo = this._child;

		const diff = 3.5;

		const toAxisCoord = fromAxisCoord.clone().addY(-1 * diff);
		const toChildCoord = fromChildCoord.clone().addY(-1 * diff);
		
		const axisTween = Tween.get(axisPuyo)
			.to({y: TsumoCanvas.getCanvasCoordinate(fromAxisCoord).y})
			.to({y: TsumoCanvas.getCanvasCoordinate(toAxisCoord).y}, TsumoCanvas.DROP_V * diff * mode)
			.call(() => { this._container.removeChild(axisPuyo); });

		const childTween = Tween.get(childPuyo)
			.to({y: TsumoCanvas.getCanvasCoordinate(fromChildCoord).y})
			.to({y: TsumoCanvas.getCanvasCoordinate(toChildCoord).y}, TsumoCanvas.DROP_V * diff * mode)
			.call(() => { this._container.removeChild(childPuyo); });
		
		const timeline = new Timeline({paused: true});
		timeline.addTween(axisTween, childTween);
		TimelineQueue.instance.push(timeline);
	}

	/**
	 * ネクストのぷよをツモに設定する。
	 * @param {TsumoInterface} tsumo ツモ
	 * @param {boolean} init 初期化時の処理かどうか
	 */
	public set(tsumo: TsumoInterface, init: boolean): void {
		if (init) {
			if (this._axis !== undefined) this._container.removeChild(this._axis);
			if (this._child !== undefined) this._container.removeChild(this._child);
		}

		const mode = TimelineQueue.instance.mode;
		const diff = 3;

		const fromAxisCanvasCoord = TsumoCanvas.getCanvasCoordinate(tsumo.axis.coord.clone().addY(diff));
		const toAixsCanvasCoord = TsumoCanvas.getCanvasCoordinate(tsumo.axis.coord);
		const fromChildCanvasCoord = TsumoCanvas.getCanvasCoordinate(tsumo.child.coord.clone().addY(diff));
		const toChildCanvasCoord = TsumoCanvas.getCanvasCoordinate(tsumo.child.coord);

		this._axis = new PuyoShape(fromAxisCanvasCoord, tsumo.axis.color, TsumoCanvas.PUYO_SIZE);
		this._child = new PuyoShape(fromChildCanvasCoord, tsumo.child.color, TsumoCanvas.PUYO_SIZE);
		this._container.addChild(this._axis, this._child);

		const axisTween = Tween.get(this._axis)
			.to({y: fromAxisCanvasCoord.y})
			.to({y: toAixsCanvasCoord.y}, diff * TsumoCanvas.DROP_V * mode);
		
		const childTween = Tween.get(this._child)
		.to({y: fromChildCanvasCoord.y})
		.to({y: toChildCanvasCoord.y}, diff * TsumoCanvas.DROP_V * mode);

		const timeline = new Timeline({paused: true});
		timeline.addTween(axisTween, childTween);
		TimelineQueue.instance.push(timeline);
	}

	/**
	 * ツモを変更する。
	 * @param {TsumoInterface} tsumo 軸ぷよ
	 */
	public change(tsumo: TsumoInterface): void {
		this._axis.changeColorAndCoord(tsumo.axis.color, TsumoCanvas.getCanvasCoordinate(tsumo.axis.coord));
		this._child.changeColorAndCoord(tsumo.child.color, TsumoCanvas.getCanvasCoordinate(tsumo.child.coord));
	}

	// static method
	/**
	 * GridCellShapeを生成する。
	 * @param {Coordinate} coord 論理座標
	 * @returns {GridCellShape} GridCellShape
	 */
	private static createGridCellShape(coord: Coordinate): GridCellShape {
		return new GridCellShape(TsumoCanvas.getCanvasCoordinate(coord), TsumoCanvas.PUYO_SIZE);
	}

	/**
	 * 論理座標から表示座標を取得する。
	 * @param {Coordinate} coord 論理座標
	 * @returns {Coordinate} 表示座標
	 */
	public static getCanvasCoordinate(coord: Coordinate): Coordinate {
		const canvasCoord = coord.clone()
			.calculateY(TsumoCanvas.convertY)
			.times(TsumoCanvas.PUYO_SIZE);
		return canvasCoord;
	}

	/**
	 * 論理座標のy方向と表示座標のy方向が異なるため、yの値を変換する。
	 * @param {number} y 論理座標のy（下方向が0）
	 * @returns {number} 変換後のy（上方向が0）
	 */
	private static convertY(y: number): number {
		return TsumoCanvas.Y_SIZE - 1 - y;
	}
}