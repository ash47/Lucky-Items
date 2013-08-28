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
	version: "1.3.3",
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
// Lucky Items Setup
// ==========================================
var li = {
	mapLoaded: false,			// did the map start?
	pluginLoaded: false,		// did plugin initialize?
	pluginTime: 0,				// keep track of passed in-game seconds
	gamePhase: 1,				// current match phase. 1 - Early Game; 2 - MidGame; 3 - Late Game
	leadTime: ['5:00'],			// lead item drop : STATE_GAME_IN_PROGRESS
	nextBase: ['5:00'],			// subsequent drops after the lead
	shakeTime: 6,				// random x seconds off designated drop times
	nextTime: 0,				// when our next drop will occur
	gameTime: null,				// keeps track of the game frame time
	currentWave: 0,				// keeps track of the current item wave
	playerList: [],				// which players will receive an item
	playersBarredFromDrops: [], // playerID is in here, they will receive no items
	disperseTimeout: 0.6,		// how many seconds to wait before giving each player their items
	itemDropFavorPercent: 40,   // percentage chance to get a favored item after a low one
	maxTries: 8,				// prevent an infinite search loop, break
	maxTriesLoot: [				// we can't find our player an item, default to these
		"item_cheese"
	],
	reLootPercentage: 75,		// a percentage chance to random twice on specific items
	reLootTable: [				// items to perform another random on.
		"item_aegis",
		"item_cheese"
	],
	doNotConsiderDupes: [		// exceptions to keep generating loot.
		"item_rapier",
		"item_aegis",
		"item_cheese"
	],
	doNotPutInStash: [			// a bug with the aegis, as you can't remove it once it's in your stash
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
			reminder: "%s in queue."
		}
	},
	// Plugin sound effects that occur when an item is randomed to a player or other trigger events.
	soundEffects: {
		enabled: true,			// Enabled / disabled
		timeThreshold: 160,		// Below this time (in seconds) threshold, disable them
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
		// will only dispense (randomly) the set number of items per team.
		countLimitPerTeam: {},
		maxEachLimit: 4,
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
		donkey: {
			enabled: false,
			loaded: false,
			radiant: {
				courier: false,
				controlMask: 0,
				entityID: null,
				spawnLocation: {'x': -7156, 'y': -6700, 'z': 270}
			},
			dire: {
				courier: false,
				controlMask: 0,
				entityID: null,
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
				// items banned from randoming on strength heroes
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
		},
		// Addon Description: Release Version 1.0.0
		// Currently watches on: Kills
		// Watches each team and adjusts item weights based on performance
		rubberband: {
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
var donkey = li.addons.donkey;
var wardrobe = li.addons.wardrobe;
var rubberband = li.addons.rubberband;

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
	// Shop Mask:
	//    1 - Caster/Support Items
	//    2 - Weapons
	//    4 - Armor
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
	// [0            1,           2,     3,         4,             5,      ]
	// ["Classname", weight(0-∞), price, gamePhase, attributeMask, shopMask], // Weapon Name (price)
	//
	["item_aegis",                   5,    0, 0, -1, -1], // Aegis of the Immortal (0g)
	["item_cheese",                  5,    0, 0, -1, -1], // Cheese (0g)
	//
	["item_orb_of_venom",          230,  275, 1, 0, 0], // Orb of Venom (275g)
	["item_null_talisman",         220,  470, 1, 4, 0], // Null Talisman (470g)
	["item_wraith_band",           220,  485, 1, 2, 0], // Wraith Band (485g)
	["item_magic_wand",            220,  509, 1, 7, 0], // Magic Wand (509g)
	["item_bracer",                220,  525, 1, 1, 0], // Bracer (525g)
	["item_poor_mans_shield",      220,  550, 1, 3, 0], // Poor Man's Shield (550g)
	["item_headdress",             215,  603, 1, 4, 0], // Headdress (603g)
	["item_soul_ring",             210,  800, 1, 4, 1], // Soul Ring (800g)
	["item_buckler",               210,  803, 1, 4, 0], // Buckler (803g)
	["item_urn_of_shadows",        210,  875, 1, 1, 7], // Urn of Shadows (875g)
	["item_void_stone",            210,  875, 1, 0, 1], // Void Stone (875g)
	["item_ring_of_health",        210,  875, 1, 0, 4], // Ring of Health (875g)
	["item_helm_of_iron_will",     210,  950, 1, 0, 4], // Helm of Iron Will (950g)
	["item_tranquil_boots",        210,  975, 1, 0, 0], // Tranquil Boots (975g)
	["item_ring_of_aquila",        205,  985, 1, 0, 1], // Ring of Aquila (985g)
	["item_ogre_axe",              200, 1000, 1, 1, 4], // Ogre Axe (1,000g)
	["item_blade_of_alacrity",     200, 1000, 1, 2, 2], // Blade of Alacrity (1,000g)
	["item_staff_of_wizardry",     200, 1000, 1, 4, 1], // Staff of Wizardry (1,000g)
	["item_energy_booster",        200, 1000, 1, 4, 1], // Energy Booster (1,000g)
	["item_medallion_of_courage",  200, 1075, 1, 0, 2], // Medallion of Courage (1,075g)
	["item_vitality_booster",      190, 1100, 1, 7, 4], // Vitality Booster (1,100g)
	["item_point_booster",         180, 1200, 1, 7, 1], // Point Booster (1,200g)
	["item_broadsword",            180, 1200, 1, 0, 2], // Broadsword (1,200g)
	["item_phase_boots",           170, 1350, 1, 0, 2], // Phase Boots (1,350g)
	["item_platemail",             160, 1400, 1, 0, 4], // Platemail (1,400g)
	["item_claymore",              160, 1400, 1, 0, 2], // Claymore (1,400g)
	["item_power_treads",          160, 1400, 1, 7, 6], // Power Treads (1,400g)
	["item_arcane_boots",          160, 1450, 1, 4, 1], // Arcane Boots (1,450g)
	["item_javelin",               150, 1500, 1, 0, 2], // Javelin (1,500g)
	["item_ghost",                 140, 1600, 1, 0, 1], // Ghost Scepter (1,600g)
	["item_shadow_amulet",         140, 1600, 1, 0, 0], // Shadow Amulet (1,600g)
	["item_mithril_hammer",        140, 1600, 1, 0, 2], // Mithril Hammer (1,600g)
	["item_oblivion_staff",        140, 1675, 1, 0, 1], // Oblivion Staff (1,675g)
	["item_pers",                  130, 1750, 1, 0, 1], // Perseverance (1,750g)
	["item_ancient_janggo",        130, 1775, 1, 7, 7], // Drums of Endurance (1,775g)
	["item_talisman_of_evasion",   120, 1800, 2, 0, 4], // Talisman of Evasion (1,800g)
	["item_helm_of_the_dominator", 120, 1850, 2, 3, 2], // Helm of the Dominator (1,850g)
	["item_hand_of_midas",         110, 1900, 1, 0, 2], // Hand of Midas (1,900g)
	["item_mask_of_madness",       110, 1900, 2, 3, 2], // Mask of Madness (1,900g)
	["item_vladmir",               100, 2050, 2, 3, 2], // Vladmir's Offering (2,050g)
	["item_yasha",                 100, 2050, 2, 2, 2], // Yasha (2,050g)
	["item_sange",                 100, 2050, 2, 1, 2], // Sange (2,050g)
	["item_ultimate_orb",           95, 2100, 2, 7, 3], // Ultimate Orb (2,100g)
	["item_hyperstone",             95, 2100, 2, 3, 2], // Hyperstone (2,100g)
	["item_hood_of_defiance",       95, 2125, 2, 0, 1], // Hood of Defiance (2,125g)
	["item_blink",                  95, 2150, 1, 0, 7], // Blink Dagger (2,150g)
	["item_lesser_crit",            15, 2150, 2, 2, 2], // Crystalys (2,150g)
	["item_blade_mail",             90, 2200, 2, 1, 4], // Blade Mail (2,200g)
	["item_vanguard",               90, 2225, 2, 0, 4], // Vanguard (2,225g)
	["item_force_staff",            90, 2250, 1, 4, 7], // Force Staff (2,250g)
	["item_mekansm",                85, 2306, 2, 4, 1], // Mekansm (2,306g)
	["item_demon_edge",             80, 2400, 2, 3, 2], // Demon Edge (2,400g)
	["item_travel_boots",           80, 2450, 3, 0, 7], // Boots of Travel (2,450g)
	["item_armlet",                 75, 2600, 2, 1, 2], // Armlet of Mordiggan (2,600g)
	["item_veil_of_discord",        65, 2650, 2, 0, 1], // Veil of Discord (2,650g)
	["item_mystic_staff",           60, 2700, 2, 4, 1], // Mystic Staff (2,700g)
	["item_necronomicon",           60, 2700, 2, 5, 1], // Necronomicon 1 (2,700g)
	["item_maelstrom",              60, 2700, 2, 3, 2], // Maelstrom (2,700g)
	["item_cyclone",                60, 2700, 2, 4, 1], // Eul's Scepter of Divinity (2,700g)
	["item_dagon",                  60, 2730, 2, 5, 1], // Dagon 1 (2,730g)
	["item_basher",                 55, 2950, 2, 1, 2], // Skull Basher (2,950g)
	["item_invis_sword",            55, 3001, 2, 7, 2], // Shadow Blade (3,000g)
	["item_rod_of_atos",            50, 3100, 3, 4, 1], // Rod of Atos (3,100g)
	["item_reaver",                 45, 3200, 3, 1, 4], // Reaver (3,200g)
	["item_soul_booster",           40, 3300, 3, 7, 1], // Soul Booster (3,300g)
	["item_eagle",                  40, 3300, 3, 2, 2], // Eaglesong (3,300g)
	["item_diffusal_blade",         40, 3300, 3, 3, 2], // Diffusal Blade (3,300g)
	["item_pipe",                   25, 3628, 3, 5, 1], // Pipe of Insight (3,628g)
	["item_relic",                  15, 3800, 3, 7, 2], // Sacred Relic (3,800g)
	["item_heavens_halberd",        15, 3850, 3, 1, 2], // Heaven's Halberd (3,850g)
	["item_black_king_bar",         15, 3900, 3, 7, 4], // Black King Bar (3,900g)
	["item_necronomicon_2",         10, 3950, 3, 0, 1], // Necronomicon 2 (3,950g)
	["item_dagon_2",                10, 3980, 3, 0, 1], // Dagon 2 (3,980g)
	["item_desolator",               3, 4100, 3, 3, 2], // Desolator (4,100g)
	["item_sange_and_yasha",         3, 4100, 3, 3, 2], // Sange & Yasha (4,100g)
	["item_orchid",                  3, 4125, 3, 4, 1], // Orchid Malevolence (4,125g)
	["item_diffusal_blade_2",        3, 4150, 3, 0, 2], // Diffusal Blade 2 (4,150g)
	["item_ultimate_scepter",        3, 4200, 3, 7, 7], // Aghanim's Scepter (4,200g)
	["item_bfury",                   3, 4350, 3, 3, 2], // Battle Fury (4,350g)
	["item_shivas_guard",            3, 4700, 3, 4, 4], // Shiva's Guard (4,700g)
	["item_ethereal_blade",          3, 4900, 3, 6, 2], // Ethereal Blade (4,900g)
	["item_bloodstone",              3, 5050, 3, 4, 5], // Bloodstone (5,050g)
	["item_manta",                   2, 5050, 3, 2, 2], // Manta Style (5,050g)
	["item_radiance",                2, 5150, 3, 7, 2], // Radiance (5,150g)
	["item_sphere",                  2, 5175, 3, 7, 5], // Linken's Sphere (5,175g)
	["item_necronomicon_3",          2, 5200, 3, 0, 1], // Necronomicon 3 (5,200g)
	["item_dagon_3",                 2, 5230, 3, 0, 1], // Dagon 3 (5,230g)
	["item_refresher",               2, 5300, 3, 5, 1], // Refresher Orb (5,300g)
	["item_assault",                 2, 5350, 3, 3, 4], // Assault Cuirass (5,350g)
	["item_mjollnir",                1, 5400, 3, 3, 2], // Mjollnir (5,400g)
	["item_monkey_king_bar",         1, 5400, 3, 3, 2], // Monkey King Bar (5,400g)
	["item_heart",                   1, 5500, 3, 7, 4], // Heart of Terrasque (5,500g)
	["item_greater_crit",            1, 5550, 3, 3, 2], // Daedalus (5,550g)
	["item_skadi",                   1, 5675, 3, 7, 3], // Eye of Skadi (5,675g)
	["item_sheepstick",              1, 5675, 3, 4, 1], // Scythe of Vyse (5,675g)
	["item_butterfly",               1, 6001, 3, 2, 2], // Butterfly (6,000g)
	["item_satanic",                 1, 6150, 3, 3, 2], // Satanic (6,150g)
	["item_rapier",                  1, 6200, 3, 0, 2], // Divine Rapier (6,200g)
	["item_dagon_4",                 1, 6480, 3, 0, 1], // Dagon 4 (6,480g)
	["item_abyssal_blade",           1, 6750, 3, 1, 2], // Abyssal Blade (6,750g)
	["item_dagon_5",                 1, 7730, 3, 0, 1], // Dagon 5 (7,730g)
];
function containsFlag(flags, flag) {
    return (flags & flag) === flag;
}

// ==========================================
// Game Phase Loot Modifier
// ==========================================
// timers.setInterval(function() {
// 	if (li.pluginLoaded) {

// 		li.pluginTime += 1;

// 		switch(li.pluginTime)
// 		{
// 			default: break;
// 			case (li.gamePhase === 1 && li.pluginTime >= 450):
// 				li.gamePhase = 2;
// 				break;
// 			case (li.gamePhase === 2 && li.pluginTime >= 900):
// 				li.gamePhase = 3;
// 				break;
// 		}

// 		if (li.pluginTime % 10 === 0) {
// 			for (var key in playerProps) {
// 				var obj = playerProps[key];
// 				for (var i = 0; i < obj.lootTable.length; ++i) {
// 					var entry = obj.lootTable[i];
// 					if (li.gamePhase === 1) {
// 						if (entry[3] === 1 && entry[1] > 1) {
// 							entry[1] -= 1;
// 						}
// 					}
// 					else if (li.gamePhase === 2 && entry[3] === 2) {
// 						entry[1] += 1;
// 					}
// 				}
// 			}
// 		}
// 	}
// }, li.queue.checkXSeconds * 1000);

// ==========================================
// Player Inventory Queue
// ==========================================
function resetQueueReminder() { li.queue.reminded = false; }
timers.setInterval(function() {
	if (li.pluginLoaded) {
		var playerIDs = getConnectedPlayerIDs();
		if (playerIDs.length === 0)
			return;

		for (i = 0; i < playerIDs.length; ++i)
		{
			var playerID = playerIDs[i];
			var client = dota.findClientByPlayerID(playerID);
			if (client === null)
				continue;

			var hero = client.netprops.m_hAssignedHero;
			if (hero === null)
				continue;

			if (playerProps[playerID])
			{
				// Take a snapshot of a player's equipment, in-case they disconnect
				var equipment = getHeroEquipment(hero);
				playerProps[playerID].snapHeroEquip = equipment;

				var queueLength = playerProps[playerID].queue.length;
				if (queueLength > 0) {
					if (isInventoryAvailable(hero) || isStashAvailable(hero)) {
						giveItemToPlayer(playerProps[playerID].queue[0], playerID);
						playerProps[playerID].queue.shift();
					}
					if (queueLength >= li.queue.remindNItems && !li.queue.reminded) {
						printToPlayer(playerID, li.queue.notice.reminder, [queueLength]);
						timers.setTimeout(resetQueueReminder, (li.queue.reminderTimeout * 1000));
						li.queue.reminded = true;
					}
				}
			}
		}
	}
}, li.queue.checkXSeconds * 1000);

// ==========================================
// Player Properties & Item Dispenser
// ==========================================
timers.setInterval(function() {
	if (!li.mapLoaded) return;

	var playerIDs = getConnectedPlayerIDs();
	if (playerIDs.length === 0)
		return;

	var gameState = game.rules.props.m_nGameState;

	// ==========================================
	// Player Properties
	// ==========================================
	for (i = 0; i < playerIDs.length; ++i)
	{
		var playerID = playerIDs[i];

		if (!playerProps[playerID]) {
			playerProps[playerID] = {
				ID: playerID,
				queue: [],
				itemNamesGiven: [],
				snapHeroEquip: [],
				itemEntities: [],
				lootTable: null,
				buildLootTable: true,
				nextDropFavored: false
			};
			var team = getTeamIDFromPlayerID(playerID);
			if (team === TEAM_RADIANT)
				donkey.radiant.controlMask += Math.pow(2, playerID);
			else
				donkey.dire.controlMask += Math.pow(2, playerID);
		}
	}

	// ==========================================
	// Courier Spawn
	// ==========================================
	if (donkey.enabled) {
		if (gameState === dota.STATE_PRE_GAME && !donkey.loaded) {
			var donkies = game.findEntitiesByClassname("npc_dota_courier");
			if (donkies.length > 0) {
				for (var i = 0; i < donkies.length; ++i) {
					var courier = donkies[i];
					if (courier.netprops.m_iTeamNum === TEAM_RADIANT)
						donkey.radiant.courier = true;
					else if (courier.netprops.m_iTeamNum === TEAM_DIRE)
						donkey.dire.courier = true;
				}
			}
			if (!donkey.radiant.courier) {
				var entity = dota.createUnit("npc_dota_courier", TEAM_RADIANT);
				var radiMask = 0;
				for (var key in playerProps) {
					var obj = playerProps[key];
					var playerID = obj.ID;
					var team = getTeamIDFromPlayerID(playerID);
					if (team === TEAM_RADIANT)
						radiMask += Math.pow(2, playerID);
				}
				entity.netprops.m_iIsControllableByPlayer = radiMask;
				donkey.radiant.entityID = entity;
				dota.findClearSpaceForUnit(entity, donkey.radiant.spawnLocation);
				donkey.radiant.courier = true;
			}
			if (!donkey.dire.courier) {
				var entity = dota.createUnit("npc_dota_courier", TEAM_DIRE);
				var direMask = 0;
				for (var key in playerProps) {
					var obj = playerProps[key];
					var playerID = obj.ID;
					var team = getTeamIDFromPlayerID(playerID);
					if (team === TEAM_DIRE)
						direMask += Math.pow(2, playerID);
				}
				entity.netprops.m_iIsControllableByPlayer = direMask;
				donkey.dire.entityID = entity;
				dota.findClearSpaceForUnit(entity, donkey.dire.spawnLocation);
				donkey.dire.courier = true;
			}
			timers.setInterval(function() {
				// Update control mask throughout the match in-case a new player joins in after initial hero spawn
				donkey.radiant.controlMask = 0;
				donkey.dire.controlMask = 0;
				for (var key in playerProps) {
					var obj = playerProps[key];
					var playerID = obj.ID;
					var team = getTeamIDFromPlayerID(playerID);
					if (team === TEAM_RADIANT)
						donkey.radiant.controlMask += Math.pow(2, playerID);
					else
						donkey.dire.controlMask += Math.pow(2, playerID);
				}
				var courierDire = donkey.dire.entityID;
				courierDire.netprops.m_iIsControllableByPlayer = donkey.dire.controlMask;
				var courierRadi = donkey.radiant.entityID;
				courierRadi.netprops.m_iIsControllableByPlayer = donkey.radiant.controlMask;
			}, 30000);
			donkey.loaded = true;
		}
	}

	if (gameState < dota.STATE_PRE_GAME || gameState > dota.STATE_GAME_IN_PROGRESS)
		return;

	// ==========================================
	// Dispenser: Manages item drops
	// ==========================================
	var gameTime, increment, time, shakeTime;
	if (!li.pluginLoaded && gameState === dota.STATE_GAME_IN_PROGRESS) {

		li.pluginLoaded = true;
		li.nextTime += convertMinutesToSeconds(li.leadTime[getRandomInt(li.leadTime.length)]) + getRandomInt( flipInt(li.shakeTime) );

		li.gameTime = game.rules.props.m_fGameTime + li.nextTime;
		timeFirst = convertSecondsToMinutes(li.nextTime);
		printToAll(li.dropNotifications.lead, [timeFirst]);

		// Re-build our item table if it does not exist
		if (li.itemTable.instance === null) {
			buildItemTable();
		}

		if (li.itemTable.useWeights && wardrobe.enabled) {
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
	if (li.pluginLoaded && game.rules.props.m_fGameTime >= li.gameTime) {

		li.currentWave += 1;

		increment = convertMinutesToSeconds(li.nextBase[getRandomInt(li.nextBase.length)]) + getRandomInt( flipInt(li.shakeTime) );

		li.nextTime += increment;
		li.gameTime += increment;

		if (li.dropNotifications.enabled) {
			shakeTime = convertSecondsToMinutes(li.nextTime + getRandomInt( flipInt(li.shakeTime) ));
			printToAll(li.dropNotifications.subsequent, [shakeTime]);
		}

		for (var key in playerProps) {
			var obj = playerProps[key];
			if ( li.playersBarredFromDrops.indexOf(obj.ID) > -1)
				continue;

			li.playerList.push(obj.ID);
		}

		if (rubberband.enabled) {
			pendulumSwing();
		}

		generateLoot();

		if (li.trashManager.enabled) {
			if (li.currentWave % li.trashManager.cleanAtXWave === 0) {
				cleanupTrash();
			}
		}
	}
}, 100);

// ==========================================
// Begin Plugin Functions
// ==========================================
function resetGarbageCollector() { li.trashManager.cleaned = false; }


function generateLoot() {
	for (var i = 0; i < li.playerList.length; ++i)
	{
		var playerID = li.playerList[i];

		if (playerProps[playerID]) {
			var snapLastEquipment = playerProps[playerID].snapHeroEquip;
			var itemName = getUniqueItemName(playerID, snapLastEquipment);
			var client = dota.findClientByPlayerID(playerID);

			if (client === null) {
				giveItemToPlayer(itemName, playerID, true);
			}
			else {
				giveItemToPlayer(itemName, playerID);
				if (li.soundEffects.enabled) {
					var sound = li.soundEffects.list[getRandomInt(li.soundEffects.list.length)];
					dota.sendAudio(client, false, sound);
				}
			}

			if (li.reLootTable.indexOf(itemName) > -1 && getRandomInt(100) <= li.reLootPercentage) {
				itemName = getUniqueItemName(playerID, snapLastEquipment);
				giveItemToPlayer(itemName, playerID);
			}
		}
	}
	li.playerList.length = 0;
}

function checkForBoots(heroInventory, boots) {
	for (var i = 0; i < heroInventory.length; ++i)
	{
		if (boots.indexOf(heroInventory[i]) > -1)
			return true;
	}
	return false;
}

function getUniqueItemName(playerID, heroInventory) {
	var itemNamesGiven = [], rolls = 0, itemName;

	itemNamesGiven = getPlayerProp(playerID, "itemNamesGiven");

	var boots = [
		"item_boots",
		"item_travel_boots",
		"item_tranquil_boots",
		"item_arcane_boots",
		"item_power_treads",
		"item_phase_boots"
	];

	var hasBoots = checkForBoots(heroInventory, boots);

	do
	{
		rolls += 1;
		// Fail-safe so we don't continue rolling infinitely if we can't find an item.
		if (rolls < li.maxTries) {
			itemEntry = getRandomLoot(playerID);
			itemName = itemEntry[0];
		}
		else {
			itemName = li.maxTriesLoot[getRandomInt(li.maxTriesLoot.length)];
			break;
		}

		if ( li.doNotConsiderDupes.indexOf(itemName) > -1 )
			break;

	}
	while ( heroInventory.indexOf(itemName) > -1 || itemNamesGiven.indexOf(itemName) > -1 || (hasBoots && boots.indexOf(itemName) > -1) );

	if (li.doNotConsiderDupes.indexOf(itemName) === -1)
	{
		if (itemNamesGiven.indexOf(itemName) === -1)
		{
			if (playerProps[playerID]) {
				if (!playerProps[playerID].nextDropFavored)
					if (itemEntry[2] < 2050)
						playerProps[playerID].nextDropFavored = true;
				else
					playerProps[playerID].nextDropFavored = false;
			}

			itemNamesGiven.push(itemName);
			setPlayerProp(playerID, "itemNamesGiven", itemNamesGiven);

			if ( typeof li.itemTable.countLimitPerTeam[itemName] === "undefined" )
				li.itemTable.countLimitPerTeam[itemName] = 0;

			li.itemTable.countLimitPerTeam[itemName] += 1;

			if ( typeof li.itemTable.limitPerTeam[itemName] !== "undefined" && li.itemTable.countLimitPerTeam[itemName] === li.itemTable.limitPerTeam[itemName]) {
				var teamID = getTeamIDFromPlayerID(playerID);
				if (teamID !== null) {
					var playerIDs = getConnectedPlayerIDsOnTeam(teamID);
					for (var i = 0; i < playerIDs.length; ++i)
					{
						var teamPlayerID = playerIDs[i];
						// Skip the player that landed the item
						if (teamPlayerID === playerID)
							continue;

						if (playerProps[teamPlayerID]) {
							var exclusionList = getPlayerProp(teamPlayerID, "itemNamesGiven");

							if ( exclusionList.indexOf(itemName) > -1 )
								continue;

							exclusionList.push(itemName);
							setPlayerProp(teamPlayerID, "itemNamesGiven", exclusionList);
						}
					}
				}
			}
			else if (li.itemTable.countLimitPerTeam[itemName] === li.itemTable.maxEachLimit) {
				var teamID = getTeamIDFromPlayerID(playerID);
				if (teamID !== null) {
					var playerIDs = getConnectedPlayerIDsOnTeam(teamID);
					for (var i = 0; i < playerIDs.length; ++i)
					{
						var teamPlayerID = playerIDs[i];
						// Skip the player that landed the item
						if (teamPlayerID === playerID)
							continue;

						if (playerProps[teamPlayerID]) {
							var exclusionList = getPlayerProp(teamPlayerID, "itemNamesGiven");

							if ( exclusionList.indexOf(itemName) > -1 )
								continue;

							exclusionList.push(itemName);
							setPlayerProp(teamPlayerID, "itemNamesGiven", exclusionList);
						}
					}
				}
			}

			if ( typeof li.itemTable.componentExclude.items[itemName] !== "undefined" ) {
				var entries = li.itemTable.componentExclude.items[itemName];
				for (var i = 0; i < entries.length; ++i) {
					itemNamesGiven.push(entries[i]);
				}
			}
		}
	}

	return itemName;
}

function giveItemToPlayer(itemName, playerID, addToQueue) {

	addToQueue = typeof addToQueue !== 'undefined' ? addToQueue : false;

	if (addToQueue) {
		addItemToQueue(itemName, playerID);
		return;
	}

	var client = dota.findClientByPlayerID(playerID);
	if (client === null) {
		addItemToQueue(itemName, playerID);
		return;
	}

	var hero = client.netprops.m_hAssignedHero;
	if (hero === null) {
		addItemToQueue(itemName, playerID);
		return;
	}
	if (!hero.isHero()) return;

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
						playerProps[playerID].itemEntities.push(index);
						return true;
					}
				}
			}
			else if (spaceInStash && li.doNotPutInStash.indexOf(itemName) === -1) {
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
						playerProps[playerID].itemEntities.push(index);
						return true;
					}
				}
			}
		}
		else {
			addItemToQueue(itemName, playerID);
			return false;
		}
	}
	else {
		addItemToQueue(itemName, playerID);
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

	loot = li.itemTable.instance;

	if (li.itemTable.useWeights && wardrobe.enabled) {
		if (playerProps[playerID].lootTable !== null)
			loot = playerProps[playerID].lootTable;
	}

	if (!loot) loot = baseItemTable;

	if (playerProps[playerID].nextDropFavored) {
		if (getRandomInt(100) < li.itemDropFavorPercent) {
			var chanceLoot = [];
			for (var i = 0; i < loot.length; ++i) {
				if (loot[i][2] > 2000)
					chanceLoot.push(loot[i]);
			}
			loot = chanceLoot;
		}
	}

	if (li.itemTable.useWeights) {
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
function getConnectedPlayerIDs() {
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

		playing.push(playerID);
	}
	return playing;
}

function getConnectedPlayerIDsOnTeam(teamID) {
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

		if (client.netprops.m_iTeamNum === teamID)
			playing.push(playerID);
	}
	return playing;
}

