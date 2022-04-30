import { Coordinate } from "../math/coordinate";
import { Homography } from "../math/homography";
import { Util } from "./util";

export class HomographyImage {
	public static convert(inImg: ImageData, inCoord: Coordinate[], outWidth: number, outHeight: number): ImageData {
		if (inCoord.length != 4) throw new Error();

		const src = [
			new Coordinate(0, 0),
			new Coordinate(outWidth, 0),
			new Coordinate(outWidth, outHeight),
			new Coordinate(0, outHeight)
		];

		const h = new Homography(src, inCoord);
		const outImg = new ImageData(outWidth, outHeight);

		for (let x = 0; x < outWidth; x++) {
			for (let y = 0; y < outHeight; y++) {
				const outCoord = new Coordinate(x, y);
				const inCoord = h.convert(outCoord).calculate(Math.round, Math.round);
				const rgba = Util.getRGBAFromImageData(inImg, inCoord);
				Util.setRGBAToImageData(outImg, outCoord, rgba);
			}
		}

		return outImg;
	}
}