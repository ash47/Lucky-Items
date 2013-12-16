var timers = require('timers');
var settings = require('settings.js').s;
var util = require('util.js');
var unitManager = require('unitManager.js');
var sprintf = require('sprintf.js').vsprintf;
var enchanter = settings.enchanter;
var itemManager = require('itemManager.js');

var playerProps = new Array(dota.MAX_PLAYERS);

for (var i = 0; i < playerProps.length; ++i)
{
	playerProps[i] = {
		queue: [],					// Handles extra equipment in storage space
		queueNotified: false,		// Reminder of queued items
		queuePaused: false,			// A boolean controlled by the player to stop/start the queue
		snapHeroEquip: [],			// Last snapshot of a player's equipment
		equipmentHandouts: [],		// Logs all item names given to this player
		equipmentEntities: [],		// Logs all item entity indexes changed by the plugin
		nextDropFavored: false,		// Next random drop favorable for this player?
		lootTable: null,			// Personal playerID loot table
		buildLootTable: true,		// Boolean to tell plugin to build a loot table
		enchantTimeouts: {},
		lastAttacker: null,
		lastEquipment: [],
		upgradeHandouts: []			// Logs all the item upgrades randomed to this player
	};
}

function setProp(playerID, prop, value) {
	if(!playerProps[playerID])
		return undefined;

	playerProps[playerID][prop] = value;
	return true;
}

function getProp(playerID, prop) {
	if(!playerProps[playerID])
		return undefined;

	if(!playerProps[playerID][prop])
		return undefined;

	return playerProps[playerID][prop];
}

function getProps() {
	return playerProps;
}

function giveItem(playerID, item) {
	// We can't find their hero, queue the item
	var hero = grabHero(playerID);
	if (hero === null) {
		addToQueue(playerID, item);
		return false;
	}
	// Is the hero alive and well?
	if (unitManager.getLifeState(hero) === settings.UNIT_LIFE_STATE_ALIVE) {
		// Do we have space in the player's inventory or stash?
		var hasSpace = false;
		for(var i=0; i<12; i++) {
			if(hero.netprops.m_hItems[i] == null) {
				hasSpace = true;
				break;
			}
		}
		
		if(!hasSpace) {
			addToQueue(playerID, item);
			return false;
		}
		
		// Give the item to our hero
		var clsname = item[0];
		
		var entity = dota.giveItemToHero(clsname, hero);
		
		if (entity === null) return false;
		// Possible enchant our loot
		if (enchanter.enabled && enchanter.random) {
			itemManager.enchantLoot(entity, item, playerID);
		}
		// Alter item properties
		itemManager.changeItemProperties(entity, item, playerID);
		return true;
	}
	else {
		addToQueue(playerID, item);
		return false;
	}
}

function addToQueue(playerID, item) {
	// Pull our stored queue property
	var prop = getProp(playerID, 'queue');
	// Push the new item into it
	prop.push(item);
	// Set the new queue property
	setProp(playerID, 'queue', prop);
}

function grabHero(playerID) {
	// Do we have a client?
	var client = dota.findClientByPlayerID(playerID);
	if (client === null) return null;
	// Does the client control a hero?
	var hero = client.netprops.m_hAssignedHero;
	if (hero === null) return null;
	// Is the hero a hero?
	if (!hero.isHero()) return null;
	// Return a valid hero
	return hero;
}

function resetQueueReminder(playerID) {
	timers.setTimeout(function() {
		playerProps[playerID].queueNotified = false;
	}, settings.queue.reminderTimeout * 1000);
}

function printToAll(string, args) {
	if (typeof(args) === 'undefined') args = [];
	var playerIDs = getConnectedPlayerIDs();
	for (var i = 0; i < playerIDs.length; ++i)
	{
		var playerID = playerIDs[i];
		var client = dota.findClientByPlayerID(playerID);
		var format = sprintf(string, args);
		client.printToChat(settings.prefix + " " + format);
	}
}

function printToPlayer(playerID, string, args) {
	if (typeof(args) === 'undefined') args = [];
	var format = sprintf(string, args);
	var client = dota.findClientByPlayerID(playerID);
	if (client === null)
		return;

	client.printToChat(settings.prefix + " " + format);
}

// ==========================================
// Player Queue
// ==========================================
timers.setInterval(function() {
	// Has the map & plugin initialized?
	if (!settings.mapLoaded || !settings.pluginLoaded)
		return;
	// Has the game begun?
	if (!util.getGameState(dota.STATE_GAME_IN_PROGRESS))
		return;
	// Loop through the players
	var playerIDs = getConnectedPlayerIDs();
	for (var i = 0; i < playerIDs.length; ++i) {
		// Looped playerID
		var playerID = playerIDs[i];
		// Do we have a hero?
		var hero = grabHero(playerID);
		if (hero === null) continue; // Skip
		// Take a snapshot of a player's equipment, in-case they disconnect
		playerProps[playerID].snapHeroEquip = unitManager.pullHeroEquipment(hero, 1);
		// Queue operations
		if (playerProps[playerID].queue.length > 0 && !playerProps[playerID].queuePaused) {
			// Do we have space in inventory or stash?
			if (unitManager.isInventoryAvailable(hero) || unitManager.isBankAvailable(hero)) {
				// Shift the beginning item in our player queue
				var itemToGive = playerProps[playerID].queue.shift();
				// Give it to our player
				settings.sounds.enabled = false;
				giveItem(playerID, itemToGive);
				settings.sounds.enabled = true;
			}
			// If we have more items in the queue, send a reminder
			if (playerProps[playerID].queue.length >= settings.queue.remindNItems && !playerProps[playerID].queueNotified) {
				// Tell our player about thier queue
				printToPlayer(playerID, settings.queue.reminderNotice, [playerProps[playerID].queue.length]);
				// Let the plugin know we reminded this player
				playerProps[playerID].queueNotified = true;
				// Perform a timed reset on the reminder state
				resetQueueReminder(playerID);
			}
		}
	}
}, settings.queue.interval * 1000);

