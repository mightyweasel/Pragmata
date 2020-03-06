// adapts code between tsv, json, and the chart object format
var dashiSoup = (function () {

    // Keep this variable private inside this closure scope
    // the shell of the metrics
    var adapter_data_shell = {
        stats_last_updated: "...",
        stats_total_outreach: "...",
        stats_events: "...",
        stats_engagements: "...",
        stats_web: "...",
        stats_media: "...",
        stats_grassroots: "...",
        stats_newsletters: "...",
        get_chart_events_participation_data: [
            { "id": "e_ip", "metric": "In-person", "reach": 0 }, //
            { "id": "e_vr", "metric": "Virtual", "reach": 0 }  //
        ],
        get_chart_engagements_participation_data: [
            { "id": "n_dw", "metric": "Workshop", "reach": 0 }, // 
            { "id": "n_ds", "metric": "Speaker", "reach": 0 }, //
            { "id": "n_dk", "metric": "Kiosk", "reach": 0 }, //
            { "id": "n_dp", "metric": "Presentation", "reach": 0 }, //
            { "id": "n_dm", "metric": "Meetup", "reach": 0 } //
        ],
        get_chart_summary_thermo_data: [
            { "id": "c_ip", "metric": "In-person", "reach": 0 }, //
            { "id": "c_vr", "metric": "Virtual", "reach": 0 }, //
            { "id": "c_br", "metric": "Web", "reach": 0 },
            { "id": "c_go", "metric": "[bold]GOAL\nOutreach[\]", "reach": 0 },
            { "id": "c_id", "metric": "Multimedia", "reach": 0 },
            { "id": "c_gr", "metric": "Grassroots", "reach": 0 },
            { "id": "c_nl", "metric": "Newsletters", "reach": 0 },
            { "id": "c_tc", "metric": "[bold]Total\nChannel[\]", "reach": 0 },
            { "id": "c_te", "metric": "[bold]Total\nEngagement[\]", "reach": 0 },
            { "id": "c_to", "metric": "[bold]Total\nOutreach[\]", "reach": 0 }
        ],
        get_chart_engagement_thermo_data: [
            { "id": "e_ip", "metric": "In-person: 0k", "reach": 0 / 1 * 100, "full": 100 }, //
            { "id": "e_vr", "metric": "Virtual: 0k", "reach": 0 / 1 * 100, "full": 100 }, //
            { "id": "e_go", "metric": "Goal: 250k", "reach": 0 / 1 * 100, "full": 100 } // dashiSpices.get_goal_number() will replace this
        ],
        get_chart_timeline_data: [
            //{ "date": "M/d/yyyy", "reach": 0 },
        ]
    };

    // split up tsv into arrays
    var split_raw_cell_data = function (tab) {
        tab = tab.split("\n");
        for (row in tab) {
            tab[row] = tab[row].split("\t");
        }
        return tab;
    };

    // verify if the tsv rows have the right layout
    var error_log = "";
    var errors = 0;
    var check_col_row_alignment = function (tab) {
        //console.log("tab1");
        var col_count = 0;
        for (row in tab) {
            if (col_count == 0) {
                col_count = tab[row].length;
            }
            if (col_count != tab[row].length) {
                var err = "- WARN: row " + row + " col check fail ";
                error_log += "\n" + err;
                console.log(err);
                console.log(tab[row]);
                errors++;
            }
        }
        return errors;
    };

    // drop unchartable data
    var scrub_timeline = function (timeline) {
        var clean_timeline = [];
        //console.log(timeline);
        var clean = true;
        var rgx = /^\d{1,2}\/\d{1,2}\/\d{4}$/;

        for (var i = 0; i < timeline.length; i++) {
            clean = true;
            //console.log(timeline[i].reach);
            let date = timeline[i]["date"];
            let reach = timeline[i]["reach"];

            if (isNaN(reach) ||
                rgx.test(date) == false ||
                date == "1/0/1900" ||
                reach == 0
            ) {
                clean = false;
            }

            if (clean == true) {
                clean_timeline.push(timeline[i]);
            }
        }

        // sort
        clean_timeline.sort(function (a, b) {
            var dateA = new Date(a.date), dateB = new Date(b.date);
            return dateA - dateB;
        });
        // accumulate
        var accum_reach = 0;
        for (var i = 0; i < clean_timeline.length; i++) {
            accum_reach += clean_timeline[i].reach;
            clean_timeline[i].reach = accum_reach;
        }
        //console.log(JSON.stringify(clean_timeline, null, 4));
        return clean_timeline;
    };

    // main processing workhorse. Creates metrics.
    var process_aligned_rows = function (merge) {
        var tab1 = merge.tab1;
        var tab2 = merge.tab2;
        var tab3 = merge.tab3;

        merge.get_chart_timeline_data = [];

        // set update time
        let now = new Date();
        merge.stats_last_updated = (now.toISOString().split("T"))[0];

        // map tab 1 data
        // map excel cell data to our key object
        //
        /*********
         * 
         * You will have to update this when you excel structure changes
         * 
         */
        var cell_fxn_map = {
            // Category 1
            "Outreach": "stats_engagements",
            "Events": "stats_events",
            "Total1": "stats_total_engagements",
            // Category 2
            "Web": "stats_web",
            "Multimedia": "stats_media",
            "Total2": "stats_total_channels",
            // Category 3
            "Grassroots": "stats_grassroots",
            "Newsletters": "stats_newsletters",
            "Total3": "stats_total_digitalaudience",
            "Total Outreach": "stats_total_outreach"
        };
        //[0 Metric 1 Value]
        var total_counter = 0;
        for (let row = 0; row < tab1.length; row++) {
            var cell_id = tab1[row][0];
            if (cell_id == "Total Outreach") {
                merge[cell_fxn_map[cell_id]] = tab1[row + 1][1];
                break;
            }

            if (cell_id == "Total") {
                total_counter++;
                cell_id += total_counter;
            }

            if (typeof cell_fxn_map[cell_id] !== "undefined") {
                merge[cell_fxn_map[cell_id]] = tab1[row][1];
            }
        }

        // map tab 2 data
        //[ ],
        // cols [0]temporal [2]filter [7]value
        var accumulator = {
            "Workshop": 0,
            "Speaker": 0,
            "Kiosk": 0,
            "Presentation": 0,
            "Meetup": 0
        };
        for (let row = 0; row < tab2.length; row++) {
            //get_chart_engagements_participation_data
            let valdate = tab2[row][0];
            let val = parseInt(tab2[row][7], 10) || 0; // we're converting NaNs to 0 here (and more)
            //console.log(val);
            accumulator[tab2[row][2]] += val;

            let d = new Date(valdate);
            let now = new Date();
            let n = now.getFullYear();
            //console.log(n);
            if (d.getFullYear() <= n + 2 && !valdate.includes("Total")) {
                //console.log(tab2[row]);
                d = d.toLocaleDateString('en-US');
                merge.get_chart_timeline_data.push({ "date": d, "reach": val });
            }
        }
        //console.log(accumulator);

        var replace_data_shell = function (merge, shell, id_in, label, usePct) {
            usePct = usePct ? usePct : false;
            let obj = merge[shell].find((o, i) => {
                if (o.id === id_in) {
                    if (usePct == true) {
                        merge[shell][i] = { id: id_in, metric: label + " " + (accumulator[label] / 1000).toFixed(1) + "k", reach: accumulator[label] / dashiSpices.get_goal_number() * 100, full: 100 };
                    } else {
                        merge[shell][i] = { id: id_in, metric: label, reach: accumulator[label] };
                    }
                    return true; // stop searching
                }
            });
        };
        replace_data_shell(merge, "get_chart_engagements_participation_data", "n_dw", "Workshop");
        replace_data_shell(merge, "get_chart_engagements_participation_data", "n_ds", "Speaker");
        replace_data_shell(merge, "get_chart_engagements_participation_data", "n_dk", "Kiosk");
        replace_data_shell(merge, "get_chart_engagements_participation_data", "n_dp", "Presentation");
        replace_data_shell(merge, "get_chart_engagements_participation_data", "n_dm", "Meetup");

        // map tab 3 data
        //[ ],
        // cols [0]temporal [3]broadfilter [5]value_class1 [6]value_class2 [7]sum(5,6)
        var accumulator = {
            "In-person": 0,
            "Virtual": 0,
            "Total": 0
        };
        var n_format = function (val) {
            return parseInt(val.split(",").join(""), 10);
        }
        accumulator["Web"] = n_format(merge.stats_web);
        accumulator["Multimedia"] = n_format(merge.stats_media);
        accumulator["Grassroots"] = n_format(merge.stats_grassroots);
        accumulator["Newsletters"] = n_format(merge.stats_newsletters);
        accumulator["[bold]GOAL\nOutreach[\]"] = dashiSpices.get_goal_number();
        //console.log("1" + accumulator["[bold]GOAL\nOutreach[\]"]);
        accumulator["[bold]Total\nChannel[\]"] = n_format(merge.stats_web) + n_format(merge.stats_media);
        accumulator["[bold]Total\nEngagement[\]"] = n_format(merge.stats_engagements);
        accumulator["[bold]Total\nOutreach[\]"] = n_format(merge.stats_total_outreach);
        //console.log(merge.stats_total_outreach);

        for (let row = 0; row < tab3.length; row++) {
            //get_chart_engagements_participation_data
            let valdate = tab3[row][0];
            let val1 = parseInt(tab3[row][5], 10) || 0; // we're converting NaNs to 0 here (and more)
            let val2 = parseInt(tab3[row][6], 10) || 0; // we're converting NaNs to 0 here (and more)
            let val3 = parseInt(tab3[row][7], 10) || 0; // we're converting NaNs to 0 here (and more)
            let filter = tab3[row][3];
            //console.log(`${filter} ${val1} ${val2} ${val3}`);
            //console.log(val);
            if (["In-person", "Virtual", "In-person/Virtual"].includes(filter)) {
                accumulator["In-person"] += val2;
                accumulator["Virtual"] += val1;
                accumulator["Total"] += val3;

                let d = new Date(valdate);
                let now = new Date();
                let n = now.getFullYear();
                //console.log(n);
                if (d.getFullYear() <= n + 2 && !valdate.includes("Total")) {
                    //console.log(tab2[row]);
                    d = d.toLocaleDateString('en-US');
                    merge.get_chart_timeline_data.push({ "date": d, "reach": val3 });
                }
            }
        }
        //console.log(merge.get_chart_timeline_data);
        //{ "id": "e_ip", "metric": "In-person", "reach": 0 },
        replace_data_shell(merge, "get_chart_events_participation_data", "e_ip", "In-person");
        replace_data_shell(merge, "get_chart_summary_thermo_data", "c_ip", "In-person");
        replace_data_shell(merge, "get_chart_engagement_thermo_data", "e_ip", "In-person", true);

        replace_data_shell(merge, "get_chart_events_participation_data", "e_vr", "Virtual");
        replace_data_shell(merge, "get_chart_summary_thermo_data", "c_vr", "Virtual");
        replace_data_shell(merge, "get_chart_engagement_thermo_data", "e_vr", "Virtual", true);

        replace_data_shell(merge, "get_chart_engagement_thermo_data", "e_go", "Total", true);

        replace_data_shell(merge, "get_chart_summary_thermo_data", "c_br", "Web");
        replace_data_shell(merge, "get_chart_summary_thermo_data", "c_go", "[bold]GOAL\nOutreach[\]");

        replace_data_shell(merge, "get_chart_summary_thermo_data", "c_id", "Multimedia");

        replace_data_shell(merge, "get_chart_summary_thermo_data", "c_gr", "Grassroots");
        replace_data_shell(merge, "get_chart_summary_thermo_data", "c_nl", "Newsletters");

        replace_data_shell(merge, "get_chart_summary_thermo_data", "c_tc", "[bold]Total\nChannel[\]");
        replace_data_shell(merge, "get_chart_summary_thermo_data", "c_te", "[bold]Total\nEngagement[\]");
        replace_data_shell(merge, "get_chart_summary_thermo_data", "c_to", "[bold]Total\nOutreach[\]");

        //add timeline data

        merge.get_chart_timeline_data = scrub_timeline(merge.get_chart_timeline_data);

        return merge;
    };

    // translate tsv into json chart object
    var convert_format_sheetpaste_to_chartjson = function (merge) {
        //merge = adapter_data_shell;
        Object.assign(merge, adapter_data_shell);

        error_log = "";
        //tab1
        var t1e = check_col_row_alignment(merge.tab1);
        var t2e = check_col_row_alignment(merge.tab2);
        var t3e = check_col_row_alignment(merge.tab3);
        var totes = t1e + t2e + t3e;


        if (totes == 0 && errors == 0) {
            console.log("INFO: No errors detected");
            document.getElementById("format_errors_container").style.display = 'none';
            error_log = "";
            document.getElementById("format_errors_log").innerText = "";
            merge = process_aligned_rows(merge);
        } else {
            document.getElementById("format_errors_container").style.display = 'block';
            document.getElementById("format_errors").innerText = totes;
            document.getElementById("format_errors_log").innerText = error_log;

            console.log("INFO: tab1 " + t1e + " Errors");
            console.log("INFO: tab2 " + t2e + " Errors");
            console.log("INFO: tab3 " + t3e + " Errors");
            console.log("INFO: Total " + totes + " Errors");
        }

        return merge;
    };

    // format raw data object
    var format = function () {
        console.log("INFO: Format data object...");
        return "var global_dashi_data = " + JSON.stringify(get_raw_data(), null, 4) + ";\n";
    };
    // get data from the textareas
    var get_raw_data = function () {
        console.log("INFO: Get raw data object...");
        var merge = {
            tab1: split_raw_cell_data(document.getElementById("summaryTabData").value),
            tab2: split_raw_cell_data(document.getElementById("engagementsTabData").value),
            tab3: split_raw_cell_data(document.getElementById("eventsTabData").value)
        }

        merge = convert_format_sheetpaste_to_chartjson(merge);

        // overwrite sheet data to shrink chart object
        merge.tab1 = "";
        merge.tab2 = "";
        merge.tab3 = "";

        return merge;
    };
    // make tsv of the json to feed our adapter
    var process_tab_to_tsv = function (tab_json, start_row, end_row, cols) {//star_col, end_col) {
        let cells = tab_json.feed.entry;
        let accumulator_array = [];
        for (var i = 0; i < cells.length; i++) {
            let cell_id = cells[i].title["$t"];
            let cell_ct = cells[i].content["$t"];
            accumulator_array.push({ "rc": cell_id, "val": cell_ct });
        }
        var tsv = ""
        var current_row = start_row;
        accumulator_array.sort(function (a, b) {
            var dateA = a.rc.slice(1, 3), dateB = b.rc.slice(1, 3);
            return dateA - dateB;
        });

        for (var i = start_row; i <= end_row; i++) {
            for (var j = 0; j < cols.length; j++) {
                let v = accumulator_array.find(function (item) {
                    return item.rc == cols[j] + i; // So it looks like A1
                });
                if (typeof v === "undefined") {
                    tsv += "\t";
                } else {
                    tsv += v.val + "\t";
                }
            }
            tsv += "\n";
        }
        tsv += "\t".repeat(cols.length);

        //console.log(tsv);
        return tsv;
    };
    // call api
    var get_json = function (yourUrl) {
        var Httpreq = new XMLHttpRequest(); // a new request
        Httpreq.open("GET", yourUrl, false);
        Httpreq.send(null);
        return Httpreq.responseText;
    };
    // load from API of Googlesheet
    var get_data = function () {
        // from data/data.js
        console.log("INFO: Get data object...");
        let gsid = dashiSpices.get_sheet_id();
        var tab1_url = "https://spreadsheets.google.com/feeds/cells/" + gsid + "/1/public/full?alt=json";
        var tab2_url = "https://spreadsheets.google.com/feeds/cells/" + gsid + "/2/public/full?alt=json";
        var tab3_url = "https://spreadsheets.google.com/feeds/cells/" + gsid + "/3/public/full?alt=json";

        var tab1_json = JSON.parse(get_json(tab1_url));
        var tab2_json = JSON.parse(get_json(tab2_url));
        var tab3_json = JSON.parse(get_json(tab3_url));

        var tab1_tsv = process_tab_to_tsv(tab1_json, 1, 16, ["A", "B"]);
        var tab2_tsv = process_tab_to_tsv(tab2_json, 1, 100, ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]);
        var tab3_tsv = process_tab_to_tsv(tab3_json, 1, 100, ["A", "B", "C", "D", "E", "F", "G", "H"]);

        var merge = {
            tab1: split_raw_cell_data(tab1_tsv),
            tab2: split_raw_cell_data(tab2_tsv),
            tab3: split_raw_cell_data(tab3_tsv)
        }

        merge = convert_format_sheetpaste_to_chartjson(merge);

        // overwrite sheet data to shrink chart object
        merge.tab1 = "";
        merge.tab2 = "";
        merge.tab3 = "";

        document.getElementById("outputDataJSON").value = "var global_dashi_data = " + JSON.stringify(merge, null, 4) + ";\n";

        return merge;
    };

    var get_cached_data = function () {
        return global_dashi_data;
    };

    return {
        get_data: get_data,
        get_raw_data: get_raw_data,
        get_cached_data: get_cached_data,
        format: format
    }
})();

//console.log(dashiSoup.get_data());
