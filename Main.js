// Libraries
var timers = require('timers.js');
var sprintf = require('sprintf.js').vsprintf;

// ==========================================
// Plugin Information - READ ONLY
// ==========================================
var g_plugin = {
	name: "Lucky Items",
	prefix: "[LI]",
	author: "koone",
	description: "Gives players weighted random items.",
	version: "1.2.1",
	url: "http://www.d2ware.net/",
	thanks: {
		ocnyd6: "making the Fighting Chance plugin",
        fr0sZ: "asking thought-provoking scenario questions",
        m28: "d2ware, timers library",
        smjsirc: "tet etc",
        d2wareplayers: "",
        humbug: "helping",
        chirpers: "good suggestions",
        ash47: "helping"
    },
	license: "http://www.gnu.org/licenses/gpl.html",
	developer: true // Developer Mode
};

// ==========================================
// General Setup
// ==========================================

// Constants
var HERO_INVENTORY_BEGIN = 0;
var HERO_INVENTORY_END = 5;
var HERO_STASH_BEGIN = 6;
var HERO_STASH_END = 12;
var UNIT_LIFE_STATE_ALIVE = 0;
var TEAM_DIRE = dota.TEAM_DIRE;
var TEAM_RADIANT = dota.TEAM_RADIANT;

// Variables
var playerManager;
var playerProps = [];

// ==========================================
// Warden Setup
// ==========================================
var warden = {
	mapLoaded: false,			// Did the map finish loading?
	pluginLoaded: false,		// Did the plugin initialize?
	leadTime: ['5:00'],			// Lead item drop : STATE_GAME_IN_PROGRESS
	nextBase: ['5:00'],			// Subsequent drops after the lead
	shakeTime: 4,				// Used to random x seconds off designated drop times
	nextTime: 0,				// When our next drop will occur
	gameTime: null,				// Keeps track of gametime
	currentWave: 0,				// Keeps track of the current item wave (and total)
	playerList: [],				// Which clients will receive an item
	maxTries: 8,				// To prevent an infinite loop, break out
	maxTriesLoot: [				// We can't find our player an item, default to these
		"item_cheese"
	],
	reLootPercentage: 75,		// A percentage chance to random twice on specific items
	reLootTable: [				// Items to perform another random on.
		"item_aegis",
		"item_cheese"
	],
	doNotConsiderDupes: [		// Exceptions to keep generating loot.
		"item_rapier",
		"item_aegis",
		"item_cheese"
	],
	doNotPutInStash: [			// A bug with the aegis, as you can't remove it once it's in your stash
		"item_aegis"
	],
	// This is the inventory queue to manage items when a player cannot be given more items.
	// An integral part of the plugin, and cannot be disabled.
	queue: {
		checkXSeconds: 1.2,		// Every X seconds, check our inventory queue & dispense items
		reminded: false,		// Have we reminded our player?
		remindNItems: 2,		// Reminder trigger on the amount of items in a player's queue
		reminderTimeout: 120,	// Every X seconds, remind our player they have items in their queue
		notice: {				// Message notifications
			added: "Queued...",
			reminder: "%s items in your queue."
		}
	},
	// Plugin sound effects that occur when an item is randomed to a player or other trigger events.
	soundEffects: {
		enabled: true,			// Enabled / disabled
		timeThreshold: 150,		// Below this time (in seconds) threshold, disable them
		list: [					// List of sound effects to use
			"ui/npe_objective_given.wav"
			// "ui/ui_add_to_inventory_01.wav"
		]
	},
	// Plugin chat drop notifications display
	dropNotifications: {
		lead: "\x02%s\x01",		// Lead item time (NOTE: Always enabled)
		enabled: true,			// Enable / disable subsequent notifications
		timeThreshold: 150,		// Below this time (in seconds) threshold, disable them
		subsequent: "%s",		// Subsequent item time
	},
	// Properties of the generated base item table
	itemTable: {
		instance: null,			// Here we store our lobby generated item table.
		useWeights: true,		// Enable / disable the use of item weighing (RECOMMENDED: true)
		priceRangeMin: 1000,	// MIN price value to include in item table generation
		priceRangeMax: 7000,	// MAX price value to include in item table generation
		customMode: 1,			// Custom Modes: 1 - Default; 2 - Aegis & Rapier only
		// This section disables additional randoms for aura-based or team-wide items.
		// Warden will only dispense (randomly) the set number of items per team.
		countLimitPerTeam: {},
		limitPerTeam: {
			item_medallion_of_courage: 1,
			item_ancient_janggo: 1,
			item_vladmir: 1,
			item_assault: 2,
			item_hood_of_defiance: 1,
			item_pipe: 1,
			item_mekansm: 1,
			item_ring_of_basilius: 1,
			item_ring_of_aquila: 1,
			item_urn_of_shadows: 2,
			item_veil_of_discord: 1,
			item_shivas_guard: 2,
			item_bloodstone: 2,
			item_radiance: 2,
			item_desolator: 2
		},
		// Setting below removes possible item recipe upgrades from rolling again per player.
		// For example, if a player rolled a dagon 3 the first time,
		// all other possible dagon rolls are excluded, including a dagon 5.
		componentExclude: keyvalue.parseKVFile("item_component_exclusion_list.kv")
	},
	// This is the plugin item trash manager, it looks at all the items it has given to each player,
	// and cleans up all of them that are not in their inventory.
	trashManager: {
		enabled: false,			// Enable/disable the trash manager
		cleanAtXWave: 5,		// Cleanup every X item wave
		cleaned: false,			// Did the plugin perform a cleanup?
		notice: {
			active: "Sweeping leftovers..."
		}
	},
	// These are the plugin addons. They are added onto the base and provide improved functionality.
	// Plugin addons can be disabled, and the base plugin still functions normally without their intended benefits.
	addons: {
		// Addon version: 1.0.0
		// Buys a courier for each team if they don't have one by the end of the pre-game phase.
		helpingHand: {
			enabled: false,
			courierBoughtForRadiant: false,
			courierBoughtForDire: false
		},
		// Addon version: 1.0.0
		// Tailors loot on a per-hero basis
		wardrobe: {
			enabled: true,
			loaded: false,
			checkAbilities: false,
			heroFile: keyvalue.parseKVFile("hero_base.kv"),
			spellFile: keyvalue.parseKVFile("spell_base.kv"),
			// Any plugins listed below will disable the tailor module completely.
			disallowPlugins: [
				"DMDota", // Constant hero swapping, which would be impossible for this module.
			],
			// Any plugins listed below will switch the method on how the hero is tailored.
			abilityPlugins: [
				"OMGDota",
				"bomg",
				"LegendsOfDota",
				"SickSkills"
			],
			rules: {
				scepterUpgradeWeightIncrease: 500,
				tailoredItemBuildWeightIncrease: 150,
				primaryAttributeWeightIncrease: 50
			}
		},
		// Addon Description: Release Version 1.0.0
		// Currently watches on: Kills
		// Watches each team and adjusts item weights based on performance
		pendulum: {
			enabled: false,
			// checkNSeconds: 10
			killsItemTableThresholdMin: 2, // Kill difference threshold for poor items
			killsItemTableThresholdMax: 8,
			TEAM_RADIANT: {
				modifier: 0,
				usePoorTable: false,
				kills: 0
			},
			TEAM_DIRE: {
				modifier: 0,
				usePoorTable: false,
				kills: 0
			}
		}
	}
};
var wardrobe = warden.addons.wardrobe;
var pensettings = warden.addons.pendulum;

