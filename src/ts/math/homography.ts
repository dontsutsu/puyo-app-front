import { Coordinate } from "./coordinate";
import { Matrix } from "./matrix";
import { SquareMatrix } from "./squareMatrix";

export class Homography {
	// properties
	private _param!: number[];

	/**
	 * constructor
	 * @param {Coordinate[]} src 変換前の4座標
	 * @param {Coordinate[]} dst 変換後の4座標
	 */
	constructor(src: Coordinate[], dst: Coordinate[]) {
		this.setParam(src, dst);
	}

	/**
	 * ホモグラフィ変換行列を設定する。
	 * @param {Coordinate[]} src 変換前の4座標
	 * @param {Coordinate[]} dst 変換後の4座標
	 */
	public setParam(src: Coordinate[], dst: Coordinate[]): void {
		if (src.length != 4) throw new Error();
		if (dst.length != 4) throw new Error();

		const mat = new SquareMatrix([
			[ src[0].x, src[0].y, 1,        0,        0, 0, -1*src[0].x*dst[0].x, -1*src[0].y*dst[0].x ],
			[        0,        0, 0, src[0].x, src[0].y, 1, -1*src[0].x*dst[0].y, -1*src[0].y*dst[0].y ],
			[ src[1].x, src[1].y, 1,        0,        0, 0, -1*src[1].x*dst[1].x, -1*src[1].y*dst[1].x ],
			[        0,        0, 0, src[1].x, src[1].y, 1, -1*src[1].x*dst[1].y, -1*src[1].y*dst[1].y ],
			[ src[2].x, src[2].y, 1,        0,        0, 0, -1*src[2].x*dst[2].x, -1*src[2].y*dst[2].x ],
			[        0,        0, 0, src[2].x, src[2].y, 1, -1*src[2].x*dst[2].y, -1*src[2].y*dst[2].y ],
			[ src[3].x, src[3].y, 1,        0,        0, 0, -1*src[3].x*dst[3].x, -1*src[3].y*dst[3].x ],
			[        0,        0, 0, src[3].x, src[3].y, 1, -1*src[3].x*dst[3].y, -1*src[3].y*dst[3].y ],
		]);

		const dstArray = new Matrix([
			[dst[0].x, dst[0].y, dst[1].x, dst[1].y, dst[2].x, dst[2].y, dst[3].x, dst[3].y],
		]);

		// ( a, b, c, d, e, f, g, h )
		const result = Matrix.matmul(mat.inverse(), dstArray.transpose());

		this._param = result.transpose().getArray()[0];
	}

	/**
	 * 座標を変換する。
	 * @param {Coordinate} src 変換元座標
	 * @returns {Coordinate} 変換先座標
	 */
	public convert(src: Coordinate): Coordinate {
		let s = this._param[6]*src.x + this._param[7]*src.y + 1;
		if (s == 0) s = 0.000001;

		const x = (this._param[0]*src.x + this._param[1]*src.y + this._param[2]) / s;
		const y = (this._param[3]*src.x + this._param[4]*src.y + this._param[5]) / s;

		return new Coordinate(x, y);
	}
}