// jshint jquery: true, curly: true, bitwise: true, eqeqeq: true, immed: true, strict: true, unused: vars, devel: true, browser: true, newcap: false
"use strict";
const MAPS = {"USA":0, "AUS":1, };
var SVGNS = "http://www.w3.org/2000/svg",
	fontpt = 30,
	btns = [],
	playerDests = [],
	root = document.getElementById("root"),
	currentPlayer,
	map = MAPS.USA;


function init() {
	for (let i = 0; i < 6; i++) {
		btns[i] = button(100 + i * 120, 80, "#E01B1B", i + 1, 49, 61, () => setPlayers(i + 1));
	}
	map = MAPS.AUS;
}

function button(x, y, color, text, width, height, onClick) {
    var that = {},
    	pad = fontpt / 3;
    that.g = create(document.getElementById("buttons"), "g");
    that.rect = create(that.g, "rect");
    that.text = create(that.g, "text");
    that.get = function (name) {
        return that.rect.getAttributeNS(null, name);
    };
    that.set = function (name, val) {
        that.rect.setAttributeNS(null, name, val);
    };
    that.remove = function () {
        document.getElementById("buttons").removeChild(that.g);
    };
    set(that.text, "x", x + pad * 1.7, "y", y + fontpt + pad + 1, "font-size", fontpt, "font-family", "Segoe", "fill", "White");
    that.text.appendChild(document.createTextNode(text));
    that.set("fill", color);
    if(width) {
    	that.set("width", width);
    	that.set("height", height);
    } else {
    	that.set("width", that.text.getBBox().width + pad * 3);
    	that.set("height", that.text.getBBox().height + pad * 2);
    }
    that.set("x", x);
	that.set("y", y);
	
	if (onClick) {
		that.g.onclick = onClick;
	}
    return that;
}

function setPlayers(numPlayers) {
	btnsClear();
	for (let i = 0; i < numPlayers; i++) {
		btns[i] = button(100, 80 + i * 100, "#E01B1B", i + 1, 49, 61);
		let fullDest = destination();
		playerDests[i] = fullDest["city"];
		btns[i + numPlayers] = button(180, 80 + i * 100, "#111111", playerDests[i], undefined, undefined, () => newDestination(i, fullDest.region));
		btns[i + numPlayers * 2] = button(420, 80 + i * 100, "#00BA19", "$0")
	};
}

function newDestination(playerIdx, oldRegion, region) {
	let oldDest = playerDests[playerIdx],
		numPlayers = playerDests.length,
		fullDest;
	currentPlayer = playerIdx;
	fullDest = destination(oldRegion, region);
	if(fullDest === false)
		return;
	playerDests[playerIdx] = fullDest["city"];
	console.log(fullDest);
	btns[playerIdx + numPlayers].remove();
	btns[playerIdx + numPlayers] = button(180, 80 + playerIdx * 100, "#111111", playerDests[playerIdx], undefined, undefined, () => newDestination(playerIdx, fullDest.region));
	btns[playerIdx + numPlayers * 2].remove();
	btns[playerIdx + numPlayers * 2] = button(420, 80 + playerIdx * 100, "#00BA19", "$" + payout(oldDest, playerDests[playerIdx]) * 100);
}

function btnsClear() {
	for (var i = btns.length - 1; i >= 0; i--) {
		btns[i].remove();
	};
}

function selectRegion(evt) {
	var region = regionFromCode(evt.target.attributes.id.value);
	set(document.getElementById("map"), "visibility", "hidden");
	newDestination(currentPlayer, false, region);
}
/*****************
 utility functions
******************/

function roll(dice = 1) {
	var result = 0;
	for (var i = 0; i < dice; i++) {
		result += Math.floor(Math.random() * 6) + 1;
	};
	return result;
}

function isEven() {
	return roll() % 2;
}

function create(parent, type, id) { //id is optional
    var element = document.createElementNS(SVGNS, type);
    if (typeof parent === 'string') {
        parent = document.getElementById(parent);
    }
    if (id) {
        set(element, "id", id);
    }
    parent.appendChild(element);
    return element;
}

function set(element, attr1, val1, etc) {  //after element, attribute and value alternate
    var i;
    for (i = 1; i < arguments.length; i += 2) {
        element.setAttributeNS(null, arguments[i], arguments[i + 1]);
    }
    return element;
}

function payout(city1, city2) {
	if (map === MAPS.AUS) {
		let r = payoutAUS(city1, city2);
		if (r === undefined) {
			return payoutAUS(city1, city2);
		}
		return r;
	}
	var payouts = {
		"San Francisco": {
			"Los Angeles": 124,
			"Sacramento": 54,
			"Billings": 200
		},
		"Los Angeles": {
			"Sacramento": 130,
			"Billings": 230
		},
		"Billings": {
			"Sacramento": 170
		}
	};
	if(payouts[city1] !== undefined && payouts[city1][city2] !== undefined) {
		return payouts[city1][city2];
	} else {
		return payouts[city2][city1];
	}
	
}