// ==========================================
// Player Inventory Queue
// ==========================================
timers.setInterval(function() {
	if (warden.pluginLoaded) {
		var clients = getConnectedPlayingClients();
		if (clients.length === 0) return;

		for (i = 0; i < clients.length; ++i)
		{
			client = clients[i];
			playerID = client.netprops.m_iPlayerID;
			hero = client.netprops.m_hAssignedHero;

			if (playerProps[playerID])
			{
				var queueLength = playerProps[playerID].queue.length;
				if (queueLength > 0) {
					if (hero !== null) {
						if (isInventoryAvailable(hero) || isStashAvailable(hero)) {
							giveItemToClient(playerProps[playerID].queue[0], client);
							playerProps[playerID].queue.shift();
						}
					}
					if (queueLength >= warden.queue.remindNItems && !warden.queue.reminded) {
						printToClient(client, warden.queue.notice.reminder, [playerProps[playerID].queue.length]);
						timers.setTimeout(resetQueueReminder, (warden.queue.reminderTimeout * 1000));
						warden.queue.reminded = true;
					}
				}
			}
		}
	}
}, warden.queue.checkXSeconds * 1000);

// ==========================================
// Warden & Player Properties
// ==========================================
timers.setInterval(function() {
	if (!warden.mapLoaded) return;

	var clients = getConnectedPlayingClients();
	if (clients.length === 0) return;

	var gameState = game.rules.props.m_nGameState;
	if (gameState < dota.STATE_PRE_GAME || gameState > dota.STATE_GAME_IN_PROGRESS) return;

	var client, playerID, hero;
	var i, k, v;
	// ==========================================
	// Player Properties & Inventory Queue
	// ==========================================
	if (warden.pluginLoaded) {
		for (i = 0; i < clients.length; ++i)
		{
			client = clients[i];
			playerID = client.netprops.m_iPlayerID;
			hero = client.netprops.m_hAssignedHero;

			if (!playerProps[playerID]) {
				playerProps[playerID] = {
					uniqueItemsGiven: [],
					queue: [],
					items: [],
					lootTable: null,
					buildLootTable: true
				};
			}
		}
	}
	// ==========================================
	// Warden: Manages item drops
	// ==========================================
	var gameTime, increment, time, shakeTime;
	if (!warden.pluginLoaded && gameState === dota.STATE_GAME_IN_PROGRESS) {

		warden.pluginLoaded = true;
		warden.nextTime += convertMinutesToSeconds(warden.leadTime[getRandomInt(warden.leadTime.length)]) + getRandomInt( flipInt(warden.shakeTime) );

		warden.gameTime = game.rules.props.m_fGameTime + warden.nextTime;
		timeFirst = convertSecondsToMinutes(warden.nextTime);
		printToAll(warden.dropNotifications.lead, [timeFirst]);

		if (warden.addons.helpingHand.enabled) {
			if (!warden.addons.helpingHand.courierBoughtForRadiant) {

			}
			if (!warden.addons.helpingHand.courierBoughtForDire) {
				
			}
		}

		// If for some reason the lobby manager fails & the item table isn't loaded, let's re-build it here.
		if (warden.itemTable.instance === null) {
			buildItemTable();
		}

	}
	if (warden.pluginLoaded && game.rules.props.m_fGameTime >= warden.gameTime) {

		warden.currentWave += 1;

		increment = convertMinutesToSeconds(warden.nextBase[getRandomInt(warden.nextBase.length)]) + getRandomInt( flipInt(warden.shakeTime) );

		warden.nextTime += increment;
		warden.gameTime += increment;

		if (warden.dropNotifications.enabled) {
			shakeTime = convertSecondsToMinutes(warden.nextTime + getRandomInt( flipInt(warden.shakeTime) ));
			printToAll(warden.dropNotifications.subsequent, [shakeTime]);
		}

		for (i = 0; i < clients.length; ++i)
		{
			client = clients[i];
			warden.playerList.push(client);
		}

		if (pensettings.enabled) {
			pendulumSwing();
		}

		if (warden.itemTable.useWeights && wardrobe.enabled) {
			var incompatiblePlugins = wardrobe.disallowPlugins;
			for (i = 0; i < incompatiblePlugins.length; ++i) {
				if ( plugin.exists(incompatiblePlugins[i]) ) {
					wardrobe.enabled = false;
					break;
				}
			}
			if (wardrobe.enabled && !wardrobe.loaded) {
				var abilityPlugins = wardrobe.abilityPlugins;
				for (i = 0; i < abilityPlugins.length; ++i) {
					if ( plugin.exists(abilityPlugins[i]) ) {
						wardrobe.checkAbilities = true;
						break;
					}
				}
				tailorHeroes();
				wardrobe.loaded = true;
			}
		}

		generateLoot();

		if (warden.trashManager.enabled) {
			if (warden.currentWave % warden.trashManager.cleanAtXWave === 0) {
				cleanupTrash();
			}
		}
	}
}, 100);

// ==========================================
// Begin Plugin Functions
// ==========================================

