import { Component } from '@angular/core';
import * as d3 from 'd3';

@Component({
	templateUrl: './demo-sentio.component.html'
})
export class DemoSentioComponent {

	// Donut Chart Configuration
	private donut: any = {
		resize: true,
		model: [],
		configure: (chart: any) => {
			chart.color(d3.scale.ordinal().range(['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c']));
			chart.label(function(d: any) { return d.key + ' (' + d.value + ')'; });
		},
		update: () => {
			let samples = 5;
			let newModel: Object[] = [];
			for (let i: number = 0; i < samples; i++) {
				newModel.push({
					key: `key: ${i}`,
					value: Math.floor(Math.random() * samples)
				});
			}
			this.donut.model = newModel;
		}
	};

	// Bar Chart Configuration
	private bars: any = {
		resize: true,
		model: [],
		configure: (chart: any) => {
			chart.label(function(d: any) { return d.key + '&lrm; (' + d.value + ')'; });
		},
		update: () => {
			let newData: Object[] = [];
			let samples = 20;

			for (let i: number = 0; i < samples; i++) {
				newData.push({
					key: `key: ${i}`,
					value: Math.floor(Math.random() * 100)
				});
			}
			this.bars.model = newData
				.sort((a: any, b: any) => { return b.value - a.value; })
				.slice(0, 12);
		}
	};

	// Matrix Chart Configuration
	private matrix: any = {
		model: [],
		configure: (chart: any) => {
			chart.key(function(d: any, i: number) { return i; })
				.value(function(d: any) { return d; })
				.margin({ top: 20, right: 2, bottom: 2, left: 80 });
		},
		update: () => {
			let data: Object[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
			let series: Object[] = [];

			series.push({ key: 'increasing', label: 'Increasing', values: data.map((d: any, i: number) => { return i; }) });
			series.push({ key: 'decreasing', label: 'Decreasing', values: data.map((d: any, i: number, arr: any[]) => { return arr.length - i - 1; }) });
			series.push({ key: 'upAndDown', label: 'Up and Down', values: data.map((d: any, i: number, arr: any[]) => { return arr.length / 2 - Math.abs(-i + arr.length / 2); }) });
			series.push({ key: 'flatHigh', label: 'Flat High', values: data.map((d: any, i: number) => { return 19; })});
			series.push({ key: 'flatLow', label: 'Flat Low', values: data.map((d: any, i: number) => { return 0; }) });
			series.push({ key: 'flatMid', label: 'Flat Mid', values: data.map((d: any, i: number) => { return 10; }) });
			series.push({ key: 'spikeHigh', label: 'Spike High', values: data.map((d: any, i: number) => { return (Math.random() > 0.1) ? 1 : 19; }) });
			series.push({ key: 'spikeLow', label: 'Spike Low', values: data.map((d: any, i: number) => { return (Math.random() > 0.1) ? 19 : 1; }) });
			series.push({ key: 'random', label: 'random', values: data.map((d: any, i: number) => { return Math.random() * 19; }) });

			// Remove a couple things
			series.splice(Math.floor(Math.random() * series.length), 1);
			series.splice(Math.floor(Math.random() * series.length), 1);

			// Swap a couple things
			let swap = (i: number, j: number, arr: any[]) => {
				let t = arr[j];
				arr[j] = arr[i];
				arr[i] = t;
			};
			swap(Math.floor(Math.random() * series.length), Math.floor(Math.random() * series.length), series);
			swap(Math.floor(Math.random() * series.length), Math.floor(Math.random() * series.length), series);

			this.matrix.model = series;
		}
	};


	ngOnInit() {
		this.donut.update();
		this.bars.update();
		this.matrix.update();
	}
}
