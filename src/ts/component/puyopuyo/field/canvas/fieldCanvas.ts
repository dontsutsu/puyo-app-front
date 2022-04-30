import { PuyoConst, UIConst } from "../../../../util/const";
import { Coordinate } from "../../../../math/coordinate";
import { GridCellShape } from "../../../canvasparts/gridCellShape";
import { PuyoShape } from "../../../canvasparts/puyoShape";
import { TimelineQueue } from "../../../../timeline/timelineQueue";

import $ from "jquery";
import { Container, EventDispatcher, Shadow, Shape, Stage, Text } from "@createjs/easeljs";
import { Ticker, Timeline, Tween } from "@createjs/tweenjs";
import { TsumoInterface } from "../../tsumo/logic/tsumoInterface";
import { MathUtil } from "../../../../math/mathUtil";

/**
 * Field (UI)
 */
export class FieldCanvas extends EventDispatcher {
	// constant
	private static readonly PUYO_SIZE = 25;
	public static readonly F_O_PAD = FieldCanvas.PUYO_SIZE / 6;
	public static readonly F_I_PAD = FieldCanvas.F_O_PAD * 3;
	private static readonly F_SKEW_DEG = 5;
	private static readonly F_BASE_X = FieldCanvas.PUYO_SIZE * PuyoConst.Field.X_SIZE + (FieldCanvas.F_O_PAD + FieldCanvas.F_I_PAD) * 2;
	private static readonly F_BASE_Y = FieldCanvas.PUYO_SIZE * PuyoConst.Field.Y_SIZE + (FieldCanvas.F_O_PAD + FieldCanvas.F_I_PAD) * 2;
	private static readonly CELL_COLOR = "#FFFFFF";
	private static readonly CELL_MOUSEOVER_COLOR = "#00FFFF";
	/** 1セル移動するのにかかる時間 */
	private static readonly DROP_V = 50;
	private static readonly ERASE_TIME = 500;
	private static readonly STEP_ERASE_TIME = 300;
	
	// properties
	private _is2P: boolean;
	private _stage: Stage;
	private _container: Container;
	private _score: Text;
	private _scoreOutline: Text;
	private _array: PuyoShape[][];
	private _guideAxis: PuyoShape;
	private _guideChild: PuyoShape;

