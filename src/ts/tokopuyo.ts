import { Field } from "./component/puyopuyo/field/field";
import { Tsumo } from "./component/puyopuyo/tsumo/tsumo";
import { Next } from "./component/puyopuyo/next/next";
import { TimelineQueue } from "./timeline/timelineQueue";

import { Ticker } from "@createjs/tweenjs";
import $ from "jquery";

// entry point
$(() => { new Tokopuyo(); });

export class Tokopuyo {
	// properties
	private _field: Field;
	private _tsumo: Tsumo;
	private _next: Next;
	private _$tlmode: JQuery<HTMLElement>;
	private _undoStack: {field: string, score: number}[];

	/**
	 * constructor
	 */
	constructor() {
		Ticker.timingMode = Ticker.RAF;

		this._field = new Field("field", false);
		this._tsumo = new Tsumo("tsumo");
		this._next = new Next("next");
		this._$tlmode = $("input:radio[name='tlmode']");
		this._undoStack = [];

		this._next.init();
		const color = this._next.getNextColor();
		this._tsumo.init(color.axis, color.child);

		TimelineQueue.instance.play(undefined, () => { this.setGuide(); });

		// event
		$("html").on("keydown", (e) => {
			switch(e.key) {
				case "ArrowRight" : this.keydownRight(); break;
				case "ArrowLeft" : this.keydownLeft(); break;
				case "ArrowDown" : this.keydownDown(); break;
				case "ArrowUp" : this.keydownUp(); break;
				case "z" : this.keydownZ(); break;
				case "x" : this.keydownX(); break;
			}
		});

		this._$tlmode.on("change", () => {
			TimelineQueue.instance.mode = Number(this._$tlmode.filter(":checked").val() as string);
		});
	}

	private keydownRight(): void {
		if (TimelineQueue.instance.isPlaying) return;
		if (this._field.isDead()) return;
		this._tsumo.move(1);
		TimelineQueue.instance.play(() => { this._field.removeGuide(); }, () => { this.setGuide(); });
	}

	private keydownLeft(): void {
		if (TimelineQueue.instance.isPlaying) return;
		if (this._field.isDead()) return;
		this._tsumo.move(-1);
		TimelineQueue.instance.play(() => { this._field.removeGuide(); }, () => { this.setGuide(); });
	}

	private keydownDown(): void {
		if (TimelineQueue.instance.isPlaying) return;
		if (this._field.isDead()) return;
		
		// ツモを落とせるかチェック
		const currentTsumo = this._tsumo.getTsumo();
		if (!this._field.canDrop(currentTsumo.axis, currentTsumo.child)) return;

		// 履歴に登録
		const field = this._field.getFieldString();
		const score = this._field.getScore();
		this._undoStack.push({field: field, score: score});

		// フィールドにツモを落とす
		const dropTsumo = this._tsumo.drop();
		this._field.dropTsumo(dropTsumo.axis, dropTsumo.child);

		const color = this._next.getNextColor();
		this._tsumo.set(color.axis, color.child);

		TimelineQueue.instance.play(() => { this._field.removeGuide(); }, () => { this.setGuide(); });
	}

	private keydownUp(): void {
		if (TimelineQueue.instance.isPlaying) return;

		const undo = this._undoStack.pop();
		if (undo === undefined) return;

		this._field.setField(undo.field);
		this._field.setScore(undo.score);

		const color = this._next.back();
		this._tsumo.change(color.axis, color.child);

		this.setGuide();
	}

	private keydownZ(): void {
		if (TimelineQueue.instance.isPlaying) return;
		if (this._field.isDead()) return;
		this._tsumo.rotate(false);
		TimelineQueue.instance.play(() => { this._field.removeGuide(); }, () => { this.setGuide(); });
	}

	private keydownX(): void {
		if (TimelineQueue.instance.isPlaying) return;
		if (this._field.isDead()) return;
		this._tsumo.rotate(true);
		TimelineQueue.instance.play(() => { this._field.removeGuide(); }, () => { this.setGuide(); });
	}

	private setGuide(): void {
		const tsumo = this._tsumo.getTsumo();
		this._field.setGuide(tsumo.axis, tsumo.child);
	}
}