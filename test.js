// We need this to build our post string
var fs = require('fs');
var request = require('request');

var sqlQuery = "select%20*";
var orderBy = "select%20*%20order%20by%20K";

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
        // console.log(cleanJSON);
        return jsonResp;
};

function main() {
    console.log("Pulling Waiver Info");

    var rosterPromise = readSheetByURL(rosterURL);
    var signaturePromise = readSheetByURL(signedURL);

    Promise.all([signaturePromise, rosterPromise]).then((myResult) => {
        // var signedJSON = myResult[0];
        var rosterJSON = myResult[1];

        // console.log(JSON.stringify(signedJSON));
        // console.log("\n\n" + JSON.stringify(rosterJSON));        

        var teamRosters = pullRosters(rosterJSON);
    });
};

function matchTeam(arr, teamName) { 
    // console.log(entry);

    // console.log(entry.team);
    // console.log(entry.team === teamName);
    return arr.some(function(entry) {
        console.log("----\n" + entry.team);
        console.log(teamName);
        console.log(entry.name == teamName);
        return entry.name == teamName;
        });
};

function pullRosters(rosterJSON) {
    var teamStruct = [];
    /*
    [ { teamName: 'x', 
        players: [{ playerName: y, signed: null}] 
    } ]
    */
    var teamList = [];
    var playerList = [];
    var columnInfo = rosterJSON.table.col;
    var teamInfo   = rosterJSON.table.rows;

    teamInfo.forEach(function(entry) {
        // Eventually add logic to determine correct column
        var teamName = entry.c[0].v;
        var playerName = entry.c[1].v + " " + entry.c[2].v;
        // console.log("Team: ", teamName);
        // console.log("Player: ", playerName);

        // if (!teamStruct.some(entry, matchTeam(entry, teamName))) {
            // console.log("New teamName found!" + teamName);
        if (!matchTeam(teamStruct, teamName)) {
            var teamJson = {team: teamName, players: []};
            teamStruct.push(teamJson);   
        }

        if (!teamList.includes(teamName)) {
            teamList.push(teamName);
        } 

        if (!playerList.includes(playerName)) {
            playerList.push(playerName);
        }       

        teamStruct.forEach(function(curTeam) {
            if (curTeam.team == teamName) {
                if (!curTeam.players.includes(playerName)) {
                    // console.log("New player found! " + playerName);
                    curTeam.players.push(playerName);
                }
            }
        });

    });

    // console.log(teamList);
    // console.log(teamStruct);
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
