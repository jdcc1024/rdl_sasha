// Notes and Junk

// Pull signed data
// var signaturePromise = new Promise(function(resolve, reject) {
//     console.log("Pulling Signatures!");
//     request.get(
//         signedURL,
//         function (error, response, body) {
//             if (!error && response.statusCode == 200) {
//                 // console.log(body + "\n ---------- ");
//                 var jsonResp = pullGVizJSON(body);                
//                 // console.log(" ------- ");
//                 // var columnInfo = jsonResp.table.col;
//                 // var teamInfo   = jsonResp.table.rows;

//                 // teamInfo.forEach(function(team) {
//                 //     var teamName = team.c[0].v;
//                 //     var player   = team.c[1].v + " " + team.c[2].v;

//                 //     // console.log("Team:\t\t" + teamName + ", \tPlayer:\t\t"  + player);
//                 // });
//                 resolve(jsonResp);

//             } else {
//                 reject(response.statusCode);
//             }
//         }
//     )
// });


// console.log("Send request to " + signedURL);
// var signedList = request.get(
//     signedURL,
//     function (error, response, body) {
//         if (!error && response.statusCode == 200) {
//             return;
//             // console.log(body + "\n ---------- ");
//             var jsonResp = pullGVizJSON(body);
//             console.log(" ------- ");
//             var columnInfo = jsonResp.table.col;
//             var teamInfo   = jsonResp.table.rows;

//             teamInfo.forEach(function(team) {
//                 var teamName = team.c[4].v;
//                 var player   = team.c[1].v + " " + team.c[2].v;
//                 var date     = team.c[0].f;                
//                 // console.log("Player:\t\t"  + player);
//                 var dateInfo = "Date:\t\t" + JSON.stringify(date, function(key, value) {
//                     if (value == undefined) {
//                         return "----- NOT SIGNED";
//                     } else if (value.includes("\n") || value.includes("\r")) {
//                         value = value.replace(/\r/g,   ",");
//                         value = value.replace(/\n/g,   ",");
//                         value = value.replace(/,,/g,   ",");
//                     }
//                     return value;
//                 });
//                 // console.log("Team:\t\t" + teamName + ", \t\tPlayer:\t"  + player + ", \t\tDate Signed:\t" + date);

//             });

//         }
//     }
// );

// console.log("Send request to " + waivListURL);
// var teamWaivList = request.get(
//     waivListURL,
//     function (error, response, body) {
//         if (!error && response.statusCode == 200) {
//             // console.log(body + "\n ---------- ");
//             var jsonResp = pullGVizJSON(body);
//             console.log(" ------- ");
//             var columnInfo = jsonResp.table.col;
//             var teamInfo   = jsonResp.table.rows;

//             teamInfo.forEach(function(team) {
//                 var teamName = team.c[0].v;
//                 var player   = team.c[1].v + " " + team.c[2].v;

//                 // console.log("Team:\t\t" + teamName + ", \tPlayer:\t\t"  + player);
//             });

//         }
//     }
// );


// scan columns and create datastructures
// function readJSON()

// console.log("Send request to " + rosterURL);
// var rosterList = request.get(
//     rosterURL,
//     function (error, response, body) {
//     	return;
//         if (!error && response.statusCode == 200) {
//             var jsonResp = pullGVizJSON(body);
//             console.log(" ------- ");
//             var columnInfo = jsonResp.table.col;
//             var teamInfo   = jsonResp.table.rows;

//             teamInfo.forEach(function(team) {
//             	var teamName = team.c[1].v;
//             	var captain  = team.c[2].v;
//             	var roster 	 = team.c[3].v;

//             	console.log("\nTeam:\t\t" + JSON.stringify(teamName));
//             	console.log("Captain:\t"  + JSON.stringify(captain))
//             	console.log("Roster:\t\t" + JSON.stringify(roster, function(key, value) {
//         			if (value.includes("\n") || value.includes("\r")) {
//         				value = value.replace(/\r/g,   ",");
//         				value = value.replace(/\n/g,   ",");
//         				value = value.replace(/,,/g,   ",");
//         			}
//         			return value;
//             	}));

//             });

//         }
// 	}
// );


// console.log("Send request to " + waiverURL);
// var waiverList = request.get(
//     waiverURL,
//     function (error, response, body) {
//         if (!error && response.statusCode == 200) {
//             return;
//             // console.log(body + "\n ---------- ");
//             var jsonResp = pullGVizJSON(body);
//             console.log(" ------- ");
//             var columnInfo = jsonResp.table.col;
//             var teamInfo   = jsonResp.table.rows;

//             teamInfo.forEach(function(team) {
//             	var teamName = team.c[0].v;
//             	var player   = team.c[1].v;
//             	var date 	 = team.c[4].f;

//             	console.log("\nTeam:\t\t" + JSON.stringify(teamName));
//             	console.log("Player:\t\t"  + JSON.stringify(player))
//             	console.log("Date:\t\t" + JSON.stringify(date, function(key, value) {
//             		if (value == undefined) {
//             			return "----- NOT SIGNED";
//             		} else if (value.includes("\n") || value.includes("\r")) {
//         				value = value.replace(/\r/g,   ",");
//         				value = value.replace(/\n/g,   ",");
//         				value = value.replace(/,,/g,   ",");
//         			}
//         			return value;
//             	}));

//             });

//         }
// 	}
// );



// function PostCode(codestring) {
//   // Build the post string from an object
//   var post_data = querystring.stringify({
//       'compilation_level' : 'ADVANCED_OPTIMIZATIONS',
//       'output_format': 'json',
//       'output_info': 'compiled_code',
//         'warning_level' : 'QUIET',
//         'js_code' : codestring
//   });

//   // An object of options to indicate where to post to
//   var post_options = {
//       host: 'closure-compiler.appspot.com',
//       port: '80',
//       path: '/compile',
//       method: 'POST',
//       headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//           'Content-Length': Buffer.byteLength(post_data)
//       }
//   };

//   // Set up the request
//   var post_req = http.request(post_options, function(res) {
//       res.setEncoding('utf8');
//       res.on('data', function (chunk) {
//           console.log('Response: ' + chunk);
//       });
//   });

//   // post the data
//   post_req.write(post_data);
//   post_req.end();

// }



// This is an async file read
// fs.readFile('LinkedList.js', 'utf-8', function (err, data) {
//   if (err) {
//     // If this were just a small part of the application, you would
//     // want to handle this differently, maybe throwing an exception
//     // for the caller to handle. Since the file is absolutely essential
//     // to the program's functionality, we're going to exit with a fatal
//     // error instead.
//     console.log("FATAL An error occurred trying to read in the file: " + err);
//     process.exit(-2);
//   }
//   // Make sure there's data before we post it
//   if(data) {
//     PostCode(data);
//   }
//   else {
//     console.log("No data to post");
//     process.exit(-1);
//   }
// });