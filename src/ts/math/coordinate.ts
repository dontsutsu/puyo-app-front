/**
 * xy座標クラス
 */
export class Coordinate {
	// properties
	private _x: number;
	private _y: number;
	
	/**
	 * constructor
	 * @param {number} x x座標 
	 * @param {number} y y座標
	 */
	constructor(x: number, y: number) {
		this._x = x;
		this._y = y;
	}

	/**
	 * 座標を設定する。
	 * @param {number} x x座標
	 * @param {number} y y座標
	 */
	public set(x :number, y: number): void {
		this._x = x;
		this._y = y;
	}

	// method
	/**
	 * オブジェクトのコピーを生成
	 * @returns {Coordinate} オブジェクトのコピー
	 */
	public clone(): Coordinate {
		return new Coordinate(this._x, this._y);
	}
	
	/**
	 * 座標を定数倍する
	 * @param {number} n 定数倍の値
	 * @returns {Coordinate} 計算後の座標
	 */
	public times(n: number): Coordinate {
		this._x = this._x * n;
		this._y = this._y * n;
		return this;
	}

	/**
	 * x座標に足す
	 * @param {number} n 足す値
	 * @returns {Coordinate} 計算後の座標
	 */
	public addX(n: number): Coordinate {
		this._x += n;
		return this;
	}

	/**
	 * y座標に足す
	 * @param {number} n 足す値
	 * @returns {Coordinate} 計算後の座標
	 */
	public addY(n: number): Coordinate {
		this._y += n;
		return this;
	}

	/**
	 * x座標、y座標に足す
	 * @param {number} n 足す値
	 * @returns {Coordinate} 計算後の座標
	 */
	public add(n: number): Coordinate {
		return this.addX(n).addY(n);
	}

	/**
	 * 座標を足す
	 * @param {Coordinate} coord 座標 
	 * @returns {Coordinate} 計算後の座標
	 */
	public addCoord(coord: Coordinate): Coordinate {
		return this.addX(coord.x).addY(coord.y);
	}

	/**
	 * x座標を任意の関数で計算する
	 * @param {(x: number) => number} calculateX xを計算する関数 
	 * @returns {Coordinate} 計算後の座標
	 */
	public calculateX(calculateX: (x: number) => number): Coordinate {
		this._x = calculateX(this._x);
		return this;
	}

	/**
	 * y座標を任意の関数で計算する
	 * @param {(y: number) => number} calculateY yを計算する関数
	 * @returns {Coordinate} 計算後の座標
	 */
	public calculateY(calculateY: (y: number) => number): Coordinate {
		this._y = calculateY(this._y);
		return this;
	}

	/**
	 * x座標、y座標を任意の関数で計算する
	 * @param {(x: number) => number} calculateX xを計算する関数
	 * @param {(y: number) => number} calculateY yを計算する関数
	 * @returns {Coordinate} 計算後の座標
	 */
	public calculate(calculateX: (x: number) => number, calculateY: (y: number) => number): Coordinate {
		return this.calculateX(calculateX).calculateY(calculateY);
	}

	// accessor
	get x(): number {
		return this._x;
	}

	set x(x: number) {
		this._x = x;
	}

	get y(): number {
		return this._y;
	}

	set y(y: number) {
		this._y = y;
	}
}