import { Coordinate } from "../../../../math/coordinate";
import { EnumPosition } from "./enumPosition";

export interface TsumoInterface {
	axisColor: string;
	childColor: string;
	axisX: number;
	position: EnumPosition;
	axisCoord: Coordinate;
	childCoord: Coordinate;
}