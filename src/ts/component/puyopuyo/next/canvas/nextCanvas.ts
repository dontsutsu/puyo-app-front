import { UIConst } from "../../../../util/const";
import { PuyoShape } from "../../../canvasparts/puyoShape";
import { Coordinate } from "../../../../math/coordinate";
import { TimelineQueue } from "../../../../timeline/timelineQueue";

import $ from "jquery";
import { Container, Shape, Stage } from "@createjs/easeljs";
import { Ticker, Timeline, Tween } from "@createjs/tweenjs";
import { MathUtil } from "../../../../math/mathUtil";

/**
 * Next (UI)
 */
export class NextCanvas {
	// constant
	private static readonly AXIS = 1;
	private static readonly CHILD = 0;
	private static readonly NEXT = 0;
	private static readonly NEXT2 = 1;
	private static readonly MOVE_TIME = 150;

	private static readonly PUYO_SIZE = 25;
	private static readonly F_X_SHIFT = NextCanvas.PUYO_SIZE;
	private static readonly F_Y_SHIFT = NextCanvas.PUYO_SIZE / 3 * 7;
	private static readonly F_O_PAD = NextCanvas.PUYO_SIZE / 6;
	private static readonly F_I_PAD = NextCanvas.F_O_PAD * 3;
	private static readonly F_SKEW_DEG = 5;
	private static readonly F_BASE_X = NextCanvas.PUYO_SIZE + (NextCanvas.F_O_PAD + NextCanvas.F_I_PAD) * 2;
	private static readonly F_BASE_Y = NextCanvas.PUYO_SIZE * 2 + (NextCanvas.F_O_PAD + NextCanvas.F_I_PAD) * 2;

	// properties
	private _is2p: boolean;
	private _stage: Stage;
	private _container: Container;
	private _axisPuyo!: PuyoShape;
	private _childPuyo!: PuyoShape;
	private _axisPuyo2!: PuyoShape;
	private _childPuyo2!: PuyoShape;

	/**
	 * constructor
	 * @param {string} canvasId canvasのID
	 * @param {boolean} [is2p] 2pかどうか
	 */
	constructor(canvasId: string, is2p: boolean = false) {
		this._is2p = is2p;

		// canvas init
		this._stage = new Stage(canvasId);
		Ticker.addEventListener("tick", this._stage);
		const w = NextCanvas.F_X_SHIFT + NextCanvas.F_BASE_X;
		const h = NextCanvas.F_Y_SHIFT + (NextCanvas.F_BASE_Y + NextCanvas.F_BASE_X * MathUtil.sinDeg(NextCanvas.F_SKEW_DEG) * 2);
		$("#" + canvasId).attr("width", 1 + Math.ceil(w));
		$("#" + canvasId).attr("height", 1 + Math.ceil(h));

		// frame
		const frame = this.createFrame();
		this._stage.addChild(frame);

		// container
		this._container = new Container();
		this._stage.addChild(this._container);
		this._container.x = NextCanvas.F_O_PAD + NextCanvas.F_I_PAD;
		this._container.y = NextCanvas.F_O_PAD + NextCanvas.F_I_PAD + NextCanvas.F_BASE_X * MathUtil.sinDeg(NextCanvas.F_SKEW_DEG);
		if (this._is2p) {
			this._stage.scaleX = -1;
			this._stage.x = w;
		}
	}

	/**
	 * 初期化する。
	 * @param {string} axisColor ネクスト軸ぷよの色
	 * @param {string} childColor ネクスト子ぷよの色
	 * @param {string} axisColor2 ダブネク軸ぷよの色
	 * @param {string} childColor2 ダブネク子ぷよの色
	 */
	public init(axisColor: string, childColor: string, axisColor2: string, childColor2: string): void {
		if (this._axisPuyo !== undefined) this._container.removeChild(this._axisPuyo);
		if (this._childPuyo !== undefined) this._container.removeChild(this._childPuyo);
		if (this._axisPuyo2 !== undefined) this._container.removeChild(this._axisPuyo2);
		if (this._childPuyo2 !== undefined) this._container.removeChild(this._childPuyo2);

		this._axisPuyo = NextCanvas.createPuyoShape(NextCanvas.NEXT, NextCanvas.AXIS, axisColor);
		this._childPuyo = NextCanvas.createPuyoShape(NextCanvas.NEXT, NextCanvas.CHILD, childColor);
		this._axisPuyo2 = NextCanvas.createPuyoShape(NextCanvas.NEXT2, NextCanvas.AXIS, axisColor2);
		this._childPuyo2 = NextCanvas.createPuyoShape(NextCanvas.NEXT2, NextCanvas.CHILD, childColor2);
		this._container.addChild(this._axisPuyo, this._childPuyo, this._axisPuyo2, this._childPuyo2);
	}

