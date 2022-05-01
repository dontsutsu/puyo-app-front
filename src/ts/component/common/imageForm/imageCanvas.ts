import { Bitmap, Container, Shadow, Shape, Stage } from "@createjs/easeljs";
import { Ticker } from "@createjs/tweenjs";
import { Coordinate } from "../../../math/coordinate";
import { ImageForm } from "./imageForm";
import $ from "jquery";

/**
 * ぷよ画像表示キャンバス
 */
export class ImageCanvas {
	// constant
	private static readonly SEGMENT = [6, 3];
	private static readonly OFFSET = ImageCanvas.SEGMENT[0] + ImageCanvas.SEGMENT[1];
	private static readonly CORNER = 8;
	private static readonly COLLISION = ImageCanvas.CORNER * 2 + 1;
	private static readonly CORNER_GRAPHIC = [
		[ 1*ImageCanvas.CORNER,  1*ImageCanvas.CORNER],
		[-1*ImageCanvas.CORNER,  1*ImageCanvas.CORNER],
		[-1*ImageCanvas.CORNER, -1*ImageCanvas.CORNER],
		[ 1*ImageCanvas.CORNER, -1*ImageCanvas.CORNER]
	];
	public static readonly LT = 0;
	public static readonly RT = 1;
	public static readonly RB = 2;
	public static readonly LB = 3;

	// properties
	private _canvasId: string;
	private _stage: Stage;

	private _bmpContainer: Container;
	private _bmp!: Bitmap;
	private _img!: HTMLImageElement;

	private _frameContainer: Container;
	private _frame: Shape;
	private _corners: Shape[];

	private _cornerCoords: Coordinate[];
	private _offset: number;
	private _mode: string;

	/**
	 * constructor
	 * @param {string} canvasId canvasのID
	 * @param {string} mode モード
	 */
	constructor(canvasId: string, mode: string) {
		this._canvasId = canvasId;
		this._stage = new Stage(canvasId);
		this._stage.enableMouseOver();
		Ticker.addEventListener("tick", this._stage);

		this._mode = mode;

		this._bmpContainer = new Container();
		this._stage.addChild(this._bmpContainer);

		this._frameContainer = new Container();
		this._frameContainer.visible = false;
		this._stage.addChild(this._frameContainer);

		this._frame = new Shape();
		const cornerLT = new Shape();
		const cornerRT = new Shape();
		const cornerRB = new Shape();
		const cornerLB = new Shape();
		this._corners = [cornerLT, cornerRT, cornerRB, cornerLB];
		this._frameContainer.addChild(this._frame, cornerLT, cornerRT, cornerRB, cornerLB);

		this._offset = 0;
		const coordLT = new Coordinate(0, 0);
		const coordRT = new Coordinate(0, 0);
		const coordRB = new Coordinate(0, 0);
		const coordLB = new Coordinate(0, 0);
		this._cornerCoords = [coordLT, coordRT, coordRB, coordLB];

		// event
		Ticker.addEventListener("tick", this.updateFrame.bind(this));
		this.setFrameEvent();
	}

