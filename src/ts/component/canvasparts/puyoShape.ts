import { Shape } from "@createjs/easeljs";
import { PuyoConst } from "../../util/const";
import { Coordinate } from "../../math/coordinate";

export class PuyoShape extends Shape {
	// constant
	private static readonly PUYO_DICT: PuyoShapeDictionary[] = [
		  { color: PuyoConst.Color.G , bgColor: "#68EE26", alpha: 1, borderColor: "#236F1A" }
		, { color: PuyoConst.Color.R , bgColor: "#F34A49", alpha: 1, borderColor: "#852D20" }
		, { color: PuyoConst.Color.B , bgColor: "#0C8EF9", alpha: 1, borderColor: "#254AB2" }
		, { color: PuyoConst.Color.Y , bgColor: "#FDBA2E", alpha: 1, borderColor: "#A44D0F" }
		, { color: PuyoConst.Color.P , bgColor: "#B458EB", alpha: 1, borderColor: "#692797" }
		, { color: PuyoConst.Color.J , bgColor: "#BBBBBB", alpha: 1, borderColor: "#69686E" }
		, { color: PuyoConst.Color.N , bgColor: "#FFFFFF", alpha: 0, borderColor: "#FFFFFF" }
	];
	private static readonly THICKNESS_RATIO = 0.1;

	// properties
	private _color: string;
	private _radius: number;
	private _thickness: number;

	/**
	 * constructor
	 * @param {Coordinate} canvasCoord 表示座標
	 * @param {string} color ぷよの色
	 * @param {number} diameter 直径
	 */
	constructor(canvasCoord: Coordinate, color: string, diameter: number) {
		super();

		this.x = canvasCoord.x;
		this.y = canvasCoord.y;
		this._color = color;
		this._radius = diameter / 2;
		this._thickness = this._radius * PuyoShape.THICKNESS_RATIO;
		
		this.setGraphics();
	}

	// method
	/**
	 * ぷよの色を変更する。
	 * @param {string} color ぷよの色
	 */
	public changeColor(color: string): void {
		this._color = color;
		this.graphics.c();
		this.setGraphics();
	}

	public changeCoord(canvasCoord: Coordinate): void {
		this.x = canvasCoord.x;
		this.y = canvasCoord.y;
	}

	public changeColorAndCoord(color: string, canvasCoord: Coordinate): void {
		this.changeColor(color);
		this.changeCoord(canvasCoord);
	}

	/**
	 * 消去時のグラフィックに変更する。
	 */
	public changeEraseGraphic(): void {
		const dict = PuyoShape.getDictionary(this._color);
		const r = this._radius;
		const t = this._thickness;

		this.graphics
			.c()
			.s(dict.bgColor)	// borderに本来のbgColor使用
			.ss(t)
			.f("#FFFFFF")
			.dc(r + 0.5, r + 0.5, r - t);
		this.alpha = 1;
	}

	/**
	 * グラフィックを設定する。
	 */
	private setGraphics(): void {
		const dict = PuyoShape.getDictionary(this._color);
		const r = this._radius;
		const t = this._thickness;

		this.graphics
			.s(dict.borderColor)
			.ss(t)
			.f(dict.bgColor)
			.dc(r + 0.5, r + 0.5, r - t);
		this.alpha = dict.alpha;
	}

	// static method
	/**
	 * 辞書（描画に必要な情報）を取得
	 * @param {string} color 色
	 * @returns {PuyoShapeDictionary} 辞書
	 */
	private static getDictionary(color: string): PuyoShapeDictionary {
		const dict = PuyoShape.PUYO_DICT.find(dict => dict.color == color);
		if (dict == undefined) throw Error("illegal argument");
		return dict;
	}
}

/**
 * 辞書
 */
interface PuyoShapeDictionary {
	color: string;
	bgColor: string;
	alpha: number;
	borderColor: string;
}