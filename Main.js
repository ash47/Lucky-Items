// ==========================================
// Plugin Information - READ ONLY
// ==========================================
var g_plugin = {
	name: "Lucky Items",
	prefix: "[LI]",
	author: "koone",
	description: "Gives players weighted random items.",
	version: "1.4.1",
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
	license: "http://www.gnu.org/licenses/gpl.html",
	developer: false // Developer Mode (useful for plugin strength testing)
};

var DEBUG = false; // server.print()'s everywhere

// ==========================================
// General Setup
// ==========================================

// Constants
var HERO_INVENTORY_BEGIN = 0;
var HERO_INVENTORY_END = 5; // END at [0, 1, 2, 3,  4,  5] - 6 SLOTS
var HERO_STASH_BEGIN = 6; // BEGIN at [6, 7, 8, 9, 10, 11] - 6 SLOTS
var HERO_STASH_END = 11;
var UNIT_LIFE_STATE_ALIVE = 0;
var TEAM_RADIANT = dota.TEAM_RADIANT;
var TEAM_DIRE = dota.TEAM_DIRE;

// Variables
var playerProps = new Array(dota.MAX_PLAYERS);

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
	doNotPutInStash: ["item_aegis"],
	// This is the inventory queue to manage items when a player cannot be given more items.
	// An integral part of the plugin, and cannot be disabled.
	queue: {
		interval: 0.8,						// Every X seconds: check our inventory queue, and take a hero snapshot
		remindNItems: 2,					// Reminder trigger on the amount of items in a player's queue
		reminderTimeout: 60,				// Every X seconds, remind our player they have items in their queue
		reminderNotice: "%s in queue."		// Message to display
	},
	// Plugin sound effects that occur when an item is randomed to a player or other trigger events.
	sounds: {
		enabled: true,			// Enabled / disabled
		timeThreshold: 45,		// Below this time (in seconds) threshold, disable them
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
			percentage: 30,
			storeVoid: [],
			onHitEnchantEntity: null,
			constantEnchantEntity: null
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

var timers = require('timers');					// Built-In Timers Library
var sprintf = require('sprintf.js').vsprintf;	// Sprintf Library for dynamic strings
var util = require('util.js');					// Load Utility Library
var enchants = require('enchantments.js');		// Load the item enchantments
var locale = require('locale.js');				// Load locale
var unit = require('hero.js');					// Load exports related to hero handling

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
  ["item_vladmir",               114, 2050, 2, 3, 2, 0], // Vladmir's Offering (2,050g)
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
  ["item_rod_of_atos",            42, 3100, 3, 4, 1, 1], // Rod of Atos (3,100g)
  ["item_reaver",                 41, 3200, 3, 1, 4, 0], // Reaver (3,200g)
  ["item_soul_booster",           39, 3300, 3, 7, 1, 0], // Soul Booster (3,300g)
  ["item_eagle",                  39, 3300, 3, 2, 2, 0], // Eaglesong (3,300g)
  ["item_diffusal_blade",         39, 3300, 3, 3, 2, 1], // Diffusal Blade (3,300g)
  ["item_pipe",                   35, 3628, 3, 5, 1, 1], // Pipe of Insight (3,628g)
  ["item_relic",                  33, 3800, 3, 7, 2, 0], // Sacred Relic (3,800g)
  ["item_heavens_halberd",        32, 3850, 3, 1, 2, 1], // Heaven's Halberd (3,850g)
  ["item_black_king_bar",         31, 3900, 3, 7, 4, 1], // Black King Bar (3,900g)
  ["item_necronomicon_2",         31, 3950, 3, 0, 1, 1], // Necronomicon 2 (3,950g)
  ["item_dagon_2",                25, 3980, 3, 0, 1, 1], // Dagon 2 (3,980g)
  ["item_desolator",              24, 4100, 3, 3, 2, 0], // Desolator (4,100g)
  ["item_sange_and_yasha",        24, 4100, 3, 3, 2, 0], // Sange & Yasha (4,100g)
  ["item_orchid",                 23, 4125, 3, 4, 1, 1], // Orchid Malevolence (4,125g)
  ["item_diffusal_blade_2",       23, 4150, 3, 0, 2, 1], // Diffusal Blade 2 (4,150g)
  ["item_ultimate_scepter",       22, 4200, 3, 7, 7, 0], // Aghanim's Scepter (4,200g)
  ["item_bfury",                  20, 4350, 3, 3, 2, 0], // Battle Fury (4,350g)
  ["item_shivas_guard",           38, 4700, 3, 4, 4, 1], // Shiva's Guard (4,700g)
  ["item_ethereal_blade",         33, 4900, 3, 6, 6, 1], // Ethereal Blade (4,900g)
  ["item_bloodstone",             31, 5050, 3, 4, 5, 1], // Bloodstone (5,050g)
  ["item_manta",                  31, 5050, 3, 2, 2, 1], // Manta Style (5,050g)
  ["item_radiance",               30, 5150, 3, 7, 2, 0], // Radiance (5,150g)
  ["item_sphere",                 29, 5175, 3, 7, 5, 0], // Linken's Sphere (5,175g)
  ["item_necronomicon_3",         29, 5200, 3, 0, 1, 1], // Necronomicon 3 (5,200g)
  ["item_dagon_3",                26, 5230, 3, 0, 1, 1], // Dagon 3 (5,230g)
  ["item_refresher",              25, 5300, 3, 5, 1, 1], // Refresher Orb (5,300g)
  ["item_assault",                23, 5350, 3, 3, 4, 0], // Assault Cuirass (5,350g)
  ["item_mjollnir",               22, 5400, 3, 3, 2, 1], // Mjollnir (5,400g)
  ["item_monkey_king_bar",        22, 5400, 3, 3, 2, 0], // Monkey King Bar (5,400g)
  ["item_heart",                  20, 5500, 3, 7, 4, 0], // Heart of Terrasque (5,500g)
  ["item_greater_crit",           20, 5550, 3, 3, 2, 0], // Daedalus (5,550g)
  ["item_skadi",                  18, 5675, 3, 7, 3, 0], // Eye of Skadi (5,675g)
  ["item_sheepstick",             16, 5675, 3, 4, 1, 1], // Scythe of Vyse (5,675g)
  ["item_butterfly",              14, 6000, 3, 2, 2, 0], // Butterfly (6,000g)
  ["item_satanic",                12, 6150, 3, 3, 2, 1], // Satanic (6,150g)
  ["item_rapier",                 12, 6200, 3, 0, 2, 0], // Divine Rapier (6,200g)
  ["item_dagon_4",                10, 6480, 3, 0, 1, 1], // Dagon 4 (6,480g)
  ["item_abyssal_blade",           8, 6750, 3, 1, 2, 1], // Abyssal Blade (6,750g)
  ["item_dagon_5",                 5, 7730, 3, 0, 1, 1], // Dagon 5 (7,730g)
];
// ==========================================
// Item Dispenser
// ==========================================
timers.setInterval(function() {
	if (!settings.mapLoaded) return;

	var playerIDs = util.getConnectedPlayerIDs();
	if (playerIDs.length === 0)
		return;

	var gameState = game.rules.props.m_nGameState;

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
		settings.nextTime = converted;
		settings.gameTime = game.rules.props.m_fGameTime + converted;
		if (DEBUG) server.print("First drop game time: " + settings.gameTime);

		// Tell the players when the next drop is
		printToAll(settings.dropNotifications.lead + (enchanter.enabled ? ' use -li for enchant commands.' : ''), [selected]);

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

		settings.nextTime += increment;
		settings.gameTime += increment;

		if (settings.dropNotifications.enabled) {
			shakeTime = util.convertSecondsToMinutes(settings.nextTime + util.getRandomNumber( util.flipNumber( settings.shakeTime ) ) );
			printToAll(settings.dropNotifications.subsequent, [shakeTime]);
		}

		for (var key in playerProps) {
			var obj = playerProps[key];
			if ( settings.playersBarredFromDrops.indexOf(obj.ID) > -1)
				continue;

			settings.playerList.push(obj.playerID);
		}

		generateLoot();

		if (settings.currentWave >= settings.waveLimit && settings.waveLimit > -1) {
			settings.pluginHalted = true;
			printToAll("End", []);
		}
	}
}, 100);

