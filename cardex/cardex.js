var cardex = (function () {
    var synth = window.speechSynthesis;
    var pitchValue = 1;
    var rateValue = 1.3; // cross browser note, this isn't consistent across them. This might be too fast, consider user settable

    var clear_text = function () {
        document.getElementById('cardex_transcript').value = "";
        //document.getElementById('cardex_console').innerHTML = "";
        document.getElementById('cardex_result').innerHTML = "";
    };

    var pack_items = 0;
    var process_speech_text = function (inv, edit_id) {
        // #who sinan b #where csps #what developer analyst advisor #when 3/5/2020 #why to make it easier #more cool eh?
        var pack = {};
        if (typeof edit_id === "undefined") {
            pack_items++;
            pack.id = pack_items;
        } else {
            pack.id = edit_id;
        }
        pack.body = inv;

        pack.who = "";
        pack.where = ""
        pack.what = "";
        pack.why = "";
        pack.when = "";
        pack.more = "";

        var tokens = pack.body.split("#");
        for (var i = 0; i < tokens.length; i++) {
            var tk = tokens[i].split(" ");
            var key = tk[0].toLowerCase();
            tk[0] = "";
            tk = tk.join(" ").trim();
            if (["who", "where", "what", "why", "when", "more"].includes(key)) {
                pack[key] = tk;
            }
        }
        document.getElementById('cardex_result').innerHTML += `
                    <tr id="cardex-container-${pack.id}">
                        <td><span class="badge badge-secondary">${pack.id}</span></th>
                        <td><strong>${pack.who}<strong></td>
                        <td>${pack.where}</td>
                        <td>${pack.what}</td>
                        <td>${pack.why}</td>
                        <td>${pack.when}</td>
                        <td>${pack.more}</td>
                        <td><a href="#" id="cardex-edit-${pack.id}" class="btn btn-secondary btn-small">Edit</a><input type="hidden" id="cardex-edit-body-${pack.id}" value="${pack.body}"</td>
                        <td><a href="#" id="cardex-delete-${pack.id}" class="btn btn-secondary btn-small">Delete</a></td>
                    </tr>
                `;
        if (typeof edit_id === "undefined") {
            bind_edit_btn(pack.id);
            bind_delete_btn(pack.id);
        }
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
                document.getElementById('cardex_transcript').value = vox;
                process_speech_text(vox);
            };

            recognition.onerror = function (e) {
                recognition.stop();
            }
        } else {
            document.getElementById("cardex_result").innerHTML = "Error";
        }
    };

    var edit_cardex_by_id = function (id) {
        var elem = document.querySelector('#cardex-container-' + id);
        var body = elem.querySelector('#cardex-edit-body-' + id).value + " (edited)";
        delete_cardex_by_id(id);
        document.getElementById('cardex_transcript').value = body;
        //process_speech_text(body, id);
    };
    var delete_cardex_by_id = function (id) {
        var elem = document.querySelector('#cardex-container-' + id);
        unbind_edit_btn(id);
        unbind_delete_btn(id);
        elem.parentNode.removeChild(elem);
    };
    var bind_delete_btn = function (id) {
        // bind open formatter button
        document.addEventListener('click', function (event) {
            // If the clicked element doesn't have the right selector, bail
            if (!event.target.matches('#cardex-delete-' + id)) return;
            // Don't follow the link
            event.preventDefault();
            //console.log("del");
            delete_cardex_by_id(id);
        }, false);
    };
    var unbind_delete_btn = function (id) {
        // bind open formatter button
        document.removeEventListener('click', function (event) {
            // If the clicked element doesn't have the right selector, bail
            if (!event.target.matches('#cardex-delete-' + id)) return;
            // Don't follow the link
            event.preventDefault();
            //console.log("del");
            delete_cardex_by_id(id);
        }, false);
    };
    var bind_edit_btn = function (id) {
        //console.log("bind edt");
        // bind open formatter button
        document.addEventListener('click', function (event) {
            // If the clicked element doesn't have the right selector, bail
            if (!event.target.matches('#cardex-edit-' + id)) return;
            // Don't follow the link
            event.preventDefault();
            //console.log("edt");
            edit_cardex_by_id(id);
        }, false);
    };
    var unbind_edit_btn = function (id) {
        // bind open formatter button
        document.removeEventListener('click', function (event) {
            // If the clicked element doesn't have the right selector, bail
            if (!event.target.matches('#cardex-edit-' + id)) return;
            // Don't follow the link
            event.preventDefault();
            //console.log("edt");
            edit_cardex_by_id(id);
        }, false);
    };
    var bind_cardex_btn = function () {
        // bind open formatter button
        document.addEventListener('click', function (event) {
            // If the clicked element doesn't have the right selector, bail
            if (!event.target.matches('#cardex_btn')) return;
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

            process_speech_text(document.getElementById('cardex_transcript').value);
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
        bind_cardex_btn();
        bind_clear_btn();
        bind_send_btn();
    };

    return {
        start: start
    }
})();

cardex.start();