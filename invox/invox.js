var invox = (function () {
    var synth = window.speechSynthesis;
    var pitchValue = 1;
    var rateValue = 1.3; // cross browser note, this isn't consistent across them. This might be too fast, consider user settable

    var clear_text = function () {
        document.getElementById('invox_transcript').value = "";
        document.getElementById('invox_console').innerHTML = "";
        document.getElementById('invox_result').innerHTML = "";
    };

    var pack_items = 0;
    var process_speech_text = function (inv) {
        var pack = {};
        pack_items++;
        pack.title = "NOTE";
        pack.subtitle = "General"
        pack.body = inv;
        pack.id = pack_items;

        var tokens = pack.body.split(" ");
        if (tokens[0].toLowerCase() == "action") {
            pack.title = `<span class="badge badge-danger">ACTION</span>`;
            tokens[0] = "";
            if (typeof tokens[1] !== "undefined") {
                var st = tokens[1].split("");
                st[0] = st[0].toUpperCase();
                st = st.join("");
                pack.subtitle = st;
                tokens[1] = "";
            }
        }

        pack.body = tokens.join(" ").trim();

        document.getElementById('invox_result').innerHTML += `
            <div class="col-sm-12 bg-dark" id="invox-container-${pack.id}">
                <div class="card m-2">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-sm-2">
                                <h5 class="card-title">${pack.title}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">${pack.subtitle}</h6>
                            </div>
                            <div class="col-sm-8">
                                <p id="invox-text-${pack.id}">${pack.body}</p>
                            </div>
                            <div class="col-sm-2">
                                <a href="#" id="invox-edit-${pack.id}" class="card-link">Edit</a>
                                <a href="#" id="invox-delete-${pack.id}" class="card-link">Delete</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        bind_edit_btn(pack.id);
        bind_delete_btn(pack.id);
    };

    var recognition_lang = "en-US";
    var recognition_lang_tlxd = "enabled";

    var recognize_speech = function () {
        if (window.hasOwnProperty('webkitSpeechRecognition')) {
            var recognition = new webkitSpeechRecognition();

            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.lang = recognition_lang;
            recognition.start();

            recognition.onresult = function (e) {
                var vox = e.results[0][0].transcript;

                recognition.stop();
                document.getElementById('invox_transcript').value = vox;
                process_speech_text(vox);
            };

            recognition.onerror = function (e) {
                recognition.stop();
            }
        } else {
            document.getElementById("invox_result").innerHTML = "Error";
        }
    };

    var edit_invox_by_id = function (id) {
        var elem = document.querySelector('#invox-container-' + id);
        elem.querySelector('#invox-text-' + id).innerHTML = elem.querySelector('#invox-text-' + id).innerHTML + " (edited)";
    };
    var delete_invox_by_id = function (id) {
        var elem = document.querySelector('#invox-container-' + id);
        elem.parentNode.removeChild(elem);
    };
    var bind_delete_btn = function (id) {
        // bind open formatter button
        document.addEventListener('click', function (event) {
            // If the clicked element doesn't have the right selector, bail
            if (!event.target.matches('#invox-delete-' + id)) return;
            // Don't follow the link
            event.preventDefault();

            delete_invox_by_id(id);
        }, false);
    };
    var bind_edit_btn = function (id) {
        // bind open formatter button
        document.addEventListener('click', function (event) {
            // If the clicked element doesn't have the right selector, bail
            if (!event.target.matches('#invox-edit-' + id)) return;
            // Don't follow the link
            event.preventDefault();

            edit_invox_by_id(id);
        }, false);
    };
    var bind_invox_btn = function () {
        // bind open formatter button
        document.addEventListener('click', function (event) {
            // If the clicked element doesn't have the right selector, bail
            if (!event.target.matches('#invox_btn')) return;
            // Don't follow the link
            event.preventDefault();

            recognize_speech();
        }, false);
    };
    var bind_send_btn = function () {
        // bind open formatter button
        document.addEventListener('click', function (event) {
            // If the clicked element doesn't have the right selector, bail
            if (!event.target.matches('#send_btn')) return;
            // Don't follow the link
            event.preventDefault();

            process_speech_text(document.getElementById('invox_transcript').value);
        }, false);
    };
    var bind_clear_btn = function () {
        // bind open formatter button
        document.addEventListener('click', function (event) {
            // If the clicked element doesn't have the right selector, bail
            if (!event.target.matches('#clear_btn')) return;
            // Don't follow the link
            event.preventDefault();

            clear_text();
        }, false);
    };

    var start = function () {
        bind_invox_btn();
        bind_clear_btn();
        bind_send_btn();
    };

    return {
        start: start
    }
})();

invox.start();