	/**
	 * constructor
	 * @param {string} canvasId canvasのID
	 * @param {boolean} mouseEvent フィールドのマウスイベントon/off
	 * @param {boolean} [is2P] 2pかどうか
	 */
	constructor(canvasId: string, mouseEvent: boolean, is2P: boolean = false) {
		super();

		this._is2P = is2P;

		// canvas init
		this._stage = new Stage(canvasId);
		Ticker.addEventListener("tick", this._stage);
		this._stage.enableMouseOver();
		const w = FieldCanvas.F_BASE_X;
		const h = FieldCanvas.F_BASE_Y + FieldCanvas.F_BASE_X * MathUtil.sinDeg(FieldCanvas.F_SKEW_DEG) * 2;
		$("#" + canvasId).attr("width", 1 + Math.ceil(w));
		$("#" + canvasId).attr("height", 1 + Math.ceil(h));

		// frame
		const frame = this.createFrameContainer();
		this._stage.addChild(frame);

		// container
		this._container = new Container();
		this._stage.addChild(this._container);
		this._container.x = FieldCanvas.F_O_PAD + FieldCanvas.F_I_PAD;
		this._container.y = FieldCanvas.F_O_PAD + FieldCanvas.F_I_PAD + FieldCanvas.F_BASE_X * MathUtil.sinDeg(FieldCanvas.F_SKEW_DEG);

		// score
		const scoreStr = FieldCanvas.formatScore(0);
		this._score = new Text(scoreStr, "bold " + (FieldCanvas.PUYO_SIZE * 0.8 | 0) + "px BIZ UDPGothic");
		this._score.textAlign = "end";
		this._score.textBaseline = "top";
		this._score.x = FieldCanvas.PUYO_SIZE * PuyoConst.Field.X_SIZE + 0.5;
		this._score.y = FieldCanvas.PUYO_SIZE * PuyoConst.Field.Y_SIZE + 4.5;	// 4は余白
		// outline clone
		this._scoreOutline = this._score.clone();
		// color, outline
		this._score.color = "#FFFFFF";
		this._scoreOutline.color = "#707070";
		this._scoreOutline.shadow = new Shadow(this._scoreOutline.color, 1, 1, 0);
		this._scoreOutline.outline = 3;
		// add outlineを先に
		this._container.addChild(this._scoreOutline, this._score);

		// grid
		for (let y = 0; y < PuyoConst.Field.Y_SIZE; y++) {
			for (let x = 0; x < PuyoConst.Field.X_SIZE; x++) {
				const coord = new Coordinate(x, y);
				const cell = FieldCanvas.createGridCellShape(coord);
				cell.alpha = y == PuyoConst.Field.Y_SIZE - 1 ? 0.01 : 1.0;
				this._container.addChild(cell);

				if (mouseEvent) {
					// mouseover, mouseout
					cell.addEventListener("mouseover", () => {
						cell.changeBgColor(FieldCanvas.CELL_MOUSEOVER_COLOR);
						cell.alpha = 1.0;
					});

					cell.addEventListener("mouseout", () => {
						cell.changeBgColor(FieldCanvas.CELL_COLOR);
						cell.alpha = y == PuyoConst.Field.Y_SIZE - 1 ? 0.01 : 1.0;
					});

					// mousedown
					cell.addEventListener("mousedown", () => {
						const e = new CustomEvent<Coordinate>("mousedown", {
							detail: coord
						});
						this.dispatchEvent(e);
					});
				}
			}
		}

		// 致死座標の×印
		const cross = this.createCrossShape();
		this._container.addChild(cross);

		// puyo
		this._array = [];
		for (let y = 0; y < PuyoConst.Field.Y_SIZE; y++) {
			const yarray = [];
			for (let x = 0; x < PuyoConst.Field.X_SIZE; x++) {
				const puyo = FieldCanvas.createPuyoShape(new Coordinate(x, y));
				yarray.push(puyo);
				this._container.addChild(puyo);
			}
			this._array.push(yarray);
		}

		// guide
		this._guideAxis = new PuyoShape(new Coordinate(0, 0), PuyoConst.Color.N, FieldCanvas.PUYO_SIZE / 2);
		this._guideChild = new PuyoShape(new Coordinate(0, 0), PuyoConst.Color.N, FieldCanvas.PUYO_SIZE / 2);
		this._container.addChild(this._guideAxis, this._guideChild);
	}

	// method
	/**
	 * 色を変更する。
	 * @param {Coordinate} coord 論理座標 
	 * @param {string} color 色 
	 */
	public changeColor(coord: Coordinate, color: string): void {
		this._array[coord.y][coord.x].changeColor(color);
	}

	/**
	 * ぷよを落とす。
	 * @param {{from: Coordinate, to: Coordinate}} dropCoordList 落とす座標（元と先）のリスト
	 */
	public drop(dropCoordList: {from: Coordinate, to: Coordinate}[]): void {
		const mode = TimelineQueue.instance.mode;
		const timeline = new Timeline({paused: true});

		for (const dropCoord of dropCoordList) {
			const from = dropCoord.from;
			const to = dropCoord.to;

			const dropPuyo = this.getPuyo(from);
			const removePuyo = this.getPuyo(to);
			const newPuyo = FieldCanvas.createPuyoShape(from);

			this.setPuyo(to, dropPuyo);
			this.setPuyo(from, newPuyo);

			const tween = Tween.get(dropPuyo)
				.to({y: FieldCanvas.getCanvasCoordinate(from).y})
				.to({y: FieldCanvas.getCanvasCoordinate(to).y}, FieldCanvas.DROP_V * (from.y - to.y) * mode)
				.call(() => {
					// remove
					this._container.removeChild(removePuyo);
					// add
					this._container.addChild(newPuyo);
				});
			timeline.addTween(tween);
		}

		TimelineQueue.instance.push(timeline);
	}

