// We need this to build our post string
var fs = require('fs');
var request = require('request');

var sqlQuery = "select%20*";
var orderBy  = "select%20*%20order%20by%20K";

var urlQuery = "gviz/tq?tq=" + sqlQuery;

var rosterHash = "1uIGWI3CzdNPlXPgHvt1hLBu9-BLSAUK32AsGZoFDVlI";
var waiverHash = "1QOFmQjSvypT_pfdu_lrE9GXHcde8bJ0KayzZW-IaZ3c";
var signedHash = "1KPtNdoPCj6Dop2NOXNrVTJBESaer5PFRG9S1tQ6L4LQ";
// https://docs.google.com/spreadsheets/d/1QOFmQjSvypT_pfdu_lrE9GXHcde8bJ0KayzZW-IaZ3c/gviz/tq?q=select%20*
// https://docs.google.com/spreadsheets/d/1QOFmQjSvypT_pfdu_lrE9GXHcde8bJ0KayzZW-IaZ3c/edit?usp=sharing
// https://docs.google.com/spreadsheets/d/1KPtNdoPCj6Dop2NOXNrVTJBESaer5PFRG9S1tQ6L4LQ/edit?usp=sharing

// var rosterURL = 'https://docs.google.com/spreadsheets/d/' + rosterHash + '/' + urlQuery;
var waiverURL = 'https://docs.google.com/spreadsheets/d/' + waiverHash + '/' + urlQuery;
var signedURL = 'https://docs.google.com/spreadsheets/d/' + signedHash + '/' + urlQuery; //'/gviz/tq?tq=' + orderBy;
var rosterURL = 'https://docs.google.com/spreadsheets/d/' + signedHash + '/' + urlQuery + '&gid=927592039'; //'/gviz/tq?tq=' + orderBy;

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

    var rosterPromise    = readSheetByURL(rosterURL);
    var signaturePromise = readSheetByURL(signedURL);

    Promise.all([signaturePromise, rosterPromise]).then((myResult) => {
        var signedJSON = myResult[0];
        var rosterJSON = myResult[1];

        var waiverList  = pullWaivers(signedJSON);
        var teamRosters = pullRosters(rosterJSON);
        // compare teamRosters with waiver players
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
                console.log("Missing from Roster: " + player);
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

function pullWaivers(waiverJSON) {
	var signedPlayers = [];

    var teamList = [];
    var playerList = [];
    var columnInfo = waiverJSON.table.col;
    var waiverInfo = waiverJSON.table.rows;

    waiverInfo.forEach(function(entry) {
        var firstName = entry.c[1].v;
        var lastName  = entry.c[2].v;

        var playerName = firstName.trim() + " " + lastName.trim();

    	if (!signedPlayers.includes(playerName)) {
    		signedPlayers.push(playerName.toUpperCase().trim());
    	}
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

function readSheetByURL(googleSheetURL) {
    return new Promise(function(resolve, reject) {
        console.log("Pulling data from " + googleSheetURL);
        request.get(
            googleSheetURL,
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var jsonResp = pullGVizJSON(body);                
                    resolve(jsonResp);

                } else {
                    reject(error);
                }
            }
        )
    })
};

main();
