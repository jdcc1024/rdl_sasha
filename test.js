// We need this to build our post string
var fs = require('fs');
var request = require('request');

var sqlQuery = "select%20*";
var orderBy  = "select%20*%20order%20by%20K";

var urlQuery = "gviz/tq?tq=" + sqlQuery;

var rosterHash = "1uIGWI3CzdNPlXPgHvt1hLBu9-BLSAUK32AsGZoFDVlI";
var waiverHash = "1QOFmQjSvypT_pfdu_lrE9GXHcde8bJ0KayzZW-IaZ3c";
var signedHash = "1KPtNdoPCj6Dop2NOXNrVTJBESaer5PFRG9S1tQ6L4LQ";
var dinoteamHash = "16hSvEbxUTS0XlRUz-d0mjxoVcRQgeCjYVDG-RQybrLM";
// https://docs.google.com/spreadsheets/d/1QOFmQjSvypT_pfdu_lrE9GXHcde8bJ0KayzZW-IaZ3c/gviz/tq?q=select%20*
// https://docs.google.com/spreadsheets/d/1QOFmQjSvypT_pfdu_lrE9GXHcde8bJ0KayzZW-IaZ3c/edit?usp=sharing
// https://docs.google.com/spreadsheets/d/1KPtNdoPCj6Dop2NOXNrVTJBESaer5PFRG9S1tQ6L4LQ/edit?usp=sharing
// https://docs.google.com/spreadsheets/d/16hSvEbxUTS0XlRUz-d0mjxoVcRQgeCjYVDG-RQybrLM/edit?usp=sharing
// https://docs.google.com/spreadsheets/d/16hSvEbxUTS0XlRUz-d0mjxoVcRQgeCjYVDG-RQybrLM/edit?usp=sharing

// var rosterURL = 'https://docs.google.com/spreadsheets/d/' + rosterHash + '/' + urlQuery;
var waiverURL = 'https://docs.google.com/spreadsheets/d/' + waiverHash + '/' + urlQuery;
var signedURL = 'https://docs.google.com/spreadsheets/d/' + signedHash + '/' + urlQuery; //'/gviz/tq?tq=' + orderBy;
var season1waiverURL = 'https://docs.google.com/spreadsheets/d/' + signedHash + '/' + urlQuery + '&gid=1787672357';//'/gviz/tq?tq=' + orderBy;
var rosterURL = 'https://docs.google.com/spreadsheets/d/' + signedHash + '/' + urlQuery + '&gid=927592039'; //'/gviz/tq?tq=' + orderBy;
var dinoteamURL = 'https://docs.google.com/spreadsheets/d/' + dinoteamHash + '/' + urlQuery + '&gid=377382517';

// List of Players, Teams, Waiver data
var seasondata = {};

// parse google gviz response data
function pullGVizJSON(gQueryResp) {
        var googleRespRegex = /setResponse\((.*)\);/g;
        var cleanJSON = googleRespRegex.exec(gQueryResp);
        jsonResp = JSON.parse(cleanJSON[1], function(key, value) {
            return value == null 
                ? "" 
                : value;
        });
        return jsonResp;
};