function destination(previous, region) {

	if (map == MAPS.AUS) {
		return destinationAUS(previous, region);
	}

	var roll1,
		roll2,
		dest;
	if(!region) {
		roll1 = roll();
		roll2 = roll(2);
		if (roll1 % 2) {
			if(roll2 === 2) {
				region = "Plains";
			} else if(roll2 === 3){
				region = "Southeast";
			} else if(roll2 === 4) {
				region = "Southeast";
			} else if(roll2 === 5) {
				region = "Southeast";
			} else if(roll2 === 6) {
				region = "North Central";
			} else if(roll2 === 7) {
				region = "North Central";
			} else if(roll2 === 8) {
				region = "Northeast";
			} else if(roll2 === 9) {
				region = "Northeast";
			} else if(roll2 === 10) {
				region = "Northeast";
			} else if(roll2 === 11) {
				region = "Northeast";
			} else if(roll2 === 12) {
				region = "Northeast";
			}
		} else {
			if(roll2 === 2) {
				region = "Southwest";
			} else if(roll2 === 3){
				region = "South Central";
			} else if(roll2 === 4) {
				region = "South Central";
			} else if(roll2 === 5) {
				region = "South Central";
			} else if(roll2 === 6) {
				region = "Southwest";
			} else if(roll2 === 7) {
				region = "Southwest";
			} else if(roll2 === 8) {
				region = "Plains";
			} else if(roll2 === 9) {
				region = "Northwest";
			} else if(roll2 === 10) {
				region = "Northwest";
			} else if(roll2 === 11) {
				region = "Plains";
			} else if(roll2 === 12) {
				region = "Northwest";
			}
		}
	}
	if(previous === region) {
		set(document.getElementById("map"), "visibility", "visible");
		return false;
	}
	if(region === "Northeast"){
		roll1 = roll();
		roll2 = roll(2);
		if (roll1 % 2) {
			if(roll2 === 2) {
				dest = "New York";
			} else if(roll2 === 3){
				dest = "New York";
			} else if(roll2 === 4) {
				dest = "New York";
			} else if(roll2 === 5) {
				dest = "Albany";
			} else if(roll2 === 6) {
				dest = "Boston";
			} else if(roll2 === 7) {
				dest = "Buffalo";
			} else if(roll2 === 8) {
				dest = "Boston";
			} else if(roll2 === 9) {
				dest = "Portland";
			} else if(roll2 === 10) {
				dest = "New York";
			} else if(roll2 === 11) {
				dest = "New York";
			} else if(roll2 === 12) {
				dest = "New York";
			}
		} else {
			if(roll2 === 2) {
				dest = "New York";
			} else if(roll2 === 3){
				dest = "Washington";
			} else if(roll2 === 4) {
				dest = "Pittsburgh";
			} else if(roll2 === 5) {
				dest = "Pittsburgh";
			} else if(roll2 === 6) {
				dest = "Philadelphia";
			} else if(roll2 === 7) {
				dest = "Washington";
			} else if(roll2 === 8) {
				dest = "Philadelphia";
			} else if(roll2 === 9) {
				dest = "Baltimore";
			} else if(roll2 === 10) {
				dest = "Baltimore";
			} else if(roll2 === 11) {
				dest = "Baltimore";
			} else if(roll2 === 12) {
				dest = "New York";
			}
		}
	}
	if(region === "Southeast"){
		roll1 = roll();
		roll2 = roll(2);
		if (roll1 % 2) {
			if(roll2 === 2) {
				dest = "Charlotte";
			} else if(roll2 === 3){
				dest = "Charlotte";
			} else if(roll2 === 4) {
				dest = "Chattanooga";
			} else if(roll2 === 5) {
				dest = "Atlanta";
			} else if(roll2 === 6) {
				dest = "Atlanta";
			} else if(roll2 === 7) {
				dest = "Atlanta";
			} else if(roll2 === 8) {
				dest = "Richmond";
			} else if(roll2 === 9) {
				dest = "Knoxville";
			} else if(roll2 === 10) {
				dest = "Mobile";
			} else if(roll2 === 11) {
				dest = "Knoxville";
			} else if(roll2 === 12) {
				dest = "Mobile";
			}
		} else {
			if(roll2 === 2) {
				dest = "Norfolk";
			} else if(roll2 === 3){
				dest = "Norfolk";
			} else if(roll2 === 4) {
				dest = "Norfolk";
			} else if(roll2 === 5) {
				dest = "Charleston";
			} else if(roll2 === 6) {
				dest = "Miami";
			} else if(roll2 === 7) {
				dest = "Jacksonville";
			} else if(roll2 === 8) {
				dest = "Miami";
			} else if(roll2 === 9) {
				dest = "Tampa";
			} else if(roll2 === 10) {
				dest = "Tampa";
			} else if(roll2 === 11) {
				dest = "Mobile";
			} else if(roll2 === 12) {
				dest = "Norfolk";
			}
		}
	}
	if(region === "North Central"){
		roll1 = roll();
		roll2 = roll(2);
		if (roll1 % 2) {
			if(roll2 === 2) {
				dest = "Cleveland";
			} else if(roll2 === 3){
				dest = "Cleveland";
			} else if(roll2 === 4) {
				dest = "Cleveland";
			} else if(roll2 === 5) {
				dest = "Cleveland";
			} else if(roll2 === 6) {
				dest = "Detroit";
			} else if(roll2 === 7) {
				dest = "Detroit";
			} else if(roll2 === 8) {
				dest = "Indianapolis";
			} else if(roll2 === 9) {
				dest = "Milwaukee";
			} else if(roll2 === 10) {
				dest = "Milwaukee";
			} else if(roll2 === 11) {
				dest = "Chicago";
			} else if(roll2 === 12) {
				dest = "Milwaukee";
			}
		} else {
			if(roll2 === 2) {
				dest = "Cincinnati";
			} else if(roll2 === 3){
				dest = "Chicago";
			} else if(roll2 === 4) {
				dest = "Cincinnati";
			} else if(roll2 === 5) {
				dest = "Cincinnati";
			} else if(roll2 === 6) {
				dest = "Columbus";
			} else if(roll2 === 7) {
				dest = "Chicago";
			} else if(roll2 === 8) {
				dest = "Chicago";
			} else if(roll2 === 9) {
				dest = "St. Louis";
			} else if(roll2 === 10) {
				dest = "St. Louis";
			} else if(roll2 === 11) {
				dest = "St. Louis";
			} else if(roll2 === 12) {
				dest = "Chicago";
			}
		}
	}
	if(region === "South Central"){
		roll1 = roll();
		roll2 = roll(2);
		if (roll1 % 2) {
			if(roll2 === 2) {
				dest = "Memphis";
			} else if(roll2 === 3){
				dest = "Memphis";
			} else if(roll2 === 4) {
				dest = "Memphis";
			} else if(roll2 === 5) {
				dest = "Little Rock";
			} else if(roll2 === 6) {
				dest = "New Orleans";
			} else if(roll2 === 7) {
				dest = "Birmingham";
			} else if(roll2 === 8) {
				dest = "Louisville";
			} else if(roll2 === 9) {
				dest = "Nashville";
			} else if(roll2 === 10) {
				dest = "Nashville";
			} else if(roll2 === 11) {
				dest = "Louisville";
			} else if(roll2 === 12) {
				dest = "Memphis";
			}
		} else {
			if(roll2 === 2) {
				dest = "Shreveport";
			} else if(roll2 === 3){
				dest = "Shreveport";
			} else if(roll2 === 4) {
				dest = "Dallas";
			} else if(roll2 === 5) {
				dest = "New Orleans";
			} else if(roll2 === 6) {
				dest = "Dallas";
			} else if(roll2 === 7) {
				dest = "San Antonio";
			} else if(roll2 === 8) {
				dest = "Houston";
			} else if(roll2 === 9) {
				dest = "Houston";
			} else if(roll2 === 10) {
				dest = "Fort Worth";
			} else if(roll2 === 11) {
				dest = "Fort Worth";
			} else if(roll2 === 12) {
				dest = "Fort Worth";
			}
		}
	}
	if(region === "Plains"){
		roll1 = roll();
		roll2 = roll(2);
		if (roll1 % 2) {
			if(roll2 === 2) {
				dest = "Kansas City";
			} else if(roll2 === 3){
				dest = "Kansas City";
			} else if(roll2 === 4) {
				dest = "Denver";
			} else if(roll2 === 5) {
				dest = "Denver";
			} else if(roll2 === 6) {
				dest = "Denver";
			} else if(roll2 === 7) {
				dest = "Kansas City";
			} else if(roll2 === 8) {
				dest = "Kansas City";
			} else if(roll2 === 9) {
				dest = "Kansas City";
			} else if(roll2 === 10) {
				dest = "Pueblo";
			} else if(roll2 === 11) {
				dest = "Pueblo";
			} else if(roll2 === 12) {
				dest = "Oklahoma City";
			}
		} else {
			if(roll2 === 2) {
				dest = "Oklahoma City";
			} else if(roll2 === 3){
				dest = "St. Paul";
			} else if(roll2 === 4) {
				dest = "Minneapolis";
			} else if(roll2 === 5) {
				dest = "St. Paul";
			} else if(roll2 === 6) {
				dest = "Minneapolis";
			} else if(roll2 === 7) {
				dest = "Oklahoma City";
			} else if(roll2 === 8) {
				dest = "Des Moines";
			} else if(roll2 === 9) {
				dest = "Omaha";
			} else if(roll2 === 10) {
				dest = "Omaha";
			} else if(roll2 === 11) {
				dest = "Fargo";
			} else if(roll2 === 12) {
				dest = "Fargo";
			}
		}
	}
	if(region === "Northwest"){
		roll1 = roll();
		roll2 = roll(2);
		if (roll1 % 2) {
			if(roll2 === 2) {
				dest = "Spokane";
			} else if(roll2 === 3){
				dest = "Spokane";
			} else if(roll2 === 4) {
				dest = "Seattle";
			} else if(roll2 === 5) {
				dest = "Seattle";
			} else if(roll2 === 6) {
				dest = "Seattle";
			} else if(roll2 === 7) {
				dest = "Seattle";
			} else if(roll2 === 8) {
				dest = "Rapid City";
			} else if(roll2 === 9) {
				dest = "Casper";
			} else if(roll2 === 10) {
				dest = "Billings";
			} else if(roll2 === 11) {
				dest = "Billings";
			} else if(roll2 === 12) {
				dest = "Spokane";
			}
		} else {
			if(roll2 === 2) {
				dest = "Spokane";
			} else if(roll2 === 3){
				dest = "Salt Lake City";
			} else if(roll2 === 4) {
				dest = "Salt Lake City";
			} else if(roll2 === 5) {
				dest = "Salt Lake City";
			} else if(roll2 === 6) {
				dest = "Portland OR";
			} else if(roll2 === 7) {
				dest = "Portland OR";
			} else if(roll2 === 8) {
				dest = "Portland OR";
			} else if(roll2 === 9) {
				dest = "Pocatello";
			} else if(roll2 === 10) {
				dest = "Butte";
			} else if(roll2 === 11) {
				dest = "Butte";
			} else if(roll2 === 12) {
				dest = "Portland OR";
			}
		}
	}
	if(region === "Southwest"){
		roll1 = roll();
		roll2 = roll(2);
		if (roll1 % 2) {
			if(roll2 === 2) {
				dest = "San Diego";
			} else if(roll2 === 3){
				dest = "San Diego";
			} else if(roll2 === 4) {
				dest = "Reno";
			} else if(roll2 === 5) {
				dest = "San Diego";
			} else if(roll2 === 6) {
				dest = "Sacramento";
			} else if(roll2 === 7) {
				dest = "Las Vegas";
			} else if(roll2 === 8) {
				dest = "Phoenix";
			} else if(roll2 === 9) {
				dest = "El Paso";
			} else if(roll2 === 10) {
				dest = "Tucumcari";
			} else if(roll2 === 11) {
				dest = "Phoenix";
			} else if(roll2 === 12) {
				dest = "Phoenix";
			}
		} else {
			if(roll2 === 2) {
				dest = "Los Angeles";
			} else if(roll2 === 3){
				dest = "Oakland";
			} else if(roll2 === 4) {
				dest = "Oakland";
			} else if(roll2 === 5) {
				dest = "Oakland";
			} else if(roll2 === 6) {
				dest = "Los Angeles";
			} else if(roll2 === 7) {
				dest = "Los Angeles";
			} else if(roll2 === 8) {
				dest = "Los Angeles";
			} else if(roll2 === 9) {
				dest = "San Francisco";
			} else if(roll2 === 10) {
				dest = "San Francisco";
			} else if(roll2 === 11) {
				dest = "San Francisco";
			} else if(roll2 === 12) {
				dest = "San Francisco";
			}
		}
	}

	return {
		"city": dest,
		"region": region
	};
}

