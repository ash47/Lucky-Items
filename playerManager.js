var playerProps = new Array(dota.MAX_PLAYERS);

for (var i = 0; i < playerProps.length; ++i)
{
	playerProps[i] = {
		queue: [],					// Handles extra equipment in storage space
		queueNotified: false,		// Reminder of queued items
		snapHeroEquip: [],			// Last snapshot of a player's equipment
		equipmentHandouts: [],		// Logs all item names given to this player
		equipmentEntities: [],		// Logs all item entity indexes changed by the plugin
		nextDropFavored: false,		// Next random drop favorable for this player?
		lootTable: null,			// Personal playerID loot table
		buildLootTable: true,		// Boolean to tell plugin to build a loot table
		enchantTimeouts: {},
		lastAttacker: null,
		onEquipModifiers: []
	};
}

function setPlayerProp(playerID, prop, value) {
	if(!playerProps[playerID])
		return undefined;

	playerProps[playerID][prop] = value;
	return true;
}

function getPlayerProp(playerID, prop) {
	if(!playerProps[playerID])
		return undefined;

	if(!playerProps[playerID][prop])
		return undefined;

	return playerProps[playerID][prop];
}

function getProps() {
	return playerProps;
}

function addItemToQueue(item, playerID) {
	// Pull our stored queue property
	var prop = getPlayerProp(playerID, 'queue');
	// Push the new item into it
	prop.push(item);
	// Set the new queue property
	setPlayerProp(playerID, 'queue', prop);
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
	var playerIDs = playerManager.getConnectedPlayerIDs();
	for (var i = 0; i < playerIDs.length; ++i)
	{
		var playerID = playerIDs[i];
		var client = dota.findClientByPlayerID(playerID);
		var format = sprintf(string, args);
		client.printToChat(g_plugin["prefix"] + " " + format);
	}
}

function printToPlayer(playerID, string, args) {
	if (typeof(args) === 'undefined') args = [];
	var format = sprintf(string, args);
	var client = dota.findClientByPlayerID(playerID);
	if (client === null)
		return;

	client.printToChat(g_plugin["prefix"] + " " + format);
}

// ==========================================
// Player Queue
// ==========================================
timers.setInterval(function() {
	// Has the map & plugin initialized?
	if (!settings.mapLoaded || !settings.pluginLoaded) return;
	// Has the game begun?
	if (!util.getGameState(dota.STATE_GAME_IN_PROGRESS)) return;
	// Loop through the players
	var playerIDs = getConnectedPlayerIDs();
	for (var i = 0; i < playerIDs.length; ++i) {
		var playerID = playerIDs[i];
		// Do we have a hero?
		var hero = playerManager.grabHero(playerID);
		if (hero === null) continue; // Skip
		// Take a snapshot of a player's equipment, in-case they disconnect
		playerProps[playerID].snapHeroEquip = unitManager.pullHeroEquipment(hero, 1);
		// Queue operations
		if (playerProps[playerID].queue.length > 0) {
			// Do we have space in inventory or stash?
			if (unitManager.isInventoryAvailable(hero) || unitManager.isBankAvailable(hero)) {
				// Shift the beginning item in our player queue
				var itemToGive = playerProps[playerID].queue.shift();
				// Give it to our player
				giveItemToPlayer(itemToGive, playerID);
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

// Exports
exports.getTeamIDFromPlayerID = getTeamIDFromPlayerID;
exports.getConnectedPlayerIDs = getConnectedPlayerIDs;
exports.addToQueue = addItemToQueue;
exports.setProp = setPlayerProp;
exports.getProp = getPlayerProp;
exports.getProps = getProps;
exports.grabHero = grabHero;
exports.print = printToPlayer;
exports.printAll = printToAll;