// ==========================================
// Player Enchantments
// ==========================================

var enchMapEquipNames = [];
for (var en = 0; en < enchants.enchantMap.constant.length; ++en) {
	var enchant = enchants.enchantMap.constant[en];
	if (enchant.name) {
		enchMapEquipNames.push(enchant.name);
	}
}
timers.setInterval(function() {
	if (settings.pluginLoaded && enchanter.enabled)
	{
		var playerIDs = util.getConnectedPlayerIDs();
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
				// Apply any constant enchantments
				var equipment = unit.pullHeroInventory(hero, 0);

				if (equipment.length === 0)
					continue;

			    // Loop through active equipment
			    for ( var z = 0; z < equipment.length; ++z )
			    {
			    	var item = equipment[z];

			    	if (equipment[z].constant) {
				        // Look at what type of enchants exist
				        for ( var x = 0; x < enchMapEquipNames.length; ++x )
				        {
				        	if ( item.constant[enchMapEquipNames[x]] )
				        	{
				        		var name = enchMapEquipNames[x];

				        		if (DEBUG) server.print(name);

				        		var enchName = item.constant[enchMapEquipNames[x]];

				                // Find our enchantment modifiers
								for (var value in enchName.modifiers)
								{
				                    // Skip 'clone' ??
				                    if (!util.isNumber(value)) continue;

									var modifier = enchName.modifiers[value];

					                dota.addNewModifier(hero, enchanter.constantEnchantEntity[name], modifier.clsname, modifier.ref, modifier.options);
					                // playerProps[playerID].activeModifiers.push(modifier.clsname);
								}
				        	}
				        }
			    	}
			    }
			}
		}
	}
}, 4995);

// ==========================================
// Player Inventory Queue
// ==========================================
timers.setInterval(function() {
	// Has the plugin initialized?
	if (settings.pluginLoaded)
	{
		for (var i = 0; i < playerProps.length; ++i)
		{
			var playerID = playerProps[i].playerID;

			// Has connected client?
			var client = dota.findClientByPlayerID(playerID);
			if (client === null)
				continue;

			// Is controlling a hero?
			var hero = client.netprops.m_hAssignedHero;
			if (hero === null)
				continue;

			if (playerProps[playerID])
			{
				// Take a snapshot of a player's equipment, in-case they disconnect
				var equipment = unit.pullHeroEquipment(hero, 1);
				playerProps[playerID].snapHeroEquip = equipment;

				// Queue has items in it
				if (playerProps[playerID].queue.length > 0)
				{
					// Do we have space in inventory or stash?
					if (unit.isInventoryAvailable(hero) || unit.isBankAvailable(hero))
					{
						// Pop the beginning item in our queue array
						var itemToGive = playerProps[playerID].queue.shift();

						// Give it to our player
						giveItemToPlayer(itemToGive, playerID);
					}
					// Perform a queue reminder
					if (playerProps[playerID].queue.length >= settings.queue.remindNItems && !playerProps[playerID].queueNotified)
					{
						// Tell our player about thier queue
						printToPlayer(playerID, settings.queue.reminderNotice, [playerProps[playerID].queue.length]);

						// Let the plugin know we reminded this player
						playerProps[playerID].queueNotified = true;

						// Perform a timed reset on the reminder state
						resetQueueReminder(playerID);
					}
				}
			}
		}
	}
}, settings.queue.interval * 1000);