	/**
	 * トリミング枠のイベント設定。
	 */
	private setFrameEvent(): void {
		for (let i = 0; i < this._corners.length; i++) {
			const frame = this._corners[i];
			const coord = this._cornerCoords[i];
			frame.addEventListener("mouseover", () => {
				document.body.style.cursor = "grab";
			});
			frame.addEventListener("mouseout", () => {
				document.body.style.cursor = "auto";
			});
			frame.addEventListener("pressmove", () => {
				document.body.style.cursor = "grabbing";
				let x = this._stage.mouseX;
				let y = this._stage.mouseY;

				const hNeighborCoord = this._cornerCoords[ImageCanvas.getHNeighborIndex(i)];
				const vNeighborCoord = this._cornerCoords[ImageCanvas.getVNeighborIndex(i)];

				if (this._mode == ImageForm.MODE_RECT) {
					// 矩形モードのとき、枠が裏返らないように制御
					if (ImageCanvas.isRight(i) && x <= hNeighborCoord.x + ImageCanvas.COLLISION) x = hNeighborCoord.x + ImageCanvas.COLLISION;
					if (ImageCanvas.isLeft(i) && x >= hNeighborCoord.x - ImageCanvas.COLLISION) x = hNeighborCoord.x - ImageCanvas.COLLISION;
					if (ImageCanvas.isTop(i) && y >= vNeighborCoord.y - ImageCanvas.COLLISION) y = vNeighborCoord.y - ImageCanvas.COLLISION;
					if (ImageCanvas.isBottom(i) && y <= vNeighborCoord.y + ImageCanvas.COLLISION) y = vNeighborCoord.y + ImageCanvas.COLLISION;
				}

				coord.set(x, y);

				if (this._mode == ImageForm.MODE_RECT) {
					// 矩形モードのとき、矩形を保つように隣りの角も移動する
					vNeighborCoord.x = x;
					hNeighborCoord.y = y;
				}
			});
			frame.addEventListener("pressup", () => {
				document.body.style.cursor = "auto";
			});
		}
	}

	/**
	 *
	 * @param {Coordinate[]} frame
	 */
	public setFrame(frame: Coordinate[]): void {
		for (let i = 0; i < frame.length; i++) {
			this._cornerCoords[i].set(frame[i].x, frame[i].y);
		}
	}

	/**
	 * 画像を更新する。
	 * @param {HTMLImageElement} img 画像
	 */
	public updateImage(img: HTMLImageElement): void {
		// 既に画像がある場合はremove
		if (this._bmp !== undefined) this._bmpContainer.removeChild(this._bmp);

		$("#"+this._canvasId).attr("width", img.naturalWidth);
		$("#"+this._canvasId).attr("height", img.naturalHeight);

		this._img = img;
		this._bmp = new Bitmap(img);
		this._bmpContainer.addChild(this._bmp);

		this._frameContainer.visible = true;

		this.initFrame(img.naturalWidth, img.naturalHeight);
	}

	/**
	 * トリミング枠の初期設定。
	 * @param {number} imgWidth 画像幅
	 * @param {number} imgHeight 画像高さ
	 */
	private initFrame(imgWidth: number, imgHeight: number): void {
		const wPad = Math.floor(imgWidth / 4);
		const hPad = Math.floor(imgHeight / 4);

		const left = 0 + wPad;
		const right = imgWidth - wPad;
		const top = 0 + hPad;
		const bottom = imgHeight - hPad;

		this._cornerCoords[ImageCanvas.LT].set(left, top);
		this._cornerCoords[ImageCanvas.RT].set(right, top);
		this._cornerCoords[ImageCanvas.RB].set(right, bottom);
		this._cornerCoords[ImageCanvas.LB].set(left, bottom);
	}