function getTeamIDFromPlayerID(playerID) {
	var client = dota.findClientByPlayerID(playerID);
	if (client === null)
		return false;
	var teamID = client.netprops.m_iTeamNum;
	return teamID;
}


function getConnectedPlayerIDs(teamID) {
	var playing = [];
	for (var i = 0; i < server.clients.length; ++i)
	{
		var client = server.clients[i];
		if (client === null)
			continue;

		if (!client.isInGame())
			continue;

		var playerID = client.netprops.m_iPlayerID;
		if (playerID === -1)
			continue;

		if (!teamID)
			playing.push(playerID);
		else {
			if (client.netprops.m_iTeamNum === teamID)
				playing.push(playerID);
		}
	}
	return playing;
}

// http://d2ware.net/plugin?Builder1
// Sets the clients gold
function setPlayerGold(playerID, gold) {
	// Validate gold
	if (DEBUG) server.print("setPlayerGold: Setting new gold");
	if (gold == null
		|| gold.r == null
		|| gold.u == null) {
		if (DEBUG) server.print("setPlayerGold: Setting new gold: gold value is NULL");
		return false;
	}
	
	// Grab client
	var client = dota.findClientByPlayerID(playerID);
	if (client === null) {
		if (DEBUG) server.print("setPlayerGold: Could not find client.");
		return false;
	}
	
	// Grab the clients team
	var playerTeamID = client.netprops.m_iTeamNum;

	// Grab the player resource manager
	var dotaPlayerManager = settings.dotaPlayerManager;
	
	// Set their gold, depending on their team
	if (playerTeamID === dota.TEAM_RADIANT) {
		dotaPlayerManager.netprops.m_iReliableGoldRadiant[playerID] = gold.r;
		dotaPlayerManager.netprops.m_iUnreliableGoldRadiant[playerID] = gold.u;
	}
	else if (playerTeamID === dota.TEAM_DIRE) {
		dotaPlayerManager.netprops.m_iReliableGoldDire[playerID] = gold.r;
		dotaPlayerManager.netprops.m_iUnreliableGoldDire[playerID] = gold.u;
	}
	else {
		if (DEBUG) server.print("setPlayerGold: Setting new gold: FALSE, Invalid TeamID");
		return false;
	}
	if (DEBUG) server.print("setPlayerGold: Success");
	return true;
}
// Gets the client gold
function getPlayerGold(playerID) {
	// Grab client
	var client = dota.findClientByPlayerID(playerID);
	if (client === null)
		return false;

	if (DEBUG) server.print("getPlayerGold: Found client");
	
	// Grab the clients team
	var playerTeamID = client.netprops.m_iTeamNum;
	if (DEBUG) server.print("getPlayerGold: Found teamID" + playerTeamID);

	var dotaPlayerManager = settings.dotaPlayerManager;
	
	// Read their gold, where we read depends on their team
	if (playerTeamID === dota.TEAM_RADIANT) {
		var reliableGold = dotaPlayerManager.netprops.m_iReliableGoldRadiant[playerID];
		var unreliableGold = dotaPlayerManager.netprops.m_iUnreliableGoldRadiant[playerID];
	}
	else if (playerTeamID === dota.TEAM_DIRE) {
		var reliableGold = dotaPlayerManager.netprops.m_iReliableGoldDire[playerID];
		var unreliableGold = dotaPlayerManager.netprops.m_iUnreliableGoldDire[playerID];
	}
	else
		return null;
	
	// Return table with money data
	return {r:reliableGold,
			u:unreliableGold}
}
// Takes gold from a player
function purchase(playerID, cost) {
	// Grab client
	var client = dota.findClientByPlayerID(playerID);
	if (client === null)
		return false;

	if (DEBUG) server.print("Purchase: Found client");
	
	// Grab and validate gold
	var gold = getPlayerGold(playerID);
	if (gold == null) {
		if (DEBUG) server.print("Purchase: gold = null");
		return false;
	}
	if (DEBUG) server.print("Unreliable gold: " + gold.u);
	if (DEBUG) server.print("Reliable gold: " + gold.r);
	if (DEBUG) server.print("Cost of Enchantment: " + cost);
	
	// They can't afford
	if (gold.r + gold.u < cost) {
		if (DEBUG) server.print("Purchase: reliable + unreliable gold less than " + cost);
		return false;
	}
	
	// Calculate new gold values
	gold.u -= cost;
	if (gold.u < 0) {
		gold.r += gold.u;
		gold.u = 0;
	}
	
	// Store new values
	return setPlayerGold(playerID, gold);
}

// Exports
exports.setPlayerGold = setPlayerGold;
exports.getPlayerGold = getPlayerGold;
exports.purchase = purchase;
exports.giveItem = giveItem;
exports.getTeamIDFromPlayerID = getTeamIDFromPlayerID;
exports.getConnectedPlayerIDs = getConnectedPlayerIDs;
exports.addToQueue = addToQueue;
exports.setProp = setProp;
exports.getProp = getProp;
exports.getProps = getProps;
exports.grabHero = grabHero;
exports.print = printToPlayer;
exports.printAll = printToAll;