function tailorHeroes() {
// This function is only to be called if we're using weights
// and if the hero tailor system is enabled.
// 
	var baseTable = warden.itemTable.instance;
	var tmpTable = baseTable.clone();
	var i, j, k;
	for (i = 0; i < warden.playerList.length; i++) {
		var client = warden.playerList[i];
		var hero = client.netprops.m_hAssignedHero;

		if (hero === null)
			continue;

		var playerID = client.netprops.m_iPlayerID;
		if (playerProps[playerID]) {
			if (playerProps[playerID].buildLootTable) {

				var hero = client.netprops.m_hAssignedHero;
				var heroName = hero.getClassname();
				playerProps[playerID].lootTable = tmpTable;

				if (!wardrobe.checkAbilities) {
					// Weight modifications based on hero.
					var hFile = wardrobe.heroFile;

					if ( typeof hFile.Heroes[heroName] !== "undefined") {
						if ( typeof hFile.Heroes[heroName].itemBuild !== "undefined" ) {
							for (j = 0; j < hFile.Heroes[heroName].itemBuild.length; j++) {
								var prop = hFile.Heroes[heroName].itemBuild[j];
								for (k = 0; k < playerProps[playerID].lootTable.length; k++) {
									var entry = playerProps[playerID].lootTable[k];
									if (entry[0] == prop) {
										playerProps[playerID].lootTable[k][1] += wardrobe.rules.tailoredItemBuildWeightIncrease;
									}
								}
							}
						}

						if ( typeof hFile.Heroes[heroName].bannedBuild !== "undefined" ) {
							for (j = 0; j < hFile.Heroes[heroName].bannedBuild.length; j++) {
								for (k = 0; k < playerProps[playerID].lootTable.length; k++) {
									var entry = playerProps[playerID].lootTable[k];

									if (entry[0] == hFile.Heroes[heroName].bannedBuild[j]) {
										entry[1] = 0;
									}
								}
							}
						}

						for (j = 0; j < playerProps[playerID].lootTable.length; j++) {
							var entry = playerProps[playerID].lootTable[j];

							// Scepter changes
							if (entry[0] == "item_ultimate_scepter") {
								if ( hFile.Heroes[heroName].ultimateUpgrade === 0 ) {
									entry[1] = 0;
								}
								else if ( hFile.Heroes[heroName].ultimateUpgrade === 1 ) {
									entry[1] = wardrobe.rules.scepterUpgradeWeightIncrease;
								}
							}
						}
					}
				}
				else {
					// Weight modifications based on hero abilities
					var hFile = wardrobe.spellFile;
				}

				playerProps[playerID].buildLootTable = false;
			}
		}
	}
}

function onMapStart() {
	warden.mapLoaded = true;
	playerManager = game.findEntityByClassname(-1, "dota_player_manager");
}

// ==========================================
// Pendulum Calculator
// ==========================================
var itemTableDire, itemTableRadiant;
function pendulumSwing() {
	// Check kill scores
	checkTeamKills();
	function checkTeamKills() {
		var difference = Math.abs(pensettings.TEAM_RADIANT.kills - pensettings.TEAM_DIRE.kills);
		if (difference < pensettings.killsItemTableThresholdMin) { // No effect
			pensettings.TEAM_DIRE.modifier = 0;
			pensettings.TEAM_RADIANT.modifier = 0;
			pensettings.TEAM_RADIANT.usePoorTable = false;
			pensettings.TEAM_DIRE.usePoorTable = false;
		}
		else if (difference < pensettings.killsItemTableThresholdMax && difference >= killsItemTableThresholdMin) {
			var value = Math.floor(difference / 2);
			if (pensettings.TEAM_RADIANT.kills > pensettings.TEAM_DIRE.kills) {
			// Radiant is winning
				pensettings.TEAM_RADIANT.modifier = -value;
				pensettings.TEAM_DIRE.modifier = value;
			}
			else {
			// Dire is winning
				pensettings.TEAM_DIRE.modifier = -value;
				pensettings.TEAM_RADIANT.modifier = value;
			}
			pensettings.TEAM_RADIANT.usePoorTable = false;
			pensettings.TEAM_DIRE.usePoorTable = false;
		}
		else if (difference >= pensettings.killsItemTableThresholdMax) {
			if (pensettings.TEAM_RADIANT.kills > pensettings.TEAM_DIRE.kills) {
				// Radiant is winning greatly
				// Give the Radiant the poor table
				pensettings.TEAM_RADIANT.usePoorTable = false;
				pensettings.TEAM_RADIANT.modifier = 0;

				pensettings.TEAM_DIRE.usePoorTable = false;
				pensettings.TEAM_DIRE.modifier = (difference * 1.5);
			}
			else {
				// Dire is winning greatly
				// Give the Dire the poor table
				pensettings.TEAM_DIRE.usePoorTable = false;
				pensettings.TEAM_DIRE.modifier = 0;

				pensettings.TEAM_RADIANT.usePoorTable = false;
				pensettings.TEAM_RADIANT.modifier = (difference * 1.5);
			}
		}
		difference = null;
	}


	// Build our loot tables here.
	var i;
	itemTableDire = [];
	itemTableDire.length = 0;
	itemTableDire = itemTable.clone();
	for (i = 0; i < itemTableDire.length; ++i) {
		if (itemTableDire[i][2] == 1 || itemTableDire[i][2] == 2) {
			itemTableDire[i][1] = itemTable[i][1] + pensettings.TEAM_DIRE.modifier;
			if (itemTableDire[i][1] < 0) {
				itemTableDire[i][1] = 0;
			}
		}
		else {
			itemTableDire[i][1] = itemTable[i][1] - (pensettings.TEAM_DIRE.modifier * 2);
			if (itemTableDire[i][1] < 0) {
				itemTableDire[i][1] = 0;
			}
		}
	}
	itemTableRadiant = [];
	itemTableRadiant.length = 0;
	itemTableRadiant = itemTable.clone();
	for (i = 0; i < itemTableRadiant.length; ++i) {
		if (itemTableRadiant[i][2] == 1 || itemTableRadiant[i][2] == 2) {
			itemTableRadiant[i][1] = itemTable[i][1] + pensettings.TEAM_RADIANT.modifier;
			if (itemTableRadiant[i][1] < 0) {
				itemTableRadiant[i][1] = 0;
			}
		}
		else {
			itemTableRadiant[i][1] = itemTable[i][1] - (pensettings.TEAM_RADIANT.modifier * 2);
			if (itemTableRadiant[i][1] < 0) {
				itemTableRadiant[i][1] = 0;
			}
		}
	}
}


