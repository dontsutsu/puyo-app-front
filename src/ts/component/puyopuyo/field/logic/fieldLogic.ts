import { PuyoConst } from "../../../../util/const";
import { Coordinate } from "../../../../math/coordinate";
import { FieldCanvas } from "../canvas/fieldCanvas";
import { Connect } from "./connect";
import { FieldPuyo } from "./fieldPuyo";
import { ChainInfoInterface } from "./chainInfoInterface";
import { TsumoInterface } from "../../tsumo/logic/tsumoInterface";

/**
 * Field (Logic)
 */
export class FieldLogic {
	private _canvas: FieldCanvas;
	private _array: FieldPuyo[][];
	private _totalScore: number;
	private _lastChainInfo: ChainInfoInterface[];
	
	/**
	 * constructor
	 */
	constructor(canvas: FieldCanvas) {
		this._canvas = canvas;

		// score
		this._totalScore = 0;
		this._lastChainInfo = [];

		// array
		this._array = [];
		for (let y = 0; y < PuyoConst.Field.Y_SIZE; y++) {
			const yarray = [];
			for (let x = 0; x < PuyoConst.Field.X_SIZE; x++) {
				yarray.push(new FieldPuyo());
			}
			this._array.push(yarray);
		}
	}

	// method
	/**
	 * 連鎖処理を実行する。
	 */
	public start(): void {
		let chain = 0;
		let isErase: boolean;
		this._lastChainInfo.length = 0;
		do {
			chain++;

			// 落とす処理
			this.drop();

			// 消す処理
			// 1. 連結数チェック
			this.connectCheck();

			// 2. 得点計算
			this.calcScore(chain);

			// 3. 消去
			isErase = this.erase();

		} while(isErase);	// scoreが0より大きい＝消したぷよがあるため、ループ
	}

	/**
	 * 色を変更する。
	 * @param {Coordinate} coord 変更する座標 
	 * @param {string} color 変更する色
	 */
	public changeColor(coord: Coordinate, color: string): void {
		this.getFieldPuyo(coord).color = color;
		
		// view更新
		this._canvas.changeColor(coord, color);
	}

	/**
	 * フィールドの文字列を取得する。
	 * @returns {string} フィールドを表す文字列
	 */
	public getFieldString(): string {
		let str = "";
		for (let y = 0; y < PuyoConst.Field.Y_SIZE; y++) {
			for (let x = 0; x < PuyoConst.Field.X_SIZE; x++) {
				const coord = new Coordinate(x, y);
				str += this.getFieldPuyo(coord).color;
			}
		}
		return str;
	}

	/**
	 * 文字列からフィールドを設定する。
	 * @param {string} fieldStr フィールドを表す文字列
	 */
	public setField(fieldStr: string): void {
		for (let i = 0; i < fieldStr.length; i++) {
			const color = fieldStr.charAt(i);
			const x = i % PuyoConst.Field.X_SIZE;
			const y = i / PuyoConst.Field.X_SIZE | 0;
			const coord = new Coordinate(x, y);

			this.changeColor(coord, color);	// この中でview更新
		}
	}

	/**
	 * ツモをフィールドに落とせるかどうかを返す。
	 * ツモを落とす先が12以下なら落とせる。
	 * @param {TsumoInterface} tsumo ツモ
	 * @returns {boolean} true：落とせる、false：落とせない
	 */
	public canDrop(tsumo: TsumoInterface): boolean {
		return this.getHeight(tsumo.axis.coord.x) < PuyoConst.Field.Y_SIZE - 1 
			&& this.getHeight(tsumo.child.coord.x) < PuyoConst.Field.Y_SIZE - 1;
	}

	/**
	 * ツモをフィールドに落とす。
	 * @param {TsumoInterface} tsumo ツモ
	 */
	public dropTsumo(tsumo: TsumoInterface): void {
		const tsumoToCoord = this.getTsumoToCoord(tsumo);
		
		if (tsumoToCoord.axis.y < PuyoConst.Field.Y_SIZE) this.setFieldPuyo(tsumoToCoord.axis, new FieldPuyo(tsumo.axis.color));
		if (tsumoToCoord.child.y < PuyoConst.Field.Y_SIZE) this.setFieldPuyo(tsumoToCoord.child, new FieldPuyo(tsumo.child.color));
		
		// view更新
		this._canvas.dropTsumo(tsumo, tsumoToCoord.axis, tsumoToCoord.child);

		// 連鎖処理
		this.start();
	}

