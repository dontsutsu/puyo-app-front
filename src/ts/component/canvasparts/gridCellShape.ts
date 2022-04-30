import { Shape } from "@createjs/easeljs";
import { Coordinate } from "../../math/coordinate";

export class GridCellShape extends Shape {
	// constant
	private static readonly DEFAULT_BG_COLOR = "#FFFFFF";
	private static readonly DEFAULT_BORDER_COLOR = "#F0F0F0";

	// properties
	private _cellsize: number;
	private _bgColor: string;
	private _borderColor: string;

	/**
	 * constructor
	 * @param {Coordinate} canvasCoord 表示座標
	 * @param {number} cellsize セルのサイズ
	 * @param {string} [bgColor] 背景色
	 * @param {string} [borderColor] 枠の色
	 */
	constructor(canvasCoord: Coordinate, cellsize: number, bgColor: string = GridCellShape.DEFAULT_BG_COLOR, borderColor: string = GridCellShape.DEFAULT_BORDER_COLOR) {
		super();

		this.x = canvasCoord.x;
		this.y = canvasCoord.y;
		this._cellsize = cellsize;
		this._bgColor = bgColor;
		this._borderColor = borderColor;

		this.setGraphics();
	}

	// method
	/**
	 * 背景色を変更する。
	 * @param {string} bgColor 背景色
	 */
	public changeBgColor(bgColor: string): void {
		this._bgColor = bgColor;
		this.graphics.c();
		this.setGraphics();
	}

	/**
	 * 描画する。
	 */
	private setGraphics(): void {
		this.graphics
			.s(this._borderColor)
			.f(this._bgColor)
			.ss(1)
			.dr(0.5, 0.5, this._cellsize, this._cellsize);
	}
}