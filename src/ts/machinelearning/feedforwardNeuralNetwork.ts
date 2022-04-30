import { FunctionUtil } from "../math/functionUtil";
import { MathUtil } from "../math/mathUtil";

export class FeedforwardNeuralNetwork {
	// constant
	/** 学習係数η */
	private static ETA = 1.0;

	// properties
	/** 層数（中間層＋出力層、入力層は含めない） */
	private _layer: number;
	/** 活性化関数 */
	private _f: (x: number[]) => number[];
	/** 活性化関数の導関数 */
	private _df: (x: number[]) => number[];
	/** 重み係数 */
	private _weight: number[][][];
	/** 入力層 */
	private _x: number[];
	/** 中間層・出力層　活性化関数前 */
	private _u: number[][];
	/** 中間層・出力層　活性化関数後（※ダミーニューロン含む） */
	private _z: number[][];
	/** 中間層・出力層　誤差 */
	private _delta: number[][];

	/**
	 * constructor
	 * @param {number} inputNode 入力層のノード数
	 * @param {number[]} hiddenNodes 中間層の各ノード数
	 * @param {number} outputNode 出力層のノード数
	 * @param {(x: number) => number} f 活性化関数
	 * @param {(x: number) => number} df 活性化関数の導関数
	 */
	constructor(inputNode: number, hiddenNodes: number[], outputNode: number, f: (x: number[]) => number[], df: (x: number[]) => number[]) {
		this._f = f;
		this._df = df;

		// 層数は中間層＋出力層
		this._layer = hiddenNodes.length + 1;

		// 各層における入力側（x）、出力側（y）を配列化
		const xNodes = [inputNode].concat(hiddenNodes);
		const yNodes = hiddenNodes.concat([outputNode]);

		// 重み係数行列、変数の初期化
		this._weight = [];
		this._u = [];
		this._z = [];
		this._delta = [];
		for (let l = 0; l < this._layer; l++) {
			this._weight.push(MathUtil.createZero2DArray(yNodes[l], xNodes[l]+1));
			this._u.push(MathUtil.createZero1DArray(yNodes[l]));
			this._z.push(MathUtil.createZero1DArray(yNodes[l]+1));	// zはダミーニューロン考慮
			this._delta.push(MathUtil.createZero1DArray(yNodes[l]));
		}
		this._x = MathUtil.createZero1DArray(inputNode+1);	// xはz[-1]と同義、ダミーニューロン考慮

		this.initWeight();
	}

	/**
	 * 計算する。
	 * @param {number[]} input x
	 * @returns {number[]} y
	 */
	public calc(input: number[]): number[] {
		let inArray = input.concat([1]);	// 入力層にダミーニューロン追加
		this._x = inArray.slice();

		for (let l = 0; l < this._layer; l++) {
			const wMat = this._weight[l];
			let outArray = MathUtil.createZero1DArray(wMat.length);

			// 行列計算
			for (let j = 0; j < wMat.length; j++) {
				const w = wMat[j];
				outArray[j] = FunctionUtil.weightedSum(w, inArray);
			}
			this._u[l] = outArray.slice();
			outArray = (l < this._layer - 1) ? this._f(outArray) : FunctionUtil.softmax(outArray);
			outArray = outArray.concat([1]);	// ダミーニューロン追加
			this._z[l] = outArray.slice();

			// 出力を次の層の入力に
			inArray = outArray;
		}

		// ダミーニューロン除いて返却
		const y = MathUtil.createZero1DArray(this._z[this._layer-1].length-1);
		for (let i = 0; i < y.length; i++) y[i] = this._z[this._layer-1][i];

		return y;
	}

	/**
	 * 訓練する。
	 * @param {TestData} testDataSet 教師データのセット
	 */
	public training(testDataSet: TestData[]): void {
		for (const data of testDataSet) {
			const output = this.calc(data.input);

			// 更新量の計算
			const wDelta: number[][][] = [];
			// 層のループ、出力層側から
			for (let l = this._layer - 1; l >= 0; l--) {
				// 重み係数行列
				const wMat = this._weight[l];
				const deltaMat = MathUtil.createZero2DArray(wMat.length, wMat[0].length);
				
				// δ
				if (l == this._layer - 1) {
					// 出力層の場合
					this._delta[l] = FunctionUtil.substract(output, data.correct);
				} else {
					// 中間層の場合
					this._delta[l] = this.calcDelta(l);
				}

				// l側のループ
				for (let j = 0; j < wMat.length; j++) {
					// l-1側のループ
					for (let i = 0; i < wMat[j].length; i++) {
						const zz = (l > 0) ? this._z[l-1][i] : this._x[i];
						deltaMat[j][i] = zz * this._delta[l][j];
					}
				}

				wDelta.unshift(deltaMat);	// 後ろの層から処理しているのでpushではなくunshift
			}

			// 重み係数行列更新
			for (let l = 0; l < this._weight.length; l++) {
				for (let j = 0; j < this._weight[l].length; j++) {
					for (let i = 0; i < this._weight[l][j].length; i++) {
						this._weight[l][j][i] -= wDelta[l][j][i] * FeedforwardNeuralNetwork.ETA;
					}
				}
			}
		}
	}

	/**
	 * 中間層のδを計算する。
	 * @param {number} l 中間層l層目
	 * @returns {number[]} δ
	 */
	private calcDelta(l: number): number[] {
		// f'(u)
		const dfu = this._df(this._u[l]);

		// Σw[k+1]*δ[k+1]
		const sumDelta = MathUtil.createZero1DArray(this._u[l].length);
		for (let i = 0; i < sumDelta.length; i++) {
			const deltaAhead = this._delta[l+1];
			const wAhead = MathUtil.getVerticalArray(this._weight[l+1], i);
			sumDelta[i] = FunctionUtil.weightedSum(wAhead, deltaAhead);
		}

		return FunctionUtil.multipl(dfu, sumDelta);
	}

	/**
	 * 重み係数を初期化する。
	 */
	private initWeight(): void {
		for (let l = 0; l < this._weight.length; l++) {
			for (let j = 0; j < this._weight[l].length; j++) {
				for (let i = 0; i < this._weight[l][j].length; i++) {
					this._weight[l][j][i] = MathUtil.rnorm();
				}
			}
		}
	}
}

export interface TestData {
	input: number[];
	correct: number[];
}