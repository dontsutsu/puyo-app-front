import { Coordinate } from "../../../../math/coordinate";

export class EnumPosition {
	// constant
	private static VALUES = new Array<EnumPosition>();
	public static readonly TOP    = new EnumPosition("TOP"   , "T", 0, new Coordinate(0,  1));
	public static readonly RIGHT  = new EnumPosition("RIGHT" , "R", 1, new Coordinate(1,  0));
	public static readonly BOTTOM = new EnumPosition("BOTTOM", "B", 2, new Coordinate(0, -1));
	public static readonly LEFT   = new EnumPosition("LEFT"  , "L", 3, new Coordinate(-1, 0));

	// properties
	private _name: string;
	private _value: string;
	private _index: number;
	/** 軸ぷよの座標を(0, 0)としたときの子ぷよの座標 */
	private _childRelativeCoord: Coordinate;

	/**
	 * constructor
	 * @param {string} name 
	 * @param {string} value
	 * @param {number} index 
	 * @param {Coordinate} childRelativeCoord
	 */
	private constructor(name: string, value: string, index: number, childRelativeCoord: Coordinate) {
		this._name = name;
		this._value = value;
		this._index = index;
		this._childRelativeCoord = childRelativeCoord;

		EnumPosition.VALUES.push(this);
	}

	// method
	/**
	 * 回転後のEnumPositionを取得する。
	 * @param {boolean} clockwise true：時計周り / false：反時計周り
	 * @returns {EnumPosition} EnumPosition
	 */
	public getRotatedEnum(clockwise: boolean): EnumPosition {
		const addIndex = clockwise ? 1 : -1;
		const index = (this._index + addIndex + 4) % 4;
		return EnumPosition.fromIndex(index);
	}

	/**
	 * indexからEnumPositionを取得する。
	 * @param {number} index index
	 * @returns {EnumPosition} EnumPosition
	 */
	private static fromIndex(index: number): EnumPosition {
		const rtn = EnumPosition.VALUES.find(position => position._index == index);
		if (rtn == undefined) throw Error("illegal argument");
		return rtn;
	}

	/**
	 * nameからEnumPositionを取得する。
	 * @param {string} name name
	 * @returns {EnumPosition} EnumPosition
	 */
	public static fromName(name: string): EnumPosition {
		const rtn = EnumPosition.VALUES.find(position => position._name == name);
		if (rtn == undefined) throw Error("illegal argument");
		return rtn;
	}

	/**
	 * valueからEnumPositionを取得する。
	 * @param {string} value value
	 * @returns {EnumPosition} EnumPosition
	 */
	public static fromValue(value: string): EnumPosition {
		const rtn = EnumPosition.VALUES.find(position => position._value == value);
		if (rtn == undefined) throw Error("illegal argument");
		return rtn;
	}

	// accessor
	get name(): string {
		return this._name;
	}

	get value(): string {
		return this._value;
	}

	get index(): number {
		return this._index;
	}

	get childRelativeCoord(): Coordinate {
		return this._childRelativeCoord.clone();
	}
}