	/**
	 * ぷよを消す。
	 * @param {Coordinate[]} coordList 消す座標のリスト 
	 */
	public erase(coordList: Coordinate[]): void {
		const mode = TimelineQueue.instance.mode;
		const timeline = new Timeline({paused: true});

		for (const coord of coordList) {
			const erasePuyo = this.getPuyo(coord);

			let tween = Tween.get(erasePuyo);

			if (mode == 1) {
				tween = tween.to({alpha: 0}, FieldCanvas.ERASE_TIME)
					.call(() => { erasePuyo.changeColor(PuyoConst.Color.N); });
			} else {
				tween = tween.wait(FieldCanvas.STEP_ERASE_TIME)
					.call(() => { erasePuyo.changeEraseGraphic(); })
					.wait(FieldCanvas.STEP_ERASE_TIME)
					.call(() => { erasePuyo.changeColor(PuyoConst.Color.N); });
			}
			timeline.addTween(tween);
		}

		TimelineQueue.instance.push(timeline);
	}

	/**
	 * ツモをフィールドに落とす。
	 * @param {TsumoInterface} axis 軸ぷよ
	 * @param {TsumoInterface} child 子ぷよ
	 * @param {Coordinate} toAxisCoord 軸ぷよが落ちる先の座標
	 * @param {Coordinate} toChildCoord 子ぷよが落ちる先の座標
	 */
	public dropTsumo(axis: TsumoInterface, child: TsumoInterface, toAxisCoord: Coordinate, toChildCoord: Coordinate): void {
		const mode = TimelineQueue.instance.mode;
		const timeline = new Timeline({paused: true});

		const baseY = 14.5;
		const fromAxisCoord = new Coordinate(axis.coord.x, axis.coord.y + baseY);
		const fromChildCoord = new Coordinate(child.coord.x, child.coord.y + baseY);

		if (toAxisCoord.y < PuyoConst.Field.Y_SIZE) {
			const removePuyo = this.getPuyo(toAxisCoord);
			const newPuyo = FieldCanvas.createPuyoShape(fromAxisCoord, axis.color);
			this._container.addChild(newPuyo);
			this.setPuyo(toAxisCoord, newPuyo);

			const axisTween = Tween.get(newPuyo)
				.to({y: FieldCanvas.getCanvasCoordinate(fromAxisCoord).y})
				.to({y: FieldCanvas.getCanvasCoordinate(toAxisCoord).y}, FieldCanvas.DROP_V * (fromAxisCoord.y - toAxisCoord.y) * mode)
				.call(() => { this._container.removeChild(removePuyo); });
			
			timeline.addTween(axisTween);
		}

		if (toChildCoord.y < PuyoConst.Field.Y_SIZE) {
			const removePuyo = this.getPuyo(toChildCoord);
			const newPuyo = FieldCanvas.createPuyoShape(fromChildCoord, child.color);
			this._container.addChild(newPuyo);
			this.setPuyo(toChildCoord, newPuyo);

			const childTween = Tween.get(newPuyo)
				.to({y: FieldCanvas.getCanvasCoordinate(fromChildCoord).y})
				.to({y: FieldCanvas.getCanvasCoordinate(toChildCoord).y}, FieldCanvas.DROP_V * (fromChildCoord.y - toChildCoord.y) * mode)
				.call(() => { this._container.removeChild(removePuyo); });
			
			timeline.addTween(childTween);
		}

		TimelineQueue.instance.push(timeline);
	}

	/**
	 * スコアの表示を更新する。
	 * @param {number} score スコア 
	 */
	public updateScore(score: number): void {
		const s = FieldCanvas.formatScore(score);
		this.updateScoreString(s);
	}

	/**
	 * スコアに計算式を表示する。
	 * @param {number} erase 消去数 
	 * @param {number} bonus ボーナス 
	 */
	public updateScoreFormula(erase: number, bonus: number): void {
		const s = (erase * 10) + " × " + bonus;
		this.updateScoreString(s);
	}