	/**
	 *
	 * @param axisColor
	 * @param childColor
	 * @param axisColor2
	 * @param childColor2
	 */
	public change(axisColor: string, childColor: string, axisColor2: string, childColor2: string): void {
		this._axisPuyo.changeColor(axisColor);
		this._childPuyo.changeColor(childColor);
		this._axisPuyo2.changeColor(axisColor2);
		this._childPuyo2.changeColor(childColor2);
	}

	/**
	 * ネクストをひとつ進める。
	 * @param {color} axisColor2 新しいダブネク軸ぷよの色
	 * @param {color} childColor2 新しいダブネク子ぷよの色
	 */
	public advance(axisColor2: string, childColor2: string): void {
		const mode = TimelineQueue.instance.mode;

		const naCoord = NextCanvas.getCanvasCoordinate(NextCanvas.NEXT, NextCanvas.AXIS);
		const ncCoord = NextCanvas.getCanvasCoordinate(NextCanvas.NEXT, NextCanvas.CHILD);
		const naCoord2 = NextCanvas.getCanvasCoordinate(NextCanvas.NEXT2, NextCanvas.AXIS);
		const ncCoord2 = NextCanvas.getCanvasCoordinate(NextCanvas.NEXT2, NextCanvas.CHILD);

		// old next
		const oldAxisPuyo = this._axisPuyo;
		const oldChildPuyo = this._childPuyo;

		const oaToY = naCoord.y - NextCanvas.PUYO_SIZE * 3;
		const oaTween = Tween.get(oldAxisPuyo)
			.to({y: naCoord.y})
			.to({y: oaToY}, NextCanvas.MOVE_TIME * mode)
			.call(() => { this._container.removeChild(oldAxisPuyo); });

		const ocToY = ncCoord.y - NextCanvas.PUYO_SIZE * 3;
		const ocTween = Tween.get(oldChildPuyo)
			.to({y: ncCoord.y})
			.to({y: ocToY}, NextCanvas.MOVE_TIME * mode)
			.call(() => { this._container.removeChild(oldChildPuyo); });

		// new next
		const newAxisPuyo = this._axisPuyo2;
		const newChildPuyo = this._childPuyo2;

		const naTween = Tween.get(newAxisPuyo)
			.to({x: naCoord2.x, y: naCoord2.y})
			.to({x: naCoord.x, y: naCoord.y}, NextCanvas.MOVE_TIME * mode);

		const ncTween = Tween.get(newChildPuyo)
			.to({x: ncCoord2.x, y: ncCoord2.y})
			.to({x: ncCoord.x, y: ncCoord.y}, NextCanvas.MOVE_TIME * mode);

		// new next2
		const newAxisPuyo2 = NextCanvas.createPuyoShape(NextCanvas.NEXT2, NextCanvas.AXIS, axisColor2);
		const newChildPuyo2 = NextCanvas.createPuyoShape(NextCanvas.NEXT2, NextCanvas.CHILD, childColor2);

		const ndaFromY = naCoord2.y + NextCanvas.PUYO_SIZE * 3;
		newAxisPuyo2.y = ndaFromY;
		const naTween2 = Tween.get(newAxisPuyo2)
			.to({y: ndaFromY})
			.to({y: naCoord2.y}, NextCanvas.MOVE_TIME * mode);

		const ndcFromY = ncCoord2.y + NextCanvas.PUYO_SIZE * 3;
		newChildPuyo2.y = ndcFromY;
		const ncTween2 = Tween.get(newChildPuyo2)
			.to({y: ndcFromY})
			.to({y: ncCoord2.y}, NextCanvas.MOVE_TIME * mode);

		this._container.addChild(newAxisPuyo2, newChildPuyo2);
		this._axisPuyo = newAxisPuyo;
		this._childPuyo = newChildPuyo;
		this._axisPuyo2 = newAxisPuyo2;
		this._childPuyo2 = newChildPuyo2;

		const timeline = new Timeline({paused: true});
		timeline.addTween(oaTween, ocTween);
		timeline.addTween(naTween, ncTween);
		timeline.addTween(naTween2, ncTween2);
		TimelineQueue.instance.push(timeline);
	}

