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


var myTeams = [];

var addTeam = function(teamName) {
	var opponents = new Map();
	var team = {'name': teamName, 'opponents': opponents }
	myTeams.push(team);
};

addTeam('a');
addTeam('b');
addTeam('c');
addTeam('d');
addTeam('e');
addTeam('f');


var week1 = [
			{'gym': 'Blundell', 'teams' : ["a", "b", "c"]},
			{'gym': 'Grauer', 'teams' : ["d", "e", "f"]}];


var week2 = [
			{'gym': 'Blundell', 'teams' : ["a", "e", "f"]},
			{'gym': 'Grauer', 'teams' : ["d", "c", "b"]}];


var week3 = [
			{'gym': 'Blundell', 'teams' : ["a", "d", "b"]},
			{'gym': 'Grauer', 'teams' : ["f", "e", "c"]}];

var weeks = [week1, week2, week3];

var playHistory = [];
// map set, map get

var getTeam = function(teamName) {
	var match = myTeams.some(function (curTeam) {
		console.log("-----" + curTeam.name);
		console.log(teamName);
		if (curTeam.name == teamName) {
			console.log("HIT!");
			console.log(curTeam);
			return curTeam;
		}
	});
	return match;
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


weeks.forEach(function(timeslots) {
	timeslots.forEach(function(night) {
		// console.log(night.gym);
		// console.log(night.teams);
		night.teams.forEach(function(team) {
			console.log(team);
			// o(n^2)
			var curTeam = getTeam(team);
			console.log(curTeam);
			night.teams.forEach(function(otherTeam) {
				if (team != otherTeam) {

					// console.log(" ---- " + otherTeam);
				}
			});
		});
	});
});

// function searchTeams(arr, team) {
// 	return arr.some(function(e) {
// 		console.log("-----");
// 		var curTeam = e.team;
// 		console.log(e.team);
// 		console.log(team);
// 		console.log(curTeam == findTeam2);

// 		JSON.stringify(e.name) == team;
// 	})
// };

// console.log(searchTeams(myJSON,findTeam));
// console.log("---------");

// myJSON.forEach(function(entry) {
// 	var curTeam = entry.team;
// 	console.log(curTeam == findTeam);
// });