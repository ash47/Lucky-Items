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
	version: "1.3.2",
	credits: {
		ocnyd6: "making the Fighting Chance plugin",
        fr0sZ: "asking thought-provoking scenario questions",
        m28: "d2ware, timers library",
        smjsirc: "tet etc",
        d2wareplayers: "because!",
        humbug: "helping",
        chirpers: "good suggestions",
        ash47: "helping"
    },
	url: "http://www.d2ware.net/",
	license: "http://www.gnu.org/licenses/gpl.html",
	developer: false // Developer Mode
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
	pluginTime: 0,				// Used to keep track of passed in-game seconds
	gamePhase: 1,				// The current Game Phase. 1 - Early Game; 2 - MidGame; 3 - Late Game
	leadTime: ['5:00'],			// Lead item drop : STATE_GAME_IN_PROGRESS
	nextBase: ['5:00'],			// Subsequent drops after the lead
	shakeTime: 6,				// Used to random x seconds off designated drop times
	nextTime: 0,				// When our next drop will occur
	gameTime: null,				// Keeps track of Game Time
	currentWave: 0,				// Keeps track of the current item wave (and total)
	playerList: [],				// Which clients will receive an item
	playersBarredFromDrops: [], // If a client is in here, they will recieve no items
	lootDisperseTimeout: 0.6,		// How many seconds to wait before giving each player their items
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
		checkXSeconds: 1,		// Every X seconds, check our inventory queue & dispense items
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
		timeThreshold: 120,		// Below this time (in seconds) threshold, disable them
		list: [					// List of sound effects to use
			"ui/npe_objective_given.wav"
		]
	},
	// Plugin chat drop notifications display
	dropNotifications: {
		lead: "\x02%s\x01",		// Lead item time (NOTE: Always enabled)
		enabled: true,			// Enable / disable subsequent notifications
		timeThreshold: 120,		// Below this time threshold (in seconds), disable them
		subsequent: "%s",		// Subsequent item time
	},
	// Properties of the generated base item table
	itemTable: {
		instance: null,			// Here we store our lobby generated item table.
		useWeights: true,		// Enable / disable the use of item weighing (RECOMMENDED: true)
		priceRangeMin: 1000,	// MIN price value to include in item table generation
		priceRangeMax: 7000,	// MAX price value to include in item table generation
		customMode: 1,			// Custom Modes: 1 - Default; 2 - Aegis & Rapier only
		// This section modifies the base item table when specified
		counter: {},
		// This section disables additional randoms for aura-based or team-wide items.
		// Warden will only dispense (randomly) the set number of items per team.
		countLimitPerTeam: {},
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
		componentExclude: keyvalue.parseKVFile("item_component_exclusion_list.kv")
	},
	// This is the plugin item trash manager, it looks at all the items it has given to each player,
	// and cleans up all of them that are not in their inventory.
	trashManager: {
		enabled: false,			// Enable/disable the trash manager
		cleanAtXWave: 5,		// Cleanup every X item wave
		cleaned: false,			// Did the plugin perform a cleanup?
		notice: {
			active: "Sweeping unused items."
		}
	},
	// These are the plugin addons. They are added onto the base and provide improved functionality.
	// Plugin addons can be disabled, and the base plugin still functions normally without their intended benefits.
	addons: {
		// Addon version: 1.0.0
		// Buys a courier for each team if they don't have one by the end of the pre-game phase.
		courierBuy: {
			enabled: true,
			enableSound: false,
			purchaseSound: "ui/buy.wav",
			radiant: {
				courierBought: false,
				spawnLocation: {'x': -7156, 'y': -6700, 'z': 270}
			},
			dire: {
				courierBought: false,
				spawnLocation: {'x': 7038, 'y': 6422, 'z': 263}
			}
		},
		// Addon version: 1.0.0
		// Tailors loot on a per-hero/ability basis during plugin initialization.
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
				// Items banned from randoming on strength heroes
				strengthBanned: [
					"item_butterfly"
				],
				agilityBanned: [
				],
				intelligenceBanned: [
					"item_vlads",
					"item_mask_of_madness",
					"item_helm_of_the_dominator"
				],
				// Items banned from randoming on ranged heroes
				rangedBanned: [
					"item_bfury",
					"item_basher",
					"item_abyssal_blade",
					"item_heavens_halberd",
					"item_blade_mail",
					"item_armlet"
				],
				recommendedBuildList: 12, // (also divided by the item's game phase variable)
				scepterUpgrade: 500,
				attributePrimary: 10 // (added weight to, and subtracted weights from others)
			}
		},
		// Addon Description: Release Version 1.0.0
		// Currently watches on: Kills
		// Watches each team and adjusts item weights based on performance
		pendulum: {
			enabled: false,
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
	// [0            1,           2,     3,         4,             ]
	// ["Classname", weight(0-∞), price, gamePhase, attributeMask, ], // Weapon Name (price)
	//
	["item_aegis",                   5,    0, 0, 0], // Aegis of the Immortal (0g)
	["item_cheese",                  5,    0, 0, 0], // Cheese (0g)
	//
	["item_orb_of_venom",          230,  275, 1, 0], // Orb of Venom (275g)
	["item_null_talisman",         220,  470, 1, 4], // Null Talisman (470g)
	["item_wraith_band",           220,  485, 1, 2], // Wraith Band (485g)
	["item_magic_wand",            220,  509, 1, 7], // Magic Wand (509g)
	["item_bracer",                220,  525, 1, 1], // Bracer (525g)
	["item_poor_mans_shield",      220,  550, 1, 3], // Poor Man's Shield (550g)
	["item_headdress",             215,  603, 1, 4], // Headdress (603g)
	["item_soul_ring",             210,  800, 1, 4], // Soul Ring (800g)
	["item_buckler",               210,  803, 1, 4], // Buckler (803g)
	["item_urn_of_shadows",        210,  875, 1, 1], // Urn of Shadows (875g)
	["item_void_stone",            210,  875, 1, 0], // Void Stone (875g)
	["item_ring_of_health",        210,  875, 1, 0], // Ring of Health (875g)
	["item_ring_of_aquila",        205,  985, 1, 0], // Ring of Aquila (985g)
	["item_ogre_axe",              200, 1000, 1, 1], // Ogre Axe (1,000g)
	["item_blade_of_alacrity",     200, 1000, 1, 2], // Blade of Alacrity (1,000g)
	["item_staff_of_wizardry",     200, 1000, 1, 4], // Staff of Wizardry (1,000g)
	["item_energy_booster",        200, 1000, 1, 4], // Energy Booster (1,000g)
	["item_medallion_of_courage",  200, 1075, 1, 0], // Medallion of Courage (1,075g)
	["item_vitality_booster",      190, 1100, 1, 7], // Vitality Booster (1,100g)
	["item_point_booster",         180, 1200, 1, 7], // Point Booster (1,200g)
	["item_broadsword",            180, 1200, 1, 0], // Broadsword (1,200g)
	["item_phase_boots",           170, 1350, 1, 0], // Phase Boots (1,350g)
	["item_platemail",             160, 1400, 1, 0], // Platemail (1,400g)
	["item_claymore",              160, 1400, 1, 0], // Claymore (1,400g)
	["item_power_treads",          160, 1400, 1, 7], // Power Treads (1,400g)
	["item_arcane_boots",          160, 1450, 1, 4], // Arcane Boots (1,450g)
	["item_javelin",               150, 1500, 1, 0], // Javelin (1,500g)
	["item_ghost",                 140, 1600, 1, 0], // Ghost Scepter (1,600g)
	["item_shadow_amulet",         140, 1600, 1, 0], // Shadow Amulet (1,600g)
	["item_mithril_hammer",        140, 1600, 1, 0], // Mithril Hammer (1,600g)
	["item_oblivion_staff",        140, 1675, 1, 0], // Oblivion Staff (1,675g)
	["item_pers",                  130, 1750, 1, 0], // Perseverance (1,750g)
	["item_ancient_janggo",        130, 1775, 1, 7], // Drums of Endurance (1,775g)
	["item_talisman_of_evasion",   120, 1800, 1, 0], // Talisman of Evasion (1,800g)
	["item_helm_of_the_dominator", 120, 1850, 1, 3], // Helm of the Dominator (1,850g)
	["item_hand_of_midas",         110, 1900, 1, 0], // Hand of Midas (1,900g)
	["item_mask_of_madness",       110, 1900, 1, 3], // Mask of Madness (1,900g)
	["item_vladmir",               100, 2050, 2, 3], // Vladmir's Offering (2,050g)
	["item_yasha",                 100, 2050, 2, 2], // Yasha (2,050g)
	["item_sange",                 100, 2050, 2, 1], // Sange (2,050g)
	["item_ultimate_orb",           95, 2100, 2, 7], // Ultimate Orb (2,100g)
	["item_hyperstone",             95, 2100, 2, 3], // Hyperstone (2,100g)
	["item_hood_of_defiance",       95, 2125, 2, 0], // Hood of Defiance (2,125g)
	["item_blink",                  95, 2150, 2, 0], // Blink Dagger (2,150g)
	["item_lesser_crit",            95, 2150, 2, 2], // Crystalys (2,150g)
	["item_blade_mail",             90, 2200, 2, 1], // Blade Mail (2,200g)
	["item_vanguard",               90, 2225, 2, 0], // Vanguard (2,225g)
	["item_force_staff",            90, 2250, 2, 4], // Force Staff (2,250g)
	["item_mekansm",                85, 2306, 2, 4], // Mekansm (2,306g)
	["item_demon_edge",             80, 2400, 2, 3], // Demon Edge (2,400g)
	["item_travel_boots",           80, 2450, 3, 0], // Boots of Travel (2,450g)
	["item_armlet",                 75, 2600, 2, 1], // Armlet of Mordiggan (2,600g)
	["item_veil_of_discord",        65, 2650, 2, 0], // Veil of Discord (2,650g)
	["item_mystic_staff",           60, 2700, 2, 4], // Mystic Staff (2,700g)
	["item_necronomicon",           60, 2700, 2, 5], // Necronomicon 1 (2,700g)
	["item_maelstrom",              60, 2700, 2, 3], // Maelstrom (2,700g)
	["item_cyclone",                60, 2700, 2, 4], // Eul's Scepter of Divinity (2,700g)
	["item_dagon",                  60, 2730, 2, 5], // Dagon 1 (2,730g)
	["item_basher",                 55, 2950, 2, 1], // Skull Basher (2,950g)
	["item_invis_sword",            55, 3001, 2, 7], // Shadow Blade (3,000g)
	["item_rod_of_atos",            50, 3100, 3, 4], // Rod of Atos (3,100g)
	["item_reaver",                 45, 3200, 3, 1], // Reaver (3,200g)
	["item_soul_booster",           40, 3300, 3, 7], // Soul Booster (3,300g)
	["item_eagle",                  40, 3300, 3, 2], // Eaglesong (3,300g)
	["item_diffusal_blade",         40, 3300, 3, 3], // Diffusal Blade (3,300g)
	["item_pipe",                   25, 3628, 3, 5], // Pipe of Insight (3,628g)
	["item_relic",                  15, 3800, 3, 7], // Sacred Relic (3,800g)
	["item_heavens_halberd",        15, 3850, 3, 1], // Heaven's Halberd (3,850g)
	["item_black_king_bar",         15, 3900, 3, 7], // Black King Bar (3,900g)
	["item_necronomicon_2",         10, 3950, 3, 0], // Necronomicon 2 (3,950g)
	["item_dagon_2",                10, 3980, 3, 0], // Dagon 2 (3,980g)
	["item_desolator",               1, 4100, 3, 3], // Desolator (4,100g)
	["item_sange_and_yasha",         1, 4100, 3, 3], // Sange & Yasha (4,100g)
	["item_orchid",                  1, 4125, 3, 4], // Orchid Malevolence (4,125g)
	["item_diffusal_blade_2",        1, 4150, 3, 0], // Diffusal Blade 2 (4,150g)
	["item_ultimate_scepter",        1, 4200, 3, 7], // Aghanim's Scepter (4,200g)
	["item_bfury",                   1, 4350, 3, 3], // Battle Fury (4,350g)
	["item_shivas_guard",            1, 4700, 3, 4], // Shiva's Guard (4,700g)
	["item_ethereal_blade",          1, 4900, 3, 6], // Ethereal Blade (4,900g)
	["item_bloodstone",              1, 5050, 3, 4], // Bloodstone (5,050g)
	["item_manta",                   1, 5050, 3, 2], // Manta Style (5,050g)
	["item_radiance",                1, 5150, 3, 7], // Radiance (5,150g)
	["item_sphere",                  1, 5175, 3, 7], // Linken's Sphere (5,175g)
	["item_necronomicon_3",          1, 5200, 3, 0], // Necronomicon 3 (5,200g)
	["item_dagon_3",                 1, 5230, 3, 0], // Dagon 3 (5,230g)
	["item_refresher",               1, 5300, 3, 5], // Refresher Orb (5,300g)
	["item_assault",                 1, 5350, 3, 3], // Assault Cuirass (5,350g)
	["item_mjollnir",                1, 5400, 3, 3], // Mjollnir (5,400g)
	["item_monkey_king_bar",         1, 5400, 3, 3], // Monkey King Bar (5,400g)
	["item_heart",                   1, 5500, 3, 7], // Heart of Terrasque (5,500g)
	["item_greater_crit",            1, 5550, 3, 3], // Daedalus (5,550g)
	["item_skadi",                   1, 5675, 3, 7], // Eye of Skadi (5,675g)
	["item_sheepstick",              1, 5675, 3, 4], // Scythe of Vyse (5,675g)
	["item_butterfly",               1, 6001, 3, 2], // Butterfly (6,000g)
	["item_satanic",                 1, 6150, 3, 3], // Satanic (6,150g)
	["item_rapier",                  1, 6200, 3, 0], // Divine Rapier (6,200g)
	["item_dagon_4",                 1, 6480, 3, 0], // Dagon 4 (6,480g)
	["item_abyssal_blade",           1, 6750, 3, 1], // Abyssal Blade (6,750g)
	["item_dagon_5",                 1, 7730, 3, 0], // Dagon 5 (7,730g)
];

