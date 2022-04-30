import { Coordinate } from "../../../../math/coordinate";
import { GridCellShape } from "../../../canvasparts/gridCellShape";
import { PuyoShape } from "../../../canvasparts/puyoShape";
import { PuyoConst } from "../../../../util/const";
import { NazoTsumo } from "../nazoTsumo";
import { NazoTsumoInterface } from "../nazoTsumoInterface";

import { EventDispatcher, Stage, Text } from "@createjs/easeljs";
import $ from "jquery";

export class NazoTsumoCanvas extends EventDispatcher {
	// constant
	private static readonly PUYO_SIZE = 25;
	private static readonly X_SIZE = 5;
	private static readonly X_PAD = NazoTsumoCanvas.PUYO_SIZE / 2;
	private static readonly Y_PAD = NazoTsumoCanvas.PUYO_SIZE / 2;
	private static readonly CELL_COLOR = "#FFFFFF";
	private static readonly CELL_MOUSEOVER_COLOR = "#00FFFF";

	// properties
	private _stage: Stage;
	private _array: PuyoShape[][];

	/**
	 * 
	 */
	constructor() {
		super();

		// canvas init
		const canvasId = "nazoTsumo";
		this._stage = new Stage(canvasId);
		this._stage.enableMouseOver();
		const ceilIndex = Math.ceil(NazoTsumo.LENGTH / NazoTsumoCanvas.X_SIZE) * NazoTsumoCanvas.X_SIZE;
		const endCoord = NazoTsumoCanvas.getCanvasCoordinate(ceilIndex - 1, NazoTsumo.AXIS);
		const w = endCoord.x + NazoTsumoCanvas.PUYO_SIZE;
		const h = endCoord.y + NazoTsumoCanvas.PUYO_SIZE;
		$("#" + canvasId).attr("width", 1 + Math.ceil(w));
		$("#" + canvasId).attr("height", 1 + Math.ceil(h));

		// number
		for (let i = 0; i < NazoTsumo.LENGTH; i++) {
			const indexShape = new Text(String(i + 1), "bold " + Math.floor(NazoTsumoCanvas.PUYO_SIZE / 2) + "px BIZ UDPGothic", "#888888");
			const canvasCoord = NazoTsumoCanvas.getCanvasCoordinate(i, NazoTsumo.CHILD);
			indexShape.x = canvasCoord.x + (NazoTsumoCanvas.PUYO_SIZE / 2);
			indexShape.y = canvasCoord.y - (NazoTsumoCanvas.PUYO_SIZE / 2);
			indexShape.textAlign = "center";
			this._stage.addChild(indexShape);
		}

		// grid
		for (let i = 0; i < NazoTsumo.LENGTH; i++) {
			for (const t of NazoTsumo.TYPES) {
				const cavasCoord = NazoTsumoCanvas.getCanvasCoordinate(i, t);
				const cell = new GridCellShape(cavasCoord, NazoTsumoCanvas.PUYO_SIZE, NazoTsumoCanvas.CELL_COLOR);
				this._stage.addChild(cell);
					
				// mouseover, mouseout
				cell.addEventListener("mouseover", () => {
					cell.changeBgColor(NazoTsumoCanvas.CELL_MOUSEOVER_COLOR);
					this._stage.update();
				});

				cell.addEventListener("mouseout", () => {
					cell.changeBgColor(NazoTsumoCanvas.CELL_COLOR);
					this._stage.update();
				});

				// mousedown
				cell.addEventListener("mousedown", () => {
					const e = new CustomEvent<NazoTsumoInterface>("mousedown", {
						detail: {index: i, type: t}
					});
					this.dispatchEvent(e);
				});
			}	
		}

		// puyo
		this._array = [];
		for (let i = 0; i < NazoTsumo.LENGTH; i++) {
			const indexArray: PuyoShape[] = [];
			for (const t of NazoTsumo.TYPES) {
				const canvasCoord = NazoTsumoCanvas.getCanvasCoordinate(i, t);
				const puyo = new PuyoShape(canvasCoord, PuyoConst.Color.N, NazoTsumoCanvas.PUYO_SIZE);
				this._stage.addChild(puyo);
				indexArray.push(puyo);
			}
			this._array.push(indexArray);
		}

		this._stage.update();
	}

	public changeColor(nazoTsumo: NazoTsumoInterface, color: string): void {
		this._array[nazoTsumo.index][nazoTsumo.type].changeColor(color);
		this._stage.update();
	}

	// static method
	/**
	 * ツモリストの座標・ツモのタイプからcanvas上の座標を取得する。
	 * @param {Coordinate} coord ツモリストの座標
	 * @param {number} type 0：子ぷよ、1：軸ぷよ
	 * @returns {Coordinate} canvas上の座標
	 */
	private static getCanvasCoordinate(index: number, type: number): Coordinate {
		const coord = NazoTsumoCanvas.getCoordinate(index);
		const canvasX = (NazoTsumoCanvas.PUYO_SIZE + NazoTsumoCanvas.X_PAD) * coord.x;
		const canvasY = NazoTsumoCanvas.PUYO_SIZE * type + NazoTsumoCanvas.PUYO_SIZE * 3 * coord.y + NazoTsumoCanvas.Y_PAD;
		return new Coordinate(canvasX, canvasY);
	}

	private static getCoordinate(index: number): Coordinate {
		return new Coordinate(index % NazoTsumoCanvas.X_SIZE, index / NazoTsumoCanvas.X_SIZE | 0);
	}
}