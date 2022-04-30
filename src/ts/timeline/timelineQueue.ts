import { Timeline } from "@createjs/tweenjs";

export class TimelineQueue {
	// singleton instance
	private static _instance: TimelineQueue;

	// properties
	private _queue: Timeline[];
	private _isPlaying: boolean;
	/** 0：ステップ、1：アニメーション */
	private _mode: number;

	/**
	 * constructor
	 */
	private constructor() {
		this._queue = [];
		this._isPlaying = false;
		this._mode = 1;
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
			this._queue[i].addEventListener("complete", afterComplete);
		}

		// callback
		if (before !== undefined) before();
		
		this._queue[0].gotoAndPlay(0);
	} 

	// accessor
	get mode(): number {
		return this._mode;
	}

	set mode(mode: number) {
		this._mode = mode;
	}

	get isPlaying(): boolean {
		return this._isPlaying;
	}
}