	/**
	 * ばたんきゅ～かどうか。
	 * @returns {boolean} true：ばたんきゅ～、false：ばたんきゅ～でない
	 */
	public isDead(): boolean {
		return this.getFieldPuyo(PuyoConst.Field.DEAD_COORD).color != PuyoConst.Color.N;
	}

	public setScore(score: number): void {
		this._totalScore = score;

		// view更新
		this._canvas.updateScore(score);
	}

	public setGuide(tsumo: TsumoInterface): void {
		const tsumoToCoord = this.getTsumoToCoord(tsumo);

		// view更新
		this._canvas.setGuide(tsumo, tsumoToCoord.axis, tsumoToCoord.child);
	}

	private getTsumoToCoord(tsumo: TsumoInterface): {axis: Coordinate, child: Coordinate} {
		const heights = this.getHeights();
		
		let toAxisCoord;
		let toChildCoord;
		if (tsumo.child.coord.y < tsumo.axis.coord.y) {
			toChildCoord = new Coordinate(tsumo.child.coord.x, ++heights[tsumo.child.coord.x]);
			toAxisCoord = new Coordinate(tsumo.axis.coord.x, ++heights[tsumo.axis.coord.x]);
		} else {
			toAxisCoord = new Coordinate(tsumo.axis.coord.x, ++heights[tsumo.axis.coord.x]);
			toChildCoord = new Coordinate(tsumo.child.coord.x, ++heights[tsumo.child.coord.x]);
		}

		return {axis: toAxisCoord, child: toChildCoord};
	}

	/**
	 * フィールド上で浮いているぷよを落とす。
	 */
	private drop(): void {
		// view用の配列
		const dropCoordList: {from: Coordinate, to: Coordinate}[] = [];

		for (let y = 0; y < PuyoConst.Field.Y_SIZE - 1; y++) {	// 下の段から順に確認、13段目は確認不要
			for (let x = 0; x < PuyoConst.Field.X_SIZE; x++) {
				const toCoord = new Coordinate(x, y);
				// 対象のぷよが "なし" 以外なら処理しない
				if (this.getFieldPuyo(toCoord).color != PuyoConst.Color.N) {
					continue;
				}

				const fromCoord = toCoord.clone();		// 落ちた先のy座標
				// 対象のぷよが "なし" の場合、上部の "なし" 以外のぷよを探す
				let dropPuyo: FieldPuyo;
				do {
					fromCoord.addY(1);
					dropPuyo = this.getFieldPuyo(fromCoord);
				} while (fromCoord.y < PuyoConst.Field.Y_SIZE - 1 && dropPuyo.color == PuyoConst.Color.N);

				// 落下するぷよがなかった場合、処理しない
				if (dropPuyo.color == PuyoConst.Color.N) {
					continue;
				}

				// 落ちる先の配列にぷよを格納
				this.setFieldPuyo(toCoord, dropPuyo);
				
				// 落ちたあとの配列に空白を格納
				this.setFieldPuyo(fromCoord, new FieldPuyo());

				// view用の配列に追加
				dropCoordList.push({from: fromCoord, to: toCoord});
			}
		}

		// view更新
		this._canvas.drop(dropCoordList);
	}

	/**
	 * 連結数のチェック処理。
	 */
	private connectCheck(): void {
		// 連結数をリセット
		for (let y = 0; y < PuyoConst.Field.Y_SIZE - 1; y++) {
			for (let x = 0; x < PuyoConst.Field.X_SIZE; x++) {
				const coord = new Coordinate(x, y);
				this.getFieldPuyo(coord).connect = null;
			}
		}

		// 連結数チェック
		for (let y = 0; y < PuyoConst.Field.Y_SIZE - 1; y++) {
			for (let x = 0; x < PuyoConst.Field.X_SIZE; x++) {
				const coord = new Coordinate(x, y);
				const preCoord = new Coordinate(-1, -1);
				this.check(coord, preCoord);
			}
		}
	}