function payoutAUS(city1, city2) {
	let c1 = AUS_D[city1],
		c2 = AUS_D[city2];
	
		if(AUS_payouts[c1] !== undefined && AUS_payouts[c1][c2] !== undefined) {
			return AUS_payouts[c1][c2];
		} else {
			return AUS_payouts[c2][c1];
		}
}

function destinationAUS(previous, region){
	if (region == undefined) {
		region = AUS_lookup_region[isEven()][roll(2)];
	}
	
	if(previous === region) {
		set(document.getElementById("map"), "visibility", "visible");
		return false;
	}

	return {
		"city": AUS_cityNames[AUS_lookup_dest[region][isEven()][roll(2)]],
		"region": region
	}
}

function regionFromCode(regionCode){
	if (map === MAPS.AUS) {
		return AUS_R[regionCode];
	}
	return regionCode;
}

const AUS_R = Object.freeze({'WA':0, 'NS':1, 'QL':2, 'VI':3, 'TA':4, 'NT':5, 'SA':6})
const AUS_regionNames = ["Western Australia", "New South Wales", "Queensland", "Victoria", "Tasmania", "Northern Territory", "South Australia"];

const AUS_D = Object.freeze({"Adelaide":0,"Albany":1,"Albury":2,"Alice Springs":3,"Ballarat":4,"Bamaga":5,"Benalla":6,"Bourke":7,"Brisbane":8,"Broken Hill":9,"Broome":10,"Bunbury":11,"Cairns":12,"Canberra":13,"Ceduna":14,"Dampier":15,"Darwin":16,"Deakin":17,"Derby":18,"Devonport":19,"Dubbo":20,"Esperance":21,"Eucla":22,"Exmouth":23,"Geelong":24,"Geraldton":25,"Giles Met Station":26,"Hobart":27,"Horsham":28,"Ivanhoe":29,"Kalgoorlie":30,"Katherine":31,"Kowanyama":32,"Kununurra":33,"Launceston":34,"Meekatharra":35,"Melbourne":36,"Mildura":37,"Millewa":38,"Moe":39,"Newcastle":40,"Nockatunga":41,"Oodnadatta":42,"Orbost":43,"Parkes":44,"Perth":45,"Port Agusta":46,"Port Hedland":47,"Port Lincoln":48,"Portland":49,"Rockhampton":50,"Shepparton":51,"Smithton":52,"Swan Hill":53,"Sydney":54,"Tennant Creek":55,"Townsville":56,"Weipa":57,"Wodonga":58,"Woomera":59,"Wyndham":60,"Zeehan":61});
const AUS_cityNames = Object.keys(AUS_D);

