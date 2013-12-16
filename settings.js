// ==========================================
// Lucky Items Settings
// ==========================================
var settings = {
	mapLoaded: false, // did the map start?
	pluginLoaded: false, // did plugin initialize?
	pluginHalted: false, // did we tell our plugin to stop dispensing items?
	timeElapsed: 0, // keep track of passed in-game seconds
	leadTime: ['5:00'], // lead item drop : STATE_GAME_IN_PROGRESS
	nextBase: ['5:00'], // subsequent drops after the lead
	shakeTime: 4, // shake shake shake!
	gameTime: null, // keeps track of the game time
	currentWave: 0, // keeps track of the current item wave
	waveLimit: 0, // how many item waves will happen
	playerList: [], // which players will receive an item
	skipPlayers: [], // playerID is in here, they will receive no items
	dispenseTimeout: 0.6, // how many seconds to wait before giving each player their items
	itemDropFavorPercent: 25, // percentage chance to get a favored item after a low one
	gamePhase: 1, // current match phase. 1 - Early Game; 2 - MidGame; 3 - Late Game
	maxTries: 12, // prevent an infinite search loop, break
	maxTriesLoot: [ // we can't find our player an item, default to these
		'item_aegis'
	],
	reLootPercentage: 80, // a percentage chance to random twice on specific items
	reLootTable: [ // items to perform another random on.
		'item_cheese',
		'item_aegis',
		'item_winter_mushroom'
	],
	doNotConsiderDupes: [ // exceptions to keep generating loot.
		'item_rapier',
		'item_aegis',
		'item_cheese',
		'item_winter_mushroom'
	],
	doNotPutInStash: ['item_aegis'],
	// This is the inventory queue to manage items when a player cannot be given more items.
	// An integral part of the plugin, and cannot be disabled.
	queue: {
		interval: 0.8, // Every X seconds: check our inventory queue, and take a hero snapshot
		remindNItems: 2, // Reminder trigger on the amount of items in a player's queue
		reminderTimeout: 60, // Every X seconds, remind our player they have items in their queue
		reminderNotice: '%s in queue.', // Message to display
		maxNextLength: 4, // Amount of items to show in the player's queue on using -queue
	},
	// Plugin sound effects that occur when an item is randomed to a player or other trigger events.
	sounds: {
		enabled: true, // Enabled / disabled
		timeThreshold: 45, // Below this time (in seconds) threshold, disable them
		addToInventory: ['ui/npe_objective_given.wav'],
		queueToInventory: ['ui/npe_objective_given.wav'],
		itemEnchanted: ['ui/npe_objective_given.wav']
	},
	// Plugin chat drop notifications display
	dropNotifications: {
		lead: '\x02%s\x01', // Lead item time (NOTE: Always enabled)
		enabled: false, // Enable / disable subsequent notifications
		timeThreshold: 60, // Below this time threshold (in seconds), disable them
		subsequent: '%s', // Subsequent item time
	},
	money: {
		GPS: 0,
		GP10: 0
	},
	// Properties of the generated base item table
	itemTable: {
		properties: {
			sellable: false,
			disassemblable: false,
			killable: false
		},
		instance: null, // Here we store our lobby generated item table.
		useWeights: false, // Enable / disable the use of item weighing
		powerWeight: 1, // What power can we modify the weights up to
		priceRangeMin: 1500, // MIN price value to include in item table generation
		priceRangeMax: 10000, // MAX price value to include in item table generation
		customMode: 1, // Custom Modes: 1 - Default; 2 - Aegis & Rapier only
		// This section modifies the base item table when specified
		counter: {},
		// This section disables additional randoms for aura-based or team-wide items.
		// will only dispense (randomly) the set number of items per team.
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
		countItemsPerTeam: {},
		maxLimitPerItem: 3,
		// Removes possible item side-grades from rolling again per player.
		componentExclude: keyvalue.parseKVFile('item_component_exclusion_list.kv')
	},
	// These are the plugin addons. They are added onto the base and provide improved functionality.
	// Plugin addons can be disabled, and the base plugin still functions normally without their intended benefits.
	addons: {
		nobuy: {
			enabled: false
		},
		enchanter: {
			enabled: false,
			random: false,
			shop: false,
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

// ==========================================
// General Setup
// ==========================================
settings.DEVELOPER = false;
settings.DEBUG = false;

settings.HERO_INVENTORY_BEGIN = 0;
settings.HERO_INVENTORY_END = 5; // END at [0, 1, 2, 3,  4,  5] - 6 SLOTS
settings.HERO_STASH_BEGIN = 6; // BEGIN at [6, 7, 8, 9, 10, 11] - 6 SLOTS
settings.ERO_STASH_END = 11;
settings.UNIT_LIFE_STATE_ALIVE = 0;

settings.enchanter = settings.addons.enchanter;
settings.wardrobe = settings.addons.wardrobe;
settings.settings = settings;

settings.prefix = '[LI]';

/*
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
*/

// Expose settings
exports.s = settings;