function resetQueueReminder() { warden.queue.reminded = false; }
function resetGarbageCollector() { warden.trashManager.cleaned = false; }

function generateLoot() {
	var client, name, playerID, hero, heroItemsEquipped, itemName;
	for (var i = 0; i < warden.playerList.length; ++i) {
		client = warden.playerList[i];
		hero = client.netprops.m_hAssignedHero;
		playerID = client.netprops.m_iPlayerID;

		if (hero !== null)
			heroItemsEquipped = getHeroEquipment(hero);
		else
			heroItemsEquipped = [];

		itemName = getUniqueItemName(playerID, heroItemsEquipped);
		giveItemToClient(itemName, client);

		if (warden.reLootTable.indexOf(itemName) !== -1 && getRandomInt(100) <= warden.reLootPercentage) {
			itemName = getUniqueItemName(playerID, heroItemsEquipped);
			giveItemToClient(itemName, client);
		}
	}
	warden.playerList.length = 0;
}

function getUniqueItemName(playerID, heroInventory) {
	var uniqueItemsGiven = [], rolls = 0, itemName;

	uniqueItemsGiven = getPlayerProp(playerID, "uniqueItemsGiven");

	do
	{
		rolls += 1;
		// Fail-safe so we don't continue rolling infinitely if we can't find an item.
		if (rolls < warden.maxTries) {
			itemName = getRandomLoot(playerID);
		}
		else {
			itemName = warden.maxTriesLoot[getRandomInt(warden.maxTriesLoot.length)];
			break;
		}

		if ( warden.doNotConsiderDupes.indexOf(itemName) !== -1 )
			break;

	}
	while ( heroInventory.indexOf(itemName) !== -1 || uniqueItemsGiven.indexOf(itemName) !== -1 );

	if (warden.doNotConsiderDupes.indexOf(itemName) === -1) {
		if (uniqueItemsGiven.indexOf(itemName) === -1) {

			uniqueItemsGiven.push(itemName);
			setPlayerProp(playerID, "uniqueItemsGiven", uniqueItemsGiven);

			if ( typeof warden.itemTable.limitPerTeam[itemName] !== "undefined" ) {

				if ( typeof warden.itemTable.countLimitPerTeam[itemName] === "undefined" )
					warden.itemTable.countLimitPerTeam[itemName] = 0;

				warden.itemTable.countLimitPerTeam[itemName] += 1;

				if (warden.itemTable.countLimitPerTeam[itemName] === warden.itemTable.limitPerTeam[itemName]) {
					var player = dota.findClientByPlayerID(playerID);
					var playerTeamID = player.netprops.m_iTeamNum;
					var clients = getConnectedPlayingTeam(playerTeamID);
					for (var i = 0; i < clients.length; ++i) {
						var client = clients[i];
						var clientPlayerID = client.netprops.m_iPlayerID;

						if (playerID === clientPlayerID) continue;

						if (playerProps[clientPlayerID]) {
							var exclusionList = getPlayerProp(clientPlayerID, "uniqueItemsGiven");

							if ( exclusionList.indexOf(itemName) !== -1 )
								continue;

							exclusionList.push(itemName);
							setPlayerProp(clientPlayerID, "uniqueItemsGiven", exclusionList);
						}
					}
				}
			}

			if ( typeof warden.itemTable.componentExclude.items[itemName] !== "undefined" ) {
				var entries = warden.itemTable.componentExclude.items[itemName];
				for (var i = 0; i < entries.length; ++i) {
					uniqueItemsGiven.push(entries[i]);
				}
			}
		}
	}

	return itemName;
}

function giveItemToClient(itemName, client, addToQueue) {
	if (client === null) return;

	var playerID = client.netprops.m_iPlayerID;
	var hero = client.netprops.m_hAssignedHero;

	if (hero === null) {
		addItemToQueue(itemName, playerID);
		return;
	}

	if (!hero.isHero()) return;

	addToQueue = typeof addToQueue !== 'undefined' ? addToQueue : true;

	var spaceInStash = isStashAvailable(hero);
	var spaceInInventory = isInventoryAvailable(hero);

	if (hero.netprops.m_lifeState === UNIT_LIFE_STATE_ALIVE) {
		if (spaceInInventory || spaceInStash) {
			if (warden.soundEffects.enabled) {
				var sound = warden.soundEffects.list[getRandomInt(warden.soundEffects.list.length)];
				dota.sendAudio(client, false, sound);
			}
			if (spaceInInventory) {
				for (var v = HERO_INVENTORY_BEGIN; v <= HERO_INVENTORY_END; ++v)
				{
					var isItemInThisSpace = hero.netprops.m_hItems[v];
					if (isItemInThisSpace === null)
					{
						dota.giveItemToHero(itemName, hero);
						var m_hItem = hero.netprops.m_hItems[v];
						if (m_hItem === null)
							return false;

						changeItemProperties(m_hItem);

						var index = m_hItem.index;
						playerProps[playerID].items.push(index);
						return true;
					}
				}
			}
			else if (spaceInStash && warden.doNotPutInStash.indexOf(itemName) === -1) {
				for (var v = HERO_STASH_BEGIN; v <= HERO_STASH_END; ++v)
				{
					var isItemInThisSpace = hero.netprops.m_hItems[v];
					if (isItemInThisSpace === null)
					{
						dota.giveItemToHero(itemName, hero);
						var m_hItem = hero.netprops.m_hItems[v];
						if (m_hItem === null)
							return false;

						changeItemProperties(m_hItem);

						var index = m_hItem.index;
						playerProps[playerID].items.push(index);
						return true;
					}
				}
			}
		}
		else {
			if (addToQueue) {
				addItemToQueue(itemName, playerID);
			}
			return false;
		}
	}
	else {
		if (addToQueue) {
			addItemToQueue(itemName, playerID);
		}
		return false;
	}
}

function changeItemProperties(entity) {

	entity.netprops.m_bSellable = false;
	entity.netprops.m_bDisassemblable = false;

	if (entity.getClassname() == "item_aegis" || entity.getClassname() == "item_rapier") {
		entity.netprops.m_bDroppable = true;
	}

	entity.netprops.m_iSharability = 1;
	entity.netprops.m_bKillable = false;

	return;
}

