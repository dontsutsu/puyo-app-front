import { MathUtil } from "./mathUtil";
import { Matrix } from "./matrix";

/**
 * 正方行列クラス
 */
export class SquareMatrix extends Matrix {
	// properties
	private _size: number;

	/**
	 * constructor
	 * @param {number[][]} mat 2次元配列
	 */
	constructor(mat: number[][]) {
		super(mat);
		if (this.rowSize != this.columnSize) throw new Error();
		this._size = this.rowSize;
	}

	/**
	 * 逆行列を取得する。
	 * @returns {SquareMatrix} 逆行列
	 */
	public inverse(): SquareMatrix {
		const wk = Matrix.concatH(this.clone(), SquareMatrix.identityMatrix(this.size));

		for (let i = 0; i < this.rowSize; i++) {
			// 1. ピボット操作
			wk.pivoting(i);

			// 2. 対角成分を1にするために割る
			const div = wk.getValue(i, i);
			wk.multiplyRow(i, 1/div);

			// 3. 他行の同列成分を0にする
			for (let i2 = 0; i2 < this.rowSize; i2++) {
				if (i2 == i) continue;

				const mul = wk.getValue(i2, i) * (-1);
				if (mul == 0) continue;

				wk.addMultipliedOtherRow(i2, i, mul);
			}
		}

		const invArr = MathUtil.createZero2DArray(this.size, this.size);
		for (let i = 0; i < this.size; i++) for (let j = 0; j < this.size; j++) invArr[i][j] = wk.getValue(i, this.size+j);

		return new SquareMatrix(invArr);
	}

	/**
	 * オブジェクトのコピーを取得する。
	 * @returns {SquareMatrix} コピー
	 */
	public clone(): SquareMatrix {
		return new SquareMatrix(this.getArray());
	}

	/**
	 * 単位行列を取得する。
	 * @param {number} size サイズ 
	 * @returns 単位行列
	 */
	public static identityMatrix(size: number): SquareMatrix {
		const iMat = MathUtil.createZero2DArray(size, size);
		for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) iMat[i][j] = (i==j) ? 1 : 0;
		return new SquareMatrix(iMat);
	}

	// accessor
	get size(): number {
		return this._size;
	}
}