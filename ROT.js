// ==UserScript==
// @name		ROT
// @namespace	ROT
// @version		0.16
// @author		Hans
// @description Rood Opstand Tool
// @include		http://de.grepolis.com/game*
// @include		/http[s]{0,1}://[a-z]{2}[0-9]{1,2}\.grepolis\.com/game*/
// @require		http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js
// @copyright	2018 Ideetjeshuis
// @updateURL   https://raw.githubusercontent.com/huizinga/ROT/master/ROT.js
// @downloadURL	https://raw.githubusercontent.com/huizinga/ROT/master/ROT.js
// ==/UserScript==

var uw = unsafeWindow || window, $ = uw.jQuery || jQuery;

$(function () {

    console.log('%c|= ROT-Tools is active =|', 'color: green; font-size: 1em; font-weight: bolder; ');
    var text = "";

    function CsTime(c, e) {
        var a = "CS_" + c + "_" + e.id;
        if (sessionStorage.getItem(a) && JSON.parse(sessionStorage.getItem(a)).timestamp + 600 > Timestamp.server())
            return JSON.parse(sessionStorage.getItem(a)).CsTime;
        var b = {};
        var d = {player_id: c, town_id: Game.townId, nl_init: NotificationLoader.isGameInitialized()};
        var u = $.ajax({url: "/game/player?action=get_profile_html&town_id=" + Game.townId + "&h=" + Game.csrfToken + "&json=" + JSON.stringify(d), async: !1});
        var f = null;
        var w = Math.floor(Math.sqrt(Math.pow(100, 2) + Math.pow(100, 2)));
        u = $("<pre/>").append(JSON.parse(u.responseText).plain.html);
        $.each(u.find(".gp_town_link"), function (c, a) {
            var d = JSON.parse(atob($(a).attr("href").substr(1)));
            var u = Math.floor(Math.sqrt(Math.pow(e.ix - d.ix, 2) + Math.pow(e.iy - d.iy, 2)));
            w = Math.min(w, u);
            if (void 0 == b[u])
                (b[u] = {});
            if (void 0 == b[u][d.id])
                (b[u][d.id] = {});
            b[u][d.id].id = d.id;
            b[u][d.id].name = d.name;
        });
        $.each(b[w], function (c, a) {
            d = {id: c, town_id: e.id, nl_init: NotificationLoader.isGameInitialized()};
            $.ajax({
                url: "/game/town_info?town_id=" + e.id + "&action=attack&h=" + Game.csrfToken + "&json=" + JSON.stringify(d), async: !1, complete: function (c) {
                    c = JSON.parse(c.responseText).json.json.units.colonize_ship.duration_without_bonus;
                    f = Math.min(f || c, c);
                }
            });
        });
        sessionStorage.setItem(a, JSON.stringify({
            timestamp: Timestamp.server() + 600, CsTime: f
        }));
        return f;
    }
    
    function AddBtn(a, b) {
        var d = b || "",
                g = $("<div/>", {
                    "class": "button_new",
                    id: a + d,
                    name: a,
                    style: "float: right; margin: 2px; ",
                    rel: "#" +
                            d
                }).button({
            caption: a
        });
        return g;
    }

    function CreateReport(a) {
        var b = a.getName();
        if (0 < a.getJQElement().find($("#report_arrow")).length &&
                0 == a.getJQElement().find($("#ROOD" + b)).length &&
                (a.getJQElement().find($("#report_report div.game_list_footer")).append(AddBtn("ROOD", b).click(function () {

                    var $tempInput = $("<textarea>");
                    $("body").append($tempInput);
                    $tempInput.val(text).select();
                    try {
                        var successful = document.execCommand('copy');
                        var msg = successful ? 'successful' : 'unsuccessful';
                        setTimeout(function () {
                            HumanMessage.success("REPORT gekopieerd naar clipboard");
                        }, 1);
                        console.log('Copying text command was ' + msg);
                    } catch (err) {
                        setTimeout(function () {
                            HumanMessage.error("Mislukt");
                        }, 1);
                        console.log('Oops, unable to copy');
                    }
                    $tempInput.remove();

                })))) {
            switch (a.getJQElement().find($("div#report_arrow img")).attr("src").replace(/.*\/([a-z_]*)\.png.*/, "$1")) {
                case "take_over":
                    c = {};
                    c.sender = {};
                    c.receiver = {};
                    c.sender.town = JSON.parse(atob(a.getJQElement().find($("#report_sending_town")).find($("li.town_name a,.gp_town_link")).attr("href").substr(1)));
                    c.receiver.town = JSON.parse(atob(a.getJQElement().find($("#report_receiving_town")).find($("li.town_name a,.gp_town_link")).attr("href").substr(1)));
                    c.sender.owner = JSON.parse(atob(a.getJQElement().find($("#report_sending_town")).find($("li.town_owner a,.gp_player_link")).attr("href").substr(1)));
                    c.receiver.owner = JSON.parse(atob(a.getJQElement().find($("#report_receiving_town")).find($("li.town_owner a,.gp_player_link")).attr("href").substr(1)));
                    c.sender.ally = a.getJQElement().find($("#report_sending_town")).find($("li.town_owner_ally a")).html().trim();
                    c.receiver.ally = a.getJQElement().find($("#report_receiving_town")).find($("li.town_owner_ally a")).html().trim();
                    c.hero = {};
                    c.hero.name = MM.checkAndPublishRawModel("Town", {id: c.receiver.town.id}).getHeroes()[0].getName();
                    c.hero.level = MM.checkAndPublishRawModel("Town", {id: c.receiver.town.id}).getHeroes()[0].getLevel();
                    var aa = ITowns.getTown(c.receiver.town.id);
                    c.wall = aa.buildings().getBuildingLevel("wall");
                    c.phalanx = aa.researches().get("phalanx");
                    c.ram = aa.researches().get("ram");
                    c.god = aa.god();
                    c.time = Date.parseDate(a.getJQElement().find($("#report_date")).html());

                    c.rtcstime = "~" + readableUnixTimestamp(parseInt(CsTime(JSON.parse(atob(a.getJQElement().find($("#report_sending_town .gp_player_link")).attr("href").substr(1))).id, JSON.parse(atob(a.getJQElement().find($("#report_receiving_town .gp_town_link")).attr("href").substr(1))))), "no_offset");

                     try {
                        c.rtrevinfo = MM.checkAndPublishRawModel("CommandsMenuBubble", {
                            id: Game.player_id
                        }).get("revolts").in_current_town;
                    } catch (e) {
                        c.rtrevinfo = ""
                    }                   
                    c.rtrevolt = "";
                    try {
                        $.each(c.rtrevinfo.arising, function (e, a) {
                            var b = readableUnixTimestamp(a.finished_at, "player_timezone", {extended_date: !1, with_seconds: !1});
                            if(-1 < c.time.indexOf(b)) (c.rtrevolt = readableUnixTimestamp(a.started_at, "player_timezone", {extended_date: !0, with_seconds: !0}));
                        });
                      $.each(c.rtrevinfo.running, function (e, a) {
                            var b = readableUnixTimestamp(a.finished_at, "player_timezone", { extended_date: !1, with_seconds: !1});
                            if(-1 < c.time.indexOf(b)) (c.rtrevolt = readableUnixTimestamp(a.started_at, "player_timezone", {extended_date: !0, with_seconds: !0}));
                        });
                    } catch (e) {
                        c.rtrevolt = "";
                    }

                    t = new Date(c.time);
                    var t1 = t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds();
                    t = new Date(c.time + 43200000);
                    var t2 = t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds();
                    t = new Date(c.time + 86400000);
                    var t3 = t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds();



                    text = "Titel: [town]" + c.receiver.town.id + "[/town] / f2 " + t1 + "\n" +
                            "" + "\n" +
                            "Stadsnaam eigenaar:[town]" + c.receiver.town.id + "[/town]" + "\n" +
                            "Naam aanvaller:[player]" + c.sender.owner.name + "[/player]" + "\n" +
                            "Naam alliantie: [ally]" + c.sender.ally + "[/ally]" + "\n" +
                            "Level muur: " + c.wall + "\n" +
                            "Held: " + c.hero.name + " / " + c.hero.level + "\n" +
                            "God: " + c.god + "\n" +
                            "Falanx: " + (c.phalanx ? "Ja" : "Nee") + "\n" +
                            "Stormram: " + (c.ram ? "Ja" : "Nee") + "\n" +
                            "Gewenste os: BIR " + "\n" +
                            "" + "\n" +
                            "Start fase 2: " + t2 + "\n" +
                            "Einde fase 2: " + t3 + "\n" +
                            "" + "\n" +
                            "Kolo tijd: " + c.rtcstime + "\n" +
                            "" + "\n" +
                            "Opstandsrapport:" + "\n";



                    console.log("take_over", c);
                    break;
            }

        }
    }

    $(document).ajaxComplete(function (d,
            h, c) {
        if ("undefined" != typeof c) {
            d = c.url.replace(/\/game\/(.*)\?.*/, "$1");
            if ("frontend_bridge" == d) {
            } else
                $.each(Layout.wnd.getAllOpen(), function (c, d) {
                    var e = Layout.wnd.GetByID(d.getID());
                    switch (e.getController()) {
                        case "report":
                            switch (e.getContext().sub) {
                                case "report_view":
                                    CreateReport(e);
                            }
                            break;
                    }
                });
        }
    });

    Date.parseDate = function (myDate) {
        var parts, date, time, dt, ms;

        parts = myDate.split(/[T ]/); // Split on `T` or a space to get date and time
        date = parts[0];
        time = parts[1];

        dt = new Date();

        parts = date.split(/[-\/]/);  // Split date on - or /
        dt.setFullYear(parseInt(parts[2], 10));
        dt.setMonth(parseInt(parts[1], 10) - 1); // Months start at 0 in JS
        dt.setDate(parseInt(parts[0], 10));

        parts = time.split(/:/);    // Split time on :
        dt.setHours(parseInt(parts[0], 10));
        dt.setMinutes(parseInt(parts[1], 10));
        dt.setSeconds(parseInt(parts[2], 10));

        ms = dt.getTime();
        return ms;
    };

});

