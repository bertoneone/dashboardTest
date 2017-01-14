console.log("Azzo")

queue()
    .defer(d3.json, "/data")
    .await(makeGraphs);


function makeGraphs(error, recordsJson) {

    // Clean data
	var records = recordsJson;

	// Works on d3-v4 only: var dateFormat = d3.timeFormat("%Y-%m-%d %H:%M:%S");
    //var dateFormat = d3.time.format("%Y-%m-%d %H:%M");
    console.log(Object.prototype.toString.call(records[0].date));

	//records.forEach(function(d) {
	//	d.date = new Date(d.date);
	//});

	// Slice data to ease debugging
	//records = records.slice(0, 8000);

	// Crossfilter instance
	ndx = crossfilter(records);

	// Define Dimensions
	// 'date', 'prodPow', 'consPow', 'toGridPow', 'fromGridPow', 'prodEn', 'consEn', 'toGridEn', 'fromGridEn'
	var dateDim = ndx.dimension(function(d) { return d.date; });
	//var prodPowDim = ndx.dimension(function(d) { return d.prodPow; });
	//var consPowDim = ndx.dimension(function(d) { return d.consPow; });
	//var toGridPowDim = ndx.dimension(function(d) { return d.toGridPow; });
	//var fromGridPowDim = ndx.dimension(function(d) { return d.fromGridPow; });
	//var prodEnDim = ndx.dimension(function(d) { return d.prodEnDim; });
	//var consEnDim = ndx.dimension(function(d) { return d.consEnDim; });
	//var toGridEnDim = ndx.dimension(function(d) { return d.toGridEn; });
	//var fromGridEnDim = ndx.dimension(function(d) { return d.fromGridEn; });

	// Define Groups
    var consPowByDate = dateDim.group().reduceSum(function (d) { return d.consPow; });
    var prodPowByDate = dateDim.group().reduceSum(function (d) { return d.prodPow; });

	console.log(consPowByDate.all());

	// Min and max dates to be used in the charts
	var minDate = dateDim.bottom(1)[0]["date"];
	var maxDate = dateDim.top(1)[0]["date"];
	console.log(dateDim.bottom(1)[0]["date"]);
	console.log(dateDim.top(1)[0]["date"]);

	// Charts instance
	var chart = dc.lineChart("#chart");
    var volumeChart = dc.barChart('#volume-chart');

    console.log("Azzo");

    // Responsive width for the charts
	//var chartWidth = document.getElementById('chart-div').offsetWidth - 10;
	//var chartWidth = 900;
	//console.log(chartWidth);
    console.log("Azzo");

	// TODO 2: add range-chart with average consumption

	chart
	    .renderArea(true)
	    /* Make the chart as big as the bootstrap grid by not setting ".width(960)" */
		//.width(chartWidth)
        .height(350)
        .transitionDuration(1000)
        .margins({top: 30, right: 50, bottom: 25, left: 40})
        .dimension(dateDim)
		/* Grouped data to represent and label to use in the legend */
        .group(consPowByDate, "Consumed Power [kW]")
		/* Function to access grouped-data values in the chart */
        .valueAccessor(function (d) {
            return d.value;
        })
		/* x-axis range */
		.x(d3.time.scale().domain([minDate, maxDate]))
		/* Auto-adjust y-axis */
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .legend(dc.legend().x(80).y(10).itemHeight(13).gap(5))
		/* When on, you can't visualize values, when off you can filter data */
        .brushOn(false)
		/* Add another line to the chart; pass (i) group, (ii) legend label and (iii) value accessor */
		.stack(prodPowByDate, "Produced Power [kW]", function(d) { return d.value; })
	    /* Range chart to link the brush extent of the range with the zoom focus of the current chart. */
        .rangeChart(volumeChart)
	    ;

    volumeChart//.width(990)
        .height(60)
        .margins({top: 0, right: 50, bottom: 20, left: 40})
        .dimension(dateDim)
        .group(consPowByDate)
        .centerBar(true)
        .gap(1)
        .x(d3.time.scale().domain([minDate, maxDate]))
        //.round(d3.time.month.round)
        .alwaysUseRounding(true)
        //.xUnits(d3.time.months);
		;


    // Render all graphs
    dc.renderAll();

	// Debug only - show result data
	d3.select("div.debug").text(JSON.stringify(consPowByDate.all()));
};


/* Bak code follows */

/* Resize the dimension of the chart for different devices and browsers
 .on("postRender", function(chart) {
 chart.select("svg")
 .attr("viewBox", "0 0 800 300")
 .attr("preserveAspectRatio", "xMinYMin")
 .attr("width", "100%")
 .attr("height", "100%");
 chart.redraw();
 }) */