	/**
	 * ツモを落とすガイドを表示する。
	 * @param {TsumoInterface} axis 
	 * @param {TsumoInterface} child 
	 * @param {Coordinate} toAxisCoord 軸ぷよが落ちる先の座標
	 * @param {Coordinate} toChildCoord 子ぷよが落ちる先の座標
	 */
	public setGuide(axis: TsumoInterface, child: TsumoInterface, toAxisCoord: Coordinate, toChildCoord: Coordinate): void {
		if (toAxisCoord.y < PuyoConst.Field.Y_SIZE) {
			this._guideAxis.changeColorAndCoord(axis.color, FieldCanvas.getCanvasCoordinate(toAxisCoord).add(FieldCanvas.PUYO_SIZE / 4));
			this._guideAxis.alpha = this._guideAxis.alpha * 0.5;
		}
		if (toChildCoord.y < PuyoConst.Field.Y_SIZE) {
			this._guideChild.changeColorAndCoord(child.color, FieldCanvas.getCanvasCoordinate(toChildCoord).add(FieldCanvas.PUYO_SIZE / 4));
			this._guideChild.alpha = this._guideChild.alpha * 0.5;
		}
	}

	/**
	 * ツモを落とすガイドを非表示にする。
	 */
	public removeGuide(): void {
		this._guideAxis.changeColor(PuyoConst.Color.N);
		this._guideChild.changeColor(PuyoConst.Color.N);
	}

	/**
	 * 設置時の一時停止処理。
	 * ステップ実行の場合のみ一時停止する。アニメーション実行の場合は一時停止しない。
	 */
	public landingPause(): void {
		const mode = TimelineQueue.instance.mode;
		const timeline = new Timeline({paused: true});
		const tween = Tween.get(new Shape()).wait(FieldCanvas.STEP_ERASE_TIME * (1 - mode));
		timeline.addTween(tween);
		TimelineQueue.instance.push(timeline);
	}

	/**
	 * スコアに表示する文字列を更新する。
	 * @param {string} s 表示する文字列
	 */
	private updateScoreString(s: string): void {
		const timeline = new Timeline({paused: true});
		const scoreTween = Tween.get(this._score)
			.call(() => { this._score.text = s; });
		const scoreOutlineTween = Tween.get(this._scoreOutline)
			.call(() => { this._scoreOutline.text = s; });
		timeline.addTween(scoreTween, scoreOutlineTween);
		TimelineQueue.instance.push(timeline);
	}

	/**
	 * フレームを生成する。
	 * @returns {Container} フレームのContainer
	 */
	private createFrameContainer(): Container {
		const oFrameColor = "#E0E0E0";
		const iFrameColor = this._is2P ? UIConst.TWO_P_COLOR : UIConst.ONE_P_COLOR;
		const skew = FieldCanvas.F_SKEW_DEG * (this._is2P ? 1 : -1);

		// 傾けた分の計算
		const sin = MathUtil.sinDeg(FieldCanvas.F_SKEW_DEG);
		const cos = MathUtil.cosDeg(FieldCanvas.F_SKEW_DEG);
		const y = this._is2P ? 0 : FieldCanvas.F_BASE_X * sin;
		
		// 角丸のサイズ
		const oRad = FieldCanvas.PUYO_SIZE / 3;
		const iRad = oRad / 5 * 4;

		// frame
		const oFrame = new Shape();
		oFrame.graphics
			.f(oFrameColor)
			.rr(0.5, 0.5, FieldCanvas.F_BASE_X / cos, FieldCanvas.F_BASE_Y + FieldCanvas.F_BASE_X * sin, oRad);
		oFrame.skewY = skew;

		const iFrame = new Shape();
		iFrame.graphics
			.f(iFrameColor)
			.rr(FieldCanvas.F_O_PAD + 0.5, FieldCanvas.F_O_PAD + 0.5, (FieldCanvas.F_BASE_X - FieldCanvas.F_O_PAD * 2) / cos, (FieldCanvas.F_BASE_Y - FieldCanvas.F_O_PAD * 2) + (FieldCanvas.F_BASE_X - FieldCanvas.F_O_PAD * 2) * sin, iRad);
		iFrame.skewY = skew;

		const container = new Container();
		container.addChild(oFrame, iFrame);
		container.y = y;

		return container;
	}

