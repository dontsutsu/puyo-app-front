import { Choose } from "./component/common/choose/choose";
import { Field } from "./component/puyopuyo/field/field";
import { Next } from "./component/puyopuyo/next/next";
import { Tsumo } from "./component/puyopuyo/tsumo/tsumo";
import { NazoTsumo } from "./component/common/nazoTsumo/nazoTsumo";
import { Coordinate } from "./math/coordinate";
import { NazoTsumoInterface } from "./component/common/nazoTsumo/nazoTsumoInterface";
import { TimelineQueue } from "./timeline/timelineQueue";

import { Ticker } from "@createjs/tweenjs";
import $ from "jquery";
import { PuyoConst } from "./util/const";
import { EnumPosition } from "./component/puyopuyo/tsumo/logic/enumPosition";
import { UIUTil } from "./ui/uiUtil";

// entry point
$(() => { new Nazotoki(); });

export class Nazotoki {
	private static readonly MODE_EDIT = "E";	// なそぷよのお題を編集するモード
	private static readonly MODE_PLAY = "P";	// 検索結果のなぞぷよを再生するモード

	// properties
	private _field: Field;
	private _tsumo: Tsumo;
	private _next: Next;
	private _choose: Choose;
	private _nazoTsumo: NazoTsumo;
	private _$tlmode: JQuery<HTMLElement>;
	private _$qType: JQuery<HTMLElement>;
	private _$qRequire: JQuery<HTMLElement>;
	private _$answer: JQuery<HTMLElement>;
	private _$find: JQuery<HTMLElement>;
	private _$play: JQuery<HTMLElement>;
	private _answerList: FindnazoRes[][];
	private _mode : string;

	/**
	 * constructor
	 */
	constructor() {
		Ticker.timingMode = Ticker.RAF;

		this._field = new Field("field", true);
		this._tsumo = new Tsumo("tsumo");
		this._next = new Next("next");
		this._choose = new Choose();
		this._nazoTsumo = new NazoTsumo();
		this._$tlmode = $("input:radio[name='tlmode']");
		this._$qType = $("#qType");
		this._$qRequire = $("#qRequire");
		this._$answer = $("input:radio[name='answer']");
		this._$find = $("#find");
		this._$play = $("#play");
		this._answerList = [];
		this._mode = Nazotoki.MODE_EDIT;

		// init
		this.changeMode(Nazotoki.MODE_EDIT);
		this._$qType.val("1");
		this.changeQuestion();

		// event
		this._field.addEventListener("mousedown", this.mousedownField.bind(this));

		this._nazoTsumo.addEventListener("mousedown", this.mousedownNazoTsumo.bind(this));

		this._$find.on("click", this.find.bind(this));

		this._$play.on("click", this.play.bind(this));

		this._$qType.on("change", this.changeQuestion.bind(this));

		this._$tlmode.on("change", () => {
			TimelineQueue.instance.mode = Number(this._$tlmode.filter(":checked").val() as string);
		});
	}

	/**
	 * 
	 * @param {Object} e 
	 */
	private mousedownField(e: Object): void {
		if (this._mode != Nazotoki.MODE_EDIT) return;

		const ce = e as CustomEvent<Coordinate>;
		const coord = ce.detail;
		const color = this._choose.choiseColor;

		this._field.changeColor(coord, color);
	}

	/**
	 * 
	 * @param {Object} e  
	 */
	private mousedownNazoTsumo(e: Object): void {
		if (this._mode != Nazotoki.MODE_EDIT) return;

		const ce = e as CustomEvent<NazoTsumoInterface>;
		const color = this._choose.choiseColor;

		this._nazoTsumo.changeColor(ce.detail, color);
	}

	/**
	 * なぞぷよの答えを探す。
	 * サーバーで検索するため、ajax通信。
	 */
	private find(): void {
		if (!this._nazoTsumo.validate()) {
			alert("ツモの入力内容が不正です。");
			return;
		}

		UIUTil.showLoading("なぞぷよの答えを検索中です...");

		const data = {
			field: this._field.getFieldString(),
			nazoTsumo: this._nazoTsumo.getString(),
			type: this._$qType.val() as string,
			require: this._$qRequire.val() as string
		};

		$.ajax({
			type: "POST",
			url: "/findnazo",
			data: JSON.stringify(data),
			contentType: "application/json",
			dataType: "json"
		})
		.done((data: FindnazoRes[][]) => {
			this._answerList.length = 0;
			this._$answer.prop("disabled", true);

			if (data.length > 0) {
				this._answerList = data;
				this._$answer.filter((i, e) => {return Number($(e).val()) <= data.length}).prop("disabled", false);
				this._$answer.filter("#answer1").prop("checked", true);

				const msg = (data.length < 10) ? data.length + "件の解答が見つかりました。" : "10件以上の解答が見つかりました。10件のみ表示します。";
				UIUTil.dialogue(msg, "0");
				this.changeMode(Nazotoki.MODE_PLAY);
			} else {
				UIUTil.dialogue("解答が見つかりませんでした。", "1");
				this.changeMode(Nazotoki.MODE_EDIT);
			}
		})
		.fail(() => {
			UIUTil.dialogue("通信に失敗しました。", "2");
			this.changeMode(Nazotoki.MODE_EDIT);
		})
		.always(() => {
			UIUTil.hideLoading();
		});
	}

