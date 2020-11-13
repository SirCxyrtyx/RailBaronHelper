// jshint jquery: true, curly: true, bitwise: true, eqeqeq: true, immed: true, strict: true, unused: vars, devel: true, browser: true, newcap: false
"use strict";

const getByID = id => document.getElementById(id),
	getByClass = className => document.getElementsByClassName(className),
	MAPS = {"USA":0, "AUS":1, "USA2":2 }, 
	mapNames = ["United States", "Australia", "United States (Extended)"],
	SVGNS = "http://www.w3.org/2000/svg",
	fontpt = 30,
	root = getByID("root"),
	noDest = "?";

let btns = [],
	playerLocations = [],
	playerDests = [],
	numPlayers,
	currentPlayer,
	map = MAPS.USA;


function init() {
	for (let i = 0; i < mapNames.length; i++) {
		btns[i] = button(100, 80 + i * 100, "#E01B1B", mapNames[i], undefined, undefined, () => selectMap(i));
	}

	for (const region of getByClass("mapRegion")) {
		region.onclick = evt => selectRegion(evt);
		region.onmouseover = region.onmousedown = evt => evt.target.setAttributeNS(null, 'fill', '#5E7BCC');
		region.onmouseout = evt => evt.target.setAttributeNS(null, 'fill', '#d3d3d3');
	}
}

function selectMap(mapId){
	btnsClear();

	map = mapId;
	getByID(Object.keys(MAPS)[mapId]).removeAttribute("visibility");

	for (let i = 0; i < 6; i++) {
		btns[i] = button(100 + i * 120, 80, "#E01B1B", i + 1, 49, 61, () => setPlayers(i + 1));
	}
}

function setPlayers(n) {
	numPlayers = n;
	btnsClear();
	for (let i = 0; i < numPlayers; i++) {
		displayPlayerName(i);
		playerLocations[i] = destination();
		playerDests[i] = undefined;
		displayDestination(i);
		displayPayout(i, 0);
	};
}

function newDestination(playerIdx, oldRegion, region) {
	currentPlayer = playerIdx;
	let dest = destination(oldRegion, region);
	if(dest === false)
		return;
	console.log(dest);
	if (playerDests[playerIdx] === undefined) {
		playerDests[playerIdx] = dest;
		displayDestination(playerIdx);
	} else {
		updateDestination(playerIdx, dest);
	}
	displayPayout(playerIdx);
}

function btnsClear() {
	for (var i = btns.length - 1; i >= 0; i--) {
		btns[i].remove();
	};
	btns = [];
}

function selectRegion(evt) {
	var region = regionFromCode(evt.target.attributes.id.value);
	set(getByID("map"), "visibility", "hidden");
	newDestination(currentPlayer, false, region);
}

function updateDestination(i, dest) {
	playerLocations[i] = playerDests[i];
	playerDests[i] = dest;

	displayDestination(i);
}

function displayPlayerName(i, name) {
	name = name || `${i + 1}`;
	if (btns[i]) {
		btns[i].remove();
	}
	btns[i] = button(100, 80 + i * 100, "#E01B1B", name, undefined, undefined, () => displayPlayerName(i, prompt("Enter player initials")));
}

function displayDestination(i) {
	if (btns[i + numPlayers]) {
		btns[i + numPlayers].remove();
	}
	if (btns[i + numPlayers * 2]) {
		btns[i + numPlayers * 2].remove();
	}
	if (btns[i + numPlayers * 3]) {
		btns[i + numPlayers * 3].remove();
	}
	btns[i + numPlayers] = button(200, 80 + i * 100, "#111111", playerLocations[i], undefined, undefined, () => editCity(i, playerLocations));
	btns[i + numPlayers * 2] = button(440, 80 + i * 100, "#1b1be0", "⇨", undefined, undefined, () => newDestination(i, regionFromCity(playerDests[i] || playerLocations[i])));
	btns[i + numPlayers * 3] = button(540, 80 + i * 100, "#111111", playerDests[i] || noDest, undefined, undefined, () => editCity(i, playerDests));
}

function displayPayout(i){
	if (btns[i + numPlayers * 4]) {
		btns[i + numPlayers * 4].remove();
	}
	btns[i + numPlayers * 4] = button(780, 80 + i * 100, "#00BA19", `$${payout(i) * 100}`);
}

