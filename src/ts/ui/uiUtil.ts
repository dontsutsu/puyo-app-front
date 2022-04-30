import $ from "jquery";

export class UIUTil {
	/**
	 * ダイアログを表示する。
	 * @param {string} msg 表示メッセージ
	 * @param {string} level "0"：info、"1"：warning、"2"：error、その他：info
	 */
	public static dialogue(msg: string, level: string = "0"): void {
		const time = 3000;

		// 古いダイアログを削除
		$(".dialogue").remove();

		let color;
		switch (level) {
			case "0" :
			color = "#5D627B";
			break;
		case "1" :
			color = "#F39800";
			break;
		case "2" :
			color = "#DD0000";
			break;
		default:
			level = "0";
			color = "#5D627B";
		}

		const $dialogue = $("<div></div>", {
			"class": "dialogue",
			css: {
				"border-top": "solid 10px #000000",
				"border-bottom": "solid 1px #000000",
				"border-left": "solid 1px #000000",
				"border-right": "solid 1px #000000",
				"padding": "0.5em 1em",
				"margin": "0",
				"background": "white",
				"border-radius": "4px",
				"box-shadow": "0 5px 10px rgba(0, 0, 0, 0.22)",
				"z-index": "21",
				"width": "auto",
				"height": "30px",
				"top": "-100px",
				"left": "50%",
				"position": "absolute",
				"border-color": color,
				"color": color,
			}
		});

		const $msg = $("<span></span>").text(msg);

		$dialogue
			.appendTo($("body"))
			.append($msg);
		
		// メッセージに合わせてマージン変更
		const negaMargin = ($dialogue.width() as number) / 2 * (-1);
		$dialogue.css("margin", "0 0 0 " + negaMargin + "px");

		$dialogue.animate({
			top: "+=110px"
		}, 500, "swing", () => {
			$dialogue.delay(time).animate({
				top: "-=110px"
			}, 500, "swing", () => {
				$dialogue.remove();
			});
		});
	}

	/**
	 * 
	 * @param {string} msg 
	 */
	public static showLoading(msg: string = ""): void {
		$("#loadMsg").text(msg);
		$("#loadingWrapper").fadeIn(300);
	}

	/**
	 * 
	 */
	public static hideLoading(): void {
		$("#loadingWrapper").fadeOut(300);
	}
}