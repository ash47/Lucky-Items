// ==========================================
// Plugin Information - READ ONLY
// ==========================================
var g_plugin = {
	name: "Lucky Items",
	prefix: "[LI]",
	author: "koone",
	description: "Gives players weighted random items.",
	version: "1.4.2",
	credits: {
		ocnyd6: "making the Fighting Chance plugin",
        fr0sZ: "asking thought-provoking scenario questions",
        m28: "d2ware, timers library",
        smjsirc: "tet etc",
        d2wareplayers: "because!",
        humbug: "helping",
        chirpers: "good suggestions",
        ash47: "helping alot, used code, examples",
        balloontag: "bits of code"
    },
	url: "http://www.d2ware.net/",
	license: "http://www.gnu.org/licenses/gpl.html"
};

// ==========================================
// General Setup
// ==========================================
var DEVELOPER = false;
var DEBUG = false;

var HERO_INVENTORY_BEGIN = 0;
var HERO_INVENTORY_END = 5; // END at [0, 1, 2, 3,  4,  5] - 6 SLOTS
var HERO_STASH_BEGIN = 6; // BEGIN at [6, 7, 8, 9, 10, 11] - 6 SLOTS
var HERO_STASH_END = 11;
var UNIT_LIFE_STATE_ALIVE = 0;
var TEAM_RADIANT = dota.TEAM_RADIANT;
var TEAM_DIRE = dota.TEAM_DIRE;

// ==========================================
// Lucky Items Settings
// ==========================================
var settings = {
	mapLoaded: false,			// did the map start?
	pluginLoaded: false,		// did plugin initialize?
	pluginHalted: false,		// did we tell our plugin to stop dispensing items?
	timeElapsed: 0,				// keep track of passed in-game seconds
	leadTime: ['5:00'],			// lead item drop : STATE_GAME_IN_PROGRESS
	nextBase: ['5:00'],			// subsequent drops after the lead
	shakeTime: 4,				// shake shake shake!
	gameTime: null,				// keeps track of the game time
	currentWave: 0,				// keeps track of the current item wave
	waveLimit: 0,				// how many item waves will happen
	playerList: [],				// which players will receive an item
	playersBarredFromDrops: [], // playerID is in here, they will receive no items
	dispenseTimeout: 0.6,		// how many seconds to wait before giving each player their items
	itemDropFavorPercent: 15,   // percentage chance to get a favored item after a low one
	gamePhase: 1,				// current match phase. 1 - Early Game; 2 - MidGame; 3 - Late Game
	maxTries: 12,				// prevent an infinite search loop, break
	maxTriesLoot: [				// we can't find our player an item, default to these
		'item_aegis',
		'item_halloween_rapier'
	],
	reLootPercentage: 65,		// a percentage chance to random twice on specific items
	reLootTable: [				// items to perform another random on.
		'item_cheese',
		'item_winter_mushroom'
	],
	doNotConsiderDupes: [		// exceptions to keep generating loot.
		'item_rapier',
		'item_aegis',
		'item_cheese',
		'item_winter_mushroom',
		'item_halloween_rapier'
	],
	doNotPutInStash: ['item_aegis'],
	// This is the inventory queue to manage items when a player cannot be given more items.
	// An integral part of the plugin, and cannot be disabled.
	queue: {
		interval: 0.8,						// Every X seconds: check our inventory queue, and take a hero snapshot
		remindNItems: 2,					// Reminder trigger on the amount of items in a player's queue
		reminderTimeout: 60,				// Every X seconds, remind our player they have items in their queue
		reminderNotice: '%s in queue.'		// Message to display
	},
	// Plugin sound effects that occur when an item is randomed to a player or other trigger events.
	sounds: {
		enabled: true,			// Enabled / disabled
		timeThreshold: 45,		// Below this time (in seconds) threshold, disable them
		addToInventory: ['ui/npe_objective_given.wav'],
		itemEnchanted: ['ui/inventory/treasure_reveal.wav']
	},
	// Plugin chat drop notifications display
	dropNotifications: {
		lead: '\x02%s\x01',		// Lead item time (NOTE: Always enabled)
		enabled: false,			// Enable / disable subsequent notifications
		timeThreshold: 60,		// Below this time threshold (in seconds), disable them
		subsequent: '%s',		// Subsequent item time
	},
	// Properties of the generated base item table
	itemTable: {
		properties: {
			sellable: false,
			disassemblable: false,
			killable: false
		},
		instance: null,			// Here we store our lobby generated item table.
		useWeights: true,		// Enable / disable the use of item weighing (RECOMMENDED: true)
		powerWeight: 1,			// What power can we modify the weights up to
		priceRangeMin: 1000,	// MIN price value to include in item table generation
		priceRangeMax: 7000,	// MAX price value to include in item table generation
		customMode: 1,			// Custom Modes: 1 - Default; 2 - Aegis & Rapier only
		// This section modifies the base item table when specified
		counter: {},
		// This section disables additional randoms for aura-based or team-wide items.
		// will only dispense (randomly) the set number of items per team.
		countLimitPerTeam: {},
		maxEachLimit: 3,
		limitPerTeam: {
			// Aura-based / utility items
			item_medallion_of_courage: 1,
			item_ancient_janggo: 1,
			item_vladmir: 1,
			item_assault: 1,
			item_hood_of_defiance: 1,
			item_pipe: 1,
			item_mekansm: 1,
			item_ring_of_basilius: 1,
			item_ring_of_aquila: 1,
			item_urn_of_shadows: 1,
			item_veil_of_discord: 1,
			item_shivas_guard: 1,
			item_bloodstone: 1,
			item_radiance: 1,
			item_desolator: 1
			// Misc. item limits here
		},
		// Setting below removes possible item recipe upgrades from rolling again per player.
		// For example, if a player rolled a dagon 3 the first time,
		// all other possible dagon rolls are excluded, including a dagon 5.
		componentExclude: keyvalue.parseKVFile('item_component_exclusion_list.kv')
	},
	// These are the plugin addons. They are added onto the base and provide improved functionality.
	// Plugin addons can be disabled, and the base plugin still functions normally without their intended benefits.
	addons: {
		enchanter: {
			enabled: false,
			percentage: 30,
			onHitEnchantEnts: [],
			onEquipEnchantEntity: null
		},
		// Tailors loot on a per-hero/ability basis during plugin initialization.
		wardrobe: {
			enabled: false,
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
				// items banned from randoming on strength heroes
				strengthBanned: [
					"item_butterfly"
				],
				agilityBanned: [],
				intelligenceBanned: [
					"item_vlads",
					"item_mask_of_madness",
					"item_helm_of_the_dominator"
				],
				// items banned from randoming on ranged heroes
				rangedBanned: [
					"item_bfury",
					"item_basher",
					"item_abyssal_blade",
					"item_heavens_halberd",
					"item_blade_mail",
					"item_armlet"
				],
				recommendedBuildList: 15, // (also divided by the item's game phase variable)
				scepterUpgrade: 500,
				attributePrimary: 10 // (added weight to, and subtracted weights from others)
			}
		}
	},
	dotaPlayerManager: null
};
var enchanter = settings.addons.enchanter;
var wardrobe = settings.addons.wardrobe;

