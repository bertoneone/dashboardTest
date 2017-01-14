queue()
    .defer(d3.json, "/data")
    .await(makeGraphs);


function makeGraphs(error, recordsJson) {

    // Clean data
    var records = recordsJson;

    // Slice data to avoid browser deadlock
    records = records.slice(0, 8000);

    // Crossfilter instance
    ndx = crossfilter(records);

    // Define Dimensions
    var dateDim = ndx.dimension(function(d) { return d.date; });

    // Define Groups
    var consPowByDate = dateDim.group().reduceSum(function (d) { return d.consPow; });
    var prodPowByDate = dateDim.group().reduceSum(function (d) { return d.prodPow; });

    // Min and max dates to be used in the charts
    var minDate = dateDim.bottom(1)[0]["date"];
    var maxDate = dateDim.top(1)[0]["date"];

    // Charts instance
    var chart = dc.lineChart("#chart");
    var volumeChart = dc.barChart('#volume-chart');

    chart
        .renderArea(true)
        /* Make the chart as big as the bootstrap grid by not setting ".width(x)" */
        .height(350)
        .transitionDuration(1000)
        .margins({top: 30, right: 50, bottom: 25, left: 40})
        .dimension(dateDim)
        /* Grouped data to represent and label to use in the legend */
        .group(consPowByDate, "Consumed")
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
        .stack(prodPowByDate, "Produced", function(d) { return d.value; })
        /* Range chart to link the brush extent of the range with the zoom focus of the current chart. */
        .rangeChart(volumeChart)
        ;

    volumeChart
        .height(60)
        .margins({top: 0, right: 50, bottom: 20, left: 40})
        .dimension(dateDim)
        .group(consPowByDate)
        .centerBar(true)
        .gap(1)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .alwaysUseRounding(true)
        ;


    // Render all graphs
    dc.renderAll();
};
