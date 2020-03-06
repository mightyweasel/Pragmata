// the main renderer. COnsumes a chart metrics object and uses amCharts to render
var dashi = (function () {

    // from: dashiSoup.js
    var chart_data = null;
    var load_source = dashiSpices.initial_load_source();
    if (load_source == "live") {
        chart_data = dashiSoup.get_data(); // will be replace by json after load.
    } else {
        chart_data = dashiSoup.get_cached_data(); // will be replace by json after load.
    }

    var update_data = function (newdata) {
        console.log("INFO: Update data object...");
        chart_data = newdata;
    };

    var k_format = function (val) {
        return (parseInt(val.split(",").join(""), 10) / 1000).toFixed(1) + "k";
    };

    var build_summary_header = function () {
        document.getElementById("stats_last_updated").innerText = chart_data.stats_last_updated;
        document.getElementById("stats_total_outreach").innerText = k_format(chart_data.stats_total_outreach)
        document.getElementById("stats_events").innerText = k_format(chart_data.stats_events);
        document.getElementById("stats_engagements").innerText = k_format(chart_data.stats_engagements);
        document.getElementById("stats_web").innerText = k_format(chart_data.stats_web);
        document.getElementById("stats_media").innerText = k_format(chart_data.stats_media);
    };

    var get_chart_events_participation_data = function () {
        return chart_data.get_chart_events_participation_data;
    };
    var g_chart_events_participation = null;
    var g_chart_events_participation_label = null;
    var build_chart_events_participation = function () {
        // Themes begin
        am4core.useTheme(am4themes_dark);
        am4core.useTheme(am4themes_animated);
        // Themes end

        // Create chart instance
        var chart = am4core.create("chart_events_participation", am4charts.PieChart);
        g_chart_events_participation = chart;
        // Add data
        chart.data = get_chart_events_participation_data();

        // Set inner radius
        chart.innerRadius = am4core.percent(60);

        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "reach";
        pieSeries.dataFields.category = "metric";
        pieSeries.slices.template.stroke = am4core.color("#4a2abb");
        pieSeries.slices.template.strokeWidth = 2;
        pieSeries.slices.template.strokeOpacity = 1;

        pieSeries.labels.template.disabled = true;
        pieSeries.ticks.template.disabled = true;

        // This creates initial animation
        pieSeries.hiddenState.properties.opacity = 1;
        pieSeries.hiddenState.properties.endAngle = -90;
        pieSeries.hiddenState.properties.startAngle = -90;

        var label = chart.seriesContainer.createChild(am4core.Label);
        g_chart_events_participation_label = label;
        label.textAlign = "middle";
        label.horizontalCenter = "middle";
        label.verticalCenter = "middle";
        label.adapter.add("text", function (text, target) {
            return "[bold font-size:30px]" + (pieSeries.dataItem.values.value.sum / 1000).toFixed(1) + "k" + "[/]";
        })

        chart.legend = new am4charts.Legend();
        chart.legend.position = "left";
        chart.legend.maxWidth = 300;
    };

    var get_chart_engagements_participation_data = function () {
        return chart_data.get_chart_engagements_participation_data;
    }
    var g_chart_engagements_participation = null;
    var g_chart_engagements_participation_label = null;
    var build_chart_engagements_participation = function () {
        // Themes begin
        am4core.useTheme(am4themes_dark);
        am4core.useTheme(am4themes_animated);
        // Themes end

        // Create chart instance
        var chart = am4core.create("chart_engagements_participation", am4charts.PieChart);
        g_chart_engagements_participation = chart;
        // Add data
        chart.data = get_chart_engagements_participation_data();

        // Set inner radius
        chart.innerRadius = am4core.percent(60);

        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "reach";
        pieSeries.dataFields.category = "metric";
        pieSeries.slices.template.stroke = am4core.color("#4a2abb");
        pieSeries.slices.template.strokeWidth = 2;
        pieSeries.slices.template.strokeOpacity = 1;

        pieSeries.labels.template.disabled = true;
        pieSeries.ticks.template.disabled = true;

        // This creates initial animation
        pieSeries.hiddenState.properties.opacity = 1;
        pieSeries.hiddenState.properties.endAngle = -90;
        pieSeries.hiddenState.properties.startAngle = -90;

        var label = chart.seriesContainer.createChild(am4core.Label);
        g_chart_engagements_participation_label = label;
        label.textAlign = "middle";
        label.horizontalCenter = "middle";
        label.verticalCenter = "middle";
        label.adapter.add("text", function (text, target) {
            return "[bold font-size:30px]" + (pieSeries.dataItem.values.value.sum / 1000).toFixed(1) + "k" + "[/]";
        })

        chart.legend = new am4charts.Legend();
        chart.legend.position = "left";
        chart.legend.maxWidth = 300;
    };

    var get_chart_summary_thermo_data = function () {
        return chart_data.get_chart_summary_thermo_data;
    }
    var g_chart_summary_thermo = null;
    var build_chart_summary_thermo = function () {
        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end
        var chart = am4core.create("chart_summary_thermo", am4charts.XYChart);
        g_chart_summary_thermo = chart;

        // Set number format
        chart.numberFormatter.numberFormat = "#.a";

        chart.data = get_chart_summary_thermo_data();

        chart.padding(40, 40, 40, 40);

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.dataFields.category = "metric";
        categoryAxis.renderer.minGridDistance = 60;
        categoryAxis.renderer.inversed = true;
        categoryAxis.renderer.grid.template.disabled = true;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.extraMax = 0.1;
        //valueAxis.rangeChangeEasing = am4core.ease.linear;
        //valueAxis.rangeChangeDuration = 1500;

        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = "metric";
        series.dataFields.valueY = "reach";
        series.tooltipText = "{valueY.reach}"
        series.columns.template.strokeOpacity = 0;
        series.columns.template.column.cornerRadiusTopRight = 10;
        series.columns.template.column.cornerRadiusTopLeft = 10;
        //series.interpolationDuration = 1500;
        //series.interpolationEasing = am4core.ease.linear;
        var labelBullet = series.bullets.push(new am4charts.LabelBullet());
        labelBullet.label.verticalCenter = "bottom";
        labelBullet.label.dy = -10;
        labelBullet.label.text = "{values.valueY.workingValue.formatNumber('#.0a')}";

        chart.zoomOutButton.disabled = true;

        // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
        series.columns.template.adapter.add("fill", function (fill, target) {
            return chart.colors.getIndex(target.dataItem.index);
        });

        categoryAxis.sortBySeries = series;

    };

    var get_chart_engagement_thermo_data = function () {
        return chart_data.get_chart_engagement_thermo_data;
    };
    var g_chart_engagement_thermo = null;
    var build_chart_engagement_thermo = function () {
        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        // Create chart instance
        var chart = am4core.create("chart_engagement_thermo", am4charts.RadarChart);
        g_chart_engagement_thermo = chart;
        // Add data
        chart.data = get_chart_engagement_thermo_data();

        // Make chart not full circle
        chart.startAngle = -90;
        chart.endAngle = 180;
        chart.innerRadius = am4core.percent(20);

        // Set number format
        chart.numberFormatter.numberFormat = "#.#'%'";

        // Create axes
        var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "metric";
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.grid.template.strokeOpacity = 0;
        categoryAxis.renderer.labels.template.horizontalCenter = "right";
        categoryAxis.renderer.labels.template.fontWeight = 500;
        categoryAxis.renderer.labels.template.adapter.add("fill", function (fill, target) {
            return (target.dataItem.index >= 0) ? chart.colors.getIndex(target.dataItem.index) : fill;
        });
        categoryAxis.renderer.minGridDistance = 10;

        var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
        valueAxis.renderer.grid.template.strokeOpacity = 0;
        valueAxis.min = 0;
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;

        // Create series
        var series1 = chart.series.push(new am4charts.RadarColumnSeries());
        series1.dataFields.valueX = "full";
        series1.dataFields.categoryY = "metric";
        series1.clustered = false;
        series1.columns.template.fill = new am4core.InterfaceColorSet().getFor("alternativeBackground");
        series1.columns.template.fillOpacity = 0.08;
        series1.columns.template.cornerRadiusTopLeft = 20;
        series1.columns.template.strokeWidth = 0;
        series1.columns.template.radarColumn.cornerRadius = 20;

        var series2 = chart.series.push(new am4charts.RadarColumnSeries());
        series2.dataFields.valueX = "reach";
        series2.dataFields.categoryY = "metric";
        series2.clustered = false;
        series2.columns.template.strokeWidth = 0;
        series2.columns.template.tooltipText = "{metric}: [bold]{reach}[/]";
        series2.columns.template.radarColumn.cornerRadius = 20;

        series2.columns.template.adapter.add("fill", function (fill, target) {
            return chart.colors.getIndex(target.dataItem.index);
        });

        // Add cursor
        chart.cursor = new am4charts.RadarCursor();

    };

    var get_chart_timeline_data = function () {
        return chart_data.get_chart_timeline_data;
    };
    var g_chart_timeline = null;
    var build_chart_timeline = function () {

        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        var chart = am4core.create("chart_timeline", am4charts.XYChart);
        g_chart_timeline = chart;

        // Set number format
        chart.numberFormatter.numberFormat = "#.a";

        chart.data = get_chart_timeline_data();
        chart.dateFormatter.inputDateFormat = "M/d/yyyy";
        var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.minGridDistance = 60;
        dateAxis.startLocation = 0.5;
        dateAxis.endLocation = 0.5;
        dateAxis.baseInterval = {
            timeUnit: "day",
            count: 1
        }

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.tooltip.disabled = true;

        var series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.dateX = "date";
        series.name = "reach";
        series.dataFields.valueY = "reach";
        series.tooltipHTML = "<span style='font-size:14px; color:#000000;'><b>{valueY.value}</b></span>";
        series.tooltipText = "[#000]{valueY.value}[/]";
        series.tooltip.background.fill = am4core.color("#FFF");
        series.tooltip.getStrokeFromObject = true;
        series.tooltip.background.strokeWidth = 3;
        series.tooltip.getFillFromObject = false;
        series.fillOpacity = 0.6;
        series.strokeWidth = 2;
        series.stacked = true;

        chart.cursor = new am4charts.XYCursor();
        chart.cursor.xAxis = dateAxis;
        chart.scrollbarX = new am4core.Scrollbar();

        // Add a legend
        chart.legend = new am4charts.Legend();
        chart.legend.position = "bottom";
    };

    var init_charts = function () {
        build_summary_header();
        build_chart_events_participation();
        build_chart_engagements_participation();
        build_chart_engagement_thermo();
        build_chart_summary_thermo();
        build_chart_timeline();
    };
    var refresh_charts = function () {
        console.log("INFO: Refresh Data...");
        build_summary_header();

        // invalidate labels to redraw
        g_chart_events_participation_label.deepInvalidate();
        g_chart_engagements_participation_label.deepInvalidate();

        //console.log(g_chart_engagement_thermo.data)
        //console.log(get_chart_engagement_thermo_data())
        g_chart_engagement_thermo.data = get_chart_engagement_thermo_data();
        //console.log(g_chart_engagement_thermo.data)
        g_chart_summary_thermo.data = get_chart_summary_thermo_data();
        g_chart_engagements_participation.data = get_chart_engagements_participation_data();
        g_chart_events_participation.data = get_chart_events_participation_data();

        g_chart_timeline.data = get_chart_timeline_data();
    }

    var bind_format_button = function () {
        // bind format button
        document.addEventListener('click', function (event) {
            // If the clicked element doesn't have the right selector, bail
            if (!event.target.matches('#format_data')) return;
            // Don't follow the link
            event.preventDefault();

            dashi.update(dashiSoup.get_raw_data());
            document.getElementById("outputDataJSON").value = dashiSoup.format();
            dashi.refresh();
        }, false);
    };
    var bind_open_formatter_button = function () {
        // bind open formatter button
        document.addEventListener('click', function (event) {
            // If the clicked element doesn't have the right selector, bail
            if (!event.target.matches('#toggle_format_data')) return;
            // Don't follow the link
            event.preventDefault();

            let el = document.getElementById("format_data_container");
            el.style.display == 'block' ?
                el.style.display = 'none' :
                el.style.display = 'block';
        }, false);
    };
    var bind_refresh_data_button = function () {
        // bind open formatter button
        document.addEventListener('click', function (event) {
            // If the clicked element doesn't have the right selector, bail
            if (!event.target.matches('#refresh_data')) return;
            // Don't follow the link
            event.preventDefault();

            console.log("INFO: Manual Refresh, Fetching...");
            dashi.update(dashiSoup.get_data());
            dashi.refresh();
        }, false);
    };
    var start_refresh_scheduledtask = function () {
        // auto load data task
        setInterval(function () {
            console.log("INFO: Fetching...");
            dashi.update(dashiSoup.get_data());
            dashi.refresh();
            //chart_data = dashiSoup.get_data(); // will be replace by json after load.
        }, 60000 * dashiSpices.get_refresh_rate()); // refresh data every 10 mins

    };
    var start_reload_scheduledtask = function () {
        // autorefresh page task
        setInterval(function () {
            console.log("INFO: Refreshing...");
            window.location.reload()
        }, 60000 * dashiSpices.get_reload_rate()); // refresh page every 60 mins

    };
    var start_initial_draw = function () {
        //setTimeout(function () {
        console.log("INFO: amChart Init...");
        am4core.ready(function () {
            init_charts();
        }); // end am4core.ready()
        //}, 1000); // refresh page every 60 mins
    };
    var start = function () {
        bind_format_button();
        bind_open_formatter_button();
        bind_refresh_data_button();
        start_refresh_scheduledtask();
        start_reload_scheduledtask();
        start_initial_draw();
    }
    return {
        init: init_charts,
        refresh: refresh_charts,
        update: update_data,
        start: start
    }
})();

/*
*
* Time to eat! Enable buttons, and start scheduled tasks
*
*/
dashi.start();