function addItemToQueue(itemName, playerID) {
	var q = getPlayerProp(playerID, "queue");
	q.push(itemName);
	setPlayerProp(playerID, "queue", q);
}

var baseItemTable = [
	// Item Classname: IN-USE
	//    As it appears in-game. Example: item_branch
	//
	// Pricing: IN-USE
	//    The cost of the item in the shop. 0 is free, and included in all tables.
	//
	// Game Phase: IN-USE
	//    0 - All game
	//    1 - Early game
	//    2 - Mid game
	//    3 - Late game
	//
	// Primary Attribute
	//    1 - Strength
	//    2 - Agility
	//    4 - Intelligence
	//
	// Usefulness:
	//    1 - Game-changing;
	//    2 - Not-as-game-changing;
	//    3 - Medium;
	//    4 - Low;
	//    5 - Don't bother;
	//
	// Shop Categories:
	//    1 - 
	//
	// Hero Role:
	//    1 - Lane Support
	//    2 - Carry
	//    4 - Semi-carry
	//    8 - Disabler
	//    16 - Ganker
	//    32 - Nuker
	//    64 - Initiator
	//    128 - Jungler
	//    256 - Pusher
	//    512 - Roamer
	//    1024 - Durable
	//    2048 - Escape
	//    4096 - Support
	//
	// Below is the array index, and what each index contains.
	// [0            1,           2,     3,         4]
	// ["Classname", weight(0-∞), price, gamePhase, primAttributeMask]   // Weapon Name (price)
	//
	["item_aegis",                   5,    0, 0, 7], // Aegis of the Immortal
	["item_cheese",                  5,    0, 0, 7], // Cheese
	//
	["item_orb_of_venom",          230,  275, 1, 6], // Orb of Venom (275g)
	["item_null_talisman",         220,  470, 1, 4], // Null Talisman (470g)
	["item_wraith_band",           220,  485, 1, 2], // Wraith Band (485g)
	["item_magic_wand",            220,  509, 1, 7], // Magic Wand (509g)
	["item_bracer",                220,  525, 1, 1], // Bracer (525g)
	["item_poor_mans_shield",      220,  550, 1, 3], // Poor Man's Shield (550g)
	["item_headdress",             215,  603, 1, 4], // Headdress (603g)
	["item_soul_ring",             210,  800, 1, 4], // Soul Ring (800g)
	["item_buckler",               210,  803, 1, 4], // Buckler (803g)
	["item_urn_of_shadows",        210,  875, 1, 1], // Urn of Shadows (875g)
	["item_void_stone",            210,  875, 1, 7], // Void Stone (875g)
	["item_ring_of_health",        210,  875, 1, 7], // Ring of Health (875g)
	["item_ring_of_aquila",        205,  985, 1, 7], // Ring of Aquila (985g)
	["item_ogre_axe",              200, 1000, 1, 7], // Ogre Axe (1,000g)
	["item_blade_of_alacrity",     200, 1000, 1, 7], // Blade of Alacrity (1,000g)
	["item_staff_of_wizardry",     200, 1000, 1, 7], // Staff of Wizardry (1,000g)
	["item_energy_booster",        200, 1000, 1, 7], // Energy Booster (1,000g)
	["item_medallion_of_courage",  200, 1075, 1, 2], // Medallion of Courage (1,075g)
	["item_vitality_booster",      190, 1100, 1], // Vitality Booster (1,100g)
	["item_point_booster",         180, 1200, 1], // Point Booster (1,200g)
	["item_broadsword",            180, 1200, 1], // Broadsword (1,200g)
	["item_phase_boots",           170, 1350, 1], // Phase Boots (1,350g)
	["item_platemail",             160, 1400, 1], // Platemail (1,400g)
	["item_claymore",              160, 1400, 1], // Claymore (1,400g)
	["item_power_treads",          160, 1400, 1], // Power Treads (1,400g)
	["item_arcane_boots",          160, 1450, 1], // Arcane Boots (1,450g)
	["item_javelin",               150, 1500, 1], // Javelin (1,500g)
	["item_ghost",                 140, 1600, 1], // Ghost Scepter (1,600g)
	["item_shadow_amulet",         140, 1600, 1], // Shadow Amulet (1,600g)
	["item_mithril_hammer",        140, 1600, 1], // Mithril Hammer (1,600g)
	["item_oblivion_staff",        140, 1675, 1], // Oblivion Staff (1,675g)
	["item_pers",                  130, 1750, 1], // Perseverance (1,750g)
	["item_ancient_janggo",        130, 1775, 1], // Drums of Endurance (1,775g)
	["item_talisman_of_evasion",   120, 1800, 1], // Talisman of Evasion (1,800g)
	["item_helm_of_the_dominator", 120, 1850, 1], // Helm of the Dominator (1,850g)
	["item_hand_of_midas",         110, 1900, 1], // Hand of Midas (1,900g)
	["item_mask_of_madness",       110, 1900, 1], // Mask of Madness (1,900g)
	["item_vladmir",               100, 2050, 2], // Vladmir's Offering (2,050g)
	["item_yasha",                 100, 2050, 2], // Yasha (2,050g)
	["item_sange",                 100, 2050, 2], // Sange (2,050g)
	["item_ultimate_orb",           95, 2100, 2], // Ultimate Orb (2,100g)
	["item_hyperstone",             95, 2100, 2], // Hyperstone (2,100g)
	["item_hood_of_defiance",       95, 2125, 2], // Hood of Defiance (2,125g)
	["item_blink",                  95, 2150, 2], // Blink Dagger (2,150g)
	["item_lesser_crit",            95, 2150, 2], // Crystalys (2,150g)
	["item_blade_mail",             90, 2200, 2], // Blade Mail (2,200g)
	["item_vanguard",               90, 2225, 2], // Vanguard (2,225g)
	["item_force_staff",            90, 2250, 2], // Force Staff (2,250g)
	["item_mekansm",                85, 2306, 2], // Mekansm (2,306g)
	["item_demon_edge",             80, 2400, 2], // Demon Edge (2,400g)
	["item_travel_boots",           80, 2450, 3], // Boots of Travel (2,450g)
	["item_armlet",                 75, 2600, 2], // Armlet of Mordiggan (2,600g)
	["item_veil_of_discord",        65, 2650, 2], // Veil of Discord (2,650g)
	["item_mystic_staff",           60, 2700, 2], // Mystic Staff (2,700g)
	["item_necronomicon",           60, 2700, 2], // Necronomicon 1 (2,700g)
	["item_maelstrom",              60, 2700, 2], // Maelstrom (2,700g)
	["item_cyclone",                60, 2700, 2], // Eul's Scepter of Divinity (2,700g)
	["item_dagon",                  60, 2730, 2], // Dagon 1 (2,730g)
	["item_basher",                 55, 2950, 2], // Skull Basher (2,950g)
	["item_invis_sword",            55, 3001, 2], // Shadow Blade (3,000g)
	["item_rod_of_atos",            50, 3100, 3], // Rod of Atos (3,100g)
	["item_reaver",                 45, 3200, 3], // Reaver (3,200g)
	["item_soul_booster",           40, 3300, 3], // Soul Booster (3,300g)
	["item_eagle",                  40, 3300, 3], // Eaglesong (3,300g)
	["item_diffusal_blade",         40, 3300, 3], // Diffusal Blade (3,300g)
	["item_pipe",                   25, 3628, 3], // Pipe of Insight (3,628g)
	["item_relic",                  15, 3800, 3], // Sacred Relic (3,800g)
	["item_heavens_halberd",        15, 3850, 3], // Heaven's Halberd (3,850g)
	["item_black_king_bar",         25, 3900, 3], // Black King Bar (3,900g)
	["item_necronomicon_2",         10, 3950, 3], // Necronomicon 2 (3,950g)
	["item_dagon_2",                10, 3980, 3], // Dagon 2 (3,980g)
	["item_desolator",               2, 4100, 3], // Desolator (4,100g)
	["item_sange_and_yasha",         4, 4100, 3], // Sange & Yasha (4,100g)
	["item_orchid",                  4, 4125, 3], // Orchid Malevolence (4,125g)
	["item_diffusal_blade_2",        2, 4150, 3], // Diffusal Blade 2 (4,150g)
	["item_ultimate_scepter",        4, 4200, 3], // Aghanim's Scepter (4,200g)
	["item_bfury",                   2, 4350, 3], // Battle Fury (4,350g)
	["item_shivas_guard",            4, 4700, 3], // Shiva's Guard (4,700g)
	["item_ethereal_blade",          4, 4900, 3], // Ethereal Blade (4,900g)
	["item_bloodstone",              3, 5050, 3], // Bloodstone (5,050g)
	["item_manta",                   2, 5050, 3], // Manta Style (5,050g)
	["item_radiance",                2, 5150, 3], // Radiance (5,150g)
	["item_sphere",                  2, 5175, 3], // Linken's Sphere (5,175g)
	["item_necronomicon_3",          2, 5200, 3], // Necronomicon 3 (5,200g)
	["item_dagon_3",                 2, 5230, 3], // Dagon 3 (5,230g)
	["item_refresher",               2, 5300, 3], // Refresher Orb (5,300g)
	["item_assault",                 2, 5350, 3], // Assault Cuirass (5,350g)
	["item_mjollnir",                1, 5400, 3], // Mjollnir (5,400g)
	["item_monkey_king_bar",         5, 5400, 3], // Monkey King Bar (5,400g)
	["item_heart",                   2, 5500, 3], // Heart of Terrasque (5,500g)
	["item_greater_crit",            1, 5550, 3], // Daedalus (5,550g)
	["item_skadi",                   2, 5675, 3], // Eye of Skadi (5,675g)
	["item_sheepstick",              3, 5675, 3], // Scythe of Vyse (5,675g)
	["item_butterfly",               1, 6001, 3], // Butterfly (6,000g)
	["item_satanic",                 1, 6150, 3], // Satanic (6,150g)
	["item_rapier",                  1, 6200, 3], // Divine Rapier (6,200g)
	["item_dagon_4",                 1, 6480, 3], // Dagon 4 (6,480g)
	["item_abyssal_blade",           1, 6750, 3], // Abyssal Blade (6,750g)
	["item_dagon_5",                 1, 7730, 3], // Dagon 5 (7,730g)
];