//lookups are [even, odd]
const AUS_lookup_region = [
		[,,AUS_R.VI,
			AUS_R.VI,
			AUS_R.QL,
			AUS_R.WA,
			AUS_R.WA,
			AUS_R.NT,
			AUS_R.VI,
			AUS_R.NS,
			AUS_R.NS,
			AUS_R.NS,
			AUS_R.VI],
		[,,AUS_R.SA,
			AUS_R.QL,
			AUS_R.QL,
			AUS_R.QL,
			AUS_R.TA,
			AUS_R.SA,
			AUS_R.VI,
			AUS_R.NS,
			AUS_R.NS,
			AUS_R.NS,
			AUS_R.NS]];
const AUS_lookup_dest = {
	[AUS_R.WA]:[
		[,,AUS_D.Meekatharra,
			AUS_D.Eucla,
			AUS_D.Albany,
			AUS_D.Broome,
			AUS_D["Port Hedland"],
			AUS_D.Perth,
			AUS_D.Perth,
			AUS_D.Perth,
			AUS_D.Kununurra,
			AUS_D.Bunbury,
			AUS_D.Meekatharra,
		],
		[,,AUS_D["Giles Met Station"],
			AUS_D.Millewa,
			AUS_D.Esperance,
			AUS_D.Geraldton,
			AUS_D.Kalgoorlie,
			AUS_D.Exmouth,
			AUS_D.Dampier,
			AUS_D.Derby,
			AUS_D.Wyndham,
			AUS_D.Deakin,
			AUS_D.Derby,
		]],
	[AUS_R.NS]:[
		[,,AUS_D.Newcastle,
			AUS_D.Canberra,
			AUS_D.Newcastle,
			AUS_D.Ivanhoe,
			AUS_D.Albury,
			AUS_D.Canberra,
			AUS_D.Newcastle,
			AUS_D.Sydney,
			AUS_D.Sydney,
			AUS_D.Sydney,
			AUS_D.Sydney,
		],
		[,,AUS_D.Newcastle,
			AUS_D.Parkes,
			AUS_D.Newcastle,
			AUS_D.Bourke,
			AUS_D.Dubbo,
			AUS_D["Broken Hill"],
			AUS_D.Sydney,
			AUS_D.Sydney,
			AUS_D.Sydney,
			AUS_D.Sydney,
			AUS_D.Sydney,
		]],
	[AUS_R.QL]:[
		[,,AUS_D.Townsville,
			AUS_D.Brisbane,
			AUS_D.Kowanyama,
			AUS_D.Cairns,
			AUS_D.Townsville,
			AUS_D.Cairns,
			AUS_D.Brisbane,
			AUS_D.Brisbane,
			AUS_D.Brisbane,
			AUS_D.Brisbane,
			AUS_D.Brisbane,
		],
		[,,AUS_D.Nockatunga,
			AUS_D.Nockatunga,
			AUS_D.Bamaga,
			AUS_D.Weipa,
			AUS_D.Townsville,
			AUS_D.Rockhampton,
			AUS_D.Brisbane,
			AUS_D.Brisbane,
			AUS_D.Brisbane,
			AUS_D.Brisbane,
			AUS_D.Brisbane,
		]],
	[AUS_R.VI]:[
		[,,AUS_D.Horsham,
			AUS_D.Benalla,
			AUS_D.Mildura,
			AUS_D.Geelong,
			AUS_D.Geelong,
			AUS_D.Portland,
			AUS_D.Melbourne,
			AUS_D.Melbourne,
			AUS_D.Shepparton,
			AUS_D.Ballarat,
			AUS_D.Portland,
		],
		[,,AUS_D.Horsham,
			AUS_D.Orbost,
			AUS_D["Swan Hill"],
			AUS_D.Wodonga,
			AUS_D.Ballarat,
			AUS_D.Moe,
			AUS_D.Melbourne,
			AUS_D.Melbourne,
			AUS_D.Melbourne,
			AUS_D.Melbourne,
			AUS_D.Melbourne,
		]],
	[AUS_R.TA]:[
		[,,AUS_D.Hobart,
			AUS_D.Launceston,
			AUS_D.Hobart,
			AUS_D.Devonport,
			AUS_D.Launceston,
			AUS_D.Devonport,
			AUS_D.Hobart,
			AUS_D.Hobart,
			AUS_D.Hobart,
			AUS_D.Hobart,
			AUS_D.Hobart,
		],
		[,,AUS_D.Hobart,
			AUS_D.Zeehan,
			AUS_D.Hobart,
			AUS_D.Smithton,
			AUS_D.Launceston,
			AUS_D.Launceston,
			AUS_D.Hobart,
			AUS_D.Hobart,
			AUS_D.Hobart,
			AUS_D.Hobart,
			AUS_D.Hobart,
		]],
	[AUS_R.NT]:[
		[,,AUS_D.Darwin,
			AUS_D.Darwin,
			AUS_D.Darwin,
			AUS_D.Katherine,
			AUS_D["Alice Springs"],
			AUS_D["Alice Springs"],
			AUS_D.Darwin,
			AUS_D.Darwin,
			AUS_D.Darwin,
			AUS_D.Darwin,
			AUS_D.Darwin,
		],
		[,,AUS_D.Darwin,
			AUS_D.Darwin,
			AUS_D.Darwin,
			AUS_D.Katherine,
			AUS_D.Katherine,
			AUS_D["Tennant Creek"],
			AUS_D.Darwin,
			AUS_D.Darwin,
			AUS_D.Darwin,
			AUS_D.Darwin,
			AUS_D.Darwin,
		]],
	[AUS_R.SA]:[
		[,,AUS_D["Port Agusta"],
			AUS_D.Adelaide,
			AUS_D["Port Agusta"],
			AUS_D.Woomera,
			AUS_D["Port Agusta"],
			AUS_D.Ceduna,
			AUS_D.Adelaide,
			AUS_D.Adelaide,
			AUS_D.Adelaide,
			AUS_D.Adelaide,
			AUS_D.Adelaide,
		],
		[,,AUS_D.Ceduna,
			AUS_D["Port Lincoln"],
			AUS_D.Adelaide,
			AUS_D.Oodnadatta,
			AUS_D.Adelaide,
			AUS_D["Port Lincoln"],
			AUS_D.Adelaide,
			AUS_D.Adelaide,
			AUS_D.Adelaide,
			AUS_D.Adelaide,
			AUS_D.Adelaide,
		]]
};