function getTeamIDFromPlayerID(playerID) {
	var client = dota.findClientByPlayerID(playerID);
	if (client === null)
		return false;
	var teamID = client.netprops.m_iTeamNum;
	return teamID;
}

function getHeroEquipment(hero) {
	if (!hero || hero === null || typeof hero === "undefined")
		return;

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
	if (!hero || hero === null || typeof hero === "undefined")
		return;

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
	if (typeof(args) === 'undefined') args = [];
	var playerIDs = getConnectedPlayerIDs();
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

// ==========================================
// Game Hooks
// ==========================================
game.hook("OnMapStart", onMapStart);
function onMapStart() {
	li.mapLoaded = true;
	playerManager = game.findEntityByClassname(-1, "dota_player_manager");
}

game.hookEvent("dota_player_killed", onPlayerKilled);
function onPlayerKilled(event) {
	if (rubberband.enabled) {
		var herokill = event.getBool("HeroKill");
		if (!herokill)
			return;

		var playerID = event.getInt("PlayerID");
		var client = dota.findClientByPlayerID(playerID);
		if (client === null)
			return;

		var team = (client.netprops.m_iTeamNum == TEAM_RADIANT ? "TEAM_DIRE" : "TEAM_RADIANT");

		++rubberband[team].kills;
	}
}

// ==========================================
// Helper Functions
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
	var optionTime = lobbyManager.getOptionsForPlugin("WeaponMayhem")["Speed"];
	if (optionTime) {
		li.nextBase.length = 0;
		li.leadTime.length = 0;
		li.leadTime = [optionTime];
		li.nextBase = [optionTime];

		var s = convertMinutesToSeconds(optionTime);

		if (s < li.soundEffects.timeThreshold)
			li.soundEffects.enabled = false;

		if (s < li.dropNotifications.timeThreshold)
			li.dropNotifications.enabled = false;
	}

	var optionWeight = lobbyManager.getOptionsForPlugin("WeaponMayhem")["Weights"];
	switch(optionWeight)
	{
		default:
		case "Weighted": break;
		case "Non-weighted":
			li.itemTable.useWeights = false;
		break;
	}

	var optionPoolType = lobbyManager.getOptionsForPlugin("WeaponMayhem")["Selection"];
	setupItemTable(optionPoolType);
});