function getRandomLoot(playerID) {

	var loot;

	if (!warden.itemTable.useWeights) {
		loot = warden.itemTable.instance;
		return loot[getRandomInt(loot.length)][0];
	}

	if (wardrobe.enabled) {
		if (playerProps[playerID]) {
			loot = playerProps[playerID].lootTable;
		}
	}
	else
		loot = warden.itemTable.instance;

	if (!loot)
		loot = warden.itemTable.instance;


    var lootTotalWeight = 0, lootCumulativeWeight = 0, i, weight;

    if (pensettings.enabled) {
    	var teamID, client, penTeam;
		client = dota.findClientByPlayerID(playerID);
		teamID = client.netprops.m_iTeamNum;
		penTeam = (teamID === TEAM_RADIANT ? "TEAM_RADIANT" : "TEAM_DIRE");
		if (pensettings[penTeam].usePoorTable) {
			loot = itemNamesPoor;
			length = loot.length;
		}
		else {
			if (teamID === TEAM_RADIANT) loot = itemTableRadiant;
			else loot = itemTableDire;
			length = loot.length;
		}
		penTeam = null;
		teamID = null;
		client = null;
	}

    for (i = 0; i < loot.length; i++) {
		lootTotalWeight += loot[i][1];
    }

    var weight = Math.floor(Math.random() * lootTotalWeight);

    for (i = 0; i < loot.length; i++) {
        lootCumulativeWeight += loot[i][1];
        if (weight < lootCumulativeWeight ) {
	        return loot[i][0];
        }
    }
}

function getConnectedPlayingClients() {
	var client, playing = [];
	for (var i = 0; i < server.clients.length; ++i)
	{
		client = server.clients[i];

		if (client === null)
			continue;

		if (!client.isInGame())
			continue;

		playerID = client.netprops.m_iplayerID;
		if (playerID === -1)
			continue;

		playing.push(client);
	}
	return playing;
}

function getConnectedPlayingTeam(teamID) {
	var client, clients = [];
	for (var i = 0; i < server.clients.length; ++i)
	{
		client = server.clients[i];

		if (client === null)
			continue;

		if (!client.isInGame())
			continue;

		playerID = client.netprops.m_iplayerID;
		if (playerID == -1)
			continue;

		if (client.netprops.m_iTeamNum !== teamID)
			continue;

		clients.push(client);

	}
	return clients;
}

