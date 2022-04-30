import { PuyoConst } from "../../../../util/const";
import { NextCanvas } from "../canvas/nextCanvas";
import { Util } from "../../../../util/util";

/**
 * Next (Logic)
 */
export class NextLogic {
	// properties
	private _canvas: NextCanvas;
	private _queue: string[];

	/**
	 * constructor
	 * @param {NextCanvas} canvas 
	 */
	constructor(canvas: NextCanvas) {
		this._canvas = canvas;
		this._queue = [];
	}

	/**
	 * 初期化する。
	 */
	public init(): void {
		this.initQueue();

		// view更新
		this._canvas.init(this._queue[0], this._queue[1], this._queue[2], this._queue[3]);
	}

	/**
	 * 次のツモの色を取得する。
	 * @returns {{axis: string, child: string}} 次のツモの色
	 */
	public getNextColor(): {axis: string, child: string} {
		const axis = this._queue.shift();
		const child = this._queue.shift();
		if (axis === undefined || child === undefined) throw Error();

		this._queue.push(axis);
		this._queue.push(child);

		// view更新
		this._canvas.advance(this._queue[2], this._queue[3]);

		return {axis: axis, child: child};
	}

	/**
	 * ツモをひとつ戻す。
	 */
	public back(): {axis: string, child: string} {
		const childNext = this._queue.pop();
		const childAxis = this._queue.pop();
		if (childAxis === undefined || childNext === undefined) throw Error();

		this._queue.unshift(childNext);
		this._queue.unshift(childAxis);

		// view更新
		// TODO 関数名initから変更したい
		this._canvas.init(this._queue[0], this._queue[1], this._queue[2], this._queue[3]);

		const axis = this._queue[this._queue.length - 2];
		const child = this._queue[this._queue.length - 1];

		return {axis: axis, child: child};
	}

	/**
	 * ツモを設定する。
	 * @param {{axis: string, child: string}[]} tsumos ツモの配列。
	 */
	public set(tsumos: {axis: string, child: string}[]): void {
		this._queue.length = 0;

		for (const tsumo of tsumos) {
			this._queue.push(tsumo.axis);
			this._queue.push(tsumo.child);
		}

		// view更新
		this._canvas.init(this._queue[0], this._queue[1], this._queue[2], this._queue[3]);
	}

	/**
	 * 4色128手をランダムで生成し、キューに設定する。
	 */
	private initQueue(): void {
		const colorList = [PuyoConst.Color.G, PuyoConst.Color.R, PuyoConst.Color.B, PuyoConst.Color.Y, PuyoConst.Color.P];
		const removeIndex = Util.getRandomNumber(colorList.length);
		let workList: string[] = [];
		const loop = PuyoConst.Tsumo.LOOP * 2 / 4;

		// 64*4色の配列作成
		for (let i = 0; i < colorList.length; i++) {
			if (i == removeIndex) continue;

				for (let j = 0; j < loop; j++) {
				workList.push(colorList[i]);
			}
		}

		// シャッフル、初手2ツモ（0～3）が3色以内になるように
		do {
			workList = Util.shuffle(workList);
		} while (this.isHeadFourColor(workList));

		this._queue.length = 0;
		this._queue = workList;
	}

	/**
	 * 最初のツモ2手（4ぷよ）が4色であるかをチェック。
	 * @param {string[]} list
	 * @returns {boolean} true：4色 / false：3色以下
	 */
	private isHeadFourColor(list: string[]) : boolean {
		return list[0] != list[1]
			&& list[0] != list[2]
			&& list[0] != list[3]
			&& list[1] != list[2]
			&& list[1] != list[3]
			&& list[2] != list[3];
	}
}