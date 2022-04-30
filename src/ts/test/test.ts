import * as fs from "fs";
import * as readline from "readline";
import { FeedforwardNeuralNetwork, TestData } from "../machinelearning/feedforwardNeuralNetwork";
import { FunctionUtil } from "../math/functionUtil";

function test(): void {
	readfile("file/input.tsv").then((result) => {
		const fnn = new FeedforwardNeuralNetwork(3, [7], 7, FunctionUtil.sigmoidForArray, FunctionUtil.dSigmoidForArray);
		
		const testDataSet = result;

		for (let i = 0; i < 10; i++) fnn.training(testDataSet);
		
		const output = fnn.calc(testDataSet[55].input);
		console.log(output);
		console.log(testDataSet[55].correct);
	});
};

function readfile(filepath: string): Promise<TestData[]> {
	let stream = fs.createReadStream(filepath);
	let reader = readline.createInterface({input: stream});

	const testDataSet: TestData[] = [];

	return new Promise((resolve) => {
		reader.on("line", (data) => {
			const arr = data.split("\t");
			const input: number[] = [];
			const correct: number[] = [];
			for (let i = 0; i < arr.length; i++) {
				if (i <= 2) {
					input.push(Number(arr[i]));
				} else {
					correct.push(Number(arr[i]));
				}
			}
			const testData: TestData = {input: input, correct: correct};
			testDataSet.push(testData);
		});
		reader.on("close", () => {
			reader.close();
			resolve(testDataSet);
		});
	});
	
}

test();