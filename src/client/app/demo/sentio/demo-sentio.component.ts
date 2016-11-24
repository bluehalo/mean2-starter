import { Component, HostListener } from '@angular/core';
import * as d3 from 'd3';
import * as sentio from '@asymmetrik/sentio';


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
		},
		init: () => {
			this.donut.update();
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
		},
		init: () => {
			this.bars.update();
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
			let data: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
			let series: any[] = [];

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
		},
		init: () => {
			this.matrix.update();
		}
	};

	// Timeline Line Chart Configuration
	private timeline: any = {
		model: [],
		filterEnabled: true,
		filter: null,
		interval: 60000,
		binSize: 1000,
		hwm: Date.now(),
		configure: (chart: any) => {},
		eventHandler: (msg: string, event: any) => {
			console.log({ msg: msg, event: event });
		},
		update: () => {
			this.timeline.hwm = Date.now();
			let newModel: any[] = [];

			['series1', 'series2'].forEach((s) => {
				let k = s;
				let d: any[] = [];

				for (let i = 0; i < this.timeline.interval / this.timeline.binSize; i++) {
					d.push([ this.timeline.hwm + (i * this.timeline.binSize), Math.random() * 10 ]);
				}

				newModel.push({ key: k, data: d });
			});

			this.timeline.model = newModel;
		},
		init: () => {
			this.timeline.update();
		}
	};

	// Timeline Line Chart Configuration
	private rtTimeline: any = {
		chart: null,
		model: [],
		bins: sentio.controller.rtBins({ binCount: 60, binSize: 1000 }),
		markers: [],
		hwm: Date.now(),
		configure: (chart: any) => {
			chart.margin({ top: 16, right: 10, bottom: 20, left: 40 }).resize();
			this.rtTimeline.chart = chart;
			this.rtTimeline.play();
		},
		eventHandler: (msg: string, event: any) => {
			console.log({ msg: msg, event: event });
		},
		play: () => {
			this.rtTimeline.chart.start();
		},
		pause: () => {
			this.rtTimeline.chart.stop();
		},
		init: () => {
			this.rtTimeline.bins.model()
				.updateBin((bin: any[], d: number) => { bin[1] += 1; })
				.createSeed(() => { return 0; });

			this.rtTimeline.model = [
				{ key: 'series1', data: this.rtTimeline.bins.bins() }
			];
		}
	};

	@HostListener('mouseup', ['$event'])
	onMouseUp(event: MouseEvent) {
		this.rtTimeline.markers.push([Date.now(), 'Click']);

		// Remove old markers
		let markers = this.rtTimeline.markers;
		let hwm = this.rtTimeline.bins.hwm();
		let binCount = this.rtTimeline.bins.model().binCount();
		let binSize = this.rtTimeline.bins.model().binSize();

		while (markers.length > 0 && markers[0][0] < hwm - (binCount * binSize)) {
			this.rtTimeline.markers.shift();
		}
	};

	@HostListener('mousemove', ['$event'])
	onMouseMove(event: MouseEvent) {
		this.rtTimeline.bins.add([Date.now()]);
	}

	ngOnInit() {
		this.donut.init();
		this.bars.init();
		this.matrix.init();
		this.timeline.init();
		this.rtTimeline.init();
	}
}