	/**
	 * 連結数のチェック処理（再帰）。
	 * @param {Coordinate} coord チェックする座標
	 * @param {Coordinate} preCoord 1つ前にチェックした座標
	 */
	private check(coord: Coordinate, preCoord: Coordinate): void {
		const checkPuyo = this.getFieldPuyo(coord);
		let connect;

		// connectがNULLでないとき、既にチェック済みなのでチェック不要
		if (checkPuyo.connect != null) {
			return;
		}

		// 色ぷよでないときはチェック不要
		if (checkPuyo.color == PuyoConst.Color.N || checkPuyo.color == PuyoConst.Color.J) {
			return;
		}

		if (preCoord.x == -1 && preCoord.y == -1) {
			connect = new Connect();
		} else {
			const prePuyo = this.getFieldPuyo(preCoord);

			// 色が異なる場合、再帰チェックしない
			if (checkPuyo.color != prePuyo.color) {
				return;
			}

			connect = prePuyo.connect as Connect;	// nullではない前提なのでConnectでcast
			connect.increment();
		}

		checkPuyo.connect = connect;

		// 以下、四方向に再帰チェック

		// up（13段目y=12のぷよは連結数チェックしない）
		const uCoord = coord.clone().addY(1);
		if (uCoord.y < PuyoConst.Field.Y_SIZE - 1) {
			this.check(uCoord, coord);
		}

		// down
		const dCoord = coord.clone().addY(-1);
		if (dCoord.y >= 0) {
			this.check(dCoord, coord);
		}

		// right
		const rCoord = coord.clone().addX(1);
		if (rCoord.x < PuyoConst.Field.X_SIZE) {
			this.check(rCoord, coord);
		}

		// left
		const lCoord = coord.clone().addX(-1);
		if (lCoord.x >= 0) {
			this.check(lCoord, coord);
		}
	}

	/**
	 * 得点を計算する。
	 * @param {number} chain 連鎖数
	 */
	private calcScore(chain: number): void {
		// 得点計算に必要な変数設定
		const connectArray: Connect[] = [];	// 連結数の配列
		const colorArray: string[] = [];		// 消去した色の配列

		for (let y = 0; y < PuyoConst.Field.Y_SIZE - 1; y++) {
			for (let x = 0; x < PuyoConst.Field.X_SIZE; x++) {
				const coord = new Coordinate(x, y);
				const puyo = this.getFieldPuyo(coord);
				if (puyo.connect != null && puyo.connect.isErasable()) {
					// 得点計算の処理
					if (!connectArray.includes(puyo.connect)) connectArray.push(puyo.connect);
					if (!colorArray.includes(puyo.color)) colorArray.push(puyo.color);
				}
			}
		}

		// 連結数の配列が空の場合（＝消去できるものがなかった場合）、得点は0
		if (connectArray.length == 0) return;

		// 消去数
		const erase = connectArray.reduce((sum, connect) => { return sum + connect.size; }, 0);

		// 連結ボーナス
		let connectBonus = 0;
		const connectList: number[] = [];
		for (const connect of connectArray) {
			const index = (connect.size > 11 ? 11 : connect.size) - 4;
			connectBonus += PuyoConst.Bonus.CONNECT[index];
			connectList.push(connect.size);
		}
		
		// 色数ボーナス
		const colorBonus = PuyoConst.Bonus.COLOR[colorArray.length - 1];

		// 連鎖ボーナス
		const chainBonus = PuyoConst.Bonus.CHAIN[chain - 1];
		
		// ボーナス合計
		let bonus = connectBonus + colorBonus + chainBonus;
		if (bonus == 0) bonus = 1;

		// スコア計算
		const score = erase * bonus * 10;
		this._totalScore += score;

		let chainInfo: ChainInfoInterface = {
			chain: chain,
			color: colorArray.length,
			connect: connectList,
			score: score
		};
		this._lastChainInfo.push(chainInfo);

		// view更新
		this._canvas.updateScoreFormula(erase, bonus);
	}