// ==========================================
// Game Phase Loot Modifier
// ==========================================
// timers.setInterval(function() {
// 	if (warden.pluginLoaded) {

// 		warden.pluginTime += 1;

// 		switch(warden.pluginTime)
// 		{
// 			default: break;
// 			case (warden.gamePhase === 1 && warden.pluginTime >= 450):
// 				warden.gamePhase = 2;
// 				break;
// 			case (warden.gamePhase === 2 && warden.pluginTime >= 900):
// 				warden.gamePhase = 3;
// 				break;
// 		}

// 		if (warden.pluginTime % 10 === 0) {
// 			for (var key in playerProps) {
// 				var obj = playerProps[key];
// 				for (var i = 0; i < obj.lootTable.length; ++i) {
// 					var entry = obj.lootTable[i];
// 					if (warden.gamePhase === 1) {
// 						if (entry[3] === 1 && entry[1] > 1) {
// 							entry[1] -= 1;
// 						}
// 					}
// 					else if (warden.gamePhase === 2 && entry[3] === 2) {
// 						entry[1] += 1;
// 					}
// 				}
// 			}
// 		}
// 	}
// }, warden.queue.checkXSeconds * 1000);

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
					buildLootTable: true,
					nextDropFavored: false
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

		if (warden.addons.courierBuy.enabled) {
			if (!warden.addons.courierBuy.radiant.courierBought) {
				var entity = dota.createUnit("npc_dota_courier", TEAM_RADIANT);
				var clients = getConnectedPlayingTeam(TEAM_RADIANT);
				var controllable = 0;
				for (var i = 0; i < clients.length; ++i) {
					var playerID = clients[i].netprops.m_iPlayerID;
					controllable = Math.pow(2, playerID);
					if (warden.addons.courierBuy.enableSound)
						dota.sendAudio(clients[i], false, warden.addons.courierBuy.purchaseSound);
				}
				entity.netprops.m_iIsControllableByPlayer = controllable;
				dota.findClearSpaceForUnit(entity, warden.addons.courierBuy.radiant.spawnLocation);

				warden.addons.courierBuy.radiant.courierBought = true;
			}
			if (!warden.addons.courierBuy.dire.courierBought) {
				var entity = dota.createUnit("npc_dota_courier", TEAM_DIRE);
				var clients = getConnectedPlayingTeam(TEAM_DIRE);
				var controllable = 0;
				for (var i = 0; i < clients.length; ++i) {
					var playerID = clients[i].netprops.m_iPlayerID;
					controllable = Math.pow(2, playerID);
					if (warden.addons.courierBuy.enableSound)
						dota.sendAudio(clients[i], false, warden.addons.courierBuy.purchaseSound);
				}
				entity.netprops.m_iIsControllableByPlayer = controllable;
				dota.findClearSpaceForUnit(entity, warden.addons.courierBuy.dire.spawnLocation);
				warden.addons.courierBuy.dire.courierBought = true;
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
			var client = clients[i];
			if ( warden.playersBarredFromDrops.indexOf(client) > -1)
				continue;

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

		warden.playerList.sort();
		timers.setInterval(generateLoot, warden.lootDisperseTimeout * 1000);

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
					for (j = 0; j < wardrobe.rules.rangedBanned.length; ++j) {
						var banName = wardrobe.rules.rangedBanned[j];
						for (k = 0; k < playerProps[playerID].lootTable.length; k++) {
							var entry = playerProps[playerID].lootTable[k];
							if (entry[0] == banName)
								playerProps[playerID].lootTable.splice(k, 1);
						}
					}
				}

				// Primary Hero Attribute Modification
				var fileFieldPrimaryExists = (typeof hFile.Heroes[heroName].attributePrimary !== "undefined" ? true : false);
				if ( fileFieldPrimaryExists ) {
					var attr = hFile.Heroes[heroName].attributePrimary;
					for (j = 0; j < playerProps[playerID].lootTable.length; j++) {
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
							for (j = 0; j < hFile.Heroes[heroName].itemBuild.length; j++) {
								var prop = hFile.Heroes[heroName].itemBuild[j];
								for (k = 0; k < playerProps[playerID].lootTable.length; k++) {
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
									entry[1] = wardrobe.rules.scepterUpgrade;
								}
							}
						}
					}
				}
				else {
					var abilities = [];
					for (j = 0; j < 15; j++) {
						if (hero.netprops.m_hAbilities[j] !== null) {
							var name = hero.netprops.m_hAbilities[j].getClassname();
							abilities.push(name);
						}
					}
					var scepterAbility = false;

					// Analyze the abilities
					for (k = 0; k < abilities.length; ++k) {
						if ( sFile.Abilities.scepter.indexOf(abilities[k]) > -1) {
							scepterAbility = true;
							break;
						}
						else
							continue;
					}

					// Weight modifications based on hero abilities
					for (j = 0; j < playerProps[playerID].lootTable.length; j++) {
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
}

function onMapStart() {
	warden.mapLoaded = true;
	playerManager = game.findEntityByClassname(-1, "dota_player_manager");
}

// ==========================================
// Pendulum Calculator
// ==========================================
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
}


