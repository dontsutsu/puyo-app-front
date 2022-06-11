import { Choose } from "./component/common/choose/choose";
import { TimelineQueue } from "./timeline/timelineQueue";
import { Field } from "./component/puyopuyo/field/field";
import { Coordinate } from "./math/coordinate";
import { Ticker } from "@createjs/tweenjs";
import $ from "jquery";
import { ImageForm } from "./component/common/imageForm/imageForm";

// entry point
$(() => { new Editor(); });

export class Editor {
	// properties
	private _field: Field;
	private _choose: Choose;
	private _undoStack: string[];
	private _redoStack: string[];
	private _imageForm: ImageForm;
	private _timeline: TimelineQueue;
	
	/**
	 * constructor
	 */
	constructor() {
		Ticker.timingMode = Ticker.RAF;

		this._field = new Field("field", true);
		this._choose = new Choose();
		this._imageForm = new ImageForm();
		this._undoStack = [];
		this._redoStack = [];
		this._timeline = TimelineQueue.instance;

		// event
		$("html").on("keydown", (e) => {
			if (e.ctrlKey) {
				switch(e.key) {
					case "z" : this.undo(); break;
					case "y" : this.redo(); break;
				}
			} else {
				switch(e.key) {
					case "1" : case "g" : this._choose.choiseColor = "1"; break;
					case "2" : case "r" : this._choose.choiseColor = "2"; break;
					case "3" : case "b" : this._choose.choiseColor = "3"; break;
					case "4" : case "y" : this._choose.choiseColor = "4"; break;
					case "5" : case "p" : this._choose.choiseColor = "5"; break;
					case "9" : case "j" : this._choose.choiseColor = "9"; break;
					case "0" : case "d" : this._choose.choiseColor = "0"; break;
					case " " : this.start(); break;
				}
			}
		});

		this._field.addEventListener("mousedown", this.mousedownField.bind(this));
		$("#start").on("click", this.start.bind(this));
		$("#undo").on("click", this.undo.bind(this));
		$("#redo").on("click", this.redo.bind(this));
		$("#openImageForm").on("click", () => { this._imageForm.open() });
		this._imageForm.addEventListener("receive", this.recieveFieldData.bind(this));
	}

	// method
	private mousedownField(e: Object): void {
		const ce = e as CustomEvent<Coordinate>;
		const coord = ce.detail;
		const color = this._choose.choiseColor;

		this.doWithRecordHistory(() => {
			this._field.changeColor(coord, color);
		});
	}

	private start(): void {
		this.doWithRecordHistory(() => {
			this._field.start();
		});

		this._timeline.play();
	}

	private undo(): void {
		const undo = this._undoStack.pop();
		if (undo !== undefined) {
			this._redoStack.push(this._field.getFieldString());
			this._field.setField(undo);
		}
	}

	private redo(): void {
		const redo = this._redoStack.pop();
		if (redo !== undefined) {
			this._undoStack.push(this._field.getFieldString());
			this._field.setField(redo);
		}
		this._timeline.play();
	}

	/**
	 * 指定の関数を実行時に履歴の登録を行う。
	 * @param {() => void} doing callback関数
	 */
	private doWithRecordHistory(doing: () => void): void {
		const before = this._field.getFieldString();
		doing();
		const after = this._field.getFieldString();
		if (before != after) this.pushUndoStack(before);
	}

	/**
	 * UNDO用の履歴を残す。
	 * @param {string} state 
	 */
	private pushUndoStack(state: string): void {
		this._undoStack.push(state);

		// 一番古い履歴を消す
		if (this._undoStack.length > 100) {
			this._undoStack.shift();
		}
		// REDOを消す
		this._redoStack.length = 0;
	}

	private recieveFieldData(e: Object): void {
		const ce = e as CustomEvent<string>;
		const field = ce.detail;
		this._field.setField(field);
	}
}