	/**
	 * 致死座標×印のShapeを作成する。
	 * @returns {Shape} ×印のcreatejs.Shape
	 */
	private createCrossShape(): Shape {
		const cross = new Shape();
		// TODO ループとかで上手くかけそうなら変更したい、思いつかないのでゴリ押し
		const thickness = FieldCanvas.PUYO_SIZE / 20;
		const uni = (FieldCanvas.PUYO_SIZE - thickness * 2) / 4;
		cross.graphics
			.s("#872819")
			.ss(thickness)
			.f("#EC4141")
			.mt(uni * 0, uni * 1)
			.lt(uni * 1, uni * 0)
			.lt(uni * 2, uni * 1)
			.lt(uni * 3, uni * 0)			
			.lt(uni * 4, uni * 1)
			.lt(uni * 3, uni * 2)
			.lt(uni * 4, uni * 3)
			.lt(uni * 3, uni * 4)
			.lt(uni * 2, uni * 3)
			.lt(uni * 1, uni * 4)
			.lt(uni * 0, uni * 3)
			.lt(uni * 1, uni * 2)
			.lt(uni * 0, uni * 1);
		const canvasCoord = FieldCanvas.getCanvasCoordinate(PuyoConst.Field.DEAD_COORD).add(thickness + 0.5);
		cross.x = canvasCoord.x;
		cross.y = canvasCoord.y;
		return cross;
	}

	/**
	 * ぷよをセットする。
	 * @param {Coordinate} coord 論理座標 
	 * @param {PuyoShape} puyo PuyoShape
	 */
	private setPuyo(coord: Coordinate, puyo: PuyoShape): void {
		this._array[coord.y][coord.x] = puyo;
	}

	/**
	 * ぷよを取得する。
	 * @param {Coordinate} coord 論理座標 
	 * @returns {PuyoShape} PuyoShape
	 */
	private getPuyo(coord: Coordinate): PuyoShape {
		return this._array[coord.y][coord.x];
	}

	// static method
	/**
	 * 論理座標のy方向と表示座標のy方向が異なるため、yの値を変換する。
	 * @param {number} y 論理座標のy（下方向が0）
	 * @returns {number} 変換後のy（上方向が0）
	 */
	 private static convertY(y: number): number {
		return PuyoConst.Field.Y_SIZE - 1 - y;
	}

	/**
	 * 論理座標から表示座標を取得する。
	 * @param {Coordinate} coord 論理座標 
	 * @returns {Coordinate} 表示座標
	 */
	private static getCanvasCoordinate(coord: Coordinate): Coordinate {
		return coord.clone()
			.calculateY(FieldCanvas.convertY)
			.times(FieldCanvas.PUYO_SIZE);
	}

	/**
	 * PuyoShapeを生成する。
	 * @param {Coordinate} coord 論理座標 
	 * @param {string} [color] 色 
	 * @returns {PuyoShape} PuyoShape 
	 */
	private static createPuyoShape(coord: Coordinate, color: string = PuyoConst.Color.N): PuyoShape {
		return new PuyoShape(FieldCanvas.getCanvasCoordinate(coord), color, FieldCanvas.PUYO_SIZE);
	}

	/**
	 * GridCellShapeを生成する。
	 * @param {Coordinate} coord 論理座標 
	 * @returns {GridCellShape} GridCellShape 
	 */
	private static createGridCellShape(coord: Coordinate): GridCellShape {
		return new GridCellShape(FieldCanvas.getCanvasCoordinate(coord), FieldCanvas.PUYO_SIZE);
	}

	/**
	 * scoreを指定フォーマットの文字列に変換する。
	 * @param {number} score スコア
	 * @returns {string} 0埋め9桁の文字列
	 */
	private static formatScore(score: number): string {
		return (score + "").padStart(9, "0");
	}
}