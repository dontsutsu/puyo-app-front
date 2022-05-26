import { PuyoConst } from "../../../../util/const";
import { Coordinate } from "../../../../math/coordinate";
import { TsumoCanvas } from "../canvas/tsumoCanvas";
import { EnumPosition } from "./enumPosition";
import { TsumoPuyoInterface } from "./tsumoPuyoInterface";
import { TsumoInterface } from "./tsumoInterface";

/**
 * Tsumo (Logic)
 */
export class TsumoLogic {
	// properties
	private _canvas: TsumoCanvas;
	private _axisColor!: string;		// set関数で初期化
	private _childColor!: string;		// set関数で初期化
	private _axisX!: number;			// set関数で初期化
	private _position!: EnumPosition;	// set関数で初期化

	/**
	 * constructor
	 */
	constructor(canvas: TsumoCanvas) {
		this._canvas = canvas;
	}

	/**
	 * ネクストのぷよをツモに設定する。
	 * @param {string} axisColor 軸ぷよの色
	 * @param {string} childColor 子ぷよの色
	 * @param {boolean} init 初期化時の処理かどうか
	 */
	public set(axisColor: string, childColor: string, init: boolean): void {
		this._axisColor = axisColor;
		this._childColor = childColor;
		this._axisX = PuyoConst.Tsumo.INI_X;
		this._position = PuyoConst.Tsumo.INI_POSITION;

		const tsumo: TsumoInterface = {
			axis: { color: this._axisColor, coord: this.axisCoord },
			child: { color: this._childColor, coord: this.childCoord }
		}

		this._canvas.set(tsumo, init);
	}

	/**
	 * ツモを変更する。
	 * @param {string} axisColor 軸ぷよの色
	 * @param {string} childColor 子ぷよの色
	 */
	public change(axisColor: string, childColor: string): void {
		this._axisColor = axisColor;
		this._childColor = childColor;
		this._axisX = PuyoConst.Tsumo.INI_X;
		this._position = PuyoConst.Tsumo.INI_POSITION;

		const tsumo: TsumoInterface =  {
			axis: { color: this._axisColor, coord: this.axisCoord },
			child: { color: this._childColor, coord: this.childCoord }
		};

		this._canvas.change(tsumo);
	}

	/**
	 * 移動する。
	 * @param {number} vec ベクトル（ex. 左に2：-2　右に3：3）
	 */
	public move(vec: number): void {
		// view用
		const fromAxisCoord = this.axisCoord;
		const fromChildCoord = this.childCoord;

		let to = this._axisX + vec;
		
		// 左端チェック
		const left = this._position == EnumPosition.LEFT ? 1 : 0;
		if (to < left) to = left;

		// 右端チェック
		const right = this._position == EnumPosition.RIGHT ? PuyoConst.Field.X_SIZE - 2 : PuyoConst.Field.X_SIZE - 1;
		if (to > right) to = right;

		this._axisX = to;

		// view更新
		this._canvas.move(fromAxisCoord, fromChildCoord, this.axisCoord, this.childCoord);
	}

	/**
	 * 回す。
	 * @param {boolean} clockwise true：時計回り、false：反時計回り
	 */
	public rotate(clockwise: boolean) {
		// view用
		const fromAxisCoord = this.axisCoord;
		const fromChildCoord = this.childCoord;

		this._position = this._position.getRotatedEnum(clockwise);
		if (this._axisX == PuyoConst.Field.X_SIZE - 1 && this._position == EnumPosition.RIGHT) this._axisX = PuyoConst.Field.X_SIZE - 2;
		if (this._axisX == 0 && this._position == EnumPosition.LEFT) this._axisX = 1;

		// view更新
		this._canvas.rotate(fromAxisCoord, fromChildCoord, this.axisCoord, this.childCoord);
	}

	/**
	 * ツモの状態を取得する。
	 * @returns {TsumoInterface} ツモ
	 */
	public getTsumo(): TsumoInterface {
		return { axis: this.axis, child: this.child };
	}

	/**
	 * ツモをフィールドに落とす。
	 * フィールドに渡す用のツモの情報を返す。
	 * @returns {TsumoInterface} ツモ
	 */
	public drop(): TsumoInterface {
		// view更新
		this._canvas.drop(this.axisCoord, this.childCoord);

		return { axis: this.axis, child: this.child };
	}

	// accessor
	get axisColor(): string {
		return this._axisColor;
	}

	get childColor(): string {
		return this._childColor;
	}

	get axisCoord(): Coordinate {
		return new Coordinate(this._axisX, 1);
	}

	get childCoord(): Coordinate {
		return this.axisCoord.addCoord(this._position.childRelativeCoord);
	}

	get axis(): TsumoPuyoInterface {
		return { color: this.axisColor, coord: this.axisCoord };
	}

	get child(): TsumoPuyoInterface {
		return { color: this.childColor, coord: this.childCoord };
	}
}