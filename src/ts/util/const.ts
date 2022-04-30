import { EnumPosition } from "../component/puyopuyo/tsumo/logic/enumPosition";
import { Coordinate } from "../math/coordinate";

/**
 * ぷよぷよに関する定数
 */
export namespace PuyoConst {
	export namespace Color {
		export const G = "1";
		export const R = "2";
		export const B = "3";
		export const Y = "4";
		export const P = "5";
		export const N = "0";
		export const J = "9";
	}

	export namespace Field {
		export const X_SIZE = 6;
		export const Y_SIZE = 13;
		export const DEAD_COORD = new Coordinate(2, 11);
	}

	export namespace Tsumo {
		export const INI_X = 2;
		export const INI_POSITION = EnumPosition.TOP;
		export const LOOP = 128;
	}

	export namespace BONUS {
		export const CHAIN = [0, 8, 16, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, 480, 512];
		export const CONNECT = [0, 2, 3, 4, 5, 6, 7, 10];
		export const COLOR = [0, 3, 6, 12, 24];
	}

	export const ERASE_CONNECT = 4;
}

export namespace UIConst {
	export const ONE_P_COLOR = "#40B0FF";
	export const TWO_P_COLOR = "#F57777";
}