	/**
	 * なぞぷよの答えを再生する。
	 */
	private play(): void {
		const index = Number(this._$answer.filter(":checked").val() as string) - 1;
		const answer = this._answerList[index];

		const tsumos = [];
		for (let i = 0; i < answer.length + 3; i++) {
			if (i < answer.length) {
				const tsumo = {axis: answer[i].axisColor, child: answer[i].childColor};
				tsumos.push(tsumo);
			} else {
				tsumos.push({axis: PuyoConst.Color.N, child: PuyoConst.Color.N});
			}
		}

		this._next.set(tsumos);
		const color = this._next.getNextColor();
		this._tsumo.init(color.axis, color.child);

		for (let i = 0; i < answer.length; i++) {
			const tsumo = answer[i];

			// 回転から
			const position = EnumPosition.fromName(tsumo.position);
			if (position == EnumPosition.RIGHT) {
				this._tsumo.rotate(true);
			} else if (position == EnumPosition.LEFT) {
				this._tsumo.rotate(false);
			} else if (position == EnumPosition.BOTTOM) {
				this._tsumo.rotate(true);
				this._tsumo.rotate(true);
			}

			// x位置
			const axisX = Number(tsumo.axisX);
			const vec = axisX - PuyoConst.Tsumo.INI_X;
			this._tsumo.move(vec);

			// 落とす
			const dropTsumo = this._tsumo.drop();
			this._field.dropTsumo(dropTsumo.axis, dropTsumo.child);
			this._field.landingPause();	// 設置時の一時停止処理
			const color = this._next.getNextColor();
			this._tsumo.set(color.axis, color.child);
		}

		TimelineQueue.instance.play();
	}

	/**
	 * モードを変更する。
	 * モードによってdomの表示・非表示を切り替え。
	 * @param {string} mode 
	 */
	private changeMode(mode: string): void {
		this._mode = mode;
		if (mode == Nazotoki.MODE_EDIT) {
			this._answerList.length = 0;
			this._$answer.prop("disabled", true);
			this._$play.prop("disabled", true);
			this._$find.prop("disabled", false);
		} else if (mode == Nazotoki.MODE_PLAY) {
			this._$play.prop("disabled", false);
			this._$find.prop("disabled", true);
		}
	}

	/**
	 * なぞぷよのお題を変更したときの処理。
	 * お題によってrequireを変更。
	 */
	private changeQuestion(): void {
		const type = this._$qType.val() as string;
		this._$qRequire.children().remove();

		switch (type) {
			case "1" : { // XX連鎖するべし
				this._$qRequire.prop("disabled", false);
				for (let i = 1; i <= 19; i++) this._$qRequire.append($("<option>").attr({value: i}).text(i));
				break;
			}
			case "2" : { // ぷよすべて消すべし
				this._$qRequire.prop("disabled", true);
				break;
			}
			case "3" : { // XXぷよすべて消すべし
				this._$qRequire.prop("disabled", false);
				this._$qRequire.append($("<option>").attr({value: "1"}).text("みどり"));
				this._$qRequire.append($("<option>").attr({value: "2"}).text("あか"));
				this._$qRequire.append($("<option>").attr({value: "3"}).text("あお"));
				this._$qRequire.append($("<option>").attr({value: "4"}).text("きいろ"));
				this._$qRequire.append($("<option>").attr({value: "5"}).text("むらさき"));
				this._$qRequire.append($("<option>").attr({value: "9"}).text("おじゃま"));
				break;
			}
			case "4" : { // XX色同時に消すべし
				this._$qRequire.prop("disabled", false);
				for (let i = 1; i <= 5; i++) this._$qRequire.append($("<option>").attr({value: i}).text(i));
				break;
			}
			case "5" : { // XX匹同時に消すべし
				this._$qRequire.prop("disabled", false);
				for (let i = 4; i <= 72; i++) this._$qRequire.append($("<option>").attr({value: i}).text(i));
				break;
			}
		}
	}
}

interface FindnazoRes {
	axisColor: string;
	childColor: string;
	axisX: string;
	position: string;
}