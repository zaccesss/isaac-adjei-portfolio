//Full Documentation: https://animmaster.github.io/docs/chartdoc.html

/*
========================================================
ANIM CHART MODULE
========================================================

Lightweight charts powered by Chart.js.


--------------------------------------------------------
HTML STRUCTURE
--------------------------------------------------------

<canvas
	data-anim-chart
	data-anim-chart-type="line"
	data-anim-chart-labels='["Jan","Feb","Mar"]'
	data-anim-chart-datasets='[
		{
			"label":"Sales",
			"data":[10,20,15],
			"borderColor":"#6366f1",
			"backgroundColor":"#6366f1"
		}
	]'
></canvas>



--------------------------------------------------------
ATTRIBUTES
--------------------------------------------------------

data-anim-chart
chart canvas


data-anim-chart-type
chart type

line
bar
pie
doughnut
radar


data-anim-chart-labels
chart labels


data-anim-chart-datasets
datasets array


--------------------------------------------------------
FEATURES
--------------------------------------------------------

✔ multiple charts
✔ HTML API
✔ responsive
✔ Chart.js powered


Docs
https://www.chartjs.org/


========================================================
*/

// Import functionality
import { ANIM } from '@js/common/functions.js'

// Chart.js
import Chart from 'chart.js/auto'

// Styles
import './chart.scss'

function chartInit() {
	const charts = document.querySelectorAll('[data-anim-chart]')

	if (!charts.length) return

	ANIM('_ANIM_CHART_START', charts.length)

	charts.forEach(chartCanvas => {
		const type = chartCanvas.dataset.animChartType || 'line'

		const labels = chartCanvas.dataset.animChartLabels
			? JSON.parse(chartCanvas.dataset.animChartLabels)
			: []

		const datasets = chartCanvas.dataset.animChartDatasets
			? JSON.parse(chartCanvas.dataset.animChartDatasets)
			: []

		const data = {
			labels,
			datasets,
		}

		new Chart(chartCanvas, {
			type,

			data,

			options: {
				responsive: true,

				plugins: {
					legend: {
						position: 'bottom',
					},

					title: {
						display: false,
					},
				},
			},
		})
	})
}

if (document.querySelector('[data-anim-chart]')) {
	window.addEventListener('load', chartInit)
}