var timers = require('timers');						// Built-In Timers Library
var sprintf = require('sprintf.js').vsprintf;		// Sprintf Library for dynamic strings
var util = require('util.js');						// Load Utility Library
var mapManager = require('mapManager.js');			// Load the Map Manager
var playerManager = require('playerManager.js');	// Load exports related to player handling
var unitManager = require('unitManager.js');		// Load exports related to hero/unit handling
var itemManager = require('itemManager.js');		// Load exports related to item handling
var enchants = require('enchantments.js');			// Load the item enchantments
require('commands.js');								// Load the plugin commands
require('dev.js');									// Load developer mode
require('lobbyManager.js');							// Load lobby manager

// ==========================================
// Item Dispenser
// ==========================================
timers.setInterval(function() {
	// Map has not initialized
	if (!settings.mapLoaded)
		return;

	// No players connected
	var playerIDs = playerManager.getConnectedPlayerIDs();
	if (playerIDs.length === 0)
		return;

	// Game state invalid
	if (util.getGameState() !== dota.STATE_GAME_IN_PROGRESS)
		return;

	// ==========================================
	// Dispenser: Manages item drops
	// ==========================================
	if (!settings.pluginLoaded)
	{
		// Load the plugin
		settings.pluginLoaded = true;

		// Randomly select our initial drop time
		var selected = settings.leadTime[util.getRandomNumber(settings.leadTime.length)];
		if (DEBUG) server.print("First drop: " + selected);

		// Convert the time into seconds
		var converted = util.convertMinutesToSeconds(selected);
		if (DEBUG) server.print("First drop converted: " + converted);

		// To communicate with the game timer when the next drop will be exactly
		settings.nextTime = converted;
		settings.gameTime = game.rules.props.m_fGameTime + converted;
		if (DEBUG) server.print("First drop game time: " + settings.gameTime);

		// Tell the players when the next drop is
		var cmdmsg = (enchanter.enabled ? ' use -li for enchant commands.' : '');
		playerManager.printAll(settings.dropNotifications.lead + cmdmsg, [selected]);

		// Re-build our item table if it does not exist
		if (settings.itemTable.instance === null)
			itemManager.buildItemTable();

		// Tailor per-player loot if the wardrobe addon is enabled
		if (settings.itemTable.useWeights && wardrobe.enabled) {
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
	}
	if (settings.pluginLoaded && game.rules.props.m_fGameTime >= settings.gameTime && !settings.pluginHalted) {

		// New item wave, increment item waves count
		settings.currentWave += 1;

		// Select our next base time.
		var selected = settings.nextBase[util.getRandomNumber(settings.nextBase.length)];

		// Convert the time into seconds
		var converted = util.convertMinutesToSeconds(selected);

		// Calculate additional shake seconds
		// var randomized = util.getRandomNumber( util.flipNumber( settings.shakeTime ) );

		var increment = converted; // + randomized;

		settings.nextTime += increment;
		settings.gameTime += increment;

		if (settings.dropNotifications.enabled) {
			var shakeTime = util.convertSecondsToMinutes(settings.nextTime + util.getRandomNumber( util.flipNumber( settings.shakeTime ) ) );
			playerManager.printAll(settings.dropNotifications.subsequent, [shakeTime]);
		}

		var players = playerManager.getConnectedPlayerIDs();
		for (var i = 0; i < players.length; ++i) {
			// Skip players exempt from items
			if (settings.playersBarredFromDrops.indexOf(players[i]) > -1)
				continue;

			settings.playerList.push(players[i]);
		}

		startDispensing();

		if (settings.waveLimit > 0 && settings.currentWave >= settings.waveLimit) {
			settings.pluginHalted = true;
			playerManager.printAll('End', []);
		}
	}
}, 100);

// ==========================================
// Begin Plugin Functions
// ==========================================
function startDispensing() {
	var timer = timers.setInterval(function() {
		if (settings.playerList.length > 0)
		{
			// Randomize the playerList
			util.shuffle(settings.playerList);
			// Pop a playerID
			var playerID = settings.playerList.pop();
			// Retrieve a unique random item name
			var item = itemManager.getUniqueItemName(playerID);
			// Give the player their item
			playerManager.giveItem(playerID, item);
			// Here we perform our sub-par items re-loot chance
			if (settings.reLootTable.indexOf(item[0]) > -1 && util.getRandomNumber(100) < settings.reLootPercentage)
			{
				// Get unique item name
				item = itemManager.getUniqueItemName(playerID);
				// Disable the sounds
				settings.sounds.enabled = false;
				// Give additional item to our player
				playerManager.giveItem(playerID, item);
				// Enable the sounds
				settings.sounds.enabled = true;
			}
		}
		else {
			// Clear the player list
			settings.playerList.length = 0;
			// Clear the timer
			timers.clearInterval(timer);
		}
	}, settings.dispenseTimeout * 1000);
}

game.hook("Dota_OnUnitThink", onUnitThink);
function onUnitThink(unit) {
	if (enchanter.enabled) {
		dota.setUnitState(enchanter.onHitEnchantEntity, dota.UNIT_STATE_INVISIBLE, true);
		dota.setUnitState(enchanter.onHitEnchantEntity, dota.UNIT_STATE_INVULNERABLE, true);
		dota.setUnitState(enchanter.onHitEnchantEntity, dota.UNIT_STATE_CANT_ACT, true);
		dota.setUnitState(enchanter.onHitEnchantEntity, dota.UNIT_STATE_BANISHED, true);

		dota.setUnitState(enchanter.onEquipEnchantEntity, dota.UNIT_STATE_INVISIBLE, true);
		dota.setUnitState(enchanter.onEquipEnchantEntity, dota.UNIT_STATE_INVULNERABLE, true);
		dota.setUnitState(enchanter.onEquipEnchantEntity, dota.UNIT_STATE_CANT_ACT, true);
		dota.setUnitState(enchanter.onEquipEnchantEntity, dota.UNIT_STATE_BANISHED, true);
	}
}

// ==========================================
// Addon: Wardrobe
// ==========================================
function tailorHeroes() {
	var baseTable = settings.itemTable.instance;
	var tmpTable = util.clone(itemManager.baseTable);
	// Loop through the playerList
	for (var i = 0; i < settings.playerList.length; i++) {
		var playerID = settings.playerList[i];

		// Check if we have a hero
		var hero = playerManager.grabHero(playerID);
		if (hero === null) continue; // Skip

		// Have we already built the loot table for this player?
		if (playerProps[playerID].buildLootTable) {

			var isMelee = (hero.netprops.m_iAttackCapabilities === dota.UNIT_CAP_MELEE_ATTACK ? true : false);
			var heroName = hero.getClassname();

			playerProps[playerID].lootTable = tmpTable;

			var hFile = wardrobe.heroFile;
			var sFile = wardrobe.spellFile;

			var heroExists = (typeof hFile.Heroes[heroName] !== "undefined" ? true : false);

			if ( !heroExists )
				continue;

			// Remove the chance to random banned melee items on ranged heroes
			if ( !isMelee ) {
				for (var j = 0; j < wardrobe.rules.rangedBanned.length; ++j) {
					var banName = wardrobe.rules.rangedBanned[j];
					for (k = 0; k < playerProps[playerID].lootTable.length; k++) {
						var entry = playerProps[playerID].lootTable[k];
						if (entry[0] == banName)
							entry[1] = 0;
					}
				}
			}

			// Primary Hero Attribute Modification
			var fileFieldPrimaryExists = (typeof hFile.Heroes[heroName].attributePrimary !== "undefined" ? true : false);
			if ( fileFieldPrimaryExists ) {
				var attr = hFile.Heroes[heroName].attributePrimary;
				for (var j = 0; j < playerProps[playerID].lootTable.length; j++) {
					var entry = playerProps[playerID].lootTable[j];

					if (entry[4] === 0)
						continue;

					var itemPhase = entry[3];

					if (attr & entry[4])
						entry[1] += (wardrobe.rules.attributePrimary / itemPhase);
					else {
						entry[1] -= (wardrobe.rules.attributePrimary / itemPhase);
						if (entry[1] <= 0)
							entry[1] = 1;
					}
				}
			}
			if (!wardrobe.checkAbilities) {
				// Weight modifications based on hero.
				if ( heroExists ) {
					if ( typeof hFile.Heroes[heroName].itemBuild !== "undefined" ) {
						for (var j = 0; j < hFile.Heroes[heroName].itemBuild.length; j++) {
							var prop = hFile.Heroes[heroName].itemBuild[j];
							for (var k = 0; k < playerProps[playerID].lootTable.length; k++) {
								var entry = playerProps[playerID].lootTable[k];
								if (entry[0] == prop) {
									var price = entry[2];
									var itemPhase = entry[3];
									var primAttributeMask = entry[4];
									var recBuild = (wardrobe.rules.recommendedBuildList / itemPhase);
									playerProps[playerID].lootTable[k][1] += recBuild;
								}
							}
						}
					}
					if ( typeof hFile.Heroes[heroName].bannedBuild !== "undefined" ) {
						for (var j = 0; j < hFile.Heroes[heroName].bannedBuild.length; j++) {
							for (var k = 0; k < playerProps[playerID].lootTable.length; k++) {
								var entry = playerProps[playerID].lootTable[k];

								if (entry[0] == hFile.Heroes[heroName].bannedBuild[j]) {
									entry[1] = 0;
								}
							}
						}
					}
					for (var j = 0; j < playerProps[playerID].lootTable.length; j++) {
						var entry = playerProps[playerID].lootTable[j];

						// Scepter changes
						if (entry[0] == "item_ultimate_scepter") {
							if ( hFile.Heroes[heroName].ultimateUpgrade === 0 ) {
								entry[1] = 0;
							}
							else if ( hFile.Heroes[heroName].ultimateUpgrade === 1 ) {
								entry[1] = wardrobe.rules.scepterUpgrade;
							}
						}
					}
				}
			}
			else {
				var abilities = [];
				for (var j = 0; j < 15; j++) {
					if (hero.netprops.m_hAbilities[j] !== null) {
						var name = hero.netprops.m_hAbilities[j].getClassname();
						abilities.push(name);
					}
				}
				var scepterAbility = false;

				// Analyze the abilities
				for (var k = 0; k < abilities.length; ++k) {
					if ( sFile.Abilities.scepter.indexOf(abilities[k]) > -1) {
						scepterAbility = true;
						break;
					}
					else
						continue;
				}

				// Weight modifications based on hero abilities
				for (var j = 0; j < playerProps[playerID].lootTable.length; j++) {
					var entry = playerProps[playerID].lootTable[j];

					// Scepter changes
					if (entry[0] == "item_ultimate_scepter") {
						if (scepterAbility)
							entry[1] = wardrobe.rules.scepterUpgrade;
						else
							entry[1] = 0;
					}
				}
			}
			playerProps[playerID].buildLootTable = false;
		}
	}
}