function buildItemTable() {
	var mainItemTable = [];
	mainItemTable.length = 0;
	var tmp = baseItemTable.clone();
	// Always included in table
	for (i = 0; i < tmp.length; ++i) {
		if ( tmp[i][2] === 0 ) {
			mainItemTable.push(tmp[i]);
		}
	}
	// Apply additional modifications to tmp table
	switch(li.itemTable.customMode)
	{
		default:
		case 1:
			for (i = 0; i < tmp.length; ++i) {
				if ( tmp[i][2] > li.itemTable.priceRangeMin && tmp[i][2] < li.itemTable.priceRangeMax ) {
					mainItemTable.push(tmp[i]);
				}
			}
			break;
		case 2: // Aegis & Rapier
			for (i = 0; i < tmp.length; ++i) {
				var itemList = ["item_rapier", "item_aegis"];
				if ( itemList.indexOf(tmp[i][0]) > -1 ) {
					if (li.itemTable.useWeights) {
						if (tmp[i][0] == "item_rapier")
							tmp[i][1] = 35;

						if (tmp[i][0] == "item_aegis")
							tmp[i][1] = 65;
					}
				}
			}
			break;
		case 3: // Caster/Support items only
			for (i = 0; i < tmp.length; ++i) {
				if ( containsFlag(tmp[i][5], 1) && tmp[i][5] !== 0 ) {
					mainItemTable.push(tmp[i]);
				}
			}
			break;
		case 4: // Damage items only
			for (i = 0; i < tmp.length; ++i) {
				if ( containsFlag(tmp[i][5], 2) && tmp[i][5] !== 0 ) {
					mainItemTable.push(tmp[i]);
				}
			}
			break;
		case 5: // Armor/Defensive items only
			for (i = 0; i < tmp.length; ++i) {
				if ( containsFlag(tmp[i][5], 4) && tmp[i][5] !== 0 ) {
					mainItemTable.push(tmp[i]);
				}
			}
			break;
		case 6: // Early Game items only
			for (i = 0; i < tmp.length; ++i) {
				if ( tmp[i][3] === 1 ) {
					mainItemTable.push(tmp[i]);
				}
			}
			break;
	}
	li.itemTable.instance = mainItemTable;
}

