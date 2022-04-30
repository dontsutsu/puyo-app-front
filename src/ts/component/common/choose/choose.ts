import { ChooseCanvas as ChooseCanvas } from "./canvas/chooseCanvas";

/**
 * ぷよ選択
 */
export class Choose {
	// properties
	private _canvas: ChooseCanvas;
	private _choiseColor: string;

	/**
	 * constructor
	 */
	constructor() {
		this._canvas = new ChooseCanvas();
		this._choiseColor = "1";
		this._canvas.changeChoiseColor(this._choiseColor);

		this._canvas.addEventListener("mousedown", (e) => {
			const ce = e as CustomEvent<string>;
			this._choiseColor = ce.detail;
			this._canvas.changeChoiseColor(this._choiseColor);
		});
	}

	// accessor
	get choiseColor(): string {
		return this._choiseColor;
	}
}