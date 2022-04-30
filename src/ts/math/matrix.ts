import { MathUtil } from "./mathUtil";

/**
 * 行列クラス
 */
export class Matrix {
	// properties
	private _mat: number[][];
	private _rowSize: number;
	private _columnSize: number;

	/**
	 * constructor
	 * @param {number[][]} mat 2次元配列
	 */
	constructor(mat: number[][]) {
		this._rowSize = mat.length;
		this._columnSize = mat[0].length;
		this._mat = mat;
	}

	public getArray(): number[][] {
		const arr = MathUtil.createZero2DArray(this.rowSize, this.columnSize);
		for (let i = 0; i < this.rowSize; i++) for (let j = 0; j < this.columnSize; j++) arr[i][j] = this._mat[i][j];
		return arr;
	}

	/**
	 * 同じサイズか。
	 * @param {Matrix} matrix 比較する行列
	 * @returns 同じサイズか
	 */
	public isSameSize(matrix: Matrix): boolean {
		return this.rowSize == matrix.rowSize && this.columnSize == matrix.columnSize;
	}

	/**
	 * オブジェクトのコピーを取得する。
	 * @returns {Matrix} コピー
	 */
	public clone(): Matrix {
		return new Matrix(this.getArray());
	}

	/**
	 * ピボット操作。
	 * @param {number} rowIndex 対象行
	 */
	public pivoting(rowIndex: number): Matrix {
		const columnIndex = rowIndex;
		
		// 対象行より下の行の中で、絶対値が最大の行と入れ替える
		let max = Math.abs(this._mat[rowIndex][columnIndex]);
		let maxRowIndex = rowIndex;
		for (let i = rowIndex + 1; i < this.rowSize; i++) {
			const tmp = Math.abs(this._mat[i][columnIndex]);
			if (tmp > max) {
				max = tmp;
				maxRowIndex = i;
			}
		}
		if (rowIndex != maxRowIndex) this.swapRow(rowIndex, maxRowIndex);
		return this;
	}

	/**
	 * 行列の基本変形(1)
	 * 1つの行をスカラー倍（≠0）する。
	 * @param {number} rowIndex スカラー倍する行
	 * @param {number} scalar スカラー 
	 */
	public multiplyRow(rowIndex: number, scalar: number): Matrix {
		if (scalar == 0) throw new Error();
		for (let j = 0; j < this.columnSize; j++) this._mat[rowIndex][j] *= scalar;
		return this;
	}

	/**
	 * 行列の基本変形(2)
	 * @param {number} rowIndex1 入れ替える行
	 * @param {number} rowIndex2 入れ替える行
	 */
	public swapRow(rowIndex1: number, rowIndex2: number): Matrix {
		const swap = this._mat[rowIndex1];
		this._mat[rowIndex1] = this._mat[rowIndex2];
		this._mat[rowIndex2] = swap;
		return this;
	}

	/**
	 * 行列の基本変形(3)
	 * 1つの行に他の行のスカラー倍を加える。
	 * @param {number} augendRowIndex 足される行
	 * @param {number} addendRowIndex 足す行
	 * @param {number} scalar スカラー（足す行に掛ける数）
	 */
	public addMultipliedOtherRow(augendRowIndex: number, addendRowIndex: number, scalar: number): Matrix {
		for (let j = 0; j < this.columnSize; j++) this._mat[augendRowIndex][j] += this._mat[addendRowIndex][j] * scalar;
		return this;
	}

	/**
	 * 転置行列を取得する。
	 * @returns {Matrix} 転置行列
	 */
	public transpose(): Matrix {
		const tMat = MathUtil.createZero2DArray(this.columnSize, this.rowSize);
		for (let i = 0; i < this.rowSize; i++) for (let j = 0; j < this.columnSize; j++) tMat[j][i] = this._mat[i][j];
		return new Matrix(tMat);
	}

	/**
	 * 値を取得する。
	 * @param {number} rowIndex 行
	 * @param {number} columnIndex 列 
	 * @returns {number} 値
	 */
	public getValue(rowIndex: number, columnIndex: number): number {
		return this._mat[rowIndex][columnIndex];
	}

	/**
	 * 値を設定する。
	 * @param {number} rowIndex 行
	 * @param {number} columnIndex 列
	 * @param {number} value 値
	 */
	public setValue(rowIndex: number, columnIndex: number, value: number): void {
		this._mat[rowIndex][columnIndex] = value;
	}

	/**
	 * 文字列化。
	 */
	public toString(): string {
		let s = "";
		for (let i = 0; i < this.rowSize; i++) {
			s += "[ ";
			for (let j = 0; j < this.columnSize; j++) {
				s += this._mat[i][j].toFixed(5);
				s += ", ";
			}
			s += "]";
			s += "\r\n";
		}
		return s;
	}

	/**
	 * 行列の掛け算。
	 * @param {Matrix} matrix1 掛けられる行列
	 * @param {Matrix} matrix2 掛ける行列
	 * @returns {Matrix} 計算結果
	 */
	public static matmul(matrix1: Matrix, matrix2: Matrix): Matrix {
		const tMatrix2 = matrix2.transpose();
		if (matrix1.columnSize != tMatrix2.columnSize) throw new Error();
		const result = MathUtil.createZero2DArray(matrix1.rowSize, tMatrix2.rowSize);
		for (let i = 0; i < matrix1.rowSize; i++) {
			for (let j = 0; j < tMatrix2.rowSize; j++) {
				result[i][j] = 0;
				for (let k = 0; k < matrix1.columnSize; k++) result[i][j] += matrix1.getValue(i, k) * tMatrix2.getValue(j, k);
			}
		}
		return new Matrix(result);
	}

	/**
	 * 行列を横方向に連結する。
	 * @param {Matrix} matrix1 左側の行列
	 * @param {Matrix} matrix2 右側の行列
	 * @returns {Matrix} 連結後の行列
	 */
	public static concatH(matrix1: Matrix, matrix2: Matrix): Matrix {
		if (matrix1.rowSize != matrix2.rowSize) throw new Error();
		const concatRowSize = matrix1.rowSize;
		const concatColumnSize = matrix1.columnSize + matrix2.columnSize;
		const result = MathUtil.createZero2DArray(concatRowSize, concatColumnSize);
		for (let i = 0; i < concatRowSize; i++) {
			for (let j = 0; j < concatColumnSize; j++) {
				result[i][j] = (j < matrix1.columnSize) ? matrix1.getValue(i, j) : matrix2.getValue(i, j-matrix1.columnSize);
			}
		}
		return new Matrix(result);
	}

	// accessor
	get rowSize(): number {
		return this._rowSize;
	}

	get columnSize(): number {
		return this._columnSize;
	}
}