	/**
	 * トリミング枠の描画更新。
	 * 　1) 動く破線のアニメーション
	 * 　2) 四隅の座標位置から枠を再描画
	 */
	private updateFrame(): void {
		// 画像がまだ設定されていない場合は何も処理しない
		if (this._img === undefined) return;

		this._offset = (this._offset + 0.5) % ImageCanvas.OFFSET;

		this._frame.uncache();

		this._frame.graphics
			.c()
			.f("#000000")
			.dr(0, 0, this._img.naturalWidth, this._img.naturalHeight);
		this._frame.alpha = 0.8;
		this._frame.cache(0, 0, this._img.naturalWidth, this._img.naturalHeight);

		this._frame.graphics
			.c()
			.f("#FF0000")
			.mt(this._cornerCoords[ImageCanvas.LT].x, this._cornerCoords[ImageCanvas.LT].y)
			.lt(this._cornerCoords[ImageCanvas.RT].x, this._cornerCoords[ImageCanvas.RT].y)
			.lt(this._cornerCoords[ImageCanvas.RB].x, this._cornerCoords[ImageCanvas.RB].y)
			.lt(this._cornerCoords[ImageCanvas.LB].x, this._cornerCoords[ImageCanvas.LB].y)
			.lt(this._cornerCoords[ImageCanvas.LT].x, this._cornerCoords[ImageCanvas.LT].y);
		this._frame.updateCache("destination-out");

		this._frame.graphics
			.c()
			.s("#FFFFFF")
			.ss(0.5)
			.sd(ImageCanvas.SEGMENT, this._offset)
			.mt(this._cornerCoords[ImageCanvas.LT].x, this._cornerCoords[ImageCanvas.LT].y)
			.lt(this._cornerCoords[ImageCanvas.RT].x, this._cornerCoords[ImageCanvas.RT].y)
			.lt(this._cornerCoords[ImageCanvas.RB].x, this._cornerCoords[ImageCanvas.RB].y)
			.lt(this._cornerCoords[ImageCanvas.LB].x, this._cornerCoords[ImageCanvas.LB].y)
			.lt(this._cornerCoords[ImageCanvas.LT].x, this._cornerCoords[ImageCanvas.LT].y);
		this._frame.updateCache("source-over");

		for (let i = 0; i < this._corners.length; i++) {
			const frame = this._corners[i];
			const coord = this._cornerCoords[i];
			const graphic = ImageCanvas.CORNER_GRAPHIC[i];

			frame.shadow = new Shadow("#000000", 0, 0, 4);
			frame.graphics
				.c()
				.s("#FFFFFF")
				.ss(4)
				.mt(coord.x+graphic[0], coord.y)
				.lt(coord.x, coord.y)
				.lt(coord.x, coord.y+graphic[1]);
		}
	}

	/**
	 * モードを変更する。
	 * @param {string} mode モード
	 */
	public changeMode(mode: string): void {
		this._mode = mode;
		if (mode == ImageForm.MODE_RECT && this._bmp !== undefined) {
			// 矩形モードに変更したとき、枠を矩形にする
			this.initFrame(this._img.width, this._img.height);
		}
	}

	/**
	 * 角の座標を取得する。（左上から時計回り）
	 * @returns {Coordinate[]} 角の座標
	 */
	public getCornerCoords(): Coordinate[] {
		return [
			this._cornerCoords[ImageCanvas.LT].clone(),
			this._cornerCoords[ImageCanvas.RT].clone(),
			this._cornerCoords[ImageCanvas.RB].clone(),
			this._cornerCoords[ImageCanvas.LB].clone()
		];
	}

	/**
	 * 画像がキャンバスにアップロードされているか。
	 * @returns {boolean} 画像がキャンバスにアップロードされているか
	 */
	public imageExists(): boolean {
		return this._bmp !== undefined;
	}

	/**
	 * base64文字列を取得。
	 * @returns {string} base64文字列を取得
	 */
	public getBase64(): string {
		return this._img.src;
	}

	/**
	 * 縦隣のindexを取得。
	 * @param {number} index
	 * @returns {number} 縦隣のindex
	 */
	private static getVNeighborIndex(index: number): number {
		return (index % 2 == 0) ? (index+3)%4 : (index+5)%4;
	}

	/**
	 * 横隣のindexを取得。
	 * @param {number} index index
	 * @returns {number} 横隣のindex
	 */
	private static getHNeighborIndex(index: number): number {
		return (index % 2 == 0) ? (index+5)%4 : (index+3)%4;
	}

	/**
	 * indexが上か。
	 * @param {number} index
	 * @returns {boolean} 上か
	 */
	private static isTop(index: number): boolean {
		return index == 0 || index == 1;
	}

	/**
	 * indexが下か。
	 * @param {number} index
	 * @returns {boolean} 下か
	 */
	private static isBottom(index: number): boolean {
		return !ImageCanvas.isTop(index);
	}

	/**
	 * indexが右か。
	 * @param {number} index
	 * @returns {boolean} 右か
	 */
	private static isRight(index: number): boolean {
		return index == 1 || index == 2;
	}

	/**
	 * indexが左か。
	 * @param {number} index
	 * @returns {boolean} 左か
	 */
	private static isLeft(index: number): boolean {
		return !ImageCanvas.isRight(index);
	}
}