function generatePayoutLookup(csv, destinations){
	let payoutTable  = {};
	let lines = csv.split('\n');
	for (const line of lines) {
		let cells = line.split(',');
		let cityName = cells.shift();
		let tmp = {};
		for (let i = 0; i < cells.length; i++) {
			let n = parseInt(cells[i], 10);
			if (!isNaN(n)) {
				tmp[i] = n;
			}
		}
		payoutTable[destinations[cityName]] = tmp;
	}
	return payoutTable;
}

const AUS_payout_csv = `Adelaide,0,245,160,195,90,420,130,125,235,60,305,235,360,165,130,280,360,115,335,140,160,195,160,30,115,235,255,195,60,95,15,335,315,325,160,21,115,60,220,140,185,125,125,165,120,210,45,265,95,92,23,125,165,90,175,245,305,420,165,70,325,175
Albany,,0,335,270,335,570,330,300,410,235,245,35,510,340,200,185,405,130,270,385,335,55,140,160,360,95,200,440,305,270,95,375,455,315,405,130,360,305,105,385,360,300,220,370,290,45,200,200,220,335,405,335,410,300,350,325,455,560,340,175,305,420
Albury,,,0,280,95,395,45,95,140,95,395,325,305,45,220,370,420,200,420,95,55,280,245,385,90,325,340,150,115,60,235,295,340,410,115,300,70,115,305,95,80,160,210,70,25,300,130,350,185,125,175,55,125,90,79,325,255,385,10,160,410,130
Alice Springs,,,,0,280,325,280,245,340,185,160,265,270,290,185,220,165,160,140,335,280,220,200,280,305,255,95,385,255,220,175,140,210,130,350,195,305,255,235,335,305,220,70,315,240,235,150,200,175,280,300,280,360,245,300,55,235,315,290,125,130,370
Ballarat,,,,,0,480,50,165,230,105,395,325,395,105,220,370,430,200,420,55,140,280,245,385,25,325,340,105,25,80,235,405,375,410,70,300,25,60,305,55,160,165,210,80,100,300,130,350,185,25,265,55,80,45,130,335,340,475,90,160,410,90
Bamaga,,,,,,0,425,325,300,385,420,560,90,405,465,480,315,440,405,490,350,515,480,545,480,560,420,525,465,405,475,290,115,350,510,515,465,465,545,455,350,325,385,430,350,535,385,465,440,490,220,445,515,440,375,280,140,45,405,405,370,525
Benalla,,,,,,,0,135,180,100,390,325,340,85,220,365,415,50,95,280,245,385,45,325,340,100,70,75,240,390,365,410,70,300,25,70,25,70,305,50,120,160,215,75,70,300,135,350,185,75,215,10,75,45,110,325,290,415,35,160,410,85
Bourke,,,,,,,,0,115,60,360,290,235,105,185,335,335,165,385,195,45,245,210,350,185,290,305,230,150,95,200,305,270,370,210,265,165,150,270,160,90,70,175,130,60,265,95,315,150,175,105,150,220,125,80,235,185,315,105,125,375,230
Brisbane,,,,,,,,,0,175,475,105,210,130,300,445,385,280,475,235,105,360,325,465,230,405,420,255,210,150,315,360,245,420,255,375,210,210,385,185,80,185,390,160,100,375,210,430,265,235,80,195,265,185,105,290,160,290,150,235,440,270
Broken Hill,,,,,,,,,,0,300,230,300,105,125,270,325,105,325,150,95,185,150,290,130,230,245,200,90,35,140,300,270,315,165,200,125,90,210,150,125,60,115,130,60,200,35,255,90,115,165,95,175,60,115,230,245,375,105,60,315,185
Broome,,,,,,,,,,,0,230,370,405,265,60,160,195,25,445,395,200,235,125,450,150,220,500,370,335,160,130,305,70,465,115,420,370,160,445,420,360,230,430,350,200,265,45,280,395,445,395,475,360,410,210,385,420,405,235,60,480
Bunbury,,,,,,,,,,,,0,500,335,195,165,385,125,255,375,325,90,165,140,350,80,195,430,300,265,90,360,445,300,395,115,350,300,90,375,350,290,210,360,280,25,195,185,210,325,395,325,405,290,340,315,445,550,335,165,290,410
Cairns,,,,,,,,,,,,,0,315,405,430,265,375,350,405,265,455,420,490,395,500,370,440,375,315,410,235,60,300,420,465,375,375,480,370,265,265,325,340,265,475,325,410,375,405,130,360,430,350,290,220,55,80,315,340,315,440
Canberra,,,,,,,,,,,,,,0,230,375,430,210,430,105,60,290,255,395,95,335,350,160,130,70,245,405,350,420,125,305,80,130,315,55,55,165,220,25,35,305,140,360,195,130,185,95,130,105,25,335,265,395,55,165,420,140
Ceduna,,,,,,,,,,,,,,,0,235,350,70,290,270,220,150,80,255,245,195,210,325,195,160,105,325,350,315,290,165,245,195,175,270,245,185,115,255,180,165,90,220,45,220,290,220,300,185,235,235,350,455,230,70,315,305
Dampier,,,,,,,,,,,,,,,,0,220,165,90,420,370,175,210,60,395,90,195,475,340,305,130,195,370,130,440,90,395,340,105,420,395,335,255,405,325,140,235,20,255,370,440,370,445,335,385,270,445,475,375,210,125,455
Darwin,,,,,,,,,,,,,,,,,0,325,140,475,375,360,370,280,455,305,265,525,410,360,315,25,200,90,490,270,445,410,315,475,420,265,235,455,375,360,315,200,340,440,340,420,500,385,410,115,280,305,430,290,105,510
Deakin,,,,,,,,,,,,,,,,,,0,220,255,200,80,80,185,230,125,140,305,175,140,35,300,325,265,270,95,230,175,105,255,230,165,90,235,160,95,70,150,90,200,270,200,280,165,220,210,325,430,210,45,255,290
Derby,,,,,,,,,,,,,,,,,,,0,475,420,230,265,150,445,175,235,323,395,360,185,115,290,55,490,140,445,395,185,475,445,350,210,455,385,230,290,70,305,420,430,420,500,385,440,195,370,395,430,265,45,510
Devonport,,,,,,,,,,,,,,,,,,,,0,150,335,300,440,45,375,395,55,80,125,290,445,420,465,20,350,25,115,360,55,160,210,265,80,110,350,185,405,135,80,270,55,25,90,130,375,350,480,90,210,465,35
Dubbo,,,,,,,,,,,,,,,,,,,,,0,280,245,385,140,325,340,185,125,60,235,350,300,410,165,300,125,125,305,115,45,115,210,90,15,300,130,350,185,150,130,105,175,95,35,280,210,340,60,160,410,185
Esperance,,,,,,,,,,,,,,,,,,,,,,0,90,195,305,130,150,385,255,220,45,335,405,270,350,105,305,255,115,335,305,245,165,315,240,80,150,160,165,280,350,280,360,245,300,270,405,510,290,125,265,370
Eucla,,,,,,,,,,,,,,,,,,,,,,,0,230,270,165,185,350,220,185,80,340,370,305,315,140,270,220,150,300,270,210,130,280,205,140,115,195,125,245,315,245,325,210,265,255,370,475,255,90,300,335
Exmouth,,,,,,,,,,,,,,,,,,,,,,,,0,410,60,245,490,360,325,150,255,430,195,455,125,410,360,80,440,410,350,270,420,340,115,255,80,270,385,455,385,465,350,405,335,510,525,395,230,185,475
Geelong,,,,,,,,,,,,,,,,,,,,,,,,,0,350,370,95,55,105,265,430,405,440,60,325,20,90,335,45,150,195,235,70,100,325,160,375,210,45,265,45,70,70,125,360,340,475,80,185,440,80
Geraldton,,,,,,,,,,,,,,,,,,,,,,,,,,0,185,430,300,265,90,280,445,220,395,60,350,300,20,375,350,290,210,360,280,55,195,105,210,325,395,325,405,290,340,305,445,550,335,165,210,410
Giles Met Station,,,,,,,,,,,,,,,,,,,,,,,,,,,0,445,315,280,105,235,305,230,410,125,370,315,165,395,370,305,165,375,300,165,210,175,230,340,395,340,420,305,360,150,335,410,350,185,230,430
Hobart,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,130,175,340,500,475,515,35,405,80,165,410,105,175,265,315,130,160,405,235,455,290,130,305,105,80,140,150,430,385,515,140,265,515,90
Horsham,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,60,210,385,360,385,95,270,55,45,280,80,150,150,185,105,85,270,105,325,160,25,245,60,105,25,140,305,325,455,105,130,385,115
Ivanhoe,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,175,335,305,350,140,235,95,60,245,125,90,95,150,95,25,235,70,290,125,90,185,70,150,35,80,265,265,395,70,95,350,160
Kalgoorlie,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,290,360,230,305,60,265,210,70,290,265,200,125,270,195,60,105,115,125,235,305,235,315,200,255,230,360,465,245,80,220,325
Katherine,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,175,60,465,245,420,385,290,445,395,235,210,430,350,335,290,175,315,410,315,395,475,360,385,90,255,280,405,265,80,480
Kowanyama,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,235,440,405,395,360,430,405,300,210,270,375,300,420,270,350,325,385,165,370,445,335,325,160,90,105,350,290,255,455
Kununurra,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,480,185,440,385,230,465,440,300,200,445,365,270,280,115,305,410,375,410,490,375,430,150,315,340,420,255,20,500
Launceston,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,370,45,130,375,70,175,230,280,95,130,370,200,420,255,95,290,70,45,105,150,395,370,500,105,230,480,55
Meekatharra,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,325,270,45,350,325,265,185,335,255,90,165,70,185,300,370,300,375,265,315,245,420,510,305,140,175,385
Melbourne,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,90,335,25,130,185,235,55,85,325,160,375,210,55,245,25,55,60,105,350,325,455,60,185,440,60
Mildura,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,280,115,150,150,185,140,85,270,105,325,160,70,245,60,140,25,140,305,325,455,105,130,385,150
Millewa,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,360,335,270,195,340,265,60,175,115,195,305,375,305,385,270,325,290,430,535,315,150,220,395
Moe,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,105,210,265,25,85,350,185,405,235,80,235,55,80,90,80,375,315,445,90,210,465,90
Newcastle,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,160,235,80,45,325,160,375,210,175,130,130,185,125,25,325,210,340,90,185,440,195
Nockatunga,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,165,195,120,265,95,315,150,175,175,160,235,125,150,165,210,315,165,125,315,245
Oodnadatta,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,245,170,185,80,235,105,210,265,210,290,175,230,125,270,375,220,55,200,300
Orbost,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,60,335,165,385,220,105,210,80,105,115,55,360,290,420,80,195,445,115
Parkes,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,255,95,305,145,110,135,75,135,60,35,280,215,340,35,120,365,145
Perth,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,165,160,185,300,370,300,375,265,315,290,420,525,305,140,265,385
Port Agusta,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,220,55,130,200,130,210,95,150,200,270,375,140,25,280,220
Port Hedland,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,235,350,420,350,430,315,370,255,430,455,360,195,105,440
Port Lincoln,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,185,255,185,265,150,200,230,325,430,195,60,305,270
Portland,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,270,80,105,55,160,335,350,480,115,160,410,115
Rockhampton,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,230,300,220,160,245,80,210,185,230,395,305
Shepparton,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,80,35,125,325,305,440,45,160,410,90
Smithton,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,115,160,405,375,510,115,235,490,45
Swan Hill,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,115,290,300,430,80,125,375,125
Sydney,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,315,235,370,80,175,430,165
Tennant Creek,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,185,265,335,175,165,410
Townsville,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,130,265,290,335,385
Weipa,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,395,395,360,515
Wodonga,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,165,420,125
Woomera,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,255,245
Wyndham,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,500
Zeehan,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0`;

const AUS_payouts = generatePayoutLookup(AUS_payout_csv, AUS_D);