function main() {
    console.log("Pulling Waiver Info");

    // var rosterPromise    = readSheetByURL(rosterURL);
    var signaturePromise = readSheetByURL(signedURL);
    // var dinoteamPromise = readSheetByURL(dinoteamURL);
    var s1waiverPromise = readSheetByURL(season1waiverURL);

    //rosterPromise, dinoteamPromise, 
    Promise.all([signaturePromise, s1waiverPromise]).then((myResult) => {
        console.log("All Responses back");
        console.log(myResult.length);
        console.log(myResult);

        var signedJSON = myResult[0];
        var rosterJSON = myResult[1];
        var dinoteamJSON = myResult[2];
        var s1waiverJSON = myResult[1];

        // var dinosaurs = pullDinoteams(dinoteamJSON);
        // return;

        var dinosaurs = pullDinoteams(dinoteamJSON);

        var playerTeamMap  = pullWaivers(signedJSON);

        // console.log(playerTeamMap);
        // playerTeamMap.forEach(function(ptm) {
        //     console.log(ptm);

        // });

        var waiverList = Array.from(playerTeamMap.keys());
        console.log(waiverList);
        dinosaurs.forEach(function(dinoPlayer){ 
            var name = dinoPlayer.toUpperCase();

            if (waiverList.includes(name)) {
                console.log(name + " SIGNED");
            } else {
                console.log(" --------- " + name + " HAS NOT SIGNED");
            }

        });

        return;
        var teamRosters = pullRosters(rosterJSON);
        var s1players = pullS1Players(s1waiverJSON);

        console.log(playerTeamMap);
        var playerKeys = playerTeamMap.keys();

        s1players.forEach(function(s1player) {
            if (playerTeamMap.get(s1player) != null) {
                console.log("FOUND " + s1player);
            }
        });

        // compare teamRosters with waiver players

        return;
        var waiverList = Array.from(playerTeamMap.keys());
        // console.log(waiverList);
        
        teamRosters.forEach(function(team) {
        	console.log("\n" + team.team);
        	var players = team.players;
        	players.forEach(function(curPlayer) {
                curPlayer = curPlayer.toUpperCase().trim();
                playerIndex = waiverList.indexOf(curPlayer);
        		if (curPlayer != 'undefined' && playerIndex > -1) {
                    waiverList[playerIndex] = null;
        			console.log("\t" + curPlayer + " signed!");
        		}  else {
        			console.log("\t----" + curPlayer + " has not signed their waiver");
        		}
        	});            
        });
        // Finished scanning signatures, see who is not in a roster, or has double signed! :'(
        // TO-DO: Add feature to pull teamname of player who thinks they are on team X
        console.log("\n Players who double signed, or are not in an official roster");
        waiverList.forEach(function(player) {
            if (player != undefined) {
                // Add this player who hasn't signed, and add check their corresponding signed team

                var team = playerTeamMap.get(player);
                console.log("Missing from Roster: " + player + ", \t\tteam: " + team);
            }
        });
    });
};

function matchTeam(arr, teamName) { 
    return arr.some(function(entry) {
    	var curTeam = entry.team;
        // curTeam == teamName ? true : false;
        if (curTeam == teamName) {
        	return true;
        } else { 
        	return false;
        }
    });
};

function pullS1Players(s1waiverJSON) {
    console.log(s1waiverJSON);
    var playerList = [];

    var s1rows = s1waiverJSON.table.rows;
    s1rows.forEach(function(s1player) { 
        var firstName = s1player.c[0].v;
        var lastName = s1player.c[1].v;
        var email = s1player.c[2].v;

        var playerName = firstName.trim() + " " + lastName.trim();
        playerName = playerName.toUpperCase();
        playerList.push(playerName);
    })

    return playerList;
}

function pullWaivers(waiverJSON) {
	var signedPlayers = new Map();

    var teamList = [];
    var playerList = [];
    var columnInfo = waiverJSON.table.col;
    var waiverInfo = waiverJSON.table.rows;

    waiverInfo.forEach(function(entry) {
        // if signed date matches criteria

        var firstName = entry.c[1].v;
        var lastName  = entry.c[2].v;

        var teamName  = entry.c[4].v;

        var playerName = firstName.trim() + " " + lastName.trim();
        var playerName = playerName.toUpperCase().trim();

        if (!signedPlayers.has(playerName)) {
            signedPlayers.set(playerName, teamName);
        }
        else {
            console.log("Found duplicate player!! " + playerName + "\t\t" + teamName);
        }
    	// if (!signedPlayers.includes(playerName)) {
    	// 	signedPlayers.push(playerName.toUpperCase().trim());
    	// }
    });

    return signedPlayers;

};

function pullRosters(rosterJSON) {
    var teamStruct = [];
    /*
    [ { teamName: 'x', 
        players: [{ playerName: y, signed: null}] 
    } ]
    */    
    var columnInfo = rosterJSON.table.col;
    var teamInfo   = rosterJSON.table.rows;

    teamInfo.forEach(function(entry) {
        // Eventually add logic to determine correct column
        var teamName  = entry.c[0].v;
        var firstName = entry.c[1].v;
        var lastName  = entry.c[2].v;

        firstName = (firstName == undefined) ? "INCOMPLETE" : firstName;
        lastName  = (lastName == undefined)  ? "ROSTER"     : lastName;
        var playerName = firstName.trim() + " " + lastName.trim();

        if (!matchTeam(teamStruct, teamName) && teamName != 'Team') {
            var teamJson = {team: teamName, players: []};
            teamStruct.push(teamJson);
        }

        teamStruct.forEach(function(curTeam) {
            if (curTeam.team == teamName) {
                if (!curTeam.players.includes(playerName)) {
                    // console.log("New player found! " + playerName);
                    curTeam.players.push(playerName.trim());
                }
            }
        });
    });
    return teamStruct;
};

