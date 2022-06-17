import { Timeline } from "@createjs/tweenjs";
import $ from "jquery";

export class TimelineQueue {
	// singleton instance
	private static _instance: TimelineQueue;

	// properties
	private _queue: Timeline[];
	private _isPlaying: boolean;
	/** 0：ステップ、1：アニメーション */
	private _mode: number;
	private _speed: number;
	private _$mode: JQuery<HTMLElement>;
	private _$speed: JQuery<HTMLElement>;

	/**
	 * constructor
	 */
	private constructor() {
		this._queue = [];
		this._isPlaying = false;
		
		this._$mode = $("input:radio[name='mode']");
		this._mode = Number(this._$mode.filter(":checked").val() as string);

		this._$speed = $("#speed");
		this._speed = Number(this._$speed.val());

		this._$mode.on("change", () => {
			this._mode = Number(this._$mode.filter(":checked").val() as string);
		});

		this._$speed.on("change", (e) => {
			const val = (e.target as HTMLInputElement).value;
			this._speed = Number(val);
		});
	}

	// static method
	/**
	 * インスタンスを取得する。 (singleton)
	 */
	public static get instance(): TimelineQueue {
		if (!this._instance) {
			this._instance = new TimelineQueue();
		}
		return this._instance;
	}

	/**
	 * Timelineを登録する。
	 * @param {Timeline} timeline createjs.Timeline
	 */
	public push(timeline: Timeline): void {
		this._queue.push(timeline);
	}

	/**
	 * 再生する。
	 * @param {() => void} [before] 再生前の処理
	 * @param {() => void} [after] 再生後の処理
	 */
	public play(before?: () => void, after?: () => void): void {
		if (this._queue.length == 0) return;
		if (this._isPlaying) return;

		this._isPlaying = true;

		for (let i = 0; i < this._queue.length; i++) {
			const timeline = this._queue[i];

			const n = this._speed - 3;
			const abs = Math.abs(n);
			let scale = (2 + abs) / 2;
			if (n < 0) scale = 1 / scale;
			timeline.timeScale = scale;

			let afterComplete;
			if (i < this._queue.length - 1) {
				afterComplete = () => this._queue[i + 1].gotoAndPlay(0);
			} else {
				afterComplete = () => {
					this._queue.length = 0;
					this._isPlaying = false;
					// callback
					if (after !== undefined) after();
				}
			}
			timeline.addEventListener("complete", afterComplete);
		}

		// callback
		if (before !== undefined) before();
		
		this._queue[0].gotoAndPlay(0);
	} 

	// accessor
	get mode(): number {
		return this._mode;
	}

	get isPlaying(): boolean {
		return this._isPlaying;
	}
}