function editCity(i, arr) {
	let city = prompt("Enter name of city");
	if (city === null) {
		return;
	}
	if (Destinations[map][city] === undefined) {
		alert(`${city} is not the name of a city! Enter the name exactly as it appears on the board.`);
		return;
	}
	
	arr[i] = city;
	displayDestination(i)
	displayPayout(i);
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

function diceMatch(dice, die0, die1, die2){
	return dice[0] === die0 && dice[1] === die1 && dice[2] === die2;
}

function create(parent, type, id) { //id is optional
    var element = document.createElementNS(SVGNS, type);
    if (typeof parent === 'string') {
        parent = getByID(parent);
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

function button(x, y, color, text, width, height, onClick) {
    var that = {},
    	pad = fontpt / 3;
    that.g = create(getByID("buttons"), "g");
    that.rect = create(that.g, "rect");
    that.text = create(that.g, "text");
    that.get = function (name) {
        return that.rect.getAttributeNS(null, name);
    };
    that.set = function (name, val) {
        that.rect.setAttributeNS(null, name, val);
    };
    that.remove = function () {
        getByID("buttons").removeChild(that.g);
    };
    set(that.text, "x", x + pad * 1.7, "y", y + fontpt + pad + 1, "font-size", fontpt, "font-family", "Segoe", "fill", "White");
    that.text.appendChild(document.createTextNode(text));
	that.set("fill", color);
	
	that.set("width", width || that.text.getBBox().width + pad * 3);
	that.set("height", height || that.text.getBBox().height + pad * 2);

    that.set("x", x);
	that.set("y", y);
	
	if (onClick) {
		that.g.onclick = onClick;
	}
    return that;
}


function payout(i) {
	let destIndices = Destinations[map],
		payouts = Payouts[map];
	
	let city1 = destIndices[playerLocations[i]],
		city2 = destIndices[playerDests[i]];
	if(payouts[city1] !== undefined && payouts[city1][city2] !== undefined) {
		return payouts[city1][city2];
	} 
	else if (payouts[city2] !== undefined && payouts[city2][city1] !== undefined){
		return payouts[city2][city1];
	}
	return 0;
}

function destination(previous, region) {
	let regionLookup = RegionLookup[map],
		cityNames = CityNames[map], 
		destLookup = DestLookup[map];

	if (region == undefined) {
		let dice = [roll(), roll(), roll()]
		region = regionLookup[dice[0] % 2][dice[1] + dice[2]];
		
		if(region != previous && map == MAPS.USA2) {
			if (diceMatch(dice, 1, 1, 1)) {
				return USA2_cityNames[USA2_D.Duluth];
			}
			if (diceMatch(dice, 1, 4, 6) || diceMatch(dice, 1, 6, 3)) {
				return USA2_cityNames[USA2_D.Montreal];
			}
			if (diceMatch(dice, 3, 3, 3)) {
				return USA2_cityNames[USA2_D["Green Bay"]];
			}
			if (diceMatch(dice, 4, 4, 4)) {
				return USA2_cityNames[USA2_D.Wichita];
			}
			if (diceMatch(dice, 5, 2, 3)) {
				return USA2_cityNames[USA2_D.Montgomery];
			}
			if (diceMatch(dice, 5, 5, 5)) {
				return USA2_cityNames[USA2_D.Binghamton];
			}
			if (diceMatch(dice, 6, 6, 6)) {
				return USA2_cityNames[USA2_D.Ogden];
			}
		}
	}
	
	if(previous === region) {
		set(getByID("map"), "visibility", "visible");
		return false;
	}

	return cityNames[destLookup[region][isEven()][roll(2)]];
}

function regionFromCode(regionCode){
	return Regions[map][regionCode];
}

function regionFromCity(city) {
	return CityRegion[map][Destinations[map][city]];
}

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

/********************
*      USA Data     *
*********************/

const USA_R = Object.freeze({'NE':0, 'SE':1, 'NC':2, 'SC':3, 'PL':4, 'NW':5, 'SW':6})
const USA_regionNames = ["North East", "South East", "North Central", "South Central", "Plains", "North West", "South West"];

const USA_D = Object.freeze({"Albany":0,"Atlanta":1,"Baltimore":2,"Billings":3,"Birmingham":4,"Boston":5,"Buffalo":6,"Butte":7,"Casper":8,"Charleston":9,"Charlotte":10,"Chattanooga":11,"Chicago":12,"Cincinnati":13,"Cleveland":14,"Columbus":15,"Dallas":16,"Denver":17,"Des Moines":18,"Detroit":19,"El Paso":20,"Fargo":21,"Fort Worth":22,"Houston":23,"Indianapolis":24,"Jacksonville":25,"Kansas City":26,"Knoxville":27,"Las Vegas":28,"Little Rock":29,"Los Angeles":30,"Louisville":31,"Memphis":32,"Miami":33,"Milwaukee":34,"Minneapolis":35,"Mobile":36,"Nashville":37,"New Orleans":38,"New York":39,"Norfolk":40,"Oakland":41,"Oklahoma City":42,"Omaha":43,"Philadelphia":44,"Phoenix":45,"Pittsburgh":46,"Pocatello":47,"Portland ME":48,"Portland OR":49,"Pueblo":50,"Rapid City":51,"Reno":52,"Richmond":53,"Sacramento":54,"Salt Lake City":55,"San Antonio":56,"San Diego":57,"San Francisco":58,"Seattle":59,"Shreveport":60,"Spokane":61,"St Louis":62,"St Paul":63,"Tampa":64,"Tucumcari":65,"Washington DC":66});
const USA_cityNames = Object.keys(USA_D);

const USA_cityRegion = {
	[USA_D.Albany]: USA_R.NE,
	[USA_D.Atlanta]: USA_R.SE,
	[USA_D.Baltimore]: USA_R.NE,
	[USA_D.Billings]: USA_R.NW,
	[USA_D.Birmingham]: USA_R.SC,
	[USA_D.Boston]: USA_R.NE,
	[USA_D.Buffalo]: USA_R.NE,
	[USA_D.Butte]: USA_R.NW,
	[USA_D.Casper]: USA_R.NW,
	[USA_D.Charleston]: USA_R.SE,
	[USA_D.Charlotte]: USA_R.SE,
	[USA_D.Chattanooga]: USA_R.SE,
	[USA_D.Chicago]: USA_R.NC,
	[USA_D.Cincinnati]: USA_R.NC,
	[USA_D.Cleveland]: USA_R.NC,
	[USA_D.Columbus]: USA_R.NC,
	[USA_D.Dallas]: USA_R.SC,
	[USA_D.Denver]: USA_R.PL,
	[USA_D["Des Moines"]]: USA_R.PL,
	[USA_D.Detroit]: USA_R.NC,
	[USA_D["El Paso"]]: USA_R.SW,
	[USA_D.Fargo]: USA_R.PL,
	[USA_D["Fort Worth"]]: USA_R.SC,
	[USA_D.Houston]: USA_R.SC,
	[USA_D.Indianapolis]: USA_R.NC,
	[USA_D.Jacksonville]: USA_R.SE,
	[USA_D["Kansas City"]]: USA_R.PL,
	[USA_D.Knoxville]: USA_R.SE,
	[USA_D["Las Vegas"]]: USA_R.SW,
	[USA_D["Little Rock"]]: USA_R.SC,
	[USA_D["Los Angeles"]]: USA_R.SW,
	[USA_D.Louisville]: USA_R.SC,
	[USA_D.Memphis]: USA_R.SC,
	[USA_D.Miami]: USA_R.SE,
	[USA_D.Milwaukee]: USA_R.NC,
	[USA_D.Minneapolis]: USA_R.PL,
	[USA_D.Mobile]: USA_R.SE,
	[USA_D.Nashville]: USA_R.SC,
	[USA_D["New Orleans"]]: USA_R.SC,
	[USA_D["New York"]]: USA_R.NE,
	[USA_D.Norfolk]: USA_R.SE,
	[USA_D.Oakland]: USA_R.SW,
	[USA_D["Oklahoma City"]]: USA_R.PL,
	[USA_D.Omaha]: USA_R.PL,
	[USA_D.Philadelphia]: USA_R.NE,
	[USA_D.Phoenix]: USA_R.SW,
	[USA_D.Pittsburgh]: USA_R.NE,
	[USA_D.Pocatello]: USA_R.NW,
	[USA_D["Portland ME"]]: USA_R.NE,
	[USA_D["Portland OR"]]: USA_R.NW,
	[USA_D.Pueblo]: USA_R.PL,
	[USA_D["Rapid City"]]: USA_R.NW,
	[USA_D.Reno]: USA_R.SW,
	[USA_D.Richmond]: USA_R.SE,
	[USA_D.Sacramento]: USA_R.SW,
	[USA_D["Salt Lake City"]]: USA_R.NW,
	[USA_D["San Antonio"]]: USA_R.SC,
	[USA_D["San Diego"]]: USA_R.SW,
	[USA_D["San Francisco"]]: USA_R.SW,
	[USA_D.Seattle]: USA_R.NW,
	[USA_D.Shreveport]: USA_R.SC,
	[USA_D.Spokane]: USA_R.NW,
	[USA_D["St Louis"]]: USA_R.NC,
	[USA_D["St Paul"]]: USA_R.PL,
	[USA_D.Tampa]: USA_R.SE,
	[USA_D.Tucumcari]: USA_R.SW,
	[USA_D["Washington DC"]]: USA_R.NE,
};

//lookups are [even, odd]
const USA_lookup_region = [
		[,,USA_R.SW,
			USA_R.SC,
			USA_R.SC,
			USA_R.SC,
			USA_R.SW,
			USA_R.SW,
			USA_R.PL,
			USA_R.NW,
			USA_R.NW,
			USA_R.PL,
			USA_R.NW],
		[,,USA_R.PL,
			USA_R.SE,
			USA_R.SE,
			USA_R.SE,
			USA_R.NC,
			USA_R.NC,
			USA_R.NE,
			USA_R.NE,
			USA_R.NE,
			USA_R.NE,
			USA_R.NE]];
const USA_lookup_dest = {
	[USA_R.NE]:[
		[,, USA_D["New York"],
			USA_D["Washington DC"],
			USA_D.Pittsburgh,
			USA_D.Pittsburgh,
			USA_D.Philadelphia,
			USA_D["Washington DC"],
			USA_D.Philadelphia,
			USA_D.Baltimore,
			USA_D.Baltimore,
			USA_D.Baltimore,
			USA_D["New York"],
		],
		[,, USA_D["New York"],
			USA_D["New York"],
			USA_D["New York"],
			USA_D.Albany,
			USA_D.Boston,
			USA_D.Buffalo,
			USA_D.Boston,
			USA_D["Portland ME"],
			USA_D["New York"],
			USA_D["New York"],
			USA_D["New York"],
		]],
	[USA_R.SE]:[
		[,, USA_D.Norfolk,
			USA_D.Norfolk,
			USA_D.Norfolk,
			USA_D.Charleston,
			USA_D.Miami,
			USA_D.Jacksonville,
			USA_D.Miami,
			USA_D.Tampa,
			USA_D.Tampa,
			USA_D.Mobile,
			USA_D.Norfolk,
		],
		[,, USA_D.Charlotte,
			USA_D.Charlotte,
			USA_D.Chattanooga,
			USA_D.Atlanta,
			USA_D.Atlanta,
			USA_D.Atlanta,
			USA_D.Richmond,
			USA_D.Knoxville,
			USA_D.Mobile,
			USA_D.Knoxville,
			USA_D.Mobile,
		]],
	[USA_R.NC]:[
		[,, USA_D.Cincinnati,
			USA_D.Chicago,
			USA_D.Cincinnati,
			USA_D.Cincinnati,
			USA_D.Columbus,
			USA_D.Chicago,
			USA_D.Chicago,
			USA_D["St Louis"],
			USA_D["St Louis"],
			USA_D["St Louis"],
			USA_D.Chicago,
		],
		[,, USA_D.Cleveland,
			USA_D.Cleveland,
			USA_D.Cleveland,
			USA_D.Cleveland,
			USA_D.Detroit,
			USA_D.Detroit,
			USA_D.Indianapolis,
			USA_D.Milwaukee,
			USA_D.Milwaukee,
			USA_D.Chicago,
			USA_D.Milwaukee,
		]],
	[USA_R.SC]:[
		[,, USA_D.Shreveport,
			USA_D.Shreveport,
			USA_D.Dallas,
			USA_D["New Orleans"],
			USA_D.Dallas,
			USA_D["San Antonio"],
			USA_D.Houston,
			USA_D.Houston,
			USA_D["Fort Worth"],
			USA_D["Fort Worth"],
			USA_D["Fort Worth"],
		],
		[,, USA_D.Memphis,
			USA_D.Memphis,
			USA_D.Memphis,
			USA_D["Little Rock"],
			USA_D["New Orleans"],
			USA_D.Birmingham,
			USA_D.Louisville,
			USA_D.Nashville,
			USA_D.Nashville,
			USA_D.Louisville,
			USA_D.Memphis,
		]],
	[USA_R.PL]:[
		[,, USA_D["Oklahoma City"],
			USA_D["St Paul"],
			USA_D.Minneapolis,
			USA_D["St Paul"],
			USA_D.Minneapolis,
			USA_D["Oklahoma City"],
			USA_D["Des Moines"],
			USA_D.Omaha,
			USA_D.Omaha,
			USA_D.Fargo,
			USA_D.Fargo,
		],
		[,, USA_D["Kansas City"],
			USA_D["Kansas City"],
			USA_D.Denver,
			USA_D.Denver,
			USA_D.Denver,
			USA_D["Kansas City"],
			USA_D["Kansas City"],
			USA_D["Kansas City"],
			USA_D.Pueblo,
			USA_D.Pueblo,
			USA_D["Oklahoma City"],
		]],
	[USA_R.NW]:[
		[,, USA_D.Spokane,
			USA_D["Salt Lake City"],
			USA_D["Salt Lake City"],
			USA_D["Salt Lake City"],
			USA_D["Portland OR"],
			USA_D["Portland OR"],
			USA_D["Portland OR"],
			USA_D.Pocatello,
			USA_D.Butte,
			USA_D.Butte,
			USA_D["Portland OR"],
		],
		[,, USA_D.Spokane,
			USA_D.Spokane,
			USA_D.Seattle,
			USA_D.Seattle,
			USA_D.Seattle,
			USA_D.Seattle,
			USA_D["Rapid City"],
			USA_D.Casper,
			USA_D.Billings,
			USA_D.Billings,
			USA_D.Spokane,
		]],
	[USA_R.SW]:[
		[,, USA_D["Los Angeles"],
			USA_D.Oakland,
			USA_D.Oakland,
			USA_D.Oakland,
			USA_D["Los Angeles"],
			USA_D["Los Angeles"],
			USA_D["Los Angeles"],
			USA_D["San Francisco"],
			USA_D["San Francisco"],
			USA_D["San Francisco"],
			USA_D["San Francisco"],
		],
		[,, USA_D["San Diego"],
			USA_D["San Diego"],
			USA_D.Reno,
			USA_D["San Diego"],
			USA_D.Sacramento,
			USA_D["Las Vegas"],
			USA_D.Phoenix,
			USA_D["El Paso"],
			USA_D.Tucumcari,
			USA_D.Phoenix,
			USA_D.Phoenix,
		]]
};

const USA_payout_csv = `Albany,0,100,35,210,110,20,30,235,180,95,75,100,80,70,50,60,170,185,120,55,220,145,170,185,75,110,125,85,280,135,305,85,125,150,90,125,135,105,150,15,60,310,155,130,25,275,55,235,30,300,185,170,255,50,270,235,195,315,310,315,160,265,100,120,135,185,35
Atlanta,100,0,70,190,15,110,95,215,255,30,25,15,75,50,75,60,80,155,95,75,145,135,80,85,60,35,90,20,230,55,230,45,40,70,80,115,35,30,50,85,55,270,90,100,75,190,80,210,120,280,150,160,260,60,270,205,105,225,270,280,65,280,60,115,55,130,85
Baltimore,35,70,0,210,80,40,40,230,180,55,40,65,80,60,45,50,145,180,115,60,210,145,145,150,70,80,120,55,275,110,290,70,95,115,80,120,105,75,115,20,25,305,145,130,10,270,35,235,55,305,180,170,285,15,300,230,170,285,305,295,125,265,90,120,100,185,50
Billings,210,190,210,0,180,230,180,25,35,225,210,180,130,155,160,160,150,65,105,155,140,65,150,175,145,225,105,185,110,155,145,160,155,260,120,90,190,165,190,220,220,140,140,90,210,190,175,50,240,95,75,50,120,215,135,65,175,155,140,90,160,60,130,90,240,110,205
Birmingham,110,15,80,180,0,120,90,200,140,50,40,15,65,50,75,60,65,135,80,75,130,130,65,70,50,45,75,25,235,40,210,40,25,80,75,105,30,20,35,100,70,255,75,90,90,175,80,205,135,265,135,145,230,75,240,190,95,210,255,270,45,240,50,105,60,115,75
Boston,20,110,40,230,120,0,50,255,200,95,85,115,100,95,70,80,185,205,140,75,240,165,195,195,95,120,145,95,300,150,325,105,140,160,110,140,145,120,155,25,70,330,175,150,30,295,65,255,10,320,210,205,305,55,320,255,210,325,330,315,165,285,120,140,140,210,45
Buffalo,30,95,40,180,90,50,0,205,150,95,80,80,50,45,20,30,140,155,90,25,190,115,140,155,45,120,95,75,250,105,275,55,95,155,60,90,120,75,130,40,65,280,125,100,40,245,25,205,60,270,155,140,255,55,270,205,165,270,280,265,140,235,70,90,140,165,45
Butte,235,215,230,25,200,255,205,0,55,260,175,140,150,180,185,185,175,90,140,180,160,90,175,200,170,245,130,210,90,180,120,180,175,285,145,110,210,185,215,240,250,120,165,115,235,165,200,25,265,70,100,75,95,235,110,45,195,130,120,65,185,35,155,110,265,135,225
Casper,180,255,180,35,140,200,150,55,0,190,175,140,100,125,135,130,115,35,65,125,95,75,115,140,115,185,70,145,120,115,150,120,120,220,100,80,155,125,155,190,190,150,105,50,180,140,145,75,215,130,45,30,125,185,140,75,140,165,150,125,125,90,100,80,150,80,175
Charleston,95,30,55,225,50,95,95,260,190,0,25,45,100,70,95,85,115,185,130,100,190,165,115,115,80,25,120,40,265,85,260,70,75,60,110,140,60,60,75,75,45,305,120,135,80,225,80,240,110,310,185,190,295,40,310,235,135,260,305,315,95,280,90,140,45,160,50
Charlotte,75,25,40,210,40,85,80,175,175,25,0,40,85,55,65,60,110,180,115,80,175,150,110,110,65,40,110,25,260,85,255,55,70,75,95,125,60,50,75,60,40,300,115,125,50,240,60,230,95,305,180,180,275,35,290,225,135,255,300,300,90,270,80,125,60,155,40
Chattanooga,100,15,65,180,15,115,80,140,140,45,40,0,60,35,60,45,90,140,80,60,155,125,90,85,45,50,75,10,240,55,235,30,40,85,70,100,50,15,65,85,65,270,90,90,75,190,70,215,120,265,140,145,245,60,260,205,105,235,270,270,70,185,45,100,20,130,60
Chicago,80,75,80,130,65,100,50,150,100,100,85,60,0,30,35,35,95,105,35,25,140,65,95,120,20,110,45,55,195,65,225,30,55,145,10,40,85,45,90,90,95,225,80,50,80,195,45,150,115,220,105,90,200,85,200,150,120,220,225,215,85,185,30,40,125,110,75
Cincinnati,70,50,60,155,50,95,45,180,125,70,55,35,30,0,25,10,95,125,65,25,155,90,95,125,10,85,60,30,225,65,235,10,50,120,35,70,75,30,85,75,70,255,90,75,65,210,30,180,105,245,125,120,230,60,245,180,125,235,255,240,85,210,35,70,100,125,55
Cleveland,50,75,45,160,75,70,20,185,135,95,65,60,35,25,0,15,125,135,70,15,175,100,125,135,30,110,80,55,230,90,255,35,70,145,40,75,100,55,110,55,65,260,105,85,50,225,15,190,80,255,135,125,235,55,250,185,145,250,260,250,110,215,50,75,125,145,45
Columbus,60,60,50,160,60,80,30,185,130,85,60,45,35,10,15,0,110,130,70,20,170,95,110,130,15,95,65,40,225,65,240,25,60,130,40,75,80,40,95,65,70,265,100,80,55,215,20,185,95,255,130,135,235,55,250,180,135,240,265,250,115,215,40,75,115,140,50
Dallas,170,80,145,150,65,185,140,175,115,115,110,90,95,95,125,110,0,85,75,120,65,125,50,25,95,110,50,90,160,35,145,85,90,145,105,100,60,70,50,160,140,195,25,70,155,110,130,150,195,225,75,125,190,140,195,135,25,145,195,240,20,210,70,100,125,50,140
Denver,185,155,180,65,135,205,155,90,35,185,180,140,105,125,135,130,85,0,70,130,75,115,85,110,115,180,65,145,100,110,135,120,110,220,105,90,150,125,135,195,190,135,75,55,185,105,150,60,215,135,10,55,115,185,130,55,110,145,135,155,100,125,90,90,200,45,180
Des Moines,120,95,115,105,80,140,90,140,65,130,115,80,35,65,70,70,75,70,0,65,115,50,75,100,55,130,20,90,160,70,195,60,65,165,35,25,100,65,105,125,130,190,55,15,115,170,85,120,150,190,70,70,170,120,180,115,100,205,190,195,80,165,35,25,145,90,110
Detroit,55,75,60,155,75,75,25,180,125,100,80,60,25,25,15,20,120,130,65,0,165,90,120,135,30,110,70,50,225,90,250,35,75,145,35,65,100,55,110,65,80,255,105,75,65,220,30,180,85,250,130,130,230,70,245,180,140,245,255,240,105,210,50,65,125,140,60
El Paso,220,145,210,140,130,240,190,160,95,190,175,155,140,155,175,170,65,75,115,165,0,165,65,85,150,175,95,155,130,100,80,150,115,215,145,140,130,135,115,230,210,130,70,115,220,45,185,135,255,200,60,130,105,205,120,125,60,80,130,220,85,200,120,140,195,35,295
Fargo,145,135,145,65,130,165,115,90,75,165,150,125,65,90,100,95,125,115,50,90,165,0,125,150,80,170,70,120,175,120,210,95,110,210,55,25,145,110,150,155,160,205,105,60,145,220,110,135,175,160,125,45,150,150,200,130,150,220,205,150,130,120,80,25,190,140,140
Fort Worth,170,80,145,150,65,195,140,175,115,115,110,90,95,95,125,110,50,85,75,120,65,125,0,25,95,110,50,90,160,40,145,85,90,145,105,100,60,70,50,165,140,195,25,70,155,110,130,150,205,225,75,125,190,140,195,135,25,145,195,240,20,210,70,100,125,50,140
Houston,185,85,150,175,70,195,155,200,140,115,110,85,120,125,135,130,25,110,100,135,85,150,25,0,110,95,80,95,170,45,165,100,60,135,110,120,50,85,35,170,145,210,50,90,160,130,145,170,205,250,100,150,220,145,210,160,20,160,210,260,25,230,90,120,115,80,150
Indianapolis,75,60,70,145,50,95,45,170,115,80,65,45,20,10,30,15,95,115,55,30,150,80,95,110,0,95,50,40,215,50,225,10,50,130,25,60,80,30,85,80,80,245,75,65,70,200,35,170,105,245,115,110,220,70,235,170,115,225,245,230,90,200,25,60,110,115,65
Jacksonville,110,35,80,225,45,120,120,245,185,25,40,50,110,85,110,95,110,180,130,110,175,170,110,95,95,0,115,55,260,80,260,80,70,30,115,150,40,65,60,100,60,300,120,135,90,220,105,235,130,315,180,190,275,65,290,235,120,255,300,315,90,280,90,150,20,160,60
Kansas City,125,90,120,105,75,145,95,130,70,120,110,75,45,60,80,65,50,65,20,70,95,70,50,80,50,115,0,80,165,50,175,55,50,155,55,50,85,60,85,135,130,195,35,20,120,150,90,125,160,195,60,75,175,120,190,120,80,175,195,195,55,165,30,50,135,65,115
Knoxville,85,20,55,185,25,95,75,210,145,40,25,10,55,30,55,40,90,145,90,50,155,120,90,95,40,55,80,0,245,55,235,30,40,90,65,95,55,20,60,75,55,270,90,95,65,215,60,205,105,275,145,150,250,50,265,200,115,235,270,270,80,240,55,95,70,130,50
Las Vegas,280,230,275,110,235,300,250,90,120,265,260,240,195,225,230,225,160,100,160,225,130,175,160,170,215,260,165,245,0,190,30,215,210,300,195,180,215,220,200,280,290,65,155,150,280,75,245,60,260,135,110,140,80,280,65,45,145,45,65,150,170,170,190,180,285,95,275
Little Rock,135,55,110,155,40,150,105,180,115,85,85,55,65,65,90,65,35,110,70,90,100,120,40,45,50,80,50,55,190,0,185,50,15,115,75,95,50,35,45,130,110,215,35,70,120,160,95,160,180,245,100,125,215,105,215,160,60,180,215,265,20,230,35,95,95,75,105
Los Angeles,305,230,290,145,210,325,275,120,150,260,255,235,225,235,255,240,145,135,195,250,80,210,145,165,225,260,175,235,30,185,0,230,195,295,225,215,210,220,195,310,295,45,150,180,300,45,265,90,335,120,135,175,60,285,50,80,145,15,45,135,165,155,205,215,275,115,290
Louisville,85,45,70,160,40,105,55,180,120,70,55,30,30,10,35,25,85,120,60,35,150,95,85,100,10,80,55,30,215,50,230,0,40,120,40,70,55,20,75,85,80,245,85,70,80,225,45,175,115,245,120,125,225,70,240,170,115,225,245,250,80,220,25,70,100,120,65
Memphis,125,40,95,155,25,140,95,175,120,75,70,40,55,50,70,60,90,110,65,75,115,110,90,60,50,70,50,40,210,15,195,40,0,105,60,90,35,25,40,115,95,230,50,65,105,175,80,170,150,250,110,125,205,90,220,165,75,190,230,245,40,215,30,90,85,85,95
Miami,150,70,115,260,80,160,155,285,220,60,75,85,145,120,145,130,145,220,165,145,215,210,145,135,130,30,155,90,300,115,295,120,105,0,155,185,85,100,100,135,95,335,155,170,125,260,140,275,170,350,215,225,330,100,335,270,155,290,335,350,125,320,130,185,20,195,110
Milwaukee,90,80,80,120,75,110,60,145,100,110,95,70,10,35,40,40,105,105,35,35,145,55,105,110,25,115,55,65,195,75,225,40,60,155,0,35,90,55,100,100,105,225,85,50,90,195,55,155,120,215,115,90,205,95,220,150,130,230,225,210,85,180,35,35,135,110,65
Minneapolis,125,115,120,90,105,140,90,110,80,140,125,100,40,70,75,75,100,90,25,65,140,25,100,120,60,150,50,95,180,95,215,70,90,185,35,0,125,85,125,130,135,210,80,35,120,195,85,135,155,180,95,50,190,125,205,135,125,225,210,175,60,145,55,0,165,115,115
Mobile,135,35,105,190,30,145,120,210,155,60,60,50,85,75,100,80,60,150,100,100,130,145,60,50,80,40,85,55,215,50,210,55,35,85,90,125,0,50,15,120,95,260,80,105,110,175,105,225,145,285,140,160,250,95,260,195,70,210,260,280,45,250,65,125,65,115,100
Nashville,105,30,75,165,20,120,75,185,125,60,50,15,45,30,55,40,70,125,65,55,135,110,70,85,30,65,60,20,220,35,220,20,25,100,55,85,50,0,55,95,80,255,75,75,85,195,60,190,130,250,125,130,230,70,245,190,100,215,255,255,65,225,30,85,80,110,70
New Orleans,150,50,115,190,35,155,130,215,155,75,75,65,90,85,110,95,50,135,105,110,115,150,50,35,85,60,85,60,200,45,195,75,40,100,100,125,15,55,0,135,100,245,75,105,125,160,115,185,165,275,135,155,220,105,235,185,55,195,245,290,30,260,70,125,80,100,110
New York,15,85,20,220,100,25,40,240,190,75,60,85,90,75,55,65,160,195,125,65,230,155,165,170,80,100,135,75,280,130,310,85,115,135,100,130,120,95,135,0,45,315,160,140,10,280,45,245,35,310,195,180,295,35,310,240,190,305,315,305,155,275,105,130,120,200,20
Norfolk,60,55,25,220,70,70,65,250,190,45,40,65,95,70,65,70,140,190,130,80,210,160,140,145,80,60,130,55,290,110,295,80,95,95,105,135,95,80,100,45,0,320,150,140,35,265,50,245,80,320,190,195,285,10,310,245,160,280,320,310,120,280,100,135,60,185,25
Oakland,310,270,305,140,255,330,280,120,150,305,300,270,225,255,260,265,195,135,190,255,130,205,195,210,245,300,195,270,65,215,45,245,230,335,225,210,260,255,245,315,320,0,180,175,310,90,275,90,340,70,140,175,25,310,10,80,190,60,0,90,215,110,220,210,315,145,305
Oklahoma City,155,90,145,140,75,175,125,165,105,120,115,90,80,90,105,100,25,75,55,105,70,105,25,50,75,120,35,90,155,35,150,85,50,155,85,80,80,75,75,160,150,180,0,55,150,125,115,125,185,215,70,90,160,140,175,125,50,145,180,230,105,200,55,80,135,40,140
Omaha,130,100,130,90,90,150,100,115,50,135,125,90,50,75,85,80,70,55,15,75,115,60,70,90,65,135,20,95,150,70,180,70,65,170,50,35,105,75,105,140,140,175,55,0,130,160,95,105,160,175,55,55,155,135,170,105,100,190,175,180,75,150,40,35,150,85,125
Philadelphia,25,75,10,210,90,30,40,235,180,80,50,75,80,65,50,55,155,185,115,65,220,145,155,160,70,90,120,65,280,120,300,80,105,125,90,120,110,85,125,10,35,310,150,130,0,270,35,235,45,300,185,170,285,25,300,235,180,295,310,295,135,265,95,120,110,190,15
Phoenix,275,190,270,190,175,295,245,165,140,225,240,190,195,210,225,215,110,105,170,220,45,220,110,130,200,220,150,215,75,160,45,225,175,260,195,195,175,195,160,280,265,90,125,160,270,0,235,140,305,160,95,160,105,265,90,120,105,40,90,180,130,200,180,195,240,85,265
Pittsburgh,55,80,35,175,80,65,25,200,145,80,60,70,45,30,15,20,130,150,85,30,185,110,130,145,35,105,90,60,245,95,265,45,80,140,55,85,105,60,115,45,50,275,115,95,35,235,0,200,80,265,150,135,250,40,265,200,155,260,275,260,120,230,60,85,125,155,30
Pocatello,235,210,235,50,205,255,205,25,75,240,230,215,150,180,190,185,150,60,120,180,135,135,150,170,170,235,125,205,60,160,90,175,170,275,155,135,225,190,185,245,245,90,125,105,235,140,200,0,270,70,75,100,70,240,85,15,175,110,90,90,155,60,145,135,255,110,230
Portland ME,30,120,55,240,135,10,60,265,215,110,95,120,115,105,80,95,195,215,150,85,255,175,205,205,105,130,160,105,260,180,335,115,150,170,120,155,145,130,165,35,80,340,185,160,45,305,80,270,0,335,220,215,315,70,335,265,225,335,340,325,160,295,130,155,150,220,55
Portland OR,300,280,305,95,265,320,270,70,130,310,305,265,220,245,255,255,225,135,190,250,200,160,225,250,245,315,195,275,135,245,120,245,250,350,215,180,285,250,275,310,320,70,215,175,300,160,265,70,335,0,145,145,75,310,65,90,250,130,70,20,240,35,220,180,330,185,300
Pueblo,185,150,180,75,135,210,155,100,45,185,180,140,105,125,135,130,75,10,70,130,60,125,75,100,115,180,60,145,110,100,135,120,110,215,115,95,140,125,135,195,190,140,70,55,185,95,150,75,220,145,0,65,120,185,135,65,95,135,140,160,100,130,90,95,200,35,180
Rapid City,170,160,170,50,145,205,140,75,30,190,180,145,90,120,125,135,125,55,70,130,130,45,125,150,110,190,75,150,140,125,175,125,125,225,90,50,160,130,155,180,195,175,90,55,170,160,135,100,215,145,65,0,155,190,170,95,150,185,175,140,130,110,95,50,205,110,180
Reno,255,260,285,120,230,305,255,95,125,295,275,245,200,230,235,235,190,115,170,230,105,150,190,220,220,275,175,250,80,215,60,225,205,330,205,190,250,230,220,295,285,25,160,155,285,105,250,70,315,75,120,155,0,280,15,55,200,85,25,95,210,110,205,190,310,155,280
Richmond,50,60,15,215,75,55,55,235,185,40,35,60,85,60,55,55,140,185,120,70,205,150,140,145,70,65,120,50,280,105,285,70,90,100,95,125,95,70,105,35,10,310,140,135,25,265,40,240,70,310,185,190,280,0,305,235,165,285,310,300,120,270,90,125,85,180,10
Sacramento,270,270,300,135,240,320,270,110,140,310,290,260,200,245,250,250,195,130,180,245,120,200,195,210,235,290,190,265,65,215,50,240,220,335,220,205,260,245,235,310,310,10,175,170,300,90,265,85,335,65,135,170,15,305,0,70,190,65,10,85,215,100,210,205,315,145,295
Salt Lake City,235,205,230,65,190,255,205,45,75,235,225,205,150,180,185,180,135,55,115,180,125,130,135,160,170,235,120,200,45,160,80,170,165,270,150,135,195,190,185,240,245,80,125,105,235,120,200,15,265,90,65,95,55,235,70,0,160,90,80,105,150,80,145,135,250,95,230
San Antonio,195,105,170,175,95,210,165,195,140,135,135,105,120,125,145,135,25,110,100,140,60,150,25,20,115,120,80,115,145,60,145,115,75,155,130,125,70,100,55,190,160,190,50,100,180,105,155,175,225,250,95,150,200,165,190,160,0,170,190,265,50,235,90,125,135,70,170
San Diego,315,225,285,155,210,325,270,130,165,260,255,235,220,235,250,240,145,145,205,245,80,220,145,160,225,255,175,235,45,180,15,225,190,290,230,225,210,215,195,305,280,60,145,190,295,40,260,110,335,130,135,185,85,285,65,90,170,0,60,150,165,170,200,225,270,110,285
San Francisco,310,270,305,140,255,330,280,120,150,305,300,270,225,255,260,265,195,135,190,255,130,205,195,210,245,300,195,270,65,215,45,245,230,335,225,210,260,255,245,315,320,0,180,175,310,90,275,90,340,70,140,175,25,310,10,80,190,60,0,90,215,110,220,210,315,145,305
Seattle,315,280,295,90,270,315,265,65,125,315,300,270,215,240,250,250,240,155,195,240,220,150,240,260,230,315,195,270,150,265,135,250,245,350,210,175,280,255,290,305,310,90,230,180,295,180,260,90,325,20,160,140,95,300,85,105,265,150,90,0,260,30,220,175,330,205,290
Shreveport,160,65,125,160,45,165,140,185,125,95,90,70,85,85,110,115,20,100,80,105,85,130,20,25,90,90,55,80,170,20,165,80,40,125,85,60,45,65,30,155,120,215,105,75,135,130,120,155,160,240,100,130,210,120,215,150,50,165,215,260,0,225,85,105,110,65,120
Spokane,265,280,265,60,240,285,235,35,90,280,270,185,185,210,215,215,210,125,165,210,200,120,210,230,200,280,165,240,170,230,155,220,215,320,180,145,250,225,260,275,280,110,200,150,265,200,230,60,295,35,130,110,110,270,100,80,235,170,110,30,225,0,190,145,300,175,260
St Louis,100,60,90,130,50,120,70,155,100,90,80,45,30,35,50,40,70,90,35,50,120,80,70,90,25,90,30,55,190,35,205,25,30,130,35,55,65,30,70,105,100,220,55,40,95,180,60,145,130,220,90,95,205,90,210,145,90,200,220,220,85,190,0,55,110,95,90
St Paul,120,115,120,90,105,140,90,110,80,140,125,100,40,70,75,75,100,90,25,65,140,25,100,120,60,150,50,95,180,95,215,70,90,185,35,0,125,85,125,130,135,210,80,35,120,195,85,135,155,180,95,50,190,125,205,135,125,225,210,175,105,145,55,0,165,110,115
Tampa,135,55,100,240,60,140,140,265,150,45,60,20,125,100,125,115,125,200,145,125,195,190,125,115,110,20,135,70,285,95,275,100,85,20,135,165,65,80,80,120,60,315,135,150,110,240,125,255,150,330,200,205,310,85,315,250,135,270,315,330,110,300,110,165,0,175,95
Tucumcari,185,130,185,110,115,210,165,135,80,160,155,130,110,125,145,140,50,45,90,140,35,140,50,80,115,160,65,130,95,75,115,120,85,195,110,115,115,110,100,200,185,145,40,85,190,85,155,110,220,185,35,110,155,180,145,95,70,110,145,205,65,175,95,110,175,0,180
Washington DC,35,85,50,205,75,45,45,225,175,50,40,60,75,55,45,50,140,180,110,60,295,140,140,150,65,60,115,50,275,105,290,65,95,110,65,115,100,70,110,20,25,305,140,125,15,265,30,230,55,300,180,180,280,10,295,230,170,285,305,290,120,260,90,115,95,180,0`;

const USA_payouts = generatePayoutLookup(USA_payout_csv, USA_D);



/********************
*   Australia Data  *
*********************/

const AUS_R = Object.freeze({'WA':0, 'NS':1, 'QL':2, 'VI':3, 'TA':4, 'NT':5, 'SA':6})
const AUS_regionNames = ["Western Australia", "New South Wales", "Queensland", "Victoria", "Tasmania", "Northern Territory", "South Australia"];

const AUS_D = Object.freeze({"Adelaide":0,"Albany":1,"Albury":2,"Alice Springs":3,"Ballarat":4,"Bamaga":5,"Benalla":6,"Bourke":7,"Brisbane":8,"Broken Hill":9,"Broome":10,"Bunbury":11,"Cairns":12,"Canberra":13,"Ceduna":14,"Dampier":15,"Darwin":16,"Deakin":17,"Derby":18,"Devonport":19,"Dubbo":20,"Esperance":21,"Eucla":22,"Exmouth":23,"Geelong":24,"Geraldton":25,"Giles Met Stn.":26,"Hobart":27,"Horsham":28,"Ivanhoe":29,"Kalgoorlie":30,"Katherine":31,"Kowanyama":32,"Kununurra":33,"Launceston":34,"Meekatharra":35,"Melbourne":36,"Mildura":37,"Millewa":38,"Moe":39,"Newcastle":40,"Nockatunga":41,"Oodnadatta":42,"Orbost":43,"Parkes":44,"Perth":45,"Port Agusta":46,"Port Hedland":47,"Port Lincoln":48,"Portland":49,"Rockhampton":50,"Shepparton":51,"Smithton":52,"Swan Hill":53,"Sydney":54,"Tennant Creek":55,"Townsville":56,"Weipa":57,"Wodonga":58,"Woomera":59,"Wyndham":60,"Zeehan":61});
const AUS_cityNames = Object.keys(AUS_D);

const AUS_cityRegion = {
	[AUS_D.Adelaide]: AUS_R.SA,
	[AUS_D.Albany]: AUS_R.WA,
	[AUS_D.Albury]: AUS_R.NS,
	[AUS_D['Alice Springs']]: AUS_R.NT,
	[AUS_D.Ballarat]: AUS_R.VI,
	[AUS_D.Bamaga]: AUS_R.QL,
	[AUS_D.Benalla]: AUS_R.VI,
	[AUS_D.Bourke]: AUS_R.NS,
	[AUS_D.Brisbane]: AUS_R.QL,
	[AUS_D['Broken Hill']]: AUS_R.NS,
	[AUS_D.Broome]: AUS_R.WA,
	[AUS_D.Bunbury]: AUS_R.WA,
	[AUS_D.Cairns]: AUS_R.QL,
	[AUS_D.Canberra]: AUS_R.NS,
	[AUS_D.Ceduna]: AUS_R.SA,
	[AUS_D.Dampier]: AUS_R.WA,
	[AUS_D.Darwin]: AUS_R.NT,
	[AUS_D.Deakin]: AUS_R.WA,
	[AUS_D.Derby]: AUS_R.WA,
	[AUS_D.Devonport]: AUS_R.TA,
	[AUS_D.Dubbo]: AUS_R.NS,
	[AUS_D.Esperance]: AUS_R.WA,
	[AUS_D.Eucla]: AUS_R.WA,
	[AUS_D.Exmouth]: AUS_R.WA,
	[AUS_D.Geelong]: AUS_R.VI,
	[AUS_D.Geraldton]: AUS_R.WA,
	[AUS_D['Giles Met Stn.']]: AUS_R.WA,
	[AUS_D.Hobart]: AUS_R.TA,
	[AUS_D.Horsham]: AUS_R.VI,
	[AUS_D.Ivanhoe]: AUS_R.NS,
	[AUS_D.Kalgoorlie]: AUS_R.WA,
	[AUS_D.Katherine]: AUS_R.NT,
	[AUS_D.Kowanyama]: AUS_R.QL,
	[AUS_D.Kununurra]: AUS_R.WA,
	[AUS_D.Launceston]: AUS_R.TA,
	[AUS_D.Meekatharra]: AUS_R.WA,
	[AUS_D.Melbourne]: AUS_R.VI,
	[AUS_D.Mildura]: AUS_R.VI,
	[AUS_D.Millewa]: AUS_R.WA,
	[AUS_D.Moe]: AUS_R.VI,
	[AUS_D.Newcastle]: AUS_R.NS,
	[AUS_D.Nockatunga]: AUS_R.QL,
	[AUS_D.Oodnadatta]: AUS_R.SA,
	[AUS_D.Orbost]: AUS_R.VI,
	[AUS_D.Parkes]: AUS_R.NS,
	[AUS_D.Perth]: AUS_R.WA,
	[AUS_D['Port Agusta']]: AUS_R.SA,
	[AUS_D['Port Hedland']]: AUS_R.WA,
	[AUS_D['Port Lincoln']]: AUS_R.SA,
	[AUS_D.Portland]: AUS_R.VI,
	[AUS_D.Rockhampton]: AUS_R.QL,
	[AUS_D.Shepparton]: AUS_R.VI,
	[AUS_D.Smithton]: AUS_R.TA,
	[AUS_D['Swan Hill']]: AUS_R.VI,
	[AUS_D.Sydney]: AUS_R.NS,
	[AUS_D['Tennant Creek']]: AUS_R.NT,
	[AUS_D.Townsville]: AUS_R.QL,
	[AUS_D.Weipa]: AUS_R.QL,
	[AUS_D.Wodonga]: AUS_R.VI,
	[AUS_D.Woomera]: AUS_R.SA,
	[AUS_D.Wyndham]: AUS_R.WA,
	[AUS_D.Zeehan]: AUS_R.TA,
}

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
		[,,AUS_D["Giles Met Stn."],
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

const AUS_payout_csv = `Adelaide,0,245,160,195,90,420,130,125,235,60,305,235,360,165,130,280,360,115,335,140,160,195,160,30,115,235,255,195,60,95,15,335,315,325,160,21,115,60,220,140,185,125,125,165,120,210,45,265,95,92,23,125,165,90,175,245,305,420,165,70,325,175
Albany,,0,335,270,335,570,330,300,410,235,245,35,510,340,200,185,405,130,270,385,335,55,140,160,360,95,200,440,305,270,95,375,455,315,405,130,360,305,105,385,360,300,220,370,290,45,200,200,220,335,405,335,410,300,350,325,455,560,340,175,305,420
Albury,,,0,280,95,395,45,95,140,95,395,325,305,45,220,370,420,200,420,95,55,280,245,385,90,325,340,150,115,60,235,295,340,410,115,300,70,115,305,95,80,160,210,70,25,300,130,350,185,125,175,55,125,90,79,325,255,385,10,160,410,130
Alice Springs,,,,0,280,325,280,245,340,185,160,265,270,290,185,220,165,160,140,335,280,220,200,280,305,255,95,385,255,220,175,140,210,130,350,195,305,255,235,335,305,220,70,315,240,235,150,200,175,280,300,280,360,245,300,55,235,315,290,125,130,370
Ballarat,,,,,0,480,50,165,230,105,395,325,395,105,220,370,430,200,420,55,140,280,245,385,25,325,340,105,25,80,235,405,375,410,70,300,25,60,305,55,160,165,210,80,100,300,130,350,185,25,265,55,80,45,130,335,340,475,90,160,410,90
Bamaga,,,,,,0,425,325,300,385,420,560,90,405,465,480,315,440,405,490,350,515,480,545,480,560,420,525,465,405,475,290,115,350,510,515,465,465,545,455,350,325,385,430,350,535,385,465,440,490,220,445,515,440,375,280,140,45,405,405,370,525
Benalla,,,,,,,0,135,180,100,390,325,340,85,220,365,415,205,415,50,95,280,245,385,45,325,340,100,70,75,240,390,365,410,70,300,25,70,305,50,120,160,215,75,70,300,135,350,185,75,215,10,75,45,110,325,290,415,35,160,410,85
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
Giles Met Stn.,,,,,,,,,,,,,,,,,,,,,,,,,,,0,445,315,280,105,235,305,230,410,125,370,315,165,395,370,305,165,375,300,165,210,175,230,340,395,340,420,305,360,150,335,410,350,185,230,430
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


/********************
*      USA2 Data     *
*********************/

const USA2_R = Object.freeze({'NE2':0, 'SE2':1, 'NC2':2, 'SC2':3, 'PL2':4, 'NW2':5, 'SW2':6})
const USA2_regionNames = ["North East", "South East", "North Central", "South Central", "Plains", "North West", "South West"];

const USA2_D = Object.freeze({"Albany":0,"Atlanta":1,"Baltimore":2,"Billings":3,"Birmingham":4,"Boston":5,"Buffalo":6,"Butte":7,"Casper":8,"Charleston":9,"Charlotte":10,"Chattanooga":11,"Chicago":12,"Cincinnati":13,"Cleveland":14,"Columbus":15,"Dallas":16,"Denver":17,"Des Moines":18,"Detroit":19,"El Paso":20,"Fargo":21,"Fort Worth":22,"Houston":23,"Indianapolis":24,"Jacksonville":25,"Kansas City":26,"Knoxville":27,"Las Vegas":28,"Little Rock":29,"Los Angeles":30,"Louisville":31,"Memphis":32,"Miami":33,"Milwaukee":34,"Minneapolis":35,"Mobile":36,"Nashville":37,"New Orleans":38,"New York":39,"Norfolk":40,"Oakland":41,"Oklahoma City":42,"Omaha":43,"Philadelphia":44,"Phoenix":45,"Pittsburgh":46,"Pocatello":47,"Portland ME":48,"Portland OR":49,"Pueblo":50,"Rapid City":51,"Reno":52,"Richmond":53,"Sacramento":54,"Salt Lake City":55,"San Antonio":56,"San Diego":57,"San Francisco":58,"Seattle":59,"Shreveport":60,"Spokane":61,"St Louis":62,"St Paul":63,"Tampa":64,"Tucumcari":65,"Washington DC":66, "Binghamton":67, "Duluth":68, "Green Bay":69, "Ogden":70, "Wichita":71, "Montgomery":72, "Montreal":73});
const USA2_cityNames = Object.keys(USA2_D);

const USA2_cityRegion = {
	[USA2_D.Albany]: USA2_R.NE2,
	[USA2_D.Atlanta]: USA2_R.SE2,
	[USA2_D.Baltimore]: USA2_R.NE2,
	[USA2_D.Billings]: USA2_R.NW2,
	[USA2_D.Birmingham]: USA2_R.SC2,
	[USA2_D.Boston]: USA2_R.NE2,
	[USA2_D.Buffalo]: USA2_R.NE2,
	[USA2_D.Butte]: USA2_R.NW2,
	[USA2_D.Casper]: USA2_R.NW2,
	[USA2_D.Charleston]: USA2_R.SE2,
	[USA2_D.Charlotte]: USA2_R.SE2,
	[USA2_D.Chattanooga]: USA2_R.SE2,
	[USA2_D.Chicago]: USA2_R.NC2,
	[USA2_D.Cincinnati]: USA2_R.NC2,
	[USA2_D.Cleveland]: USA2_R.NC2,
	[USA2_D.Columbus]: USA2_R.NC2,
	[USA2_D.Dallas]: USA2_R.SC2,
	[USA2_D.Denver]: USA2_R.PL2,
	[USA2_D["Des Moines"]]: USA2_R.PL2,
	[USA2_D.Detroit]: USA2_R.NC2,
	[USA2_D["El Paso"]]: USA2_R.SW2,
	[USA2_D.Fargo]: USA2_R.PL2,
	[USA2_D["Fort Worth"]]: USA2_R.SC2,
	[USA2_D.Houston]: USA2_R.SC2,
	[USA2_D.Indianapolis]: USA2_R.NC2,
	[USA2_D.Jacksonville]: USA2_R.SE2,
	[USA2_D["Kansas City"]]: USA2_R.PL2,
	[USA2_D.Knoxville]: USA2_R.SE2,
	[USA2_D["Las Vegas"]]: USA2_R.SW2,
	[USA2_D["Little Rock"]]: USA2_R.SC2,
	[USA2_D["Los Angeles"]]: USA2_R.SW2,
	[USA2_D.Louisville]: USA2_R.SC2,
	[USA2_D.Memphis]: USA2_R.SC2,
	[USA2_D.Miami]: USA2_R.SE2,
	[USA2_D.Milwaukee]: USA2_R.NC2,
	[USA2_D.Minneapolis]: USA2_R.PL2,
	[USA2_D.Mobile]: USA2_R.SE2,
	[USA2_D.Nashville]: USA2_R.SC2,
	[USA2_D["New Orleans"]]: USA2_R.SC2,
	[USA2_D["New York"]]: USA2_R.NE2,
	[USA2_D.Norfolk]: USA2_R.SE2,
	[USA2_D.Oakland]: USA2_R.SW2,
	[USA2_D["Oklahoma City"]]: USA2_R.PL2,
	[USA2_D.Omaha]: USA2_R.PL2,
	[USA2_D.Philadelphia]: USA2_R.NE2,
	[USA2_D.Phoenix]: USA2_R.SW2,
	[USA2_D.Pittsburgh]: USA2_R.NE2,
	[USA2_D.Pocatello]: USA2_R.NW2,
	[USA2_D["Portland ME"]]: USA2_R.NE2,
	[USA2_D["Portland OR"]]: USA2_R.NW2,
	[USA2_D.Pueblo]: USA2_R.PL2,
	[USA2_D["Rapid City"]]: USA2_R.NW2,
	[USA2_D.Reno]: USA2_R.SW2,
	[USA2_D.Richmond]: USA2_R.SE2,
	[USA2_D.Sacramento]: USA2_R.SW2,
	[USA2_D["Salt Lake City"]]: USA2_R.NW2,
	[USA2_D["San Antonio"]]: USA2_R.SC2,
	[USA2_D["San Diego"]]: USA2_R.SW2,
	[USA2_D["San Francisco"]]: USA2_R.SW2,
	[USA2_D.Seattle]: USA2_R.NW2,
	[USA2_D.Shreveport]: USA2_R.SC2,
	[USA2_D.Spokane]: USA2_R.NW2,
	[USA2_D["St Louis"]]: USA2_R.NC2,
	[USA2_D["St Paul"]]: USA2_R.PL2,
	[USA2_D.Tampa]: USA2_R.SE2,
	[USA2_D.Tucumcari]: USA2_R.SW2,
	[USA2_D["Washington DC"]]: USA2_R.NE2,
	[USA2_D.Binghamton]: USA2_R.NE2,
	[USA2_D.Duluth]: USA2_R.PL2,
	[USA2_D["Green Bay"]]: USA2_R.NC2,
	[USA2_D.Ogden]: USA2_R.NW2,
	[USA2_D.Wichita]: USA2_R.PL2,
	[USA2_D.Montgomery]: USA2_R.SE2,
	[USA2_D.Montreal]: USA2_R.NE2
};

//lookups are [even, odd]
const USA2_lookup_region = [
		[,,USA2_R.SW2,
			USA2_R.SC2,
			USA2_R.SC2,
			USA2_R.SC2,
			USA2_R.SW2,
			USA2_R.SW2,
			USA2_R.PL2,
			USA2_R.NW2,
			USA2_R.NW2,
			USA2_R.PL2,
			USA2_R.NW2],
		[,,USA2_R.PL2,
			USA2_R.SE2,
			USA2_R.SE2,
			USA2_R.SE2,
			USA2_R.NC2,
			USA2_R.NC2,
			USA2_R.NE2,
			USA2_R.NE2,
			USA2_R.NE2,
			USA2_R.NE2,
			USA2_R.NE2]];
const USA2_lookup_dest = {
	[USA2_R.NE2]:[
		[,, USA2_D["New York"],
			USA2_D["Washington DC"],
			USA2_D.Pittsburgh,
			USA2_D.Pittsburgh,
			USA2_D.Philadelphia,
			USA2_D["Washington DC"],
			USA2_D.Philadelphia,
			USA2_D.Baltimore,
			USA2_D.Baltimore,
			USA2_D.Baltimore,
			USA2_D["New York"],
		],
		[,, USA2_D["New York"],
			USA2_D["New York"],
			USA2_D["New York"],
			USA2_D.Albany,
			USA2_D.Boston,
			USA2_D.Buffalo,
			USA2_D.Boston,
			USA2_D["Portland ME"],
			USA2_D["New York"],
			USA2_D["New York"],
			USA2_D["New York"],
		]],
	[USA2_R.SE2]:[
		[,, USA2_D.Norfolk,
			USA2_D.Norfolk,
			USA2_D.Norfolk,
			USA2_D.Charleston,
			USA2_D.Miami,
			USA2_D.Jacksonville,
			USA2_D.Miami,
			USA2_D.Tampa,
			USA2_D.Tampa,
			USA2_D.Mobile,
			USA2_D.Norfolk,
		],
		[,, USA2_D.Charlotte,
			USA2_D.Charlotte,
			USA2_D.Chattanooga,
			USA2_D.Atlanta,
			USA2_D.Atlanta,
			USA2_D.Atlanta,
			USA2_D.Richmond,
			USA2_D.Knoxville,
			USA2_D.Mobile,
			USA2_D.Knoxville,
			USA2_D.Mobile,
		]],
	[USA2_R.NC2]:[
		[,, USA2_D.Cincinnati,
			USA2_D.Chicago,
			USA2_D.Cincinnati,
			USA2_D.Cincinnati,
			USA2_D.Columbus,
			USA2_D.Chicago,
			USA2_D.Chicago,
			USA2_D["St Louis"],
			USA2_D["St Louis"],
			USA2_D["St Louis"],
			USA2_D.Chicago,
		],
		[,, USA2_D.Cleveland,
			USA2_D.Cleveland,
			USA2_D.Cleveland,
			USA2_D.Cleveland,
			USA2_D.Detroit,
			USA2_D.Detroit,
			USA2_D.Indianapolis,
			USA2_D.Milwaukee,
			USA2_D.Milwaukee,
			USA2_D.Chicago,
			USA2_D.Milwaukee,
		]],
	[USA2_R.SC2]:[
		[,, USA2_D.Shreveport,
			USA2_D.Shreveport,
			USA2_D.Dallas,
			USA2_D["New Orleans"],
			USA2_D.Dallas,
			USA2_D["San Antonio"],
			USA2_D.Houston,
			USA2_D.Houston,
			USA2_D["Fort Worth"],
			USA2_D["Fort Worth"],
			USA2_D["Fort Worth"],
		],
		[,, USA2_D.Memphis,
			USA2_D.Memphis,
			USA2_D.Memphis,
			USA2_D["Little Rock"],
			USA2_D["New Orleans"],
			USA2_D.Birmingham,
			USA2_D.Louisville,
			USA2_D.Nashville,
			USA2_D.Nashville,
			USA2_D.Louisville,
			USA2_D.Memphis,
		]],
	[USA2_R.PL2]:[
		[,, USA2_D["Oklahoma City"],
			USA2_D["St Paul"],
			USA2_D.Minneapolis,
			USA2_D["St Paul"],
			USA2_D.Minneapolis,
			USA2_D["Oklahoma City"],
			USA2_D["Des Moines"],
			USA2_D.Omaha,
			USA2_D.Omaha,
			USA2_D.Fargo,
			USA2_D.Fargo,
		],
		[,, USA2_D["Kansas City"],
			USA2_D["Kansas City"],
			USA2_D.Denver,
			USA2_D.Denver,
			USA2_D.Denver,
			USA2_D["Kansas City"],
			USA2_D["Kansas City"],
			USA2_D["Kansas City"],
			USA2_D.Pueblo,
			USA2_D.Pueblo,
			USA2_D["Oklahoma City"],
		]],
	[USA2_R.NW2]:[
		[,, USA2_D.Spokane,
			USA2_D["Salt Lake City"],
			USA2_D["Salt Lake City"],
			USA2_D["Salt Lake City"],
			USA2_D["Portland OR"],
			USA2_D["Portland OR"],
			USA2_D["Portland OR"],
			USA2_D.Pocatello,
			USA2_D.Butte,
			USA2_D.Butte,
			USA2_D["Portland OR"],
		],
		[,, USA2_D.Spokane,
			USA2_D.Spokane,
			USA2_D.Seattle,
			USA2_D.Seattle,
			USA2_D.Seattle,
			USA2_D.Seattle,
			USA2_D["Rapid City"],
			USA2_D.Casper,
			USA2_D.Billings,
			USA2_D.Billings,
			USA2_D.Spokane,
		]],
	[USA2_R.SW2]:[
		[,, USA2_D["Los Angeles"],
			USA2_D.Oakland,
			USA2_D.Oakland,
			USA2_D.Oakland,
			USA2_D["Los Angeles"],
			USA2_D["Los Angeles"],
			USA2_D["Los Angeles"],
			USA2_D["San Francisco"],
			USA2_D["San Francisco"],
			USA2_D["San Francisco"],
			USA2_D["San Francisco"],
		],
		[,, USA2_D["San Diego"],
			USA2_D["San Diego"],
			USA2_D.Reno,
			USA2_D["San Diego"],
			USA2_D.Sacramento,
			USA2_D["Las Vegas"],
			USA2_D.Phoenix,
			USA2_D["El Paso"],
			USA2_D.Tucumcari,
			USA2_D.Phoenix,
			USA2_D.Phoenix,
		]]
};

const USA2_payout_csv = `Albany,0,100,35,210,110,20,30,235,180,95,75,100,80,70,50,60,170,185,120,55,220,145,170,185,75,110,125,85,280,135,305,85,125,150,90,125,135,105,150,15,60,310,155,130,25,275,55,235,30,300,185,170,255,50,270,235,195,315,310,315,160,265,100,120,135,185,35,15,125,85,235,140,120,25
Atlanta,100,0,70,190,15,110,95,215,255,30,25,15,75,50,75,60,80,155,95,75,145,135,80,85,60,35,90,20,230,55,230,45,40,70,80,115,35,30,50,85,55,270,90,100,75,190,80,210,120,280,150,160,260,60,270,205,105,225,270,280,65,280,60,115,55,130,85,90,125,95,205,95,20,120
Baltimore,35,70,0,210,80,40,40,230,180,55,40,65,80,60,45,50,145,180,115,60,210,145,145,150,70,80,120,55,275,110,290,70,95,115,80,120,105,75,115,20,25,305,145,130,10,270,35,235,55,305,180,170,285,15,300,230,170,285,305,295,125,265,90,120,100,185,50,25,125,85,230,135,90,55
Billings,210,190,210,0,180,230,180,25,35,225,210,180,130,155,160,160,150,65,105,155,140,65,150,175,145,225,105,185,110,155,145,160,155,260,120,90,190,165,190,220,220,140,140,90,210,190,175,50,240,95,75,50,120,215,135,65,175,155,140,90,160,60,130,90,240,110,205,195,95,120,65,95,180,210
Birmingham,110,15,80,180,0,120,90,200,140,50,40,15,65,50,75,60,65,135,80,75,130,130,65,70,50,45,75,25,235,40,210,40,25,80,75,105,30,20,35,100,70,255,75,90,90,175,80,205,135,265,135,145,230,75,240,190,95,210,255,270,45,240,50,105,60,115,75,100,115,85,190,80,10,130
Boston,20,110,40,230,120,0,50,255,200,95,85,115,100,95,70,80,185,205,140,75,240,165,195,195,95,120,145,95,300,150,325,105,140,160,110,140,145,120,155,25,70,330,175,150,30,295,65,255,10,320,210,205,305,55,320,255,210,325,330,315,165,285,120,140,140,210,45,30,145,105,255,170,130,35
Buffalo,30,95,40,180,90,50,0,205,150,95,80,80,50,45,20,30,140,155,90,25,190,115,140,155,45,120,95,75,250,105,275,55,95,155,60,90,120,75,130,40,65,280,125,100,40,245,25,205,60,270,155,140,255,55,270,205,165,270,280,265,140,235,70,90,140,165,45,20,95,60,205,105,100,40
Butte,235,215,230,25,200,255,205,0,55,260,175,140,150,180,185,185,175,90,140,180,160,90,175,200,170,245,130,210,90,180,120,180,175,285,145,110,210,185,215,240,250,120,165,115,235,165,200,25,265,70,100,75,95,235,110,45,195,130,120,65,185,35,155,110,265,135,225,220,115,145,45,115,200,230
Casper,180,255,180,35,140,200,150,55,0,190,175,140,100,125,135,130,115,35,65,125,95,75,115,140,115,185,70,145,120,115,150,120,120,220,100,80,155,125,155,190,190,150,105,50,180,140,145,75,215,130,45,30,125,185,140,75,140,165,150,125,125,90,100,80,150,80,175,185,90,110,75,70,150,195
Charleston,95,30,55,225,50,95,95,260,190,0,25,45,100,70,95,85,115,185,130,100,190,165,115,115,80,25,120,40,265,85,260,70,75,60,110,140,60,60,75,75,45,305,120,135,80,225,80,240,110,310,185,190,295,40,310,235,135,260,305,315,95,280,90,140,45,160,50,80,150,110,235,125,45,115
Charlotte,75,25,40,210,40,85,80,175,175,25,0,40,85,55,65,60,110,180,115,80,175,150,110,110,65,40,110,25,260,85,255,55,70,75,95,125,60,50,75,60,40,300,115,125,50,240,60,230,95,305,180,180,275,35,290,225,135,255,300,300,90,270,80,125,60,155,40,65,135,90,225,115,45,95
Chattanooga,100,15,65,180,15,115,80,140,140,45,40,0,60,35,60,45,90,140,80,60,155,125,90,85,45,50,75,10,240,55,235,30,40,85,70,100,50,15,65,85,65,270,90,90,75,190,70,215,120,265,140,145,245,60,260,205,105,235,270,270,70,185,45,100,20,130,60,85,105,80,205,85,25,115
Chicago,80,75,80,130,65,100,50,150,100,100,85,60,0,30,35,35,95,105,35,25,140,65,95,120,20,110,45,55,195,65,225,30,55,145,10,40,85,45,90,90,95,225,80,50,80,195,45,150,115,220,105,90,200,85,200,150,120,220,225,215,85,185,30,40,125,110,75,75,50,20,150,70,75,90
Cincinnati,70,50,60,155,50,95,45,180,125,70,55,35,30,0,25,10,95,125,65,25,155,90,95,125,10,85,60,30,225,65,235,10,50,120,35,70,75,30,85,75,70,255,90,75,65,210,30,180,105,245,125,120,230,60,245,180,125,235,255,240,85,210,35,70,100,125,55,75,80,50,180,85,55,85
Cleveland,50,75,45,160,75,70,20,185,135,95,65,60,35,25,0,15,125,135,70,15,175,100,125,135,30,110,80,55,230,90,255,35,70,145,40,75,100,55,110,55,65,260,105,85,50,225,15,190,80,255,135,125,235,55,250,185,145,250,260,250,110,215,50,75,125,145,45,40,75,45,185,105,80,60
Columbus,60,60,50,160,60,80,30,185,130,85,60,45,35,10,15,0,110,130,70,20,170,95,110,130,15,95,65,40,225,65,240,25,60,130,40,75,80,40,95,65,70,265,100,80,55,215,20,185,95,255,130,135,235,55,250,180,135,240,265,250,115,215,40,75,115,140,50,50,80,50,180,85,65,75
Dallas,170,80,145,150,65,185,140,175,115,115,110,90,95,95,125,110,0,85,75,120,65,125,50,25,95,110,50,90,160,35,145,85,90,145,105,100,60,70,50,160,140,195,25,70,155,110,130,150,195,225,75,125,190,140,195,135,25,145,195,240,20,210,70,100,125,50,140,160,110,115,135,40,70,185
Denver,185,155,180,65,135,205,155,90,35,185,180,140,105,125,135,130,85,0,70,130,75,115,85,110,115,180,65,145,100,110,135,120,110,220,105,90,150,125,135,195,190,135,75,55,185,105,150,60,215,135,10,55,115,185,130,55,110,145,135,155,100,125,90,90,200,45,180,185,100,110,55,55,140,200
Des Moines,120,95,115,105,80,140,90,140,65,130,115,80,35,65,70,70,75,70,0,65,115,50,75,100,55,130,20,90,160,70,195,60,65,165,35,25,100,65,105,125,130,190,55,15,115,170,85,120,150,190,70,70,170,120,180,115,100,205,190,195,80,165,35,25,145,90,110,110,45,40,115,40,90,125
Detroit,55,75,60,155,75,75,25,180,125,100,80,60,25,25,15,20,120,130,65,0,165,90,120,135,30,110,70,50,225,90,250,35,75,145,35,65,100,55,110,65,80,255,105,75,65,220,30,180,85,250,130,130,230,70,245,180,140,245,255,240,105,210,50,65,125,140,60,45,65,35,180,90,85,65
El Paso,220,145,210,140,130,240,190,160,95,190,175,155,140,155,175,170,65,75,115,165,0,165,65,85,150,175,95,155,130,100,80,150,115,215,145,140,130,135,115,230,210,130,70,115,220,45,185,135,255,200,60,130,105,205,120,125,60,80,130,220,85,200,120,140,195,35,295,220,155,160,125,80,140,240
Fargo,145,135,145,65,130,165,115,90,75,165,150,125,65,90,100,95,125,115,50,90,165,0,125,150,80,170,70,120,175,120,210,95,110,210,55,25,145,110,150,155,160,205,105,60,145,220,110,135,175,160,125,45,150,150,200,130,150,220,205,150,130,120,80,25,190,140,140,130,25,55,130,75,140,135
Fort Worth,170,80,145,150,65,195,140,175,115,115,110,90,95,95,125,110,50,85,75,120,65,125,0,25,95,110,50,90,160,40,145,85,90,145,105,100,60,70,50,165,140,195,25,70,155,110,130,150,205,225,75,125,190,140,195,135,25,145,195,240,20,210,70,100,125,50,140,160,110,115,135,40,70,185
Houston,185,85,150,175,70,195,155,200,140,115,110,85,120,125,135,130,25,110,100,135,85,150,25,0,110,95,80,95,170,45,165,100,60,135,110,120,50,85,35,170,145,210,50,90,160,130,145,170,205,250,100,150,220,145,210,160,20,160,210,260,25,230,90,120,115,80,150,165,145,130,160,70,70,195
Indianapolis,75,60,70,145,50,95,45,170,115,80,65,45,20,10,30,15,95,115,55,30,150,80,95,110,0,95,50,40,215,50,225,10,50,130,25,60,80,30,85,80,80,245,75,65,70,200,35,170,105,245,115,110,220,70,235,170,115,225,245,230,90,200,25,60,110,115,65,65,80,40,170,70,60,90
Jacksonville,110,35,80,225,45,120,120,245,185,25,40,50,110,85,110,95,110,180,130,110,175,170,110,95,95,0,115,55,260,80,260,80,70,30,115,150,40,65,60,100,60,300,120,135,90,220,105,235,130,315,180,190,275,65,290,235,120,255,300,315,90,280,90,150,20,160,60,105,155,125,235,125,40,135
Kansas City,125,90,120,105,75,145,95,130,70,120,110,75,45,60,80,65,50,65,20,70,95,70,50,80,50,115,0,80,165,50,175,55,50,155,55,50,85,60,85,135,130,195,35,20,120,150,90,125,160,195,60,75,175,120,190,120,80,175,195,195,55,165,30,50,135,65,115,120,65,60,120,20,80,140
Knoxville,85,20,55,185,25,95,75,210,145,40,25,10,55,30,55,40,90,145,90,50,155,120,90,95,40,55,80,0,245,55,235,30,40,90,65,95,55,20,60,75,55,270,90,95,65,215,60,205,105,275,145,150,250,50,265,200,115,235,270,270,80,240,55,95,70,130,50,75,105,70,200,90,35,105
Las Vegas,280,230,275,110,235,300,250,90,120,265,260,240,195,225,230,225,160,100,160,225,130,175,160,170,215,260,165,245,0,190,30,215,210,300,195,180,215,220,200,280,290,65,155,150,280,75,245,60,260,135,110,140,80,280,65,45,145,45,65,150,170,170,190,180,285,95,275,255,170,185,45,125,210,280
Little Rock,135,55,110,155,40,150,105,180,115,85,85,55,65,65,90,65,35,110,70,90,100,120,40,45,50,80,50,55,190,0,185,50,15,115,75,95,50,35,45,130,110,215,35,70,120,160,95,160,180,245,100,125,215,105,215,160,60,180,215,265,20,230,35,95,95,75,105,125,100,85,160,40,45,150
Los Angeles,305,230,290,145,210,325,275,120,150,260,255,235,225,235,255,240,145,135,195,250,80,210,145,165,225,260,175,235,30,185,0,230,195,295,225,215,210,220,195,310,295,45,150,180,300,45,265,90,335,120,135,175,60,285,50,80,145,15,45,135,165,155,205,215,275,115,290,285,210,220,80,150,215,305
Louisville,85,45,70,160,40,105,55,180,120,70,55,30,30,10,35,25,85,120,60,35,150,95,85,100,10,80,55,30,215,50,230,0,40,120,40,70,55,20,75,85,80,245,85,70,80,225,45,175,115,245,120,125,225,70,240,170,115,225,245,250,80,220,25,70,100,120,65,75,80,55,170,70,50,95
Memphis,125,40,95,155,25,140,95,175,120,75,70,40,55,50,70,60,90,110,65,75,115,110,90,60,50,70,50,40,210,15,195,40,0,105,60,90,35,25,40,115,95,230,50,65,105,175,80,170,150,250,110,125,205,90,220,165,75,190,230,245,40,215,30,90,85,85,95,110,100,80,165,55,35,135
Miami,150,70,115,260,80,160,155,285,220,60,75,85,145,120,145,130,145,220,165,145,215,210,145,135,130,30,155,90,300,115,295,120,105,0,155,185,85,100,100,135,95,335,155,170,125,260,140,275,170,350,215,225,330,100,335,270,155,290,335,350,125,320,130,185,20,195,110,140,190,165,270,155,75,170
Milwaukee,90,80,80,120,75,110,60,145,100,110,95,70,10,35,40,40,105,105,35,35,145,55,105,110,25,115,55,65,195,75,225,40,60,155,0,35,90,55,100,100,105,225,85,50,90,195,55,155,120,215,115,90,205,95,220,150,130,230,225,210,85,180,35,35,135,110,65,75,40,10,150,75,85,90
Minneapolis,125,115,120,90,105,140,90,110,80,140,125,100,40,70,75,75,100,90,25,65,140,25,100,120,60,150,50,95,180,95,215,70,90,185,35,0,125,85,125,130,135,210,80,35,120,195,85,135,155,180,95,50,190,125,205,135,125,225,210,175,60,145,55,0,165,115,115,105,15,30,135,65,110,120
Mobile,135,35,105,190,30,145,120,210,155,60,60,50,85,75,100,80,60,150,100,100,130,145,60,50,80,40,85,55,215,50,210,55,35,85,90,125,0,50,15,120,95,260,80,105,110,175,105,225,145,285,140,160,250,95,260,195,70,210,260,280,45,250,65,125,65,115,100,125,135,105,195,85,20,155
Nashville,105,30,75,165,20,120,75,185,125,60,50,15,45,30,55,40,70,125,65,55,135,110,70,85,30,65,60,20,220,35,220,20,25,100,55,85,50,0,55,95,80,255,75,75,85,195,60,190,130,250,125,130,230,70,245,190,100,215,255,255,65,225,30,85,80,110,70,85,95,60,190,70,30,115
New Orleans,150,50,115,190,35,155,130,215,155,75,75,65,90,85,110,95,50,135,105,110,115,150,50,35,85,60,85,60,200,45,195,75,40,100,100,125,15,55,0,135,100,245,75,105,125,160,115,185,165,275,135,155,220,105,235,185,55,195,245,290,30,260,70,125,80,100,110,130,140,110,185,85,35,170
New York,15,85,20,220,100,25,40,240,190,75,60,85,90,75,55,65,160,195,125,65,230,155,165,170,80,100,135,75,280,130,310,85,115,135,100,130,120,95,135,0,45,315,160,140,10,280,45,245,35,310,195,180,295,35,310,240,190,305,315,305,155,275,105,130,120,200,20,15,135,90,240,155,110,40
Norfolk,60,55,25,220,70,70,65,250,190,45,40,65,95,70,65,70,140,190,130,80,210,160,140,145,80,60,130,55,290,110,295,80,95,95,105,135,95,80,100,45,0,320,150,140,35,265,50,245,80,320,190,195,285,10,310,245,160,280,320,310,120,280,100,135,60,185,25,45,140,100,245,140,80,75
Oakland,310,270,305,140,255,330,280,120,150,305,300,270,225,255,260,265,195,135,190,255,130,205,195,210,245,300,195,270,65,215,45,245,230,335,225,210,260,255,245,315,320,0,180,175,310,90,275,90,340,70,140,175,25,310,10,80,190,60,0,90,215,110,220,210,315,145,305,295,200,220,80,170,250,310
Oklahoma City,155,90,145,140,75,175,125,165,105,120,115,90,80,90,105,100,25,75,55,105,70,105,25,50,75,120,35,90,155,35,150,85,50,155,85,80,80,75,75,160,150,180,0,55,150,125,115,125,185,215,70,90,160,140,175,125,50,145,180,230,105,200,55,80,135,40,140,150,100,95,125,20,80,170
Omaha,130,100,130,90,90,150,100,115,50,135,125,90,50,75,85,80,70,55,15,75,115,60,70,90,65,135,20,95,150,70,180,70,65,170,50,35,105,75,105,140,140,175,55,0,130,160,95,105,160,175,55,55,155,135,170,105,100,190,175,180,75,150,40,35,150,85,125,125,50,55,105,30,100,140
Philadelphia,25,75,10,210,90,30,40,235,180,80,50,75,80,65,50,55,155,185,115,65,220,145,155,160,70,90,120,65,280,120,300,80,105,125,90,120,110,85,125,10,35,310,150,130,0,270,35,235,45,300,185,170,285,25,300,235,180,295,310,295,135,265,95,120,110,190,15,25,125,90,235,135,100,45
Phoenix,275,190,270,190,175,295,245,165,140,225,240,190,195,210,225,215,110,105,170,220,45,220,110,130,200,220,150,215,75,160,45,225,175,260,195,195,175,195,160,280,265,90,125,160,270,0,235,140,305,160,95,160,105,265,90,120,105,40,90,180,130,200,180,195,240,85,265,245,190,180,120,110,180,275
Pittsburgh,55,80,35,175,80,65,25,200,145,80,60,70,45,30,15,20,130,150,85,30,185,110,130,145,35,105,90,60,245,95,265,45,80,140,55,85,105,60,115,45,50,275,115,95,35,235,0,200,80,265,150,135,250,40,265,200,155,260,275,260,120,230,60,85,125,155,30,30,95,60,200,110,85,60
Pocatello,235,210,235,50,205,255,205,25,75,240,230,215,150,180,190,185,150,60,120,180,135,135,150,170,170,235,125,205,60,160,90,175,170,275,155,135,225,190,185,245,245,90,125,105,235,140,200,0,270,70,75,100,70,240,85,15,175,110,90,90,155,60,145,135,255,110,230,225,125,150,15,105,205,235
Portland ME,30,120,55,240,135,10,60,265,215,110,95,120,115,105,80,95,195,215,150,85,255,175,205,205,105,130,160,105,260,180,335,115,150,170,120,155,145,130,165,35,80,340,185,160,45,305,80,270,0,335,220,215,315,70,335,265,225,335,340,325,160,295,130,155,150,220,55,40,160,120,265,180,140,30
Portland OR,300,280,305,95,265,320,270,70,130,310,305,265,220,245,255,255,225,135,190,250,200,160,225,250,245,315,195,275,135,245,120,245,250,350,215,180,285,250,275,310,320,70,215,175,300,160,265,70,335,0,145,145,75,310,65,90,250,130,70,20,240,35,220,180,330,185,300,280,175,205,90,170,265,290
Pueblo,185,150,180,75,135,210,155,100,45,185,180,140,105,125,135,130,75,10,70,130,60,125,75,100,115,180,60,145,110,100,135,120,110,215,115,95,140,125,135,195,190,140,70,55,185,95,150,75,220,145,0,65,120,185,135,65,95,135,140,160,100,130,90,95,200,35,180,185,105,115,65,50,135,200
Rapid City,170,160,170,50,145,205,140,75,30,190,180,145,90,120,125,135,125,55,70,130,130,45,125,150,110,190,75,150,140,125,175,125,125,225,90,50,160,130,155,180,195,175,90,55,170,160,135,100,215,145,65,0,155,190,170,95,150,185,175,140,130,110,95,50,205,110,180,165,70,90,95,65,150,175
Reno,255,260,285,120,230,305,255,95,125,295,275,245,200,230,235,235,190,115,170,230,105,150,190,220,220,275,175,250,80,215,60,225,205,330,205,190,250,230,220,295,285,25,160,155,285,105,250,70,315,75,120,155,0,280,15,55,200,85,25,95,210,110,205,190,310,155,280,275,190,200,55,150,235,280
Richmond,50,60,15,215,75,55,55,235,185,40,35,60,85,60,55,55,140,185,120,70,205,150,140,145,70,65,120,50,280,105,285,70,90,100,95,125,95,70,105,35,10,310,140,135,25,265,40,240,70,310,185,190,280,0,305,235,165,285,310,300,120,270,90,125,85,180,10,40,130,90,235,130,85,70
Sacramento,270,270,300,135,240,320,270,110,140,310,290,260,200,245,250,250,195,130,180,245,120,200,195,210,235,290,190,265,65,215,50,240,220,335,220,205,260,245,235,310,310,10,175,170,300,90,265,85,335,65,135,170,15,305,0,70,190,65,10,85,215,100,210,205,315,145,295,290,210,215,70,165,245,295
Salt Lake City,235,205,230,65,190,255,205,45,75,235,225,205,150,180,185,180,135,55,115,180,125,130,135,160,170,235,120,200,45,160,80,170,165,270,150,135,195,190,185,240,245,80,125,105,235,120,200,15,265,90,65,95,55,235,70,0,160,90,80,105,150,80,145,135,250,95,230,225,130,150,5,100,190,235
San Antonio,195,105,170,175,95,210,165,195,140,135,135,105,120,125,145,135,25,110,100,140,60,150,25,20,115,120,80,115,145,60,145,115,75,155,130,125,70,100,55,190,160,190,50,100,180,105,155,175,225,250,95,150,200,165,190,160,0,170,190,265,50,235,90,125,135,70,170,185,140,145,160,70,90,210
San Diego,315,225,285,155,210,325,270,130,165,260,255,235,220,235,250,240,145,145,205,245,80,220,145,160,225,255,175,235,45,180,15,225,190,290,230,225,210,215,195,305,280,60,145,190,295,40,260,110,335,130,135,185,85,285,65,90,170,0,60,150,165,170,200,225,270,110,285,280,230,220,90,145,215,305
San Francisco,310,270,305,140,255,330,280,120,150,305,300,270,225,255,260,265,195,135,190,255,130,205,195,210,245,300,195,270,65,215,45,245,230,335,225,210,260,255,245,315,320,0,180,175,310,90,275,90,340,70,140,175,25,310,10,80,190,60,0,90,215,110,220,210,315,145,305,295,210,220,80,170,250,310
Seattle,315,280,295,90,270,315,265,65,125,315,300,270,215,240,250,250,240,155,195,240,220,150,240,260,230,315,195,270,150,265,135,250,245,350,210,175,280,255,290,305,310,90,230,180,295,180,260,90,325,20,160,140,95,300,85,105,265,150,90,0,260,30,220,175,330,205,290,275,170,200,105,175,270,305
Shreveport,160,65,125,160,45,165,140,185,125,95,90,70,85,85,110,115,20,100,80,105,85,130,20,25,90,90,55,80,170,20,165,80,40,125,85,60,45,65,30,155,120,215,105,75,135,130,120,155,160,240,100,130,210,120,215,150,50,165,215,260,0,225,85,105,110,65,120,145,125,110,150,55,50,170
Spokane,265,280,265,60,240,285,235,35,90,280,270,185,185,210,215,215,210,125,165,210,200,120,210,230,200,280,165,240,170,230,155,220,215,320,180,145,250,225,260,275,280,110,200,150,265,200,230,60,295,35,130,110,110,270,100,80,235,170,110,30,225,0,190,145,300,175,260,245,145,170,80,150,240,265
St Louis,100,60,90,130,50,120,70,155,100,90,80,45,30,35,50,40,70,90,35,50,120,80,70,90,25,90,30,55,190,35,205,25,30,130,35,55,65,30,70,105,100,220,55,40,95,180,60,145,130,220,90,95,205,90,210,145,90,200,220,220,85,190,0,55,110,95,90,95,70,50,145,45,60,120
St Paul,120,115,120,90,105,140,90,110,80,140,125,100,40,70,75,75,100,90,25,65,140,25,100,120,60,150,50,95,180,95,215,70,90,185,35,0,125,85,125,130,135,210,80,35,120,195,85,135,155,180,95,50,190,125,205,135,125,225,210,175,105,145,55,0,165,110,115,105,15,30,135,65,110,120
Tampa,135,55,100,240,60,140,140,265,150,45,60,20,125,100,125,115,125,200,145,125,195,190,125,115,110,20,135,70,285,95,275,100,85,20,135,165,65,80,80,120,60,315,135,150,110,240,125,255,150,330,200,205,310,85,315,250,135,270,315,330,110,300,110,165,0,175,95,125,195,145,250,140,55,160
Tucumcari,185,130,185,110,115,210,165,135,80,160,155,130,110,125,145,140,50,45,90,140,35,140,50,80,115,160,65,130,95,75,115,120,85,195,110,115,115,110,100,200,185,145,40,85,190,85,155,110,220,185,35,110,155,180,145,95,70,110,145,205,65,175,95,110,175,0,180,190,120,125,95,50,120,210
Washington DC,35,85,50,205,75,45,45,225,175,50,40,60,75,55,45,50,140,180,110,60,295,140,140,150,65,60,115,50,275,105,290,65,95,110,65,115,100,70,110,20,25,305,140,125,15,265,30,230,55,300,180,180,280,10,295,230,170,285,305,290,120,260,90,115,95,180,0,30,145,85,230,135,85,60
Binghamton,15,90,25,195,100,30,20,220,185,80,65,85,75,75,40,50,160,185,110,45,220,130,160,165,65,105,120,75,255,125,285,75,110,140,75,105,125,85,130,15,45,295,150,125,25,245,30,225,40,280,185,165,275,40,290,225,185,280,295,275,145,245,95,105,125,190,30,0,115,75,225,140,105,30
Duluth,125,125,125,95,115,145,95,115,90,150,135,105,50,80,75,80,110,100,45,65,155,25,110,145,80,155,65,105,170,100,210,80,100,190,40,15,135,95,140,135,140,200,100,50,125,190,95,125,160,175,105,70,190,130,210,130,140,230,210,170,125,145,70,15,195,120,145,115,0,30,130,80,125,125
Green Bay,85,95,85,120,85,105,60,145,110,110,90,80,20,50,45,50,115,110,40,35,160,55,115,130,40,125,60,70,185,85,220,55,80,165,10,30,105,60,110,90,100,220,95,55,90,180,60,150,120,205,115,90,200,90,215,150,145,220,220,200,110,170,50,30,145,125,85,75,30,0,150,80,95,95
Ogden,235,205,230,65,190,255,205,45,75,235,225,205,150,180,185,180,135,55,115,180,125,130,135,160,170,235,120,200,45,160,80,170,165,270,150,135,195,190,185,240,245,80,125,105,235,120,200,15,265,90,65,95,55,235,70,5,160,90,80,105,150,80,145,135,250,95,230,225,130,150,0,100,190,235
Wichita,140,95,135,95,80,170,105,115,70,125,5,85,70,85,105,85,40,55,40,90,80,75,40,70,70,125,20,90,125,40,150,70,55,155,75,65,85,70,85,155,140,170,20,30,135,110,110,105,180,170,50,65,150,130,165,100,70,145,170,175,55,150,45,65,140,50,135,140,80,80,100,0,85,160
Montgomery,120,20,90,180,10,130,100,200,150,45,45,25,75,55,80,65,70,140,90,85,140,140,70,70,60,40,80,35,210,45,215,50,35,75,85,110,20,30,35,110,80,250,80,100,100,180,85,205,140,265,135,150,235,85,245,190,90,215,250,270,50,240,60,110,55,120,85,105,125,95,190,85,0,135
Montreal,25,120,55,210,130,35,40,230,195,115,95,115,90,85,60,75,185,200,125,65,240,135,185,195,90,135,140,105,280,150,305,95,135,170,90,120,155,115,170,40,75,310,170,140,45,275,60,235,30,290,200,175,280,70,295,235,210,305,310,305,170,265,120,120,160,210,60,30,125,95,235,160,135,0`;

const USA2_payouts = generatePayoutLookup(USA2_payout_csv, USA2_D);


let Regions = [USA_R, AUS_R, USA2_R],
	RegionNames = [USA_regionNames, AUS_regionNames, USA2_regionNames],
	Destinations = [USA_D, AUS_D, USA2_D],
	CityNames = [USA_cityNames, AUS_cityNames, USA2_cityNames],
	CityRegion = [USA_cityRegion, AUS_cityRegion, USA2_cityRegion],
	RegionLookup = [USA_lookup_region, AUS_lookup_region, USA2_lookup_region],
	DestLookup = [USA_lookup_dest, AUS_lookup_dest, USA2_lookup_dest],
	Payouts = [USA_payouts, AUS_payouts, USA2_payouts];