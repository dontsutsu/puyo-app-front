import $ from "jquery";
import { PuyoUtil } from "../../../util/puyoUtil";
import { ChainInfoInterface } from "../../puyopuyo/field/logic/chainInfoInterface";

export class ChainInfoArea {
	// properties
	private _$tbody: JQuery<HTMLElement>;
	private _$wrapper: JQuery<HTMLElement>;

	constructor() {
		this._$tbody = $("#chainInfoTable tbody");
		this._$wrapper = $("#chainInfoWrapper");
	}

	// method
	public print(chainInfo: ChainInfoInterface[]): void {
		if (this._$tbody.children().length > 0) {
			const $chainTd = $("<td></td>", { "class": "chain" });
			const $scoreTd = $("<td></td>", { "class": "score" });
			const $eraseTd = $("<td></td>", { "class": "erase" });
			const $connectTd = $("<td></td>", { "class": "connect" });
			const $colorTd = $("<td></td>", { "class": "color" });
			const $tr = $("<tr></tr>", { "class": "empty" }).append($chainTd).append($scoreTd).append($eraseTd).append($connectTd).append($colorTd);
			this._$tbody.append($tr);
		}

		let totalScore = 0;
		for (const info of chainInfo) {
			totalScore += info.score;

			const $chainTd = $("<td></td>", { "class": "chain" }).text(info.chain);
			const $scoreTd = $("<td></td>", { "class": "score" }).text(info.score);
			const $eraseTd = $("<td></td>", { "class": "erase" }).text(info.erase);
			const $connectTd = $("<td></td>", { "class": "connect" }).text(info.connect.join(","));
			const $colorTd = $("<td></td>", { "class": "color" }).text(info.color);
			const $tr = $("<tr></tr>", { "class": "detail" }).append($chainTd).append($scoreTd).append($eraseTd).append($connectTd).append($colorTd);
			this._$tbody.append($tr);
		}

		const $totalLabelTd = $("<td></td>", { "class": "total-label" }).text("合計");
		const $totalScoreTd = $("<td></td>", { "class": "total-score" }).text(totalScore);
		const $ojamaTd = $("<td></td>", { "class": "ojama", "colspan": "3" });
		const ojamaImg = ChainInfoArea.createOjamaImg(totalScore);
		$ojamaTd.append(...ojamaImg);
		const $tr = $("<tr></tr>", { "class": "total" }).append($totalLabelTd).append($totalScoreTd).append($ojamaTd);
		this._$tbody.append($tr);

		// スクロール
		const he = this._$wrapper.get(0) as HTMLElement;
		const scrollHeight = he.scrollHeight as number;
		this._$wrapper.scrollTop(scrollHeight);
	}

	private static createOjamaImg(totalScore: number): JQuery<HTMLElement>[] {
		const tmp: JQuery<HTMLElement>[] = [];
		let ojamaNum = PuyoUtil.calcOjamaNum(totalScore);
		while (ojamaNum > 0 && tmp.length < 6) {
			if (ojamaNum >= 720) {
				tmp.push(ChainInfoArea.ojamaCrown());
				ojamaNum -= 720;
			} else if (ojamaNum >= 360) {
				tmp.push(ChainInfoArea.ojamaMoon());
				ojamaNum -= 360;
			} else if (ojamaNum >= 180) {
				tmp.push(ChainInfoArea.ojamaStar());
				ojamaNum -= 180;
			} else if (ojamaNum >= 30) {
				tmp.push(ChainInfoArea.ojamaRock());
				ojamaNum -= 30;
			} else if (ojamaNum >= 6) {
				tmp.push(ChainInfoArea.ojamaM());
				ojamaNum -= 6;
			} else {
				tmp.push(ChainInfoArea.ojamaS());
				ojamaNum -= 1;
			}
		}

		return tmp;
	}

	private static ojamaS(): JQuery<HTMLElement> {
		return $("<img>", { "class": "img-ojama ojama-s", "src": "static/images/ojama/ojama-s.svg" });
	}

	private static ojamaM(): JQuery<HTMLElement> {
		return $("<img>", { "class": "img-ojama ojama-m", "src": "static/images/ojama/ojama-m.svg" });
	}

	private static ojamaRock(): JQuery<HTMLElement> {
		return $("<img>", { "class": "img-ojama ojama-rock", "src": "static/images/ojama/ojama-rock.svg" });
	}

	private static ojamaStar(): JQuery<HTMLElement> {
		return $("<img>", { "class": "img-ojama ojama-star", "src": "static/images/ojama/ojama-star.svg" });
	}

	private static ojamaMoon(): JQuery<HTMLElement> {
		return $("<img>", { "class": "img-ojama ojama-moon", "src": "static/images/ojama/ojama-moon.svg" });
	}

	private static ojamaCrown(): JQuery<HTMLElement> {
		return $("<img>", { "class": "img-ojama ojama-crown", "src": "static/images/ojama/ojama-crown.svg" });
	}
}