function getHeroEquipment(hero) {
	var heroItemsEquipped = [], currentSlot, className;
	for (var k = HERO_INVENTORY_BEGIN; k < HERO_STASH_END; k++)
	{
		currentSlot = hero.netprops.m_hItems[k];
		if (currentSlot === null)
			continue;

		className = currentSlot.getClassname();
		heroItemsEquipped.push(className);
	}
	return heroItemsEquipped;
}

function isInventoryAvailable(hero) {
	var countMax = 0;
	for (var v = HERO_INVENTORY_BEGIN; v <= HERO_INVENTORY_END; v++)
	{
		var heroSlotOccupied = hero.netprops.m_hItems[v];
		if (heroSlotOccupied)
			countMax++;
	}
	if (countMax >= 6)
		return false;
	else
		return true;
}

function isStashAvailable(hero) {
	var countMax = 0;
	for (var v = HERO_STASH_BEGIN; v <= HERO_STASH_END; v++)
	{
		var heroSlotOccupied = hero.netprops.m_hItems[v];
		if (heroSlotOccupied)
			countMax++;
	}
	if (countMax >= 6)
		return false;
	else
		return true;
}

function printToAll(string, args) {
	var i, clients, client, format;
	if (typeof(args) === 'undefined') args = [];
	clients = getConnectedPlayingClients();
	for (i = 0; i < clients.length; ++i)
	{
		client = clients[i];
		format = sprintf(string, args);
		client.printToChat(g_plugin["prefix"] + " " + format);
	}
}

function printToClient(client, string, args) {
	var format;
	if (typeof(args) === 'undefined') args = [];
	format = sprintf(string, args);
	client.printToChat(g_plugin["prefix"] + " " + format);
}

function setPlayerResource(playerID, prop, value) {
	if(!playerManager || !playerManager.isValid()) {
		return undefined;
	}
	playerManager.netprops[prop][playerID] = value;
}

function getPlayerResource(playerID, prop) {
	return playerManager.netprops[prop][playerID];
}

function addPlayerResource(playerID, prop, value) {
	if(!playerManager || !playerManager.isValid()) {
		return undefined;
	}
	playerManager.netprops[prop][playerID] += value;
}

function setPlayerProp(playerID, prop, value) {
	if(!playerProps[playerID]) {
		return undefined;
	}
	playerProps[playerID][prop] = value;
}
function getPlayerProp(playerID, prop) {
	return playerProps[playerID][prop];
}

function cleanupTrash() {
	var clients = [], m, v, vector;
	clients = getConnectedPlayingClients();
	// vector = {'x': 4219, 'y': -7447, 'z': 200};
	for (i = 0; i < clients.length; ++i) {
		var client = clients[i];
		var playerID = client.netprops.m_iPlayerID;

		var hero = client.netprops.m_hAssignedHero;
		if (hero === null)
			continue;

		var playerItems = playerProps[playerID].items;
		if (!playerItems || playerItems.length === 0)
			continue;

		var itemsOnHero = [];
		itemsOnHero.length = 0;
		for (v = HERO_INVENTORY_BEGIN; v <= HERO_STASH_END; ++v)
		{
			var m_hItem = hero.netprops.m_hItems[v];
			if (m_hItem === null)
				continue;

			var itemIndex = m_hItem.index;
			itemsOnHero.push(itemIndex);
		}
		if (itemsOnHero.length === 0)
			continue;

		itemsOnHero.sort();
		playerItems.sort();

		for (m = playerItems.length - 1; m >= 0; --m)
		{
			if (itemsOnHero.indexOf(playerItems[m]) === -1)
			{
				var entity = game.getEntityByIndex(playerItems[m]);
				if (entity === null || !entity) {
					continue;
				}
				if (entity.isValid()) {
					dota.remove(entity);
					// dota.findClearSpaceForUnit(entity, vector);
					playerItems.splice(m, 1);
				}
			}
		}
	}
}

// ==========================================
// Game Hooks
// ==========================================
game.hook("OnMapStart", onMapStart);
game.hookEvent("dota_player_killed", onPlayerKilled);

function Dota_OnBuyItem(unit, item, playerID, unknown)
{
	if (item == "item_courier" && warden.addons.helpingHand.enabled) {
		var client = dota.findClientByPlayerID(playerID);
		var teamID = client.netprops.m_iTeamNum;
		if (teamID === TEAM_RADIANT && !warden.addons.helpingHand.courierBoughtForRadiant)
			warden.addons.helpingHand.courierBoughtForRadiant = true;
		else if (teamID === TEAM_DIRE && !warden.addons.helpingHand.courierBoughtForDire)
			warden.addons.helpingHand.courierBoughtForDire = true;
	}
}
function onPlayerKilled(event) {
	var herokill = event.getBool("HeroKill");
	if (!herokill)
		return;

	var playerID = event.getInt("PlayerID");
	var client = dota.findClientByPlayerID(playerID);
	if (client === null)
		return;

	var team = (client.netprops.m_iTeamNum == TEAM_RADIANT ? "TEAM_DIRE" : "TEAM_RADIANT");

	++pensettings[team].kills;
}

// ==========================================
// Miscellaneous Helper Functions
// ==========================================

// Used to copy our non-simple item table
Object.prototype.clone = function() {
  var newObj = (this instanceof Array) ? [] : {};
  for (var i in this) {
    if (i == 'clone') continue;
    if (this[i] && typeof this[i] == "object") {
      newObj[i] = this[i].clone();
    } else newObj[i] = this[i];
  } return newObj;
};

function convertMinutesToSeconds(input) {
    var parts = input.split(':'),
        minutes = +parts[0],
        seconds = +parts[1];
    return (minutes * 60 + seconds);
}
function flipInt(number) {
	return (Math.round(Math.random()) === 0 ? -number : number);
}
function getRandomInt(a){return Math.floor(Math.random()*a);}
function convertSecondsToMinutes(a){var b=Math.floor(a/60);a%=60;return(10>b?"0"+b:b)+":"+(10>a?"0"+a:a);}
function IsInteger(number) {
	var regex = /^\d+$/;
	if(regex.test(number)) {
		return true;
	}
	return false;
}