	/**
	 * 消去可能な連結数以上のぷよを消去する。
	 * @returns {boolean} true：消去するぷよがあった、false：消去するぷよがなかった
	 */
	 private erase(): boolean {
		let isErase = false;

		const coordList: Coordinate[] = [];
		for (let y = 0; y < PuyoConst.Field.Y_SIZE - 1; y++) {
			for (let x = 0; x < PuyoConst.Field.X_SIZE; x++) {
				const coord = new Coordinate(x, y);
				const puyo = this.getFieldPuyo(coord);
				if (puyo.connect != null && puyo.connect.isErasable()) {
					isErase = true;
					// 自分消去
					puyo.color = PuyoConst.Color.N;

					// view更新用
					coordList.push(new Coordinate(x, y));

					// おじゃま消去
					// up（13段目y=12のおじゃまぷよは消去しない）
					const uCoord = coord.clone().addY(1);
					if ((uCoord.y < PuyoConst.Field.Y_SIZE - 1) && this.getFieldPuyo(uCoord).color == PuyoConst.Color.J) {
						this.setFieldPuyo(uCoord, new FieldPuyo(PuyoConst.Color.N));

						// view更新用
						coordList.push(uCoord);
					}

					// down
					const dCoord = coord.clone().addY(-1);
					if ((dCoord.y >= 0) && this.getFieldPuyo(dCoord).color == PuyoConst.Color.J) {
						this.setFieldPuyo(dCoord, new FieldPuyo(PuyoConst.Color.N));

						// view更新用
						coordList.push(dCoord);
					}

					// right
					const rCoord = coord.clone().addX(1);
					if ((rCoord.x < PuyoConst.Field.X_SIZE) && this.getFieldPuyo(rCoord).color == PuyoConst.Color.J) {
						this.setFieldPuyo(rCoord, new FieldPuyo(PuyoConst.Color.N));

						// view更新用
						coordList.push(rCoord);
					}

					// left
					const lCoord = coord.clone().addX(-1);
					if ((lCoord.x >= 0) && this.getFieldPuyo(lCoord).color == PuyoConst.Color.J) {
						this.setFieldPuyo(lCoord, new FieldPuyo(PuyoConst.Color.N));

						// view更新用
						coordList.push(lCoord);
					}
				}
			}
		}

		// view更新
		this._canvas.erase(coordList);
		this._canvas.updateScore(this._totalScore);	// 消去後にスコアを更新

		return isErase;
	}

	/**
	 * 座標にFieldPuyoを設定する。
	 * @param {Coordinate} coord 座標
	 * @param {FieldPuyo} fieldPuyo ぷよ
	 */
	private setFieldPuyo(coord: Coordinate, fieldPuyo: FieldPuyo): void {
		this._array[coord.y][coord.x] = fieldPuyo;
	}

	/**
	 * 座標のFieldPuyoを取得する。
	 * @param {Coordinate} coord 座標 
	 * @returns {FieldPuyo} ぷよ
	 */
	private getFieldPuyo(coord: Coordinate): FieldPuyo {
		return this._array[coord.y][coord.x];
	}

	/**
	 * 指定の列の一番高い座標を取得する。
	 * 高さが-1の場合、その列には何も置かれていない。
	 * @param {number} x 列のx座標
	 * @returns {number} 列の高さ
	 */
	private getHeight(x: number): number {
		let y = PuyoConst.Field.Y_SIZE - 1;
		for (; y >= 0; y--) {
			if (this.getFieldPuyo(new Coordinate(x, y)).color != PuyoConst.Color.N) break;
		}
		return y;
	}

	private getHeights(): number[] {
		const heights = []
		for (let x = 0; x < PuyoConst.Field.X_SIZE; x++) {
			heights.push(this.getHeight(x));
		}
		return heights;
	}

	// accessor
	get totalScore(): number {
		return this._totalScore;
	}

	get lastChainInfo(): ChainInfoInterface[] {
		return this._lastChainInfo;
	}
}