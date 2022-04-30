import { PuyoConst } from "../../../../util/const";
import { Connect } from "./connect";

export class FieldPuyo {
	// properties
	private _color: string;
	private _connect: Connect | null;

	/**
	 * constructor
	 * @param {string} [color] 色
	 */
	constructor(color: string = PuyoConst.Color.N) {
		this._color = color;
		this._connect = null;
	}

	// accessor
	get color(): string {
		return this._color;
	}

	set color(color: string) {
		this._color = color;
	}

	get connect(): Connect | null {
		return this._connect;
	}

	set connect(connect: Connect | null) {
		this._connect = connect;
	}
}