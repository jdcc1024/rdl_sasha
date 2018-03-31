// var myJSON = [ { team: 'asdf', players: ['a', 'b', 'c']},
// 			 	{ team: 'fdsa', players: ['x','y','z'] }];

// var myTeams = [
// "5 Jerks and a Seaman",
// "Bae",
// "Corgi Lovers",
// "Deez Ballz",
// "Dodgezillas",
// "Dodgy Style",
// "Eva's Emus",
// "FEEL MY THUNDA",
// "Machobear",
// "Maybe It’s Maybelline",
// "MMPR",
// "Motherduckers",
// "No Basketball",
// "Not In The Face",
// "Owen's Ostriches",
// "Phoebe and Friends",
// "River Rats Dodgeball",
// "Soju Bomb",
// "Team Sour Kris",
// "The UpsideDown",
// "We Thought This Was Speed Dating",
// "Wonderbread VII -- the Dodge Awakens",
// "YAM BAM BAM",
// "Zero Fox Given"];


// Team Structure:
/* { name: X,
	 players [ {name: Y, waiver: true, waiverDate: yyyymmdd}], 
	 	playHistory: [week1, week2] 
 	 	{
 	 		week: #,
			gym: name,
			opponents: [a,b,c],
			scores: [ { opponent: a, score: [w, l, w, w, w, l] } ]
			spirit: #
		}
	stats: {
		gyms: 		[ {blundell, 1}, {grauer, 3} ],
		opponents: 	[{a,1}, {b,3}]
		score: 		{ gamesPlayed: #, gamesWon, #}
		spirit: 	#
	}
 	}
 */
var fs = require('fs');

var s8History = fs.readFileSync(".\\s8_gyms.txt", "utf8");
// console.log(s8History);

var lines = s8History.split("\r\n");
// console.log(lines);


var myTeams = [];

function addHistory(week, gym, opponents, scores, spirit) {
	var record = {
		'week': week,
		'gym': gym,
		'opponents': opponents, // []
		'scores': scores, // []
		'sprit': spirit
	};
	return record;
};

function addScore(scores, opponent, winloss) {
	// win loss: [1, 0, 1, 1, 0, 1]
	if (scores.get(opponent)) {
		console.log("Already entered scores in for this matchup");
		return;
	}
	scores.set(opponent, winloss);
	return scores; 
};

var getTeam = function(teamName) {
	return myTeams.find(function (curTeam) {
		if (curTeam.name == teamName) {
			// console.log("Found team: " + curTeam.name);
			return curTeam;
		}
	});
};

function addTeam(teamName) {

	if (getTeam(teamName) != undefined) return;

	console.log("Adding Team: " + lines[i]);
	// var playHistory = new Map(); // { week: 1, opponents: [a,b,c], score: #wins }
	var scoreStats = { 'gamesPlayed': 0, 'gamesWon': 0 };
	var stats = {
		'gyms': new Map(),
		'opponents': new Map(),
		'score': {},
		'spirit': 0
	} 
	var playHistory = []; 
	var players = [];


	// var team = {'name': teamName, 'opponents': opponents };
	var team = {
		'name': teamName,
		'players': players,
		'playHistory': playHistory,
		'stats' : stats
	}
	myTeams.push(team);
};

function initStats(teamName) {
	console.log("Initializing " + teamName);
	var curTeam = getTeam(teamName);
	myTeams.forEach(function(opponent) {
		var opponentName = opponent.name;
		curTeam.stats.opponents.set(opponentName, 0);
	});	
}

// addTeam('a');
// addTeam('b');
// addTeam('c');
// addTeam('d');
// addTeam('e');
// addTeam('f');

var week1 = [
			{'gym': 'Blundell', 'teams' : ["a", "b", "c"]},
			{'gym': 'Grauer',   'teams' : ["d", "e", "f"]}];

var week1 = [
			{'gym':'BlundellA', 'teams' : []
			}]


var week2 = [
			{'gym': 'Blundell', 'teams' : ["a", "e", "f"]},
			{'gym': 'Grauer',   'teams' : ["d", "c", "b"]}];


var week3 = [
			{'gym': 'Blundell', 'teams' : ["a", "d", "b"]},
			{'gym': 'Grauer',   'teams' : ["f", "e", "c"]}];

var weeks = [week1, week2, week3];
weeks = [];

var playHistory = [];
// map set, map get



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

function encounterOpponent(team, opponentName) {
	var encounters = team.stats.opponents.get(opponentName);
	if (encounters == undefined) {
		// A new challenger appears!
		team.stats.opponents.set(opponentName, 1);
	} else {
		team.stats.opponents.set(opponentName, encounters + 1);
	}
	// console.log(team.name + " has encountered " + opponentName + " " + team.opponents.get(opponentName) + " times");
};

function getHistory(team) {
	if (team.name == "") { return; }
	var totalGames = 0;
	team.stats.opponents.forEach(function(encounters, enemy) {
		// console.log(enemy);
		// console.log(encounters);
		// console.log("\t" + team.name + " has played " + enemy + " " + encounters + " times");
		console.log("\t" + enemy + "\t" + encounters);
		totalGames += encounters;
	});
	console.log("Team " + team.name + " has played " + (totalGames/3) + " nights total\n");
}

var weekCount = 0; 
for (var i = 1; i < lines.length; i++) {	
	if (lines[i].includes("Week")) {
		weekCount++;
		console.log("FOUND WEEK " + weekCount);
	} else if (lines[i] == "" && !lines[i+1].includes("Week") ) {
		var curWeek = [
				{'gym': weekCount, 'teams' : [ lines[i+1], lines[i+2], lines[i+3], lines[i+4] ]},
				{'gym': weekCount, 'teams' : [ lines[i+5], lines[i+6], lines[i+7], lines[i+8] ]}
				];
		weeks.push(curWeek);
	} else {		
		addTeam(lines[i]);
	}
}

myTeams.forEach(function(team) { 
	initStats(team.name);
});


// weeks.forEach(function(timeslots) {
for (var i = 0; i < weeks.length; i++) {
	var timeslots = weeks[i];
	timeslots.forEach(function(night) {
		// console.log(night.gym);
		// console.log(night.teams);

		night.teams.forEach(function(team) {
			// o(n^2
			var curTeam = getTeam(team);
			night.teams.forEach(function(otherTeam) {
				var oTeam = otherTeam;
				if (team != otherTeam) {
					encounterOpponent(curTeam, otherTeam);
				}
			});
		});
	});
};

console.log("\nPrinting Game History. Number of Teams: " + (myTeams.length - 1));
myTeams.forEach(function(team) { 
	getHistory(team);
});
