import { PuyoConst } from "../../../../util/const";

/**
 * 連結数クラス
 */
export class Connect {
	// properties
	private _size: number;

	/**
	 * constructor
	 */
	constructor() {
		this._size = 1;
	}

	// method
	/**
	 * 連結数を1増やす。
	 */
	public increment(): void {
		this._size += 1;
	}

	/**
	 * 消去可能な連結数であるか。
	 * @returns {boolean} true：消去可能、false：消去不可
	 */
	public isErasable(): boolean {
		return this._size >= PuyoConst.ERASE_CONNECT;
	}

	// accessor
	get size(): number {
		return this._size;
	}
}