function setupItemTable(option) {
	switch(option)
	{
		default:
		case "Greater than 1,000g": break;
		case "Greater than 275g":
			li.itemTable.priceRangeMin = 275;
			break;
		case "Greater than 1,500g":
			li.itemTable.priceRangeMin = 1500;
			break;
		case "Greater than 2,000g":
			li.itemTable.priceRangeMin = 2000;
			break;
		case "Greater than 2,500g":
			li.itemTable.priceRangeMin = 2500;
			break;
		case "Greater than 3,000g":
			li.itemTable.priceRangeMin = 3000;
			break;
		case "Early Game items only":
			li.itemTable.customMode = 6;
			break;
		case "Aegis & Rapier only":
			li.itemTable.customMode = 2;
			break;
		case "Caster & Support items only":
			li.itemTable.customMode = 3;
			break;
		case "Weapon items only":
			li.itemTable.customMode = 4;
			break;
		case "Armor & Defensive items only":
			li.itemTable.customMode = 5;
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

//     	if ( player.indexOf( li.playersBarredFromDrops) > -1 )
//     		return 1;
//     	else {
//     		li.playersBarredFromDrops.push( player );
//     		return true;
//     	}
//     },
// 	// Re-enables drops for the disabled client
//     enableDropsForPlayer: function(playerID) {
//     	var player = dota.findClientByPlayerID(playerID);
//     	if ( !player )
//     		return 0;

//     	if ( player.indexOf( li.playersBarredFromDrops ) > -1 ) {
//     		li.playersBarredFromDrops.splice( player.indexOf( li.playersBarredFromDrops ), 1);
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
// Addon: Wardrobe
// ==========================================
function tailorHeroes() {
	var baseTable = li.itemTable.instance;
	var tmpTable = baseTable.clone();
	var i, j, k;
	for (i = 0; i < li.playerList.length; i++)
	{
		var playerID = li.playerList[i];

		var client = dota.findClientByPlayerID(playerID);
		if (client === null)
			continue;

		var hero = client.netprops.m_hAssignedHero;
		if (hero === null)
			continue;

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
								entry[1] = 0;
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

// ==========================================
// Addon: Rubberband
// ==========================================
function pendulumSwing() {
	// Check kill scores
	checkTeamKills();
	function checkTeamKills() {
		var difference = Math.abs(rubberband.TEAM_RADIANT.kills - rubberband.TEAM_DIRE.kills);
		if (difference < rubberband.killsItemTableThresholdMin) { // No effect
			rubberband.TEAM_DIRE.modifier = 0;
			rubberband.TEAM_RADIANT.modifier = 0;
			rubberband.TEAM_RADIANT.usePoorTable = false;
			rubberband.TEAM_DIRE.usePoorTable = false;
		}
		else if (difference < rubberband.killsItemTableThresholdMax && difference >= killsItemTableThresholdMin) {
			var value = Math.floor(difference / 2);
			if (rubberband.TEAM_RADIANT.kills > rubberband.TEAM_DIRE.kills) {
			// Radiant is winning
				rubberband.TEAM_RADIANT.modifier = -value;
				rubberband.TEAM_DIRE.modifier = value;
			}
			else {
			// Dire is winning
				rubberband.TEAM_DIRE.modifier = -value;
				rubberband.TEAM_RADIANT.modifier = value;
			}
			rubberband.TEAM_RADIANT.usePoorTable = false;
			rubberband.TEAM_DIRE.usePoorTable = false;
		}
		else if (difference >= rubberband.killsItemTableThresholdMax) {
			if (rubberband.TEAM_RADIANT.kills > rubberband.TEAM_DIRE.kills) {
				// Radiant is winning greatly
				// Give the Radiant the poor table
				rubberband.TEAM_RADIANT.usePoorTable = false;
				rubberband.TEAM_RADIANT.modifier = 0;

				rubberband.TEAM_DIRE.usePoorTable = false;
				rubberband.TEAM_DIRE.modifier = (difference * 1.5);
			}
			else {
				// Dire is winning greatly
				// Give the Dire the poor table
				rubberband.TEAM_DIRE.usePoorTable = false;
				rubberband.TEAM_DIRE.modifier = 0;

				rubberband.TEAM_RADIANT.usePoorTable = false;
				rubberband.TEAM_RADIANT.modifier = (difference * 1.5);
			}
		}
		difference = null;
	}
}


// ==========================================
// Temp.
// ==========================================
//
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

		var itemEntities = playerProps[playerID].itemEntities;
		if (!itemEntities || itemEntities.length === 0)
			continue;

		var itemsOnHero = [];
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
		itemEntities.sort();

		for (m = itemEntities.length - 1; m >= 0; --m)
		{
			if (itemsOnHero.indexOf(itemEntities[m]) === -1)
			{
				var entity = game.getEntityByIndex(itemEntities[m]);
				if (entity === null || !entity) {
					continue;
				}
				if (entity.isValid()) {
					dota.remove(entity);
					// dota.findClearSpaceForUnit(entity, vector);
					itemEntities.splice(m, 1);
				}
			}
		}
	}
}

// ==========================================
// Developer Mode
// ==========================================
//
if (g_plugin.developer) {
	li.leadTime.length = 0;
	li.nextBase.length = 0;
	li.leadTime = ['0:10'];
	li.nextBase = ['0:10'];
	var nextBase = convertMinutesToSeconds(li.nextBase[0]);

	if (nextBase <= 120)
		li.dropNotifications.enabled = false;

	li.shakeTime = 1;

	// setupItemTable("Caster/Support items only");
	// li.itemTable.customMode = 5;
	setupItemTable("Armor & Defensive items only");
	// buildItemTable();

	console.addClientCommand("load", liFill);
	function liFill(client, args) {

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
			giveItemToPlayer(itemName, playerID);
		}
	}
	console.addClientCommand("remove", removeInv);
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
}