function loadGymData() {

    var pastData = [];
    var week1 = [];
    week1.push({timeslot: "1", gym: "Garden City", side: "a", teams: [1,2,3,4]});
    week1.push({timeslot: "1", gym: "Garden City", side: "b", teams: [5,6,7,8]});
    week1.push({timeslot: "2", gym: "Garden City", side: "a", teams: [9,10,11,12]});
    week1.push({timeslot: "2", gym: "Garden City", side: "b", teams: [13,14,15,16]});

    var week2 = [];
    week2.push({timeslot: "1", gym: "Garden City", side: "a", teams: [1,2,3,4]});
    week2.push({timeslot: "1", gym: "Garden City", side: "b", teams: [5,6,7,8]});
    week2.push({timeslot: "2", gym: "Garden City", side: "a", teams: [9,10,11,12]});
    week2.push({timeslot: "2", gym: "Garden City", side: "b", teams: [13,14,15,16]});


    return pastData;
}

function pullDinoteams(dinoJSON) {
    var teamStruct = [];
    /*
    [ { teamName: 'x', 
        players: [{ playerName: y, signed: null}] 
    } ]
    */    
    var columnInfo = dinoJSON.table.col;
    var playerInfo   = dinoJSON.table.rows;
    var dinoPlayers = [];

    var vdlSchedule = [];
    vdlSchedule.push({ teamName: "Misfit Mondays",      timeslot: 1} );
    vdlSchedule.push({ teamName: "Dumbledore's Army",   timeslot: 1} );
    vdlSchedule.push({ teamName: "McDodgin",            timeslot: 1} );
    vdlSchedule.push({ teamName: "Awkward Penguins",    timeslot: 2} );
    vdlSchedule.push({ teamName: "Lil Ninja",           timeslot: 1} );
    vdlSchedule.push({ teamName: "Team China",          timeslot: 2} );
    vdlSchedule.push({ teamName: "Team Asia",           timeslot: 2} );
    vdlSchedule.push({ teamName: "Team Philippines",    timeslot: 1} );
    vdlSchedule.push({ teamName: "Team China 2",        timeslot: 2} );
    vdlSchedule.push({ teamName: "mushroom MUSHROOM!!", timeslot: 2} );
    vdlSchedule.push({ teamName: "Throbocops",          timeslot: 2} );
    vdlSchedule.push({ teamName: "(o) (o)",             timeslot: 1} );

    var vdlScheduleW10 = [];
    vdlScheduleW10.push({ teamName: "Misfit Mondays",      timeslot: 1} );
    vdlScheduleW10.push({ teamName: "Dumbledore's Army",   timeslot: 2} );
    vdlScheduleW10.push({ teamName: "McDodgin",            timeslot: 1} );
    vdlScheduleW10.push({ teamName: "Awkward Penguins",    timeslot: 2} );
    vdlScheduleW10.push({ teamName: "Lil Ninja",           timeslot: 1} );
    vdlScheduleW10.push({ teamName: "Team China",          timeslot: 2} );
    vdlScheduleW10.push({ teamName: "Team Asia",           timeslot: 2} );
    vdlScheduleW10.push({ teamName: "Team Philippines",    timeslot: 1} );
    vdlScheduleW10.push({ teamName: "Team China 2",        timeslot: 2} );
    vdlScheduleW10.push({ teamName: "mushroom MUSHROOM!!", timeslot: 1} );
    vdlScheduleW10.push({ teamName: "Throbocops",          timeslot: 2} );
    vdlScheduleW10.push({ teamName: "(o) (o)",             timeslot: 1} );


    var teamCount = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    var teamComposition = [];
    for (var i = 0; i <= 16; i++) {
        teamComposition.push( {teamName: i, players: [], restrictions: [], skillLevel: 0} );
    }

    var playerRestrictionList = [];

    console.log("");
    // console.log(playerInfo); 
    playerInfo.forEach(function(entry) {
        // Eventually add logic to determine correct column
        var firstName = entry.c[0].v;
        var lastName  = entry.c[1].v;
        var dinoTeam  = entry.c[2].v;
        var vdlTeamName = entry.c[3].v;
        var restrictions = entry.c[4].v;
        var skillLevel = entry.c[5].v;
        var teamRestriction = vdlTeamName;// + ":" + restrictions;

        if (firstName == "Firstname") return;
        // firstName = (firstName == undefined) ? "INCOMPLETE" : firstName;
        // lastName  = (lastName == undefined)  ? "ROSTER"     : lastName;
        var playerName = firstName.trim() + " " + lastName.trim();
        dinoPlayers.push(playerName);
        // console.log(teamComposition[dinoTeam].skillLevel + skillLevel);
        teamComposition[dinoTeam].skillLevel = teamComposition[dinoTeam].skillLevel + skillLevel;
        var playerData = {name: playerName, vdlTeam: vdlTeamName, restrictions: restrictions};
        teamComposition[dinoTeam].players.push(playerData);
        if (restrictions != "undefined:undefined" && restrictions != undefined) {

        }
        if (vdlTeamName != undefined) {
            console.log("\tVDL Team: " + vdlTeamName);
            teamComposition[dinoTeam].restrictions.push(vdlTeamName);
        }

        if (restrictions != undefined) {
            // console.log("Player: " + playerName + ",\tVDL Team: " + vdlTeamName + ",\tRestrictions: " + restrictions);
            if (vdlTeamName != "") {
                // console.log(playerName + " plays on " + vdlTeamName);
            }

            if (restrictions.includes("player")) {
                console.log(playerName + "must play with " + restrictions);                           
                teamComposition[dinoTeam].restrictions.push(restrictions);

            }
            if (restrictions.includes("opposite")) {
                // console.log("Opposite Restriction!");
                vdlSchedule.forEach( function(vdlTeam) {
                    if (vdlTeam.teamName == vdlTeamName) {
                        if (vdlTeam.timeslot == 1) {
                            console.log(playerName + "\t(" + vdlTeamName + ") must play in timeslot #2");
                        } else if (vdlTeam.timeslot == 2) {
                            console.log(playerName + "\t(" + vdlTeamName + ") must play in timeslot #1");
                        }
                    }
                    return;
                });
            }
            if (restrictions.includes("timeslot")) {
                console.log(playerName + "\t(" + vdlTeamName + ") must play on " + restrictions);            
                teamComposition[dinoTeam].restrictions.push(restrictions);        
            }
        }
    });

    // return; 
    // console.log(teamCount);

    // console.log("\n\n\n");
    // for (var i = 0; i < teamCount.length; i++) {
    //     console.log("Team " + i + " has a skill level of " + teamCount[i]);
    // }

    for (var i = 0; i < teamComposition.length; i++) {
        console.log(teamComposition[i]);
        console.log("\n");
    }

    for (var i = 0; i < teamComposition.length; i++) {
        // console.log(teamComposition[i].teamName + teamComposition[i].players[0] + ",\t" + teamComposition[i].restrictions);
        console.log(teamComposition[i].teamName + ",\t" + teamComposition[i].restrictions);

        // console.log("Size of Team: " + teamComposition.players.length);
        if (teamComposition[i].players == undefined) {
            continue;
        }

        for (var j = 0; j < teamComposition[i].players.length; j++) {
            var curPlayerName = teamComposition[i].players[j].name;
            var curVDLTeam = teamComposition[i].players[j].vdlTeam;
            var curRestriction = teamComposition[i].players[j].restrictions;

            if (curRestriction == undefined) {
                curRestriction = "none";
            }

            // Scan for VDL Team
            if (curVDLTeam != undefined) {
                vdlScheduleW10.forEach(function(mondayVDLteam) {
                    if (mondayVDLteam.teamName == curVDLTeam) {
                        if (mondayVDLteam.timeslot == 1) {
                            console.log(curPlayerName + "\t(" + curVDLTeam + ") must play in timeslot #2");
                        } else if (mondayVDLteam.timeslot == 2) {
                            console.log(curPlayerName + "\t(" + curVDLTeam + ") must play in timeslot #1");
                        }
                    }                    
                });
            }
            // Scan for other
            if (curRestriction.includes("timeslot")) {
                console.log(curPlayerName + "\t(" + curVDLTeam + ") must play in " + curRestriction);
            }
            if (curRestriction.includes("player")) {
                console.log(curPlayerName + "\t(" + curVDLTeam + ") must play with " + curRestriction);
            }
        }
        console.log("----------------------");
    }
    return dinoPlayers;
};

function readSheetByURL(googleSheetURL) {
    return new Promise(function(resolve, reject) {
        console.log("Pulling data from " + googleSheetURL);
        request.get(
            googleSheetURL,
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log("Data returned from " + googleSheetURL);
                    var jsonResp = pullGVizJSON(body);                
                    resolve(jsonResp);

                } else {
                    // console.log(error);
                    reject(error);
                }
            }
        )
    })
};

main();
