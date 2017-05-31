$(function() {
	$.getJSON("./data/classifications.json", function(data) {
		var canvas = $("#chart");
		data.sort(function(a, b) {
			return parseInt(a.timestamp) - parseInt(b.timestamp);
		})
		var count = 0;
		var use = [];
		var pointBgColors = [];
		for (var i =  0; i < data.length; i++) {
			var d = data[i];
			console.log(parseInt(d.timestamp))
			var date = new Date(parseInt(d.timestamp));
			console.log(date)
			d.x = date.getTime();
			d.y = d.certainty;
			if (d.class == "off") {
				d.y = -d.y;
			}
			use.push(d);
			if (d.anomaly) {
				pointBgColors.push("red");
			} else if (d.class == "on") {
				pointBgColors.push("#00ce18");
			} else {
				pointBgColors.push("orange");
			}
		}
		var chart = new Chart(canvas, {
			type: "line",
			data: {
				datasets: [{
					label: "Bedroom Light",
					data: use,
					borderColor: '#0074d9',
			        borderWidth: 2,
			        pointRadius: 4,
			        pointBorderColor: pointBgColors,
			        pointBorderWidth: 1,
			        backgroundColor: 'rgba(0, 116, 217, 0.2)',
			        pointBackgroundColor: pointBgColors
				}],
				yLabels: ["Model Certainty (ratio)"],
				xLabels: ["Time"]
			},
			options: {
				title: {
					display: true,
					text: "Naive Bayes Model Confidence",
					fontSize: 26,
					fontStyle: "bold"
				},
				scales: {
					xAxes: [{
						type: "time",
						position: "bottom",
						display: true,
						scaleLabel: {
					        display: true,
					        fontStyle: "bold",
					        fontSize: 18,
					        labelString: 'Time'
					    }
					}],
					yAxes: [{
						ticks: {
							min: -1,
							max: 1
						},
						scaleLabel: {
					        display: true,
					        labelString: 'Model Certainty (ratio)',
					        fontStyle: "bold",
					        fontSize: 18
					    }
					}]
				}
			}
		});

		chart.render();
	})
})