import { EventDispatcher } from "@createjs/easeljs";
import $ from "jquery";
import { Coordinate } from "../../../math/coordinate";
import { UIUTil } from "../../../ui/uiUtil";
import { ImageCanvas } from "./imageCanvas";

/**
 * ぷよ画像送信フォーム
 */
export class ImageForm extends EventDispatcher {
	// constant
	public static readonly MODE_ANY = "0";
	public static readonly MODE_RECT = "1";

	// properties
	private _$wrapper: JQuery<HTMLElement>;
	private _$imageFile: JQuery<HTMLElement>;
	private _$trimmode: JQuery<HTMLElement>;
	private _$close: JQuery<HTMLElement>;
	private _$convertImage: JQuery<HTMLElement>;
	private _canvas: ImageCanvas;
	private _frameList: Coordinate[][];

	constructor() {
		super();

		this._$wrapper = $("#imageFormWrapper");
		this._$imageFile = $("#imageFile");
		this._$trimmode = $("input:radio[name='trimmode']");
		this._$convertImage = $("#convertImage");
		this._$close = $("#closeImageForm");

		const mode = this._$trimmode.filter(":checked").val() as string;
		this._canvas = new ImageCanvas("image", mode);

		this._frameList = [];

		this._$wrapper.hide();
		
		// event
		this._$imageFile.on("change", this.changeImage.bind(this));
		this._$trimmode.on("change", () => { this._canvas.changeMode(this._$trimmode.filter(":checked").val() as string); });
		this._$convertImage.on("click", this.convertImage.bind(this));
		this._$close.on("click", this.close.bind(this));
	}

	/**
	 * フォームを開く。
	 */
	public open(): void {
		this._$wrapper.fadeIn(300);
	}

	/**
	 * フォームを閉じる。
	 */
	private close(): void {
		this._$wrapper.fadeOut(300);
	}

	/**
	 * 画像をフィールドデータへ変換する。
	 * サーバからデータ受け取り後、イベントを発火する。
	 */
	private convertImage(): void {
		if (!this._canvas.imageExists()) {
			alert("画像が選択されていません。");
			return;
		}

		UIUTil.showLoading("画像を変換中です...");

		const cornerCoords = this._canvas.getCornerCoords();
		const corner = {
			topLeft:     { x: cornerCoords[0].x, y: cornerCoords[0].y },
			topRight:    { x: cornerCoords[1].x, y: cornerCoords[1].y },
			bottomRight: { x: cornerCoords[2].x, y: cornerCoords[2].y },
			bottomLeft:  { x: cornerCoords[3].x, y: cornerCoords[3].y }
		};
		const data = {
			base64: this._canvas.getBase64(),
			corner: corner
		};

		$.ajax({
			type: "POST",
			url: "/convertimage",
			data: JSON.stringify(data),
			contentType: "application/json",
			dataType: "json"
		})
		.done((data: ConvertimageRes) => {
			const e = new CustomEvent<string>("receive", {
				detail: data.field
			});
			this.dispatchEvent(e);
		})
		.fail(() => {
			UIUTil.dialogue("通信に失敗しました。", "2");
		})
		.always(() => {
			this.close();
			UIUTil.hideLoading();
		});
	}

	/**
	 * 画像を変更する。
	 * @param {JQuery.ChangeEvent} e changeイベント
	 */
	private changeImage(e: JQuery.ChangeEvent): void {
		const t = e.currentTarget as HTMLInputElement;

		if (t.files === null) return;
		if (t.files.length == 0) return;

		// 画像情報取得
		const file = t.files[0];
		if (!file.type.match("image.*")) {
			alert("画像ファイルを選択してください。");
			return;
		}

		const reader = new FileReader();
		const img = new Image();
		reader.onload = (e) => {
			img.onload = () => {
				UIUTil.showLoading("画像を送信中です...");

				this._canvas.updateImage(img);

				const data = {
					base64: this._canvas.getBase64()
				};

				$.ajax({
					type: "POST",
					url: "/fieldcontours",
					data: JSON.stringify(data),
					contentType: "application/json",
					dataType: "json"
				})
				.done((data: FieldcontoursRes) => {
					console.log(data);
					this.setFrameList(data.contours);
					if (this._frameList.length > 0) this.setFrame(0);
				})
				.fail(() => {
					UIUTil.dialogue("通信に失敗しました。", "2");
				})
				.always(() => {
					UIUTil.hideLoading();
				});
			}
			if (e.target === null) throw Error();
			img.src = e.target.result as string;
		};
		reader.readAsDataURL(file);
	}

	/**
	 * 
	 * @param {number[][][]} contours 
	 */
	private setFrameList(contours: number[][][]): void {
		const frameList: Coordinate[][] = [];
		for (let cnt of contours) {
			// cntは[0]が左上になっているかは分からないので、[0]が左上になるように

			// 左上は原点からの距離が一番小さい（と思う）ので、距離で判定する
			let minDis = Infinity;
			let minIdx = 0;
			for (let i = 0; i < cnt.length; i++) {
				const dis = cnt[i][0] ** 2 + cnt[i][1] ** 2;
				if (dis < minDis) {
					minDis = dis;
					minIdx = i;
				};
			}

			// 一番距離が小さいものを0に
			const frame: Coordinate[] = new Array(cnt.length);
			for (let i = 0; i < cnt.length; i++) {
				const idx = (i - minIdx + cnt.length) % cnt.length;
				const coord = new Coordinate(cnt[i][0], cnt[i][1]);
				frame[idx] = coord;
			}

			frameList.push(frame);
		}

		this._frameList = frameList;
	}

	/**
	 * 
	 * @param index 
	 */
	private setFrame(index: number): void {
		if (index >= this._frameList.length) new Error();
		const frame = this._frameList[index];
		this._canvas.setFrame(frame);
	}
}

interface ConvertimageRes {
	field: string;
}

interface FieldcontoursRes {
	contours: number[][][];
}