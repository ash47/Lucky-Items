// ==========================================
// Plugin Information - READ ONLY
// ==========================================
var g_plugin = {
	name: "Lucky Items",
	prefix: "[LI]",
	author: "koone",
	description: "Gives players weighted random items.",
	version: "1.3.5",
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
	developer: false // Developer Mode (useful for plugin strength testing)
};

var DEBUG = false; // server.print()'s everywhere

// ==========================================
// General Setup
// ==========================================

var timers = require('timers');					// Built-In Timers Library
var sprintf = require('sprintf.js').vsprintf;	// Sprintf Library for dynamic strings
var util = require('util.js');					// Load Utility Library
// var enchants = require('enchantments.js');	// Load the item enchantments

// Constants
var HERO_INVENTORY_BEGIN = 0;
var HERO_INVENTORY_END = 5; // END at [0, 1, 2, 3,  4,  5] - 6 SLOTS
var HERO_STASH_BEGIN = 6; // BEGIN at [6, 7, 8, 9, 10, 11] - 6 SLOTS
var HERO_STASH_END = 11;
var UNIT_LIFE_STATE_ALIVE = 0;
var TEAM_RADIANT = dota.TEAM_RADIANT;
var TEAM_DIRE = dota.TEAM_DIRE;

// Variables
var playerProps = [];

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
	waveLimit: -1,				// how many item waves will happen
	playerList: [],				// which players will receive an item
	playersBarredFromDrops: [], // playerID is in here, they will receive no items
	dispenseTimeout: 0.6,		// how many seconds to wait before giving each player their items
	itemDropFavorPercent: 30,   // percentage chance to get a favored item after a low one
	gamePhase: 1,				// current match phase. 1 - Early Game; 2 - MidGame; 3 - Late Game
	maxTries: 8,				// prevent an infinite search loop, break
	maxTriesLoot: [				// we can't find our player an item, default to these
		"item_cheese",
		"item_aegis"
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
	doNotPutInStash: [			//
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
		timeThreshold: 60,		// Below this time (in seconds) threshold, disable them
		list: [					// List of sound effects to use
			"ui/npe_objective_given.wav"
		],
		enchantment: [
			"ui/inventory/treasure_reveal.wav"
		]
	},
	// Plugin chat drop notifications display
	dropNotifications: {
		lead: "\x02%s\x01",		// Lead item time (NOTE: Always enabled)
		enabled: false,			// Enable / disable subsequent notifications
		timeThreshold: 60,		// Below this time threshold (in seconds), disable them
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
		componentExclude: keyvalue.parseKVFile("item_component_exclusion_list.kv")
	},
	// These are the plugin addons. They are added onto the base and provide improved functionality.
	// Plugin addons can be disabled, and the base plugin still functions normally without their intended benefits.
	addons: {
		enchanter: {
			enabled: false,
			percentage: 0
		},
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
		}
	}
};
var enchanter = settings.addons.enchanter;
var wardrobe = settings.addons.wardrobe;

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
  // Item Bonuses:
  //	1 - Adds +damage
  //	2 - Adds +attack speed
  //	4 - Adds +movement speed
  //	8 - Adds +evasion
  //	16 - Adds +stats
  //	32 - Adds +armor
  //	64 - Adds +health
  //	128 - Adds +mana
  //	256 - Adds +manaregen
  //	512 - Adds +hpregen
  //	1024 - Adds +lifesteal
  //
  //	1024 - Adds +spell resistance
  //	2048 - Adds Magic Immunity
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
  // [0            1,           2,     3,         4,             5,            6]
  // ["Classname", weight(0-∞), price, gamePhase, attributeMask, itemBonus, hasActive(bool)], // Weapon Name (price)
  //
  ["item_aegis",                   5,    0, 0, -1, -1, 0], // Aegis of the Immortal (0g)
  ["item_cheese",                  5,    0, 0, -1, -1, 0], // Cheese (0g)
  //
  ["item_orb_of_venom",          300,  275, 1, 0, 0, 0], // Orb of Venom (275g)
  ["item_null_talisman",         291,  470, 1, 4, 0, 0], // Null Talisman (470g)
  ["item_wraith_band",           291,  485, 1, 2, 0, 0], // Wraith Band (485g)
  ["item_magic_wand",            290,  509, 1, 7, 0, 0], // Magic Wand (509g)
  ["item_bracer",                289,  525, 1, 1, 0, 0], // Bracer (525g)
  ["item_poor_mans_shield",      288,  550, 1, 3, 0, 0], // Poor Man's Shield (550g)
  ["item_headdress",             286,  603, 1, 4, 0, 0], // Headdress (603g)
  ["item_soul_ring",             278,  800, 1, 4, 1, 1], // Soul Ring (800g)
  ["item_buckler",               278,  803, 1, 4, 0, 1], // Buckler (803g)
  ["item_urn_of_shadows",        275,  875, 1, 1, 7, 1], // Urn of Shadows (875g)
  ["item_void_stone",            275,  875, 1, 0, 1, 0], // Void Stone (875g)
  ["item_ring_of_health",        275,  875, 1, 0, 4, 0], // Ring of Health (875g)
  ["item_helm_of_iron_will",     272,  950, 1, 0, 4, 0], // Helm of Iron Will (950g)
  ["item_tranquil_boots",        271,  975, 1, 0, 0, 1], // Tranquil Boots (975g)
  ["item_ring_of_aquila",        271,  985, 1, 0, 1, 0], // Ring of Aquila (985g)
  ["item_ogre_axe",              270, 1000, 1, 1, 4, 0], // Ogre Axe (1,000g)
  ["item_blade_of_alacrity",     270, 1000, 1, 2, 2, 0], // Blade of Alacrity (1,000g)
  ["item_staff_of_wizardry",     270, 1000, 1, 4, 1, 0], // Staff of Wizardry (1,000g)
  ["item_energy_booster",        270, 1000, 1, 4, 1, 0], // Energy Booster (1,000g)
  ["item_medallion_of_courage",  267, 1075, 1, 0, 2, 1], // Medallion of Courage (1,075g)
  ["item_vitality_booster",      266, 1100, 1, 7, 4, 0], // Vitality Booster (1,100g)
  ["item_point_booster",         262, 1200, 1, 7, 1, 0], // Point Booster (1,200g)
  ["item_broadsword",            262, 1200, 1, 0, 2, 0], // Broadsword (1,200g)
  ["item_phase_boots",           256, 1350, 1, 0, 2, 1], // Phase Boots (1,350g)
  ["item_platemail",             254, 1400, 1, 0, 4, 0], // Platemail (1,400g)
  ["item_claymore",              254, 1400, 1, 0, 2, 0], // Claymore (1,400g)
  ["item_power_treads",          254, 1400, 1, 7, 6, 0], // Power Treads (1,400g)
  ["item_arcane_boots",          252, 1450, 1, 4, 1, 1], // Arcane Boots (1,450g)
  ["item_javelin",               250, 1500, 1, 0, 2, 0], // Javelin (1,500g)
  ["item_ghost",                 246, 1600, 1, 0, 1, 1], // Ghost Scepter (1,600g)
  ["item_shadow_amulet",         246, 1600, 1, 0, 0, 1], // Shadow Amulet (1,600g)
  ["item_mithril_hammer",        246, 1600, 1, 0, 2, 0], // Mithril Hammer (1,600g)
  ["item_oblivion_staff",        243, 1675, 1, 0, 1, 0], // Oblivion Staff (1,675g)
  ["item_pers",                  240, 1750, 1, 0, 1, 0], // Perseverance (1,750g)
  ["item_ancient_janggo",        239, 1775, 1, 7, 0, 1], // Drums of Endurance (1,775g)
  ["item_talisman_of_evasion",   119, 1800, 2, 0, 4, 0], // Talisman of Evasion (1,800g)
  ["item_helm_of_the_dominator", 118, 1850, 2, 3, 2, 1], // Helm of the Dominator (1,850g)
  ["item_hand_of_midas",         234, 1900, 1, 0, 2, 1], // Hand of Midas (1,900g)
  ["item_mask_of_madness",       117, 1900, 2, 3, 2, 1], // Mask of Madness (1,900g)
  ["item_vladmir",               114, 2050, 2, 3, 1, 0], // Vladmir's Offering (2,050g)
  ["item_yasha",                 114, 2050, 2, 2, 2, 0], // Yasha (2,050g)
  ["item_sange",                 114, 2050, 2, 1, 2, 0], // Sange (2,050g)
  ["item_ultimate_orb",          113, 2100, 2, 7, 3, 0], // Ultimate Orb (2,100g)
  ["item_hyperstone",            113, 2100, 2, 3, 2, 0], // Hyperstone (2,100g)
  ["item_hood_of_defiance",      113, 2125, 2, 0, 1, 0], // Hood of Defiance (2,125g)
  ["item_blink",                 224, 2150, 1, 0, 7, 1], // Blink Dagger (2,150g)
  ["item_lesser_crit",           112, 2150, 2, 2, 2, 0], // Crystalys (2,150g)
  ["item_blade_mail",            111, 2200, 2, 1, 4, 1], // Blade Mail (2,200g)
  ["item_vanguard",              111, 2225, 2, 0, 4, 0], // Vanguard (2,225g)
  ["item_force_staff",           220, 2250, 1, 4, 7, 1], // Force Staff (2,250g)
  ["item_mekansm",               109, 2306, 2, 4, 1, 1], // Mekansm (2,306g)
  ["item_demon_edge",            107, 2400, 2, 3, 2, 0], // Demon Edge (2,400g)
  ["item_travel_boots",           71, 2450, 3, 0, 7, 1], // Boots of Travel (2,450g)
  ["item_armlet",                103, 2600, 2, 1, 2, 1], // Armlet of Mordiggan (2,600g)
  ["item_veil_of_discord",       102, 2650, 2, 0, 1, 1], // Veil of Discord (2,650g)
  ["item_mystic_staff",          101, 2700, 2, 4, 1, 0], // Mystic Staff (2,700g)
  ["item_necronomicon",          101, 2700, 2, 5, 1, 1], // Necronomicon 1 (2,700g)
  ["item_maelstrom",             101, 2700, 2, 3, 2, 0], // Maelstrom (2,700g)
  ["item_cyclone",               101, 2700, 2, 4, 1, 1], // Eul's Scepter of Divinity (2,700g)
  ["item_dagon",                 100, 2730, 2, 5, 1, 1], // Dagon 1 (2,730g)
  ["item_basher",                 96, 2950, 2, 1, 2, 0], // Skull Basher (2,950g)
  ["item_invis_sword",            95, 3000, 2, 7, 2, 1], // Shadow Blade (3,000g)
  ["item_rod_of_atos",            62, 3100, 3, 4, 1, 1], // Rod of Atos (3,100g)
  ["item_reaver",                 61, 3200, 3, 1, 4, 0], // Reaver (3,200g)
  ["item_soul_booster",           59, 3300, 3, 7, 1, 0], // Soul Booster (3,300g)
  ["item_eagle",                  59, 3300, 3, 2, 2, 0], // Eaglesong (3,300g)
  ["item_diffusal_blade",         59, 3300, 3, 3, 2, 1], // Diffusal Blade (3,300g)
  ["item_pipe",                   55, 3628, 3, 5, 1, 1], // Pipe of Insight (3,628g)
  ["item_relic",                  53, 3800, 3, 7, 2, 0], // Sacred Relic (3,800g)
  ["item_heavens_halberd",        52, 3850, 3, 1, 2, 1], // Heaven's Halberd (3,850g)
  ["item_black_king_bar",         51, 3900, 3, 7, 4, 1], // Black King Bar (3,900g)
  ["item_necronomicon_2",         51, 3950, 3, 0, 1, 1], // Necronomicon 2 (3,950g)
  ["item_dagon_2",                50, 3980, 3, 0, 1, 1], // Dagon 2 (3,980g)
  ["item_desolator",              49, 4100, 3, 3, 2, 0], // Desolator (4,100g)
  ["item_sange_and_yasha",        49, 4100, 3, 3, 2, 0], // Sange & Yasha (4,100g)
  ["item_orchid",                 48, 4125, 3, 4, 1, 1], // Orchid Malevolence (4,125g)
  ["item_diffusal_blade_2",       48, 4150, 3, 0, 2, 1], // Diffusal Blade 2 (4,150g)
  ["item_ultimate_scepter",       47, 4200, 3, 7, 7, 0], // Aghanim's Scepter (4,200g)
  ["item_bfury",                  45, 4350, 3, 3, 2, 0], // Battle Fury (4,350g)
  ["item_shivas_guard",           41, 4700, 3, 4, 4, 1], // Shiva's Guard (4,700g)
  ["item_ethereal_blade",         38, 4900, 3, 6, 6, 1], // Ethereal Blade (4,900g)
  ["item_bloodstone",             36, 5050, 3, 4, 5, 1], // Bloodstone (5,050g)
  ["item_manta",                  36, 5050, 3, 2, 2, 1], // Manta Style (5,050g)
  ["item_radiance",               35, 5150, 3, 7, 2, 0], // Radiance (5,150g)
  ["item_sphere",                 34, 5175, 3, 7, 5, 0], // Linken's Sphere (5,175g)
  ["item_necronomicon_3",         34, 5200, 3, 0, 1, 1], // Necronomicon 3 (5,200g)
  ["item_dagon_3",                34, 5230, 3, 0, 1, 1], // Dagon 3 (5,230g)
  ["item_refresher",              34, 5300, 3, 5, 1, 1], // Refresher Orb (5,300g)
  ["item_assault",                32, 5350, 3, 3, 4, 0], // Assault Cuirass (5,350g)
  ["item_mjollnir",               31, 5400, 3, 3, 2, 1], // Mjollnir (5,400g)
  ["item_monkey_king_bar",        31, 5400, 3, 3, 2, 0], // Monkey King Bar (5,400g)
  ["item_heart",                  30, 5500, 3, 7, 4, 0], // Heart of Terrasque (5,500g)
  ["item_greater_crit",           29, 5550, 3, 3, 2, 0], // Daedalus (5,550g)
  ["item_skadi",                  28, 5675, 3, 7, 3, 0], // Eye of Skadi (5,675g)
  ["item_sheepstick",             28, 5675, 3, 4, 1, 1], // Scythe of Vyse (5,675g)
  ["item_butterfly",              23, 6000, 3, 2, 2, 0], // Butterfly (6,000g)
  ["item_satanic",                21, 6150, 3, 3, 2, 1], // Satanic (6,150g)
  ["item_rapier",                 21, 6200, 3, 0, 2, 0], // Divine Rapier (6,200g)
  ["item_dagon_4",                17, 6480, 3, 0, 1, 1], // Dagon 4 (6,480g)
  ["item_abyssal_blade",          13, 6750, 3, 1, 2, 1], // Abyssal Blade (6,750g)
  ["item_dagon_5",                10, 7730, 3, 0, 1, 1], // Dagon 5 (7,730g)
];
// ==========================================
// Player Properties & Item Dispenser
// ==========================================
timers.setInterval(function() {
	if (!settings.mapLoaded) return;

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
				nextDropFavored: false,
				itemTimeouts: {},
				activeModifiers: []
			};
		}
	}

	if (gameState < dota.STATE_PRE_GAME || gameState > dota.STATE_GAME_IN_PROGRESS)
		return;

	// ==========================================
	// Dispenser: Manages item drops
	// ==========================================
	var gameTime, increment, time, shakeTime;
	if (!settings.pluginLoaded && gameState === dota.STATE_GAME_IN_PROGRESS) {

		// Load the plugin
		settings.pluginLoaded = true;

		// Randomly select our initial drop time
		var selected = settings.leadTime[util.getRandomNumber(settings.leadTime.length)];
		if (DEBUG) server.print("First drop: " + selected);

		// Convert the time into seconds
		var converted = util.convertMinutesToSeconds(selected);
		if (DEBUG) server.print("First drop converted: " + converted);

		// To communicate with the game timer when the next drop will be exactly
		settings.gameTime = game.rules.props.m_fGameTime + converted;
		if (DEBUG) server.print("First drop game time: " + settings.gameTime);

		// Tell the players when the next drop is
		var firstDrop = util.convertSecondsToMinutes( Math.floor( settings.gameTime ) );
		printToAll(settings.dropNotifications.lead, [firstDrop]);

		// Re-build our item table if it does not exist
		if (settings.itemTable.instance === null) {
			buildItemTable();
		}

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

		settings.gameTime += increment;

		if (settings.dropNotifications.enabled) {
			var step1 = Math.floor(settings.gameTime);
			shakeTime = util.convertSecondsToMinutes(step1 + util.getRandomNumber( util.flipNumber( settings.shakeTime ) ) );
			printToAll(settings.dropNotifications.subsequent, [shakeTime]);
		}

		for (var key in playerProps) {
			var obj = playerProps[key];
			if ( settings.playersBarredFromDrops.indexOf(obj.ID) > -1)
				continue;

			settings.playerList.push(obj.ID);
		}

		generateLoot();

		if (settings.currentWave >= settings.waveLimit && settings.waveLimit > -1) {
			settings.pluginHalted = true;
			printToAll("End", []);
		}
	}
}, 100);