	/**
	 * フレームを生成する。
	 * @returns {Shape} フレーム
	 */
	private createFrame(): Shape {
		const oFrameColor = "#E0E0E0";
		const iFrameColor = this._is2p ? UIConst.TWO_P_COLOR : UIConst.ONE_P_COLOR;

		const sin = MathUtil.sinDeg(NextCanvas.F_SKEW_DEG);
		const cos = MathUtil.cosDeg(NextCanvas.F_SKEW_DEG);

		// 角丸のサイズ
		const oRad = NextCanvas.PUYO_SIZE / 3;
		const iRad = oRad / 5 * 4;

		// frame
		const frame = new Shape();
		frame.skewY = NextCanvas.F_SKEW_DEG;

		frame.graphics
			.f(oFrameColor)
			.rr(0.5, 0.5, NextCanvas.F_BASE_X / cos, NextCanvas.F_BASE_Y + NextCanvas.F_BASE_X * sin, oRad);

		frame.graphics
			.f(oFrameColor)
			.rr(NextCanvas.F_X_SHIFT + 0.5, NextCanvas.F_Y_SHIFT + 0.5, NextCanvas.F_BASE_X / cos, NextCanvas.F_BASE_Y + NextCanvas.F_BASE_X * sin, oRad);

		frame.graphics
			.f(iFrameColor)
			.rr(NextCanvas.F_O_PAD + 0.5, NextCanvas.F_O_PAD + 0.5, (NextCanvas.F_BASE_X - NextCanvas.F_O_PAD * 2) / cos, (NextCanvas.F_BASE_Y - NextCanvas.F_O_PAD * 2) + (NextCanvas.F_BASE_X - NextCanvas.F_O_PAD * 2) * sin, iRad);

		frame.graphics
			.f(iFrameColor)
			.rr(NextCanvas.F_X_SHIFT + NextCanvas.F_O_PAD + 0.5, NextCanvas.F_Y_SHIFT + NextCanvas.F_O_PAD + 0.5, (NextCanvas.F_BASE_X - NextCanvas.F_O_PAD * 2) / cos, (NextCanvas.F_BASE_Y - NextCanvas.F_O_PAD * 2) + (NextCanvas.F_BASE_X - NextCanvas.F_O_PAD * 2) * sin, iRad);

		return frame;
	}

	/**
	 * PuyoShapeを生成する。
	 * @param {number} next 0：ネクスト、1：ダブネク
	 * @param {number} type 0：子ぷよ、1：軸ぷよ
	 * @param {string} color 色
	 * @returns
	 */
	private static createPuyoShape(next: number, type: number, color: string): PuyoShape {
		return new PuyoShape(NextCanvas.getCanvasCoordinate(next, type), color, NextCanvas.PUYO_SIZE);
	}

	/**
	 * next、typeからcanvas上の座標を取得
	 * @param {number} next 0：ネクスト、1：ダブネク
	 * @param {number} type 0：子ぷよ、1：軸ぷよ
	 * @returns {Coordinate} canvas上の座標
	 */
	private static getCanvasCoordinate(next: number, type: number): Coordinate {
		const x = NextCanvas.F_X_SHIFT * next;
		const y = NextCanvas.PUYO_SIZE * type + NextCanvas.F_Y_SHIFT * next;
		return new Coordinate(x, y);
	}
}