function resetQueueReminder() { warden.queue.reminded = false; }
function resetGarbageCollector() { warden.trashManager.cleaned = false; }


function generateLoot() {
	var client, name, playerID, hero, heroItemsEquipped, itemName;
	if (warden.playerList.length > 0) {
		client = warden.playerList.pop();
		hero = client.netprops.m_hAssignedHero;
		playerID = client.netprops.m_iPlayerID;

		if (hero !== null)
			heroItemsEquipped = getHeroEquipment(hero);
		else
			heroItemsEquipped = [];

		itemName = getUniqueItemName(playerID, heroItemsEquipped);
		giveItemToClient(itemName, client);

		if (warden.soundEffects.enabled) {
			var sound = warden.soundEffects.list[getRandomInt(warden.soundEffects.list.length)];
			dota.sendAudio(client, false, sound);
		}

		if (warden.reLootTable.indexOf(itemName) !== -1 && getRandomInt(100) <= warden.reLootPercentage) {
			itemName = getUniqueItemName(playerID, heroItemsEquipped);
			giveItemToClient(itemName, client);
		}
	}
	else {
		warden.playerList.length = 0;
		timers.clearInterval(generateLoot);
	}
}

function getUniqueItemName(playerID, heroInventory) {
	var uniqueItemsGiven = [], rolls = 0, itemName;

	uniqueItemsGiven = getPlayerProp(playerID, "uniqueItemsGiven");

	do
	{
		rolls += 1;
		// Fail-safe so we don't continue rolling infinitely if we can't find an item.
		if (rolls < warden.maxTries) {
			itemEntry = getRandomLoot(playerID);
			itemName = itemEntry[0];
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

			if (playerProps[playerID]) {
				if (!playerProps[playerID].nextDropFavored)
					if (itemEntry[2] < 2050)
						playerProps[playerID].nextDropFavored = true;
				else
					playerProps[playerID].nextDropFavored = false;
			}

			uniqueItemsGiven.push(itemName);
			setPlayerProp(playerID, "uniqueItemsGiven", uniqueItemsGiven);

			if ( typeof warden.itemTable.countLimitPerTeam[itemName] === "undefined" )
				warden.itemTable.countLimitPerTeam[itemName] = 0;

			warden.itemTable.countLimitPerTeam[itemName] += 1;

			if ( typeof warden.itemTable.limitPerTeam[itemName] !== "undefined" && warden.itemTable.countLimitPerTeam[itemName] === warden.itemTable.limitPerTeam[itemName]) {
				var player = dota.findClientByPlayerID(playerID);
				var playerTeamID = player.netprops.m_iTeamNum;
				var clients = getConnectedPlayingTeam(playerTeamID);
				for (var i = 0; i < clients.length; ++i) {
					var client = clients[i];
					var clientPlayerID = client.netprops.m_iPlayerID;

					if (playerID === clientPlayerID) continue;

					if (playerProps[clientPlayerID]) {
						var exclusionList = getPlayerProp(clientPlayerID, "uniqueItemsGiven");

						if ( exclusionList.indexOf(itemName) > -1 )
							continue;

						exclusionList.push(itemName);
						setPlayerProp(clientPlayerID, "uniqueItemsGiven", exclusionList);
					}
				}
			}
			else if ( typeof warden.itemTable.limitPerTeam[itemName] === "undefined" && warden.itemTable.countLimitPerTeam[itemName] === 2) {
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

	entity.netprops.m_iSharability = 0;
	entity.netprops.m_bKillable = false;

	return;
}

function addItemToQueue(itemName, playerID) {
	var q = getPlayerProp(playerID, "queue");
	q.push(itemName);
	setPlayerProp(playerID, "queue", q);
}

function getRandomLoot(playerID) {

	var loot;

	loot = warden.itemTable.instance;

	if (warden.itemTable.useWeights && wardrobe.enabled) {
		if (playerProps[playerID].lootTable !== null)
			loot = playerProps[playerID].lootTable;
	}

	if (!loot) loot = baseItemTable;

	if (playerProps[playerID].nextDropFavored) {
		if (getRandomInt(100) <= 75) {
			var chanceLoot = [];
			for (var i = 0; i < loot.length; ++i) {
				if (loot[i][2] > 2000)
					chanceLoot.push(loot[i]);
			}
			loot = chanceLoot;
		}
	}

	if (warden.itemTable.useWeights) {
	    var lootTotalWeight = 0, lootCumulativeWeight = 0, i, weight;

	    for (i = 0; i < loot.length; i++) {
			lootTotalWeight += loot[i][1];
	    }
	    var weight = Math.floor(Math.random() * lootTotalWeight);
	    for (i = 0; i < loot.length; i++) {
	        lootCumulativeWeight += loot[i][1];
	        if (weight < lootCumulativeWeight ) {
		        return loot[i];
	        }
	    }
	}
	else {
		return loot[getRandomInt(loot.length)];
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
game.hook("Dota_OnBuyItem", onBuyItem);
game.hookEvent("dota_player_killed", onPlayerKilled);

function onBuyItem(unit, item, playerID, unknown)
{
	if (item == "item_courier") {
		if (warden.addons.courierBuy.enabled) {
			var client = dota.findClientByPlayerID(playerID);
			var teamID = client.netprops.m_iTeamNum;
			if (teamID === TEAM_RADIANT && !warden.addons.courierBuy.radiant.courierBought)
				warden.addons.courierBuy.radiant.courierBought = true;
			else if (teamID === TEAM_DIRE && !warden.addons.courierBuy.dire.courierBought)
				warden.addons.courierBuy.dire.courierBought = true;
		}
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
		case "Aegis & Rapier only":
			warden.itemTable.mode = 2;
			break;
	}

	buildItemTable();
}

// ==========================================
// Plugin Exposure
// ==========================================

// plugin.expose({
// 	// Disables drops for this client
//     disableDropsForPlayer: function(playerID) {
//     	var player = dota.findClientByPlayerID(playerID);
//     	if ( !player )
//     		return 0;

//     	if ( player.indexOf( warden.playersBarredFromDrops) > -1 )
//     		return 1;
//     	else {
//     		warden.playersBarredFromDrops.push( player );
//     		return true;
//     	}
//     },
// 	// Re-enables drops for the disabled client
//     enableDropsForPlayer: function(playerID) {
//     	var player = dota.findClientByPlayerID(playerID);
//     	if ( !player )
//     		return 0;

//     	if ( player.indexOf( warden.playersBarredFromDrops ) > -1 ) {
//     		warden.playersBarredFromDrops.splice( player.indexOf( warden.playersBarredFromDrops ), 1);
//     		return true;
//     	}
//     	else
//     		return 1;
//     }
// });

// plugin.get("WeaponMayhem", function(obj) {
// 	var clients = getConnectedPlayingClients();
// 	for (var i = 0; i < clients.length; ++i) {
// 		server.print( obj.disableDropsForPlayer( clients[i].netprops.m_iPlayerID ) );
// 	}
// });


// ==========================================
// Developer Mode
// ==========================================

if (g_plugin.developer) {
	warden.leadTime.length = 0;
	warden.nextBase.length = 0;
	warden.leadTime = ['0:15'];
	warden.nextBase = ['0:15'];
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