// ==========================================
// Player Inventory Queue
// ==========================================
function resetQueueReminder() { settings.queue.reminded = false; }
timers.setInterval(function() {
	if (settings.pluginLoaded) {
		var playerIDs = getConnectedPlayerIDs();
		if (playerIDs.length === 0)
			return;

		for (var i = 0; i < playerIDs.length; ++i)
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
				var equipment = getHeroEquipmentNames(hero);
				playerProps[playerID].snapHeroEquip = equipment;

				var queueLength = playerProps[playerID].queue.length;
				if (queueLength > 0) {
					if (isInventoryAvailable(hero) || isStashAvailable(hero)) {
						giveItemToPlayer(playerProps[playerID].queue[0], playerID);
						playerProps[playerID].queue.shift();
					}
					if (queueLength >= settings.queue.remindNItems && !settings.queue.reminded) {
						printToPlayer(playerID, settings.queue.notice.reminder, [queueLength]);
						timers.setTimeout(resetQueueReminder, (settings.queue.reminderTimeout * 1000));
						settings.queue.reminded = true;
					}
				}
			}
		}
	}
}, settings.queue.checkXSeconds * 1000);

// ==========================================
// Begin Plugin Functions
// ==========================================
function generateLoot() {
	for (var i = 0; i < settings.playerList.length; ++i)
	{
		var playerID = settings.playerList[i];

		if (playerProps[playerID]) {
			var snappedLastEquipment = playerProps[playerID].snapHeroEquip;
			var itemEntry = getUniqueItemName(playerID, snappedLastEquipment);

			// Check if the client is present in the game.
			// If not, his item goes into the queue.
			var client = dota.findClientByPlayerID(playerID);
			if (client === null)
				giveItemToPlayer(itemEntry, playerID, true);
			else
				giveItemToPlayer(itemEntry, playerID, false);

			// Here we perform our sucky items re-loot chance
			if (settings.reLootTable.indexOf(itemEntry[0]) > -1 && util.getRandomNumber(100) < settings.reLootPercentage) {
				itemEntry = getUniqueItemName(playerID, snappedLastEquipment);
				// Disable sound effects
				settings.soundEffects.enabled = false;
				giveItemToPlayer(itemEntry, playerID, false);
				// Re-enable them
				settings.soundEffects.enabled = true;
			}
		}
	}
	settings.playerList.length = 0;
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

	var itemNamesGiven = getPlayerProp(playerID, "itemNamesGiven");

	var boots = [
		"item_boots",
		"item_travel_boots",
		"item_tranquil_boots",
		"item_arcane_boots",
		"item_power_treads",
		"item_phase_boots"
	];

	var hasBoots = checkForBoots(heroInventory, boots);

	var itemName, itemEntry;
	var rolls = 0;
	do
	{
		rolls += 1;
		// Fail-safe so we don't continue rolling infinitely if we can't find an item.
		if ( rolls < settings.maxTries ) {
			itemEntry = getRandomLoot(playerID, false);
			itemName = itemEntry[0];
		}
		else {
			itemEntry = getRandomLoot(playerID, true);
			itemName = itemEntry[0];
			break;
		}
		if ( settings.doNotConsiderDupes.indexOf(itemName) > -1 )
			break;
	}
	while ( heroInventory.indexOf(itemName) > -1 || itemNamesGiven.indexOf(itemName) > -1 || (hasBoots && boots.indexOf(itemName) > -1) );

	if (settings.doNotConsiderDupes.indexOf(itemName) == -1)
	{
		if (itemNamesGiven.indexOf(itemName) == -1)
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

			if ( !settings.itemTable.countLimitPerTeam[itemName] )
				settings.itemTable.countLimitPerTeam[itemName] = 0;

			settings.itemTable.countLimitPerTeam[itemName] += 1;

			if ( settings.itemTable.limitPerTeam[itemName] && settings.itemTable.countLimitPerTeam[itemName] === settings.itemTable.limitPerTeam[itemName]) {
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
			else if (settings.itemTable.countLimitPerTeam[itemName] === settings.itemTable.maxEachLimit) {
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

			if ( settings.itemTable.componentExclude.items[itemName] ) {
				var entries = settings.itemTable.componentExclude.items[itemName];
				for (var i = 0; i < entries.length; ++i) {
					itemNamesGiven.push(entries[i]);
				}
			}
		}
	}

	return itemEntry;
}

function giveItemToPlayer(itemEntry, playerID, addToQueue) {

	addToQueue = typeof addToQueue !== 'undefined' ? addToQueue : false;

	if (addToQueue) {
		addItemToQueue(itemEntry, playerID);
		return;
	}

	var client = dota.findClientByPlayerID(playerID);
	if (client === null) {
		addItemToQueue(itemEntry, playerID);
		return;
	}

	var hero = client.netprops.m_hAssignedHero;
	if (hero === null) {
		addItemToQueue(itemEntry, playerID);
		return;
	}
	if (!hero.isHero()) return;

	var spaceInStash = isStashAvailable(hero);
	var spaceInInventory = isInventoryAvailable(hero);

	if (hero.netprops.m_lifeState === UNIT_LIFE_STATE_ALIVE) {
		if (spaceInInventory || spaceInStash)
		{
			if (spaceInInventory)
			{
				for (var v = HERO_INVENTORY_BEGIN; v <= HERO_INVENTORY_END; ++v)
				{
					var isItemInThisSpace = hero.netprops.m_hItems[v];
					if (isItemInThisSpace === null)
					{
						dota.giveItemToHero(itemEntry[0], hero);
						var m_hItem = hero.netprops.m_hItems[v];
						if (m_hItem === null)
							return false;

						// Enchant our loot?
						if (enchanter.enabled) {
							// enchantLoot(m_hItem, itemEntry, playerID)
						}

						// Alter item properties
						changeItemProperties(m_hItem);

						var index = m_hItem.index;
						playerProps[playerID].itemEntities.push(index);
						return true;
					}
				}
			}
			else if (spaceInStash) // && settings.doNotPutInStash.indexOf(itemEntry[0]) === -1
			{
				for (var v = HERO_STASH_BEGIN; v <= HERO_STASH_END; ++v)
				{
					var isItemInThisSpace = hero.netprops.m_hItems[v];
					if (isItemInThisSpace === null)
					{
						dota.giveItemToHero(itemEntry[0], hero);
						var m_hItem = hero.netprops.m_hItems[v];
						if (m_hItem === null)
							return false;

						// Enchant our loot?
						if (enchanter.enabled) {
							// enchantLoot(m_hItem, itemEntry, playerID)
						}

						// Alter item properties
						changeItemProperties(m_hItem);


						var index = m_hItem.index;
						playerProps[playerID].itemEntities.push(index);
						return true;
					}
				}
			}
			else {
				addItemToQueue(itemEntry, playerID);
				return false;
			}
		}
		else {
			addItemToQueue(itemEntry, playerID);
			return false;
		}
	}
	else {
		addItemToQueue(itemEntry, playerID);
		return false;
	}
}

function changeItemProperties(entity) {

	if (settings.soundEffects.enabled && !entity.enchanted) {
		var sound = settings.soundEffects.list[util.getRandomNumber(settings.soundEffects.list.length)];
		var client = dota.findClientByPlayerID(entity.netprops.m_hOwnerEntity.netprops.m_iPlayerID);
		if (client !== null)
			dota.sendAudio(client, false, sound);
	}

	entity.netprops.m_bSellable = false;
	entity.netprops.m_bDisassemblable = false;

	if (entity.getClassname() == "item_aegis" || entity.getClassname() == "item_rapier") {
		entity.netprops.m_bDroppable = true;
	}

	entity.netprops.m_iSharability = 0;
	entity.netprops.m_bKillable = false;


	return true;
}

function addItemToQueue(itemName, playerID) {
	var q = getPlayerProp(playerID, "queue");
	q.push(itemName);
	setPlayerProp(playerID, "queue", q);
}

function getRandomLoot(playerID, pullFromMaxLoot) {

	var loot;

	loot = settings.itemTable.instance;

	if (settings.itemTable.useWeights && wardrobe.enabled) {
		if (playerProps[playerID].lootTable !== null)
			loot = playerProps[playerID].lootTable;
	}

	if (!loot) loot = baseItemTable;

	if (pullFromMaxLoot) {
		var item = settings.maxTriesLoot[util.getRandomNumber(settings.maxTriesLoot.length)];
		for (i = 0; i < loot.length; i++) {
			if (loot[i][0] == item)
				return loot[i];
	    }
	}
	if (playerProps[playerID].nextDropFavored) {
		if (util.getRandomNumber(100) < settings.itemDropFavorPercent) {
			var chanceLoot = [];
			for (var i = 0; i < loot.length; ++i) {
				if (loot[i][2] > 2000)
					chanceLoot.push(loot[i]);
			}
			loot = chanceLoot;
		}
	}
	if (settings.itemTable.useWeights) {
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
		return loot[util.getRandomNumber(loot.length)];
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

function getHeroEquipmentNames(hero) {
	if (!hero || hero === null || typeof hero === "undefined")
		return;

	var heroItemsEquipped = [], currentSlot, className;
	for (var k = HERO_INVENTORY_BEGIN; k <= HERO_STASH_END; k++)
	{
		currentSlot = hero.netprops.m_hItems[k];
		if (currentSlot === null)
			continue;

		className = currentSlot.getClassname();
		heroItemsEquipped.push(className);
	}
	return heroItemsEquipped;
}

function getHeroEquipmentEntities(hero) {
	if (!hero || hero === null || typeof hero === "undefined")
		return;

	var heroItemsEquipped = [], currentSlot, className;
	for (var k = HERO_INVENTORY_BEGIN; k <= HERO_INVENTORY_END; k++)
	{
		currentSlot = hero.netprops.m_hItems[k];
		if (currentSlot === null)
			continue;

		className = currentSlot;
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
	settings.mapLoaded = true;

	playerManager = game.findEntityByClassname(-1, "dota_player_manager");
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

// ==========================================
// Lobby Setup
// ==========================================
var lobbyManager;
plugin.get('LobbyManager', function(obj){
	lobbyManager = obj;
	var optionTime = lobbyManager.getOptionsForPlugin("WeaponMayhem")["Speed"];
	if (optionTime) {
		settings.nextBase.length = 0;
		settings.leadTime.length = 0;
		settings.leadTime = [optionTime];
		settings.nextBase = [optionTime];

		var s = util.convertMinutesToSeconds(optionTime);

		if (s < settings.soundEffects.timeThreshold)
			settings.soundEffects.enabled = false;

		if (s < settings.dropNotifications.timeThreshold)
			settings.dropNotifications.enabled = false;
	}

	var optionWeight = lobbyManager.getOptionsForPlugin("WeaponMayhem")["Weights"];
	switch(optionWeight)
	{
		default:
		case "Weighted": break;
		case "Non-weighted":
			settings.itemTable.useWeights = false;
		break;
	}

	var optionAmount = lobbyManager.getOptionsForPlugin("WeaponMayhem")["Amount"];
	switch(optionAmount)
	{
		case "1 Wave":
			settings.waveLimit = 1;
			break;
		case "2 Waves":
			settings.waveLimit = 2;
			break;
		case "3 Waves":
			settings.waveLimit = 3;
			break;
		case "4 Waves":
			settings.waveLimit = 4;
			break;
		case "5 Waves":
			settings.waveLimit = 5;
			break;
		case "6 Waves":
			settings.waveLimit = 6;
			break;
		case "7 Waves":
			settings.waveLimit = 7;
			break;
		case "8 Waves":
			settings.waveLimit = 8;
			break;
		case "9 Waves":
			settings.waveLimit = 9;
			break;
		case "10 Waves":
			settings.waveLimit = 10;
			break;
		case "15 Waves":
			settings.waveLimit = 15;
			break;
		case "20 Waves":
			settings.waveLimit = 20;
			break;
			default:
		case "∞ Waves":
			settings.waveLimit = -1;
			break;
	}

	var optionSelection = lobbyManager.getOptionsForPlugin("WeaponMayhem")["Selection"];
	buildItemTable(optionSelection);
});

function buildItemTable(option) {
	switch(option)
	{
		default:
		case "> 1,000g": break;
		case "> 275g":
			settings.itemTable.priceRangeMin = 275;
			break;
		case "> 1,500g":
			settings.itemTable.priceRangeMin = 1500;
			break;
		case "> 2,000g":
			settings.itemTable.priceRangeMin = 2000;
			break;
		case "> 2,500g":
			settings.itemTable.priceRangeMin = 2500;
			break;
		case "Early Game":
			settings.itemTable.customMode = 6;
			break;
		case "Aegis & Rapier":
			settings.itemTable.customMode = 2;
			break;
		case "Caster & Support Only":
			settings.itemTable.customMode = 3;
			break;
		case "Weapons Only":
			settings.itemTable.customMode = 4;
			break;
		case "Armor & Defensive Only":
			settings.itemTable.customMode = 5;
			break;
	}

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
	switch(settings.itemTable.customMode)
	{
		default:
		case 1:
			for (i = 0; i < tmp.length; ++i) {
				if ( tmp[i][2] > settings.itemTable.priceRangeMin && tmp[i][2] < settings.itemTable.priceRangeMax ) {
					mainItemTable.push(tmp[i]);
				}
			}
			break;
		case 2: // Aegis & Rapier
			for (i = 0; i < tmp.length; ++i) {
				var itemList = ["item_rapier", "item_aegis"];
				if ( itemList.indexOf(tmp[i][0]) > -1 ) {
					if (settings.itemTable.useWeights) {
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
				if ( util.containsFlag(tmp[i][5], 1) && tmp[i][5] !== 0 ) {
					mainItemTable.push(tmp[i]);
				}
			}
			break;
		case 4: // Damage items only
			for (i = 0; i < tmp.length; ++i) {
				if ( util.containsFlag(tmp[i][5], 2) && tmp[i][5] !== 0 ) {
					mainItemTable.push(tmp[i]);
				}
			}
			break;
		case 5: // Armor/Defensive items only
			for (i = 0; i < tmp.length; ++i) {
				if ( util.containsFlag(tmp[i][5], 4) && tmp[i][5] !== 0 ) {
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
	settings.itemTable.instance = mainItemTable;

	// Setup our enchantment percentage
	if (enchanter.enabled) {
		var time = util.convertMinutesToSeconds( settings.nextBase[ util.getRandomNumber( settings.nextBase.length ) ] );
		enchanter.percentage = (40 + (time / 13) );
	}
}

// ==========================================
// Addon: Wardrobe
// ==========================================
function tailorHeroes() {
	var baseTable = settings.itemTable.instance;
	var tmpTable = baseTable.clone();
	var i, j, k;
	for (i = 0; i < settings.playerList.length; i++)
	{
		var playerID = settings.playerList[i];

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
// Client Commands
// ==========================================
//
console.addClientCommand("queue", queueFunctions);
function queueFunctions(client, args) {
	var playerID = client.netprops.m_iPlayerID;
	if (playerProps[playerID])
	{
		if (playerProps[playerID].queue.length === 0) {
			printToPlayer(playerID, "There are no items in the queue", []);
			return;
		}
		else
			var queueLength = playerProps[playerID].queue.length;

		if (args.length === 0)
			printToPlayer(playerID, "There are %s items in the queue", [playerProps[playerID].queue.length]);

		if (args.length > 1)
			return;

		else {
			switch(args[0])
			{
				default: break;
				case "clear":
					playerProps[playerID].queue.length = 0;
					printToPlayer(playerID, "Cleared! There were %s items in the queue", [queueLength]);
					break;
			}
		}
	}

}

// ==========================================
// Developer Mode
// ==========================================
//
if (g_plugin.developer) {
	settings.leadTime.length = 0;
	settings.nextBase.length = 0;
	settings.leadTime = ['0:00'];
	settings.nextBase = ['0:00'];
	var nextBase = util.convertMinutesToSeconds(settings.nextBase[0]);

	if (nextBase <= 120)
		settings.dropNotifications.enabled = false;

	// To compensate for 0:00
	settings.shakeTime = 1;

	// Set queue handler to abnormal
	settings.queue.checkXSeconds = 0.1;

	// setupItemTable("Caster/Support items only");
	// settings.itemTable.customMode = 5;
	buildItemTable();

	// Initialize infinite waves
	settings.waveLimit = -1;

	console.addClientCommand("load", liFill);
	function liFill(client, args) {

		hero = client.netprops.m_hAssignedHero;
		playerID = client.netprops.m_iPlayerID;

		var count = 0;
		do
		{
			count += 1
			for (var i = HERO_INVENTORY_BEGIN; i <= HERO_STASH_END; ++i) {
				if (hero !== null) {
					heroItemsEquipped = getHeroEquipmentNames(hero);
				}
				else {
					heroItemsEquipped = [];
				}
				itemName = getUniqueItemName(playerID, heroItemsEquipped);
				giveItemToPlayer(itemName, playerID);
			}
			if (count >= 20)
				break;
		}
		while( isInventoryAvailable(hero) || isStashAvailable(hero) );
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
