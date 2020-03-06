// the settings of dashi
var dashiSpices = (function () {
    /*
    *  Modify settings that you need
    */
    var dashi_settings = {
        "data_refresh_rate": 10, // in minutes
        "page_refresh_rate": 60, // in minutes
        "google_sheet_id": "1GbsuhQWWM0Fyjyh3Ns2TB_TqxWPCewG1jec2v35FbfA", // your sheet ID
        "events_target_number": 250000,
        "live_or_cache_load": "cached" // cached | live
    };

    var get_refresh_rate = function () {
        return dashi_settings["data_refresh_rate"];
    };
    var get_reload_rate = function () {
        return dashi_settings["page_refresh_rate"];
    };
    var get_sheet_id = function () {
        return dashi_settings["google_sheet_id"];
    };
    var get_goal_number = function () {
        return dashi_settings["events_target_number"];
    };
    var initial_load_source = function () {
        return dashi_settings["live_or_cache_load"];
    }
    return {
        get_refresh_rate: get_refresh_rate,
        get_reload_rate: get_reload_rate,
        get_sheet_id: get_sheet_id,
        get_goal_number: get_goal_number,
        initial_load_source: initial_load_source
    }
})();
