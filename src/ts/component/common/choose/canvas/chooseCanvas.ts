import { PuyoConst } from "../../../../util/const";
import { Coordinate } from "../../../../math/coordinate";
import { GridCellShape } from "../../../canvasparts/gridCellShape";
import { PuyoShape } from "../../../canvasparts/puyoShape";

import $ from "jquery";
import { EventDispatcher, Shape, Stage, Text } from "@createjs/easeljs";

/**
 * ぷよ選択 (view)
 */
export class ChooseCanvas extends EventDispatcher {
	// constant
	private static readonly ORDER = [
		PuyoConst.Color.G
		, PuyoConst.Color.R
		, PuyoConst.Color.B
		, PuyoConst.Color.Y
		, PuyoConst.Color.P
		, PuyoConst.Color.J
		, PuyoConst.Color.N
	];
	private static readonly X_SIZE = 5;
	private static readonly Y_SIZE = 2;
	private static readonly PUYO_SIZE = 30;
	private static readonly CELL_ENABLED_COLOR = "#FFFFFF";
	private static readonly CELL_DISABLED_COLOR = "#666666";
	private static readonly KESU_PADDING = 2;
	private static readonly KESU_FONT = "bold " + Math.floor(ChooseCanvas.PUYO_SIZE / 2 - 1)  + "px BIZ UDPGothic";
	private static readonly KESU_COLOR = "#4242FF";
	private static readonly CHOISE_COLOR = "#FF0000";

	// properties
	private _stage: Stage;
	private _choise: Shape;

	/**
	 * constructor
	 */
	constructor() {
		super();

		// canvas init
		const canvasId = "choose";
		this._stage = new Stage(canvasId);
		const endCoord = ChooseCanvas.getCanvasCoordinate(new Coordinate(ChooseCanvas.X_SIZE, ChooseCanvas.Y_SIZE));
		const w = endCoord.x;
		const h = endCoord.y;
		$("#" + canvasId).attr("width", 1 + Math.ceil(w));
		$("#" + canvasId).attr("height", 1 + Math.ceil(h));

		// grid
		for (let y = 0; y < ChooseCanvas.Y_SIZE; y++) {
			for (let x = 0; x < ChooseCanvas.X_SIZE; x++) {
				const coord = new Coordinate(x, y);
				const index = ChooseCanvas.getIndex(coord);

				const canvasCoord = ChooseCanvas.getCanvasCoordinate(coord);
				const bgColor = index < ChooseCanvas.ORDER.length ? ChooseCanvas.CELL_ENABLED_COLOR : ChooseCanvas.CELL_DISABLED_COLOR;
				const cell = new GridCellShape(canvasCoord, ChooseCanvas.PUYO_SIZE, bgColor);
				this._stage.addChild(cell);

				if (index < ChooseCanvas.ORDER.length) {
					cell.addEventListener("mousedown", () => {
						const e = new CustomEvent<string>("mousedown", {
							detail: ChooseCanvas.ORDER[index]
						});
						this.dispatchEvent(e);
					});
				}
			}
		}

		// puyo
		for (let y = 0; y < ChooseCanvas.Y_SIZE; y++) {
			for (let x = 0; x < ChooseCanvas.X_SIZE; x++) {
				const coord = new Coordinate(x, y);
				const index = ChooseCanvas.getIndex(coord);

				if (index < ChooseCanvas.ORDER.length) {
					const canvasCoord = ChooseCanvas.getCanvasCoordinate(coord);
					const color = ChooseCanvas.ORDER[index];

					const puyo = new PuyoShape(canvasCoord, color, ChooseCanvas.PUYO_SIZE);
					this._stage.addChild(puyo);

					// 「けす」の文字
					if (color == PuyoConst.Color.N) {
						const keCoord = canvasCoord.clone();
						const suCoord = ChooseCanvas.getCanvasCoordinate(coord.add(1));

						const keShape = new Text("け", ChooseCanvas.KESU_FONT, ChooseCanvas.KESU_COLOR);
						keShape.x = keCoord.x + ChooseCanvas.KESU_PADDING;
						keShape.y = keCoord.y + ChooseCanvas.KESU_PADDING;
						keShape.textAlign = "start";
						keShape.textBaseline = "top";

						const suShape = new Text("す", ChooseCanvas.KESU_FONT, ChooseCanvas.KESU_COLOR);
						suShape.x = suCoord.x - ChooseCanvas.KESU_PADDING;
						suShape.y = suCoord.y - ChooseCanvas.KESU_PADDING;
						suShape.textAlign = "end";
						suShape.textBaseline = "bottom";

						this._stage.addChild(keShape, suShape);
					}
				}
			}
		}

		// choise
		this._choise = new Shape();
		this._stage.addChild(this._choise);

		this._stage.update();
	}

	// method
	/**
	 * 選択中の枠を移動する。
	 * @param {string} color 色
	 */
	public changeChoiseColor(color: string): void {
		const index = ChooseCanvas.ORDER.indexOf(color);
		if (index < 0) throw Error("illegal argument");

		const coord = ChooseCanvas.getCoordinate(index);
		const canvasCoord = ChooseCanvas.getCanvasCoordinate(coord);

		// 描画
		const w = 2;
		const w2 = w / 2;
		this._choise.graphics
			.c()
			.s(ChooseCanvas.CHOISE_COLOR)
			.ss(w)
			.dr(canvasCoord.x + w2 + 0.5, canvasCoord.y + w2 + 0.5, ChooseCanvas.PUYO_SIZE - w, ChooseCanvas.PUYO_SIZE - w);
		
		this._stage.update();
	}

	// static method
	/**
	 * 論理座標から表示座標を取得する。
	 * @param {Coordinate} coord 論理座標
	 * @returns {Coordinate} 表示座標
	 */
	 public static getCanvasCoordinate(coord: Coordinate): Coordinate {
		return coord.clone().times(ChooseCanvas.PUYO_SIZE);
	}

	/**
	 * 論理座標からindexを取得する。
	 * @param {Coordinate} coord 論理座標
	 * @returns {number} index
	 */
	public static getIndex(coord: Coordinate): number {
		return coord.x + ChooseCanvas.X_SIZE * coord.y;
	}

	/**
	 * indexから論理座標を取得する。
	 * @param {number} index index 
	 * @returns {Coordinate} 論理座標
	 */
	public static getCoordinate(index: number): Coordinate {
		return new Coordinate(index % ChooseCanvas.X_SIZE, index / ChooseCanvas.X_SIZE | 0);
	}
}