function resetQueueReminder(playerID) {
	timers.setTimeout(function() {
		playerProps[playerID].queueNotified = false;
	}, settings.queue.reminderTimeout * 1000);
}
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

			// Here we perform our sub-par items re-loot chance
			if (settings.reLootTable.indexOf(itemEntry[0]) > -1 && util.getRandomNumber(100) < settings.reLootPercentage)
			{
				// Get unique item name
				itemEntry = getUniqueItemName(playerID, snappedLastEquipment);

				// Disable the sounds
				settings.sounds.enabled = false;

				// Give additional item to our player
				giveItemToPlayer(itemEntry, playerID, false);

				// Enable the sounds
				settings.sounds.enabled = true;
			}
		}
	}
	settings.playerList.length = 0;
}

function getUniqueItemName(playerID, heroInventory) {

	var equipmentHandouts = getPlayerProp(playerID, "equipmentHandouts");

	var boots = [
		"item_boots",
		"item_travel_boots",
		"item_tranquil_boots",
		"item_arcane_boots",
		"item_power_treads",
		"item_phase_boots"
	];

	var hasBoots = unit.checkForBoots(heroInventory, boots);

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
	while ( heroInventory.indexOf(itemName) > -1 || equipmentHandouts.indexOf(itemName) > -1 || (hasBoots && boots.indexOf(itemName) > -1) );

	if (settings.doNotConsiderDupes.indexOf(itemName) == -1)
	{
		if (equipmentHandouts.indexOf(itemName) == -1)
		{
			if (playerProps[playerID]) {
				if (!playerProps[playerID].nextDropFavored)
					if (itemEntry[2] < 2050)
						playerProps[playerID].nextDropFavored = true;
				else
					playerProps[playerID].nextDropFavored = false;
			}

			equipmentHandouts.push(itemName);

			setPlayerProp(playerID, "equipmentHandouts", equipmentHandouts);

			if ( !settings.itemTable.countLimitPerTeam[itemName] )
				settings.itemTable.countLimitPerTeam[itemName] = 0;

			settings.itemTable.countLimitPerTeam[itemName] += 1;

			if (settings.itemTable.limitPerTeam[itemName] && settings.itemTable.countLimitPerTeam[itemName] === settings.itemTable.limitPerTeam[itemName]) {
				var teamID = getTeamIDFromPlayerID(playerID);
				if (teamID !== null) {
					var playerIDs = util.getConnectedPlayerIDs(teamID);
					for (var i = 0; i < playerIDs.length; ++i)
					{
						var teamPlayerID = playerIDs[i];
						// Skip the player that landed the item
						if (teamPlayerID === playerID)
							continue;

						if (playerProps[teamPlayerID]) {
							var exclusionList = getPlayerProp(teamPlayerID, "equipmentHandouts");

							if ( exclusionList.indexOf(itemName) > -1 )
								continue;

							exclusionList.push(itemName);
							setPlayerProp(teamPlayerID, "equipmentHandouts", exclusionList);
						}
					}
				}
			}
			if ( settings.itemTable.componentExclude.items[itemName] ) {
				var entries = settings.itemTable.componentExclude.items[itemName];
				for (var i = 0; i < entries.length; ++i) {
					equipmentHandouts.push(entries[i]);
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

	// We can't find their client, queue the item
	var client = dota.findClientByPlayerID(playerID);
	if (client === null) {
		addItemToQueue(itemEntry, playerID);
		return;
	}

	// We can't find their hero, queue the item
	var hero = client.netprops.m_hAssignedHero;
	if (hero === null) {
		addItemToQueue(itemEntry, playerID);
		return;
	}

	// Hero isn't a hero? Return!
	if (!hero.isHero()) return;

	if (unit.getLifeState(hero) === UNIT_LIFE_STATE_ALIVE)
	{
		if (unit.isInventoryAvailable(hero) || unit.isBankAvailable(hero))
		{
			switch(true)
			{
				case unit.isInventoryAvailable(hero):
					var IDX_START = HERO_INVENTORY_BEGIN;
					var IDX_END = HERO_INVENTORY_END;
					break;
				case (unit.isBankAvailable(hero)):
					var IDX_START = HERO_STASH_BEGIN;
					var IDX_END = HERO_STASH_END;
					break;
				default:
					addItemToQueue(itemEntry, playerID);
					return false;
					break;
			}
			for (var i = IDX_START; i <= IDX_END; ++i)
			{
				var entity = hero.netprops.m_hItems[i];
				if (entity === null)
				{
					var classname = itemEntry[0];

					// Give the item to our hero
					dota.giveItemToHero(classname, hero);

					// Pull the item we just gave them in the same slot
					var entity = hero.netprops.m_hItems[i];

					// This happens when a combineable item combines to an item already in the player's inventory to make a new item.
					// This won't trigger if the only slot happens to be free. Otherwise, the game moves it to a different slot upon combining.
					if (entity === null)
						return false;

					// Alter item properties
					changeItemProperties(entity, itemEntry, playerID);
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

function changeItemProperties(entity, entry, playerID) {
	var name = entity.getClassname();
	switch(name)
	{
		case "item_aegis":
			entity.netprops.m_bDroppable = true;
			entity.netprops.m_bKillable = false;
			entity.netprops.m_iSharability = 0;
			if (DEBUG) server.print("NETPROPS MODIFIED: AEGIS");
			return true;
			break;
		default:
			// Possibly enchant our new item
			if (enchanter.enabled)
				enchantLoot(entity, entry, playerID)

			if (settings.sounds.enabled && !entity.enchanted) {
				var sound = settings.sounds.list[util.getRandomNumber(settings.sounds.list.length)];
				var client = dota.findClientByPlayerID(entity.netprops.m_hOwnerEntity.netprops.m_iPlayerID);
				if (client !== null)
					dota.sendAudio(client, false, sound);
			}
			entity.netprops.m_bSellable = false;
			entity.netprops.m_bDisassemblable = false;
			entity.netprops.m_bDroppable = true;
			entity.netprops.m_iSharability = 0;
			entity.netprops.m_bKillable = false;
			// Save the entity
			playerProps[playerID].equipmentEntities.push(entity.index);
			if (DEBUG) server.print("NETPROPS MODIFIED: " + name);
			break;
	}
	return true;
}

function enchantLoot(entity, item, playerID) {
	// Switch item checks and see if this item can be enchanted
	var isEnchantable = false;
	switch(true)
	{
		// Weapons that do/look like damage
		case (item[0] === "item_ogre_axe"):
		case (item[0] === "item_blade_of_alacrity"):
		case (item[0] === "item_broadsword"):
		case (item[0] === "item_claymore"):
		case (item[0] === "item_javelin"):
		case (item[0] === "item_mithril_hammer"):
		case (item[0] === "item_yasha"):
		case (item[0] === "item_sange"):
		case (item[0] === "item_lesser_crit"):
		case (item[0] === "item_demon_edge"):
		case (item[0] === "item_maelstrom"):
		case (item[0] === "item_basher"):
		case (item[0] === "item_invis_sword"):
		case (item[0] === "item_diffusal_blade"):
		case (item[0] === "item_relic"):
		case (item[0] === "item_heavens_halberd"):
		case (item[0] === "item_black_king_bar"):
		case (item[0] === "item_desolator"):
		case (item[0] === "item_sange_and_yasha"):
		case (item[0] === "item_diffusal_blade_2"):
		case (item[0] === "item_bfury"):
		case (item[0] === "item_manta"):
		case (item[0] === "item_mjollnir"):
		case (item[0] === "item_monkey_king_bar"):
		case (item[0] === "item_greater_crit"):
		case (item[0] === "item_skadi"):
		case (item[0] === "item_rapier"):
		case (item[0] === "item_abyssal_blade"):
		case (item[0] === "item_butterfly"):
		case (item[0] === "item_reaver"):
		case (item[0] === "item_radiance"):
		case (item[0] === "item_oblivion_staff"):
		case (item[0] === "item_hand_of_midas"):
			isEnchantable = true;
			var possibleEnchants = enchants.enchantMap.onHit;
			var type = "onHit";
			break;
		// Equipped Items (constant status effects)
		default:
		case (item[0] === "item_assault"):
		case (item[0] === "item_hood_of_defiance"):
		case (item[0] === "item_pipe"):
		case (item[0] === "item_bloodstone"):
		case (item[0] === "item_blade_mail"):
		case (item[0] === "item_shivas_guard"):
		case (item[0] === "item_heart"):
		case (item[0] === "item_sphere"):
		case (item[0] === "item_bloodstone"):
		case (item[0] === "item_soul_booster"):
		case (item[0] === "item_veil_of_discord"):
		case (item[0] === "item_mask_of_madness"):
		case (item[0] === "item_ancient_janggo"):
		case (item[0] === "item_arcane_boots"):
		case (item[0] === "item_tranquil_boots"):
		case (item[0] === "item_power_treads"):
		case (item[0] === "item_phase_boots"):
		case (item[0] === "item_travel_boots"):
			isEnchantable = true;
			var possibleEnchants = enchants.enchantMap.constant;
			var type = "onEquip";
			break;
		// Add entries below to not enchant
		case (item[0] === "item_aegis"):
		case (item[0] === "item_cheese"):
			break;
	}
	if (isEnchantable)
	{
		// Chance of additional item properties is lowered based on the time setting
		var isEnchanted = ( util.getRandomNumber(100) < enchanter.percentage ? true : false );
		if (isEnchanted)
		{
			entity.enchanted = true;

			var client = dota.findClientByPlayerID(playerID);
			if (client !== null)
			{
				var sound = settings.sounds.enchantment[util.getRandomNumber(settings.sounds.enchantment.length)];
				dota.sendAudio(client, false, sound);
			}

			// Shuffle enchant map
			util.shuffle(possibleEnchants);

			// // See how many we have total
			// // var total = possibleEnchants.length;
			var rand = function(min, max) {
			    return Math.random() * (max - min) + min;
			};
			 
			var getRandomItem = function(list, weight) {
			    var total_weight = weight.reduce(function (prev, cur, i, arr) {
			        return prev + cur;
			    });
			     
			    var random_num = rand(0, total_weight);
			    var weight_sum = 0;
			     
			    for (var i = 0; i < list.length; i++) {
			        weight_sum += weight[i];
			        weight_sum = +weight_sum.toFixed(2);
			         
			        if (random_num <= weight_sum) {
			            return list[i];
			        }
			    }
			};
			 
			var list = [1, 2, 3];
			var weight = [0.5, 0.3, 0.2];
			var random_item = getRandomItem(list, weight);

			// Pick some enchantments for our item
			// util.getRandomNumberExcludeZero(2)
			var selected = possibleEnchants.slice( 0, random_item );

			// if (DEBUG) server.print(selected.length);

			if (selected.length > 0)
			{
				var entityName = entity.getClassname();

				// if (DEBUG) server.print("Enchanting Item: " + entityName);

				if ( locale.itemName[entityName] )
					var named = locale.itemName[entityName];
				else
					var named = entityName;

				if (selected.length === 1)
				{
					var enchant = selected[0];

					// if (DEBUG) server.print("Enchant is: " + enchant.name);

					var name = util.capitaliseFirstLetter(enchant.name);
					var level = util.getRandomNumberExcludeZero(4);
					enchant.setup(entity, enchant.name, level);

					// if (DEBUG) server.print("Entity has enchant? " + entity[enchant.name]);

					printToPlayer(playerID, "%s enchanted %s [level %s] %s", [named, name, level, type]);
				}
				else {
					var enchantNames = [];
					var levels = [];
					for (var i = 0; i < selected.length; ++i) {
						var enchant = selected[i];
						var name = util.capitaliseFirstLetter(enchant.name);
						var level = util.getRandomNumberExcludeZero(4);
						enchantNames.push(name);
						levels.push(level);
						enchant.setup(entity, enchant.name, level);
					}
					printToPlayer(playerID, "%s enchanted %s [levels %s] %s", [named, enchantNames.join(", "), levels.join(", "), type]);
				}

				enchanter.storeVoid.push(entity.index);
			}
		}
	}
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

function getTeamIDFromPlayerID(playerID) {
	var client = dota.findClientByPlayerID(playerID);
	if (client === null)
		return false;
	var teamID = client.netprops.m_iTeamNum;
	return teamID;
}

function printToAll(string, args) {
	if (typeof(args) === 'undefined') args = [];
	var playerIDs = util.getConnectedPlayerIDs();
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
game.hookEvent("entity_hurt", onEntityHurt);
function onEntityHurt(event) {
	var bits = event.getInt("damagebits");
	if (bits > 0) // Block damage types other than physical
		return;

	var spellID = event.getInt("entindex_inflictor");
	if (spellID > 0) // Block spells temporarily
		return;

	var sourceEntityID = event.getInt("entindex_attacker");
	var targetEntityID = event.getInt("entindex_killed");

	// Was it self-inflicted damage?
	if (sourceEntityID === targetEntityID)
		return;

	var sourceEntity = game.getEntityByIndex(sourceEntityID);
	var targetEntity = game.getEntityByIndex(targetEntityID);

	// Was it a hero who dealt the exchange?
	if (!isPlayerHero(sourceEntity) || !isPlayerHero(targetEntity))
		return;

	var sourcePlayerID = sourceEntity.netprops.m_iPlayerID;
	var targetPlayerID = targetEntity.netprops.m_iPlayerID;

	var sourceClient = dota.findClientByPlayerID(sourcePlayerID);
	var targetClient = dota.findClientByPlayerID(sourcePlayerID);

	playerProps[targetPlayerID].lastAttacker = sourcePlayerID;

	// Let's do work.
	var source = sourceEntity;
	var target = targetEntity;

	var enchMap = enchants.enchantMap.onHit;

	// Initialize a new chain of modifier
	var chain = new TimeoutChain();

	// Pull our hero equipment
	var hero = sourceEntity;
	var equipment = unit.pullHeroInventory(hero, 0);

	var appliedTypes = [];

    // Loop through active equipment
    for ( var i = 0; i < equipment.length; ++i )
    {
    	var ent = equipment[i];

    	if ( enchanter.storeVoid.indexOf(ent.index) > -1 )
    	{
    		if (DEBUG) server.print('Found entity: ' + equipment[i].getClassname());

    		var equip = equipment[i];

    		if (equip.onHitEnchants)
    		{
    			var arr = equip.onHitEnchants;

    			for (var type in arr)
    			{

    				if (type == 'clone') continue;

    				if (appliedTypes.indexOf(type) > -1) continue;

    				var applied = false;

					if (DEBUG) server.print('Found enchant: ' + type);

					var ench = arr[type];

					var enchName = type;

	                if ( !playerProps[sourcePlayerID].enchantTimeouts )
	                    playerProps[sourcePlayerID].enchantTimeouts = {};

	                // Initialize enchantment timeouts
	                if ( !playerProps[sourcePlayerID].enchantTimeouts[targetEntityID] )
	                    playerProps[sourcePlayerID].enchantTimeouts[targetEntityID] = {};

	                // Initialize enchantment timeouts
	                if ( !playerProps[sourcePlayerID].enchantTimeouts[targetEntityID][enchName] )
	                    playerProps[sourcePlayerID].enchantTimeouts[targetEntityID][enchName] = {};

	                // Find our enchantment modifiers
					for (var value in ench.modifiers)
					{
	                    // Skip 'clone' ??
	                    if (!util.isNumber(value)) continue;

						var modifier = ench.modifiers[value];

	                    // Let's see if we have a timeoutDelay
	                    if (modifier.timeout > 0)
	                    {
	                        if ( !playerProps[sourcePlayerID].enchantTimeouts[targetEntityID][enchName][value] )
	                            playerProps[sourcePlayerID].enchantTimeouts[targetEntityID][enchName][value] = 0;

	                        if (playerProps[sourcePlayerID].enchantTimeouts[targetEntityID][enchName][value] === 1) {
	                        	if (DEBUG) server.print('Still in timeout');
	                            continue;
	                        }
	                        else {
	                            playerProps[sourcePlayerID].enchantTimeouts[targetEntityID][enchName][value] = 1;

	                            // This will make a new copy of each thing, such that it wont be updated by the loop:
	                            clearEnchantments(sourcePlayerID, targetEntityID, enchName, value, modifier.timeout);

	                            if (DEBUG) server.print('Next Frame Step: Applying Modifier');

	                             // Apply the modifier
	                            applyModifier(target, enchanter.onHitEnchantEntity[enchName], modifier.clsname, modifier.ref, modifier.options);

	                            if (ench.sound) {
	                            	if (sourceClient) {
										dota.sendAudio(sourceClient, false, ench.sound);
										timers.setTimeout(function() {
											cutAudio(sourceClient, ench.sound);
										}, ench.props.duration); 
									}
									if (targetClient) {
										dota.sendAudio(targetClient, false, ench.sound);
										timers.setTimeout(function() {
											cutAudio(targetClient, ench.sound);
										}, ench.props.duration); 
									}
	                            }

	                            applied = true;
	                       		
	                       		if (DEBUG) server.print('Finished Frame Step: Applying Modifier');
	                        }
	                    }
	                    else {
		                    if (modifier.proc > 0) {
		                    	if (util.getRandomNumberExcludeZero(100) <= modifier.proc) {
		                    		applyModifier(target, enchanter.onHitEnchantEntity[enchName], modifier.clsname, modifier.ref, modifier.options);
		                            if (ench.sound) {
		                            	if (sourceClient) {
											dota.sendAudio(sourceClient, false, ench.sound);
											timers.setTimeout(function() {
												cutAudio(sourceClient, ench.sound);
											}, ench.props.duration * 1000); 
										}
										if (targetClient) {
											dota.sendAudio(targetClient, false, ench.sound);
											timers.setTimeout(function() {
												cutAudio(targetClient, ench.sound);
											}, ench.props.duration * 1000); 
										}
		                            }
		                            applied = true;
		                    	}
		                    }
	                    	else {
	                    		applyModifier(target, enchanter.onHitEnchantEntity[enchName], modifier.clsname, modifier.ref, modifier.options);
	                            if (ench.sound) {
	                            	if (sourceClient) {
										dota.sendAudio(sourceClient, false, ench.sound);
										timers.setTimeout(function() {
											cutAudio(sourceClient, ench.sound);
										}, ench.props.duration * 1000);
									}
									if (targetClient) {
										dota.sendAudio(targetClient, false, ench.sound);
										timers.setTimeout(function() {
											cutAudio(targetClient, ench.sound);
										}, ench.props.duration * 1000);
									}
	                            }
	                            applied = true;
	                    	}
	                    }

	                    if (applied) appliedTypes.push(type);

						if (DEBUG & applied) server.print('Applied modifiers');
					}
    			}
    		}
    	}
    }
}

function cutAudio(client, sound) {
	dota.sendAudio(client, true, sound);
}

function clearEnchantments2(playerID, enchantmentName) {
	timers.setTimeout(function() {
		if (playerProps[sourcePlayerID].activeModifiers.indexOf(enchantmentName) > -1) {
			var idx = playerProps[sourcePlayerID].activeModifiers.indexOf(enchantmentName);
			playerProps[sourcePlayerID].activeModifiers.splice(idx, 1)
		}
	}, 15000);
}

function clearEnchantments(sourcePlayerID, targetEntityID, enchantmentName, key, timeout) {
	timers.setTimeout(function() {
		playerProps[sourcePlayerID].enchantTimeouts[targetEntityID][enchantmentName][key] = 0;
	}, timeout * 1000);
}


function applyModifier(target, base, clsname, ref, options) {
	dota.addNewModifier( target, base, clsname, ref, options );
}

function isPlayerHero(entity) {
	var props = entity.netprops;

	if (!entity.isHero())
		return false;

	if (props["m_iTeamNum"] < 2 || props["m_iTeamNum"] > 3)
		return false;

	if (props["m_iPlayerID"] === -1)
		return false;

	return true;
}

function isUnit(entity) {
	var props = entity.netprops;

	if (DEBUG) server.print(entity.getClassname());

	if (props["m_iPlayerID"] > 0)
		return false;

	return true;
}

var TimeoutChain = function(){
    var This = this;
    this._timeoutHandler = null;
    this.chain = [];
    this.currentStep = 0;
    this.isRunning = false;
    this.nextStep = function(){
        This.currentStep = This.currentStep + 1;
        if (This.currentStep == This.chain.length)
            This.stop();
        else
            This.processCurrentStep();
    },
    this.processCurrentStep = function(){
        This._timeoutHandler = timers.setTimeout(function(){
            This.chain[This.currentStep].func();
            This.nextStep();
        }, This.chain[This.currentStep].time);
    },
    this.start =function(){
        if (This.chain.length === 0)
            return;

        if (This.isRunning === true)
            return;

        This.isRunning = true;
        This.currentStep = 0;

        if (This.currentStep === 0)
			This.chain[0].time = 0;

        This.processCurrentStep();
    },
    this.stop = function(){
        This.isRunning = false;
        timers.clearTimeout(This._timeoutHandler);
    },
    this.add = function(_function, _timeout) {
        This.chain[This.chain.length] = {func : _function, time : _timeout };
    },
    this.shuffle = function() {
        if (This.chain.length === 0)
            return;

		This.chain = util.shuffle(This.chain);
    }
};

game.hook("Dota_OnUnitThink", onUnitThink);
function onUnitThink(unit) {
	if (enchanter.enabled) {
		dota.setUnitState(enchanter.onHitEnchantEntity, dota.UNIT_STATE_INVISIBLE, true);
		dota.setUnitState(enchanter.onHitEnchantEntity, dota.UNIT_STATE_INVULNERABLE, true);
		dota.setUnitState(enchanter.onHitEnchantEntity, dota.UNIT_STATE_CANT_ACT, true);
		dota.setUnitState(enchanter.onHitEnchantEntity, dota.UNIT_STATE_BANISHED, true);

		dota.setUnitState(enchanter.constantEnchantEntity, dota.UNIT_STATE_INVISIBLE, true);
		dota.setUnitState(enchanter.constantEnchantEntity, dota.UNIT_STATE_INVULNERABLE, true);
		dota.setUnitState(enchanter.constantEnchantEntity, dota.UNIT_STATE_CANT_ACT, true);
		dota.setUnitState(enchanter.constantEnchantEntity, dota.UNIT_STATE_BANISHED, true);
	}
}

game.hook("OnMapStart", onMapStart);
function onMapStart() {
	settings.mapLoaded = true;

	for (var i = 0; i < playerProps.length; ++i)
	{
		playerProps[i] = {
			playerID: i,
			queue: [],					// Handles extra equipment in storage space
			queueNotified: false,		// Reminder of queued items
			snapHeroEquip: [],			// Last snapshot of a player's equipment
			equipmentHandouts: [],		// Logs all items given to this player
			equipmentEntities: [],			
			lootTable: null,
			buildLootTable: true,
			nextDropFavored: false,
			enchantTimeouts: {},
			lastAttacker: null,
			activeModifiers: []
		};
	}
	if (enchanter.enabled)
	{
		dota.loadParticleFile('particles/units/heroes/hero_ogre_magi.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_crystalmaiden.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_doom_bringer.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_dark_seer.pcf');

		dota.loadParticleFile('particles/units/heroes/hero_bane.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_omniknight.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_enchantress.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_razor.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_bloodseeker.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_axe.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_kunkka.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_tinker.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_sven.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_vengeful.pcf');

		dota.loadParticleFile('particles/units/heroes/hero_batrider.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_brewmaster.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_clinkz.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_magnataur.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_witchdoctor.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_lycan.pcf');
		// game.precacheModel('models/heroes/lycan/lycan_wolf.mdl');

		// Make a dummy entity to store our item enchantment abilities
		enchanter.onHitEnchantEntity = dota.createUnit('npc_dota_units_base', dota.TEAM_NEUTRAL);
		var onHitMap = enchants.enchantMap.onHit;
		for (var i = 0; i < onHitMap.length; ++i)
		{
			if (onHitMap[i].spell)
			{
				var enchantmentName = onHitMap[i].name;

				enchanter.onHitEnchantEntity[enchantmentName] = dota.createAbility(enchanter.onHitEnchantEntity, onHitMap[i].spell);

				// Level up the ability
				if (onHitMap[i].level && onHitMap[i].level > 0)
					enchanter.onHitEnchantEntity[enchantmentName].netprops.m_iLevel = onHitMap[i].level;

				// Find the first free slot for this skill
				for (var a = 0; a < 16; ++a) {
					if (enchanter.onHitEnchantEntity.netprops.m_hAbilities[a] === null) {

						dota.setAbilityByIndex(enchanter.onHitEnchantEntity, enchanter.onHitEnchantEntity[enchantmentName], a);
						break;
					}
				}
			}
		}

		enchanter.constantEnchantEntity = dota.createUnit('npc_dota_units_base', dota.TEAM_NEUTRAL);
		var constantMap = enchants.enchantMap.constant;
		for (var i = 0; i < constantMap.length; ++i)
		{
			if (constantMap[i].spell)
			{
				var enchantmentName = constantMap[i].name;

				enchanter.constantEnchantEntity[enchantmentName] = dota.createAbility(enchanter.constantEnchantEntity, constantMap[i].spell);

				// Level up the ability
				if (constantMap[i].level && constantMap[i].level > 0)
					enchanter.constantEnchantEntity[enchantmentName].netprops.m_iLevel = constantMap[i].level;
			}
		}
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

// ==========================================
// Lobby Setup
// ==========================================
var lobbyManager;
plugin.get('LobbyManager', function(obj){
	lobbyManager = obj;
	var optionTime = lobbyManager.getOptionsForPlugin("WeaponMayhem")["Speed"];
	if (optionTime) {
		settings.leadTime.length = 0;
		settings.nextBase.length = 0;
		settings.leadTime = [optionTime];
		settings.nextBase = [optionTime];

		var s = util.convertMinutesToSeconds(optionTime);

		if (s < settings.sounds.timeThreshold)
			settings.sounds.enabled = false;

		if (s < settings.dropNotifications.timeThreshold)
			settings.dropNotifications.enabled = false;
	}

	var optionWeight = lobbyManager.getOptionsForPlugin("WeaponMayhem")["Weights"];
	switch(optionWeight)
	{
		case "Weighted & Enchantable":
			enchanter.enabled = true;
			break;
		default:
		case "Weighted": break;
		case "Non-weighted & Enchantable":
			enchanter.enabled = true;
			settings.itemTable.useWeights = false;
		break;
		case "Non-weighted":
			settings.itemTable.useWeights = false;
		break;
	}

	var optionEnchant = lobbyManager.getOptionsForPlugin("WeaponMayhem")["Enchants"];
	switch(optionEnchant)
	{
		default:
		case "Enchants Disabled": break;
		case "Enchants Enabled (beta)":
			enchanter.enabled = true;
			break;
	}
	// switch(optionEnchant)
	// {
	// 	case "1 Wave":
	// 		settings.waveLimit = 1;
	// 		break;
	// 	case "2 Waves":
	// 		settings.waveLimit = 2;
	// 		break;
	// 	case "3 Waves":
	// 		settings.waveLimit = 3;
	// 		break;
	// 	case "4 Waves":
	// 		settings.waveLimit = 4;
	// 		break;
	// 	case "5 Waves":
	// 		settings.waveLimit = 5;
	// 		break;
	// 	case "6 Waves":
	// 		settings.waveLimit = 6;
	// 		break;
	// 	case "7 Waves":
	// 		settings.waveLimit = 7;
	// 		break;
	// 	case "8 Waves":
	// 		settings.waveLimit = 8;
	// 		break;
	// 	case "9 Waves":
	// 		settings.waveLimit = 9;
	// 		break;
	// 	case "10 Waves":
	// 		settings.waveLimit = 10;
	// 		break;
	// 	case "15 Waves":
	// 		settings.waveLimit = 15;
	// 		break;
	// 	case "20 Waves":
	// 		settings.waveLimit = 20;
	// 		break;
	// 		default:
	// 	case "∞ Waves":
	// 		settings.waveLimit = -1;
	// 		break;
	// }

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
		case 0:
			for (i = 0; i < tmp.length; ++i) {
				var itemList = ["item_sange", "item_yasha"];
				if ( itemList.indexOf(tmp[i][0]) > -1 ) {
					mainItemTable.push(tmp[i]);
				}
			}
			break;
		case 1:
			for (i = 0; i < tmp.length; ++i) {
				if ( tmp[i][2] > settings.itemTable.priceRangeMin && tmp[i][2] < settings.itemTable.priceRangeMax ) {
					mainItemTable.push(tmp[i]);
				}
			}
			break;
		case 2: // Aegis & Rapier
			for (i = 0; i < tmp.length; ++i) {
				var itemList = ["item_rapier"];
				if ( itemList.indexOf(tmp[i][0]) > -1 ) {
					if (settings.itemTable.useWeights) {
						if (tmp[i][0] == "item_rapier")
							tmp[i][1] = 35;
					}
					mainItemTable.push(tmp[i]);
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
		enchanter.percentage = (70 + (time / 13) );
	}
	if (DEBUG) {
		enchanter.enabled = true;
		enchanter.percentage = 100;
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
console.addClientCommand("li", clientFunctions);
function clientFunctions(client, args) {
	var playerID = client.netprops.m_iPlayerID;
	printToPlayer(playerID, "commands are:", []);
	printToPlayer(playerID, "-queue (see inside queue)", []);
	printToPlayer(playerID, "-queue clear (destroy items)", []);
	if (enchanter.enabled) {
		printToPlayer(playerID, "-ei 0 (see items with enchants)", []);
		printToPlayer(playerID, "-ei 1-6 (see enchant properties)", []);
		printToPlayer(playerID, "-ei types (see enchant types)", []);
	}
	else
		printToPlayer(playerID, "-ei (disabled, no item enchants)", []);
}

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

		if (args.length === 0) {
			printToPlayer(playerID, "There are %s items in the queue", [queueLength]);
		}

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
console.addClientCommand("ei", enchantFunctions);
function enchantFunctions(client, args) {
	var playerID = client.netprops.m_iPlayerID;
	if (!enchanter.enabled) {
		printToPlayer(playerID, 'Enchanter module not enabled for this lobby.', []);
		return;
	}

	var hero = client.netprops.m_hAssignedHero;
	if (!hero)
		return;
		
	if (args.length !== 1) {
		printToPlayer(playerID, 'Use -ei # or types.');
		return;
	}

	if (args[0] == 'types') {
		for(var cat in enchants.enchantMap) {
			if (cat == 'clone') continue;
			var arr = enchants.enchantMap[cat];
			printToPlayer(playerID, '%s enchantments:', [util.capitaliseFirstLetter(cat)]);
			for (var i = 0; i < arr.length; ++i) {
				var name = arr[i].name;
				var desc = arr[i].desc;
				printToPlayer(playerID, '%s: %s', [util.capitaliseFirstLetter(name), desc]);
			}
		}
		return;
	}

	var invSlot = Number(args[0]);
	if (isNaN(invSlot)) {
		printToPlayer(playerID, '# should be a number or "types".');
		return;
	}
	
	invSlot--;
	if (invSlot < -1 || invSlot > 5) {
		printToPlayer(playerID, 'Use a value between 0 | 1 and 6.');
		return;
	}
	
	if (invSlot !== -1) {
		var item = hero.netprops.m_hItems[invSlot];
		if (item === null) {
			printToPlayer(playerID, 'There is no item in this slot.');
			return;
		}
			
		var clsname = item.getClassname();

		if ( locale.itemName[clsname] )
			var named = locale.itemName[clsname];
		else
			var named = clsname;

		if (enchanter.storeVoid.indexOf(item.index) > -1)
		{
	        // Look at what type of enchants exist
	        for (var cat in enchants.enchantMap)
	        {
	        	if (cat == 'clone') continue;

	        	var arr = enchants.enchantMap[cat];

	        	if (item[cat])
	        	{
	        		if (DEBUG) server.print("Found item cat: " + cat);

			        for (var type in item[cat])
			        {

			        	if (type == 'clone') continue;

			        	if (item[cat][type])
			        	{
			        		if (DEBUG) server.print("Found item enchant: " + type);
			        		var ench = item[cat][type];
			        		var props = item[cat][type].props;

			        		printToPlayer(playerID, '%s %s: {%s}', [named, util.capitaliseFirstLetter(type), util.objToString(props) ]);
			        	}
					}
				}
	        }
		}
		else {
			printToPlayer(playerID, "%s is not enchanted", [named]);
			return;
		}
	}
	else {
		var equipment = unit.pullHeroInventory(hero);
		if (equipment.length === 0)
			printToPlayer(playerID, "No items to look at", []);

		for (var i = 0; i < equipment.length; ++i)
		{
			if (enchanter.storeVoid.indexOf(equipment[i].index) > -1)
			{
				var entity = equipment[i];
				entity.chants = [];
		        // Look at what type of enchants exist
		        for (var cat in enchants.enchantMap)
		        {
		        	if (cat == 'clone') continue;

		        	var arr = enchants.enchantMap[cat];

		        	if (entity[cat])
		        	{
		        		if (DEBUG) server.print("Found item cat: " + cat);

				        for (var type in entity[cat])
				        {

				        	if (type == 'clone') continue;

				        	if (entity[cat][type])
				        	{
				        		if (DEBUG) server.print("Found item enchant: " + type);

				        		entity.chants.push(util.capitaliseFirstLetter(type));
				        	}
						}
					}
		        }
			}
		}
		for (var i = 0; i < equipment.length; ++i)
		{
			var equip = equipment[i];

			var clsname = equip.getClassname();

			if ( locale.itemName[clsname] )
				var named = locale.itemName[clsname];
			else
				var named = clsname;

			if (equip.chants && equip.chants.length > 0) {
				printToPlayer(playerID, "%s is enchanted with: %s", [named, equip.chants.join(', ')]);
			}
		}
		printToPlayer(playerID, 'Use -ei [1-6] for detailed information.', []);
	}
}

// ==========================================
// Developer Mode
// ==========================================
//
if (g_plugin.developer) {
	settings.leadTime.length = 0;
	settings.nextBase.length = 0;
	settings.leadTime = ['0:02'];
	settings.nextBase = ['0:02'];
	var nextBase = util.convertMinutesToSeconds(settings.nextBase[0]);

	if (nextBase <= 120)
		settings.dropNotifications.enabled = false;

	// To compensate for 0:00
	settings.shakeTime = 0;

	// Set queue handler to abnormal
	// settings.queue.checkXSeconds = 0.1;

	// setupItemTable("Caster/Support items only");

	// Custom Mode 0 allows only a few items in.
	settings.itemTable.customMode = 1;
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
					heroItemsEquipped = unit.pullHeroEquipment(hero, 1);
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
		while( unit.isInventoryAvailable(hero) || unit.isBankAvailable(hero) );
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