// ==========================================
// Lobby Setup
// ==========================================
var lobbyManager;
plugin.get('LobbyManager', function(obj){
	lobbyManager = obj;
	var optionTime = lobbyManager.getOptionsForPlugin('WeaponMayhem')['Interval'];
	if (optionTime) {
		warden.nextBase.length = 0;
		warden.leadTime.length = 0;
		warden.leadTime = [optionTime];
		warden.nextBase = [optionTime];

		var s = convertMinutesToSeconds(optionTime);

		if (s < warden.soundEffects.timeThreshold)
			warden.soundEffects.enabled = false;

		if (s < warden.dropNotifications.timeThreshold)
			warden.dropNotifications.enabled = false;
	}

	var optionWeight = lobbyManager.getOptionsForPlugin('WeaponMayhem')['Weights'];
	switch(optionWeight)
	{
		default:
		case "Weighted": break;
		case "Non-weighted":
			warden.itemTable.useWeights = false;
		break;
	}

	var optionPoolType = lobbyManager.getOptionsForPlugin('WeaponMayhem')['PoolType'];
	setupItemTable(optionPoolType);
});

function buildItemTable() {
	var mainItemTable = [];
	mainItemTable.length = 0;
	var tmp = baseItemTable.clone();
	if (warden.itemTable.customMode === 1) {
		for (i = 0; i < tmp.length; ++i) {
			if ( tmp[i][2] === 0 || tmp[i][2] > warden.itemTable.priceRangeMin && tmp[i][2] < warden.itemTable.priceRangeMax ) {
				mainItemTable.push(tmp[i]);
			}
		}
	}
	else if (warden.itemTable.customMode === 2) {
		for (i = 0; i < tmp.length; ++i) {
			var itemList = ["item_rapier", "item_aegis"];
			if ( itemListplayerItems[m].indexOf(tmp[i][0]) !== -1 ) {
				if (warden.itemTable.useWeights) {
					if (tmp[i][0] == "item_rapier")
						tmp[i][1] = 60;

					if (tmp[i][0] == "item_aegis")
						tmp[i][1] = 40;
				}
				mainItemTable.push(tmp[i]);
			}
		}
	}
	warden.itemTable.instance = mainItemTable;
}

function setupItemTable(option) {
	switch(option)
	{
		default:
		case "Greater than 1,000g items": break;
		case "Greater than 275g items":
			warden.itemTable.priceRangeMin = 275;
			break;
		case "Greater than 1,500g items":
			warden.itemTable.priceRangeMin = 1500;
			break;
		case "Greater than 2,000g items":
			warden.itemTable.priceRangeMin = 2000;
			break;
		case "Greater than 2,500g items":
			warden.itemTable.priceRangeMin = 2500;
			break;
		case "Greater than 3,000g items":
			warden.itemTable.priceRangeMin = 3000;
			break;
		case "Exclude items Greater than 5,000g":
			warden.itemTable.priceRangeMax = 5000;
			break;
		case "Exclude items Greater than 4,000g":
			warden.itemTable.priceRangeMax = 4000;
			break;
		case "Exclude items Greater than 3,000g":
			warden.itemTable.priceRangeMax = 3000;
			break;
		case "Aegis & Rapier only":
			warden.itemTable.mode = 2;
			break;
	}

	buildItemTable();
}


// ==========================================
// Developer Mode
// ==========================================

if (g_plugin.developer) {
	warden.leadTime.length = 0;
	warden.nextBase.length = 0;
	warden.leadTime = ['0:5'];
	warden.nextBase = ['0:5'];
	var nextBase = convertMinutesToSeconds(warden.nextBase[0]);

	if (nextBase <= 120)
		warden.dropNotifications.enabled = false;

	warden.shakeTime = 1;

	setupItemTable("Greater than 1,000g items");

	console.addClientCommand("load", wardenFill);
	console.addClientCommand("empty", emptyQueue);
	console.addClientCommand("remove", removeInv);
	function wardenFill(client, args) {

		hero = client.netprops.m_hAssignedHero;
		playerID = client.netprops.m_iPlayerID;

		for (var i = HERO_INVENTORY_BEGIN; i < HERO_INVENTORY_END; ++i) {
			if (hero !== null) {
				heroItemsEquipped = getHeroEquipment(hero);
			}
			else {
				heroItemsEquipped = [];
			}

			itemName = getUniqueItemName(playerID, heroItemsEquipped);
			giveItemToClient(itemName, client);
		}
	}
	function emptyQueue(client, args) {
		var playerID = client.netprops.m_iPlayerID;
		playerProps[playerID].queue.length = 0;
	}
	function removeInv(client, args) {
		var hero = client.netprops.m_hAssignedHero;
		for (var i = HERO_INVENTORY_BEGIN; i <= HERO_STASH_END; ++i) {
			var m_hItem = hero.netprops.m_hItems[i];
			if (m_hItem === null)
				continue;

			var item = m_hItem;
			dota.remove(item);
		}
	}
	console.addClientCommand("kill", addKills);
	function addKills(client, args) {
		switch(args[0])
		{
			case "dire":
				for (var i = 0; i < args[1]; ++i) {
					++pensettings.TEAM_RADIANT.kills;
				}
				client.printToChat("RADIANT KILLS: " + pensettings.TEAM_RADIANT.kills);
				break;
			case "radi":
				for (var i = 0; i < args[1]; ++i) {
					++pensettings.TEAM_DIRE.kills;
				}
				client.printToChat("DIRE KILLS: " + pensettings.TEAM_DIRE.kills);
				break;
		}
	}
	console.addClientCommand("kills", getKills);
	function getKills(client, args) {
		switch(args[0])
		{
			case "dire":
				client.printToChat("DIRE KILLS: " + pensettings.TEAM_DIRE.kills);
				break;
			case "radi":
				client.printToChat("RADIANT KILLS: " + pensettings.TEAM_RADIANT.kills);
				break;
		}
	}
	console.addClientCommand("diff", getDifference);
	function getDifference(client, args) {
		client.printToChat("DIFFERENCE: " + Math.abs(pensettings.TEAM_DIRE.kills - pensettings.TEAM_RADIANT.kills));
	}
	console.addClientCommand("getmod", getModifier);
	function getModifier(client, args) {
		switch(args[0])
		{
			case "dire":
				client.printToChat("DIRE MODIFIER: " + pensettings.TEAM_DIRE.modifier);
				break;
			case "radi":
				client.printToChat("RADIANT MODIFIER: " + pensettings.TEAM_RADIANT.modifier);
				break;
		}
	}
}