// ==========================================
// Player Enchantments
// ==========================================
var ENCHANT_ONHIT = 'onHit';
var ENCHANT_CONSTANT = 'onEquip';
var ENCHANT_ONUSE = 'onUse';

var ENCHANT_ONEQUIP = 0;
var ENCHANT_ONHIT = 1;

function createProps(ent, cat, name) {
	if(!ent[cat])
		ent[cat] = {};

	if(!ent[cat][name])
		ent[cat][name] = {};

	return ent;
}

// Function only for onEquip enchantments only
function setNewModifier(ent, name) {
	var hero = ent.netprops.m_hOwnerEntity;
	server.print("Found hero: " + hero);
	if (hero === null) return;
	for (var value in ent.enchants[name].modifiers) {
		var modifier = ent.enchants[name].modifiers[value];
		if (dota.hasModifier(hero, modifier.clsname)) {
			dota.removeModifier(hero, modifier.clsname);
		}
	}
}

var enchantMap = {
	onHit: new Array(
		// TIMESTOP
		{
			name: 'timestop',
			description: 'Freezes the opponent in time for a short duration.',
			cost: [100, 125, 150],
			max: 3,
			type: ENCHANT_ONHIT,
			minimumHeroLevel: 1,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'faceless_void_chronosphere';

				ent.enchants[name].base = dota.createAbility(enchanter.onHitEnchantEntity, BASE_ABILITY);

				// ent.enchants[name].base.netprops.m_iLevel = level;

				// Effect triggers
				var EFFECT_DURATION = 1.0;
				var EFFECT_TIMEOUT = 0;
				var EFFECT_PROC = 10;

				// Levelup vars

				switch(level) {
					case 1:
						EFFECT_DURATION = 1.0;
						EFFECT_PROC = 12;
						break;
					case 2:
						EFFECT_DURATION = 1.5;
						EFFECT_PROC = 16;
						break;
					case 3:
						EFFECT_DURATION = 2.0;
						EFFECT_PROC = 20;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					proc_chance: EFFECT_PROC + '%',
					duration: EFFECT_DURATION + 's'
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_faceless_void_chronosphere_freeze',
						options: {
							duration: EFFECT_DURATION
						},
						timeout: EFFECT_TIMEOUT,
						proc: EFFECT_PROC,
						chainDelay: 0
					}
				}
				// setNewModifier(ent, name);
			}
		},
		// FORCEPUSH
		{
			name: 'forcepush',
			description: 'Pushes an opponent with great force.',
			cost: [100, 125, 150, 175],
			max: 4,
			type: ENCHANT_ONHIT,
			minimumHeroLevel: 1,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'item_force_staff';

				ent.enchants[name].base = dota.createAbility(enchanter.onHitEnchantEntity, BASE_ABILITY);

				// ent.enchants[name].base.netprops.m_iLevel = level;

				// Effect triggers
				var EFFECT_DURATION = 0;
				var EFFECT_TIMEOUT = 0;
				var EFFECT_PROC = 10;

				// Levelup vars

				switch(level) {
					case 1:
						EFFECT_PROC = 10;
						PUSH_LENGTH = 800;
						break;
					case 2:
						EFFECT_PROC = 15;
						PUSH_LENGTH = 1000;
						break;
					case 3:
						EFFECT_PROC = 20;
						PUSH_LENGTH = 1200;
						break;
					case 4:
						EFFECT_PROC = 25;
						PUSH_LENGTH = 1400;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					proc_chance: EFFECT_PROC + '%',
					push_distance: PUSH_LENGTH
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_item_forcestaff_active',
						options: {
							push_length: PUSH_LENGTH
						},
						timeout: EFFECT_TIMEOUT,
						proc: EFFECT_PROC,
						chainDelay: 0
					}
				}
				// setNewModifier(ent, name);
			}
		},
		// BLIND
		{
			name: 'blind',
			description: 'Causes the opponent to miss autoattacks.',
			cost: [100, 125, 150, 175],
			max: 4,
			type: ENCHANT_ONHIT,
			minimumHeroLevel: 1,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'tinker_laser';

				ent.enchants[name].base = dota.createAbility(enchanter.onHitEnchantEntity, BASE_ABILITY);

				// ent.enchants[name].base.netprops.m_iLevel = level;

				// Effect triggers
				var EFFECT_DURATION = 3.5;
				var EFFECT_TIMEOUT = 0;
				var EFFECT_PROC = 10;

				switch(level) {
					case 1:
						EFFECT_DURATION = 3.5;
						EFFECT_PROC = 10;
						break;
					case 2:
						EFFECT_DURATION = 3.75;
						EFFECT_PROC = 15;
						break;
					case 3:
						EFFECT_DURATION = 4.0;
						EFFECT_PROC = 20;
						break;
					case 4:
						EFFECT_DURATION = 4.25;
						EFFECT_PROC = 25;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					proc_chance: EFFECT_PROC + '%',
					duration: EFFECT_DURATION + 's'
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_tinker_laser_blind',
						options: {
							duration: EFFECT_DURATION
						},
						timeout: EFFECT_TIMEOUT,
						proc: EFFECT_PROC,
						chainDelay: 0
					}
				}
				// setNewModifier(ent, name);
			}
		},
		// SILENCE
		{
			name: 'silence',
			description: 'Silences the opponent.',
			cost: [100, 125, 150, 175],
			max: 4,
			type: ENCHANT_ONHIT,
			minimumHeroLevel: 1,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'item_orchid';

				ent.enchants[name].base = dota.createAbility(enchanter.onHitEnchantEntity, BASE_ABILITY);

				// ent.enchants[name].base.netprops.m_iLevel = level;

				// Effect triggers
				var EFFECT_DURATION = 3.5;
				var EFFECT_TIMEOUT = 0;
				var EFFECT_PROC = 10;

				switch(level) {
					case 1:
						EFFECT_DURATION = 3.5;
						EFFECT_PROC = 10;
						break;
					case 2:
						EFFECT_DURATION = 3.75;
						EFFECT_PROC = 15;
						break;
					case 3:
						EFFECT_DURATION = 4.0;
						EFFECT_PROC = 20;
						break;
					case 4:
						EFFECT_DURATION = 4.25;
						EFFECT_PROC = 25;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					proc_chance: EFFECT_PROC + '%',
					duration: EFFECT_DURATION + 's'
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_orchid_malevolence_debuff',
						options: {
							duration: EFFECT_DURATION
						},
						timeout: EFFECT_TIMEOUT,
						proc: EFFECT_PROC,
						chainDelay: 0
					}
				}
				// setNewModifier(ent, name);
			}
		},
		// SHEEP
		{
			name: 'sheep',
			description: 'Turns the opponent into a helpless pig.',
			cost: [100, 125, 150, 175],
			max: 4,
			type: ENCHANT_ONHIT,
			minimumHeroLevel: 1,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'item_sheepstick';

				ent.enchants[name].base = dota.createAbility(enchanter.onHitEnchantEntity, BASE_ABILITY);

				// ent.enchants[name].base.netprops.m_iLevel = level;

				// Effect triggers
				var EFFECT_DURATION = 3.5;
				var EFFECT_TIMEOUT = 0;
				var EFFECT_PROC = 10;

				switch(level) {
					case 1:
						EFFECT_DURATION = 3.5;
						EFFECT_PROC = 10;
						break;
					case 2:
						EFFECT_DURATION = 3.75;
						EFFECT_PROC = 15;
						break;
					case 3:
						EFFECT_DURATION = 4.0;
						EFFECT_PROC = 20;
						break;
					case 4:
						EFFECT_DURATION = 4.25;
						EFFECT_PROC = 25;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					proc_chance: EFFECT_PROC + '%',
					duration: EFFECT_DURATION + 's'
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_sheepstick_debuff',
						options: {
							duration: EFFECT_DURATION
						},
						timeout: EFFECT_TIMEOUT,
						proc: EFFECT_PROC,
						chainDelay: 0
					}
				}
				// setNewModifier(ent, name);
			}
		},
		// FREEZE
		{
			name: 'freeze',
			description: 'Encases an enemy in ice, prohibiting movement and attack, while dealing damage per second.',
			cost: [150, 200, 250, 300],
			max: 4,
			type: ENCHANT_ONHIT,
			minimumHeroLevel: 1,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'crystal_maiden_frostbite';

				ent.enchants[name].base = dota.createAbility(enchanter.onHitEnchantEntity, BASE_ABILITY);

				ent.enchants[name].base.netprops.m_iLevel = level;

				// Effect triggers
				var EFFECT_DURATION = 3.5;
				var EFFECT_TIMEOUT = 0;
				var EFFECT_PROC = 10;

				switch(level) {
					case 1:
						EFFECT_DURATION = 3.5;
						EFFECT_PROC = 10;
						break;
					case 2:
						EFFECT_DURATION = 3.75;
						EFFECT_PROC = 15;
						break;
					case 3:
						EFFECT_DURATION = 4.0;
						EFFECT_PROC = 20;
						break;
					case 4:
						EFFECT_DURATION = 4.25;
						EFFECT_PROC = 25;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					proc_chance: EFFECT_PROC + '%',
					duration: EFFECT_DURATION + 's',
					damage_per_second: 70
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_crystal_maiden_frostbite',
						options: {
							duration: EFFECT_DURATION
						},
						timeout: EFFECT_TIMEOUT,
						proc: EFFECT_PROC,
						chainDelay: 0
					}
				}
				// setNewModifier(ent, name);
			}
		},
		// SLOW
		{
			name: 'slow',
			description: 'Slow the enemy for a short duration.',
			cost: [50, 75, 100, 125],
			max: 4,
			type: ENCHANT_ONHIT,
			minimumHeroLevel: 1,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'item_diffusal_blade';

				ent.enchants[name].base = dota.createAbility(enchanter.onHitEnchantEntity, BASE_ABILITY);

				// ent.enchants[name].base.netprops.m_iLevel = level;

				// Effect triggers
				var EFFECT_DURATION = 4;
				var EFFECT_TIMEOUT = 8;
				var EFFECT_PROC = 0;

				switch(level) {
					case 1:
						EFFECT_DURATION = 4;
						break;
					case 2:
						EFFECT_DURATION = 5;
						break;
					case 3:
						EFFECT_DURATION = 6;
						break;
					case 4:
						EFFECT_DURATION = 7;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					duration: EFFECT_DURATION + 's',
					timeout: EFFECT_TIMEOUT + 's'
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_item_diffusal_blade_slow',
						options: {
							duration: EFFECT_DURATION
						},
						timeout: EFFECT_TIMEOUT,
						proc: EFFECT_PROC,
						chainDelay: 0
					}
				}
				// setNewModifier(ent, name);
			}
		},
		// ENFEEBLE
		{
			name: 'enfeeble',
			description: 'Weakens an enemy unit, reducing its physical damage.',
			cost: [95, 105, 115, 125],
			max: 4,
			type: ENCHANT_ONHIT,
			minimumHeroLevel: 1,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'bane_enfeeble';

				ent.enchants[name].base = dota.createAbility(enchanter.onHitEnchantEntity, BASE_ABILITY);

				ent.enchants[name].base.netprops.m_iLevel = level;

				// Effect triggers
				var EFFECT_DURATION = 20;
				var EFFECT_TIMEOUT = 10;
				var EFFECT_PROC = 0;

				// Level up vars
				var DAMAGE_REDUCTION = 8;

				switch(level) {
					case 1:
						DAMAGE_REDUCTION = 30;
						break;
					case 2:
						DAMAGE_REDUCTION = 60;
						break;
					case 3:
						DAMAGE_REDUCTION = 90;
						break;
					case 4:
						DAMAGE_REDUCTION = 120;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					duration: EFFECT_DURATION + 's',
					timeout: EFFECT_TIMEOUT + 's',
					damage_reduction: DAMAGE_REDUCTION,
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_bane_enfeeble',
						options: {
							duration: EFFECT_DURATION
						},
						timeout: EFFECT_TIMEOUT,
						proc: EFFECT_PROC,
						chainDelay: 0
					}
				}
				// setNewModifier(ent, name);
			}
		},
		{
			name: 'amplify',
			description: 'Reduces enemy armor to amplify physical damage and provides True Sight.',
			cost: [500, 600, 700],
			max: 3,
			type: ENCHANT_ONHIT,
			minimumHeroLevel: 6,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'slardar_amplify_damage';

				ent.enchants[name].base = dota.createAbility(enchanter.onHitEnchantEntity, BASE_ABILITY);

				ent.enchants[name].base.netprops.m_iLevel = level;

				// Effect triggers
				var EFFECT_DURATION = 25;
				var EFFECT_TIMEOUT = 15;
				var EFFECT_PROC = 0;

				// Level up vars
				var ARMOR_REDUCTION = 8;

				switch(level) {
					case 1:
						ARMOR_REDUCTION = 8;
						break;
					case 2:
						ARMOR_REDUCTION = 14;
						break;
					case 3:
						ARMOR_REDUCTION = 20;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					duration: EFFECT_DURATION + 's',
					timeout: EFFECT_TIMEOUT + 's',
					armor_reduction: ARMOR_REDUCTION,
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_slardar_amplify_damage',
						options: {
							duration: EFFECT_DURATION
						},
						timeout: EFFECT_TIMEOUT,
						proc: EFFECT_PROC,
						chainDelay: 0
					}
				}
				// setNewModifier(ent, name);
			}
		},
		{
			name: 'poke',
			description: 'Poke the enemy, startling them, causing them to jump a distance.',
			cost: [50, 75, 100, 125],
			max: 4,
			type: ENCHANT_ONHIT,
			minimumHeroLevel: 1,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'mirana_leap';

				ent.enchants[name].base = dota.createAbility(enchanter.onHitEnchantEntity, BASE_ABILITY);

				ent.enchants[name].base.netprops.m_iLevel = level;

				// Effect triggers
				var EFFECT_TIMEOUT = 0;
				var EFFECT_PROC = 10;

				// Level up vars
				var LEAP_DISTANCE = 630;

				switch(level) {
					case 1:
						EFFECT_PROC = 10;
						LEAP_DISTANCE = 630;
						break;
					case 2:
						EFFECT_PROC = 15;
						LEAP_DISTANCE = 720;
						break;
					case 3:
						EFFECT_PROC = 20;
						LEAP_DISTANCE = 780;
						break;
					case 4:
						EFFECT_PROC = 25;
						LEAP_DISTANCE = 870;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					proc_chance: EFFECT_PROC + '%',
					distance: LEAP_DISTANCE,
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_mirana_leap',
						options: {
							duration: 1
						},
						timeout: EFFECT_TIMEOUT,
						proc: EFFECT_PROC,
						chainDelay: 0
					}
				}
				// setNewModifier(ent, name);
			}
		},
		{
			name: 'manaleak',
			description: 'Weakens an enemy\'s magical essence, causing them to lose mana as they move.',
			cost: [50, 100, 150, 200],
			max: 4,
			type: ENCHANT_ONHIT,
			minimumHeroLevel: 1,
			setup: function(ent, name, level)
			{

				var BASE_ABILITY = 'keeper_of_the_light_mana_leak';

				ent.enchants[name].base = dota.createAbility(enchanter.onHitEnchantEntity, BASE_ABILITY);

				ent.enchants[name].base.netprops.m_iLevel = level;

				// Effect triggers
				var EFFECT_TIMEOUT = 0;
				var EFFECT_PROC = 10;

				// Level up vars
				var DURATION = 4;
				var MANA_DRAINED = 3.5;
				var STUN_DURATION = 1.3;

				switch(level) {
					case 1:
						DURATION = 4;
						MANA_DRAINED = 3.5;
						STUN_DURATION = 1.3;
						EFFECT_PROC = 10;
						break;
					case 2:
						DURATION = 5;
						MANA_DRAINED = 4;
						STUN_DURATION = 1.6;
						EFFECT_PROC = 15;
						break;
					case 3:
						DURATION = 6;
						MANA_DRAINED = 4.5;
						STUN_DURATION = 1.9;
						EFFECT_PROC = 20;
						break;
					case 4:
						DURATION = 7;
						MANA_DRAINED = 5;
						STUN_DURATION = 2.2;
						EFFECT_PROC = 25;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					duration: DURATION + 's',
					proc_chance: EFFECT_PROC + '%',
					drain_percent: MANA_DRAINED + '%',
					stun_duration: STUN_DURATION + 's'
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_keeper_of_the_light_mana_leak',
						options: {
							duration: DURATION,
						},
						timeout: EFFECT_TIMEOUT,
						proc: EFFECT_PROC,
						chainDelay: 0
					}
				}
				// setNewModifier(ent, name);
			}
		}
	),
	// ALWAYS ON WHEN EQUIPPED
	onEquip: new Array(
		// {
		// 	name: 'bloodthirst',
		// 	desc: 'Wearer can see hurt enemies.',
		// 	minlevel: 1,
		// 	spell: 'bloodseeker_thirst',
		// 	level: 2,
		// 	setup: function(ent, name, level) {
		// 		ent = createProps(ent, ENCHANT_CONSTANT, name);

		// 		var EFFECT_SPEED = 250;

		// 		switch(level)
		// 		{
		// 			default:
		// 			case 1:
		// 				EFFECT_SPEED = 250;
		// 				break;
		// 			case 2:
		// 				EFFECT_SPEED = 300;
		// 				break;
		// 			case 3:
		// 				EFFECT_SPEED = 350;
		// 				break;
		// 			case 4:
		// 				EFFECT_SPEED = 400;
		// 				break;
		// 		}

		// 		ent[ENCHANT_CONSTANT][name].props = {
		// 			level: level,
		// 			speed: EFFECT_SPEED
		// 		}

		// 		ent[ENCHANT_CONSTANT][name].modifiers = {
		// 			1: {
		// 				ref: "bloodseeker_thirst",
		// 				clsname: "modifier_bloodseeker_thirst",
		// 				options: {
		// 					duration: 3600,
		// 				}
		// 			},
		// 			2: {
		// 				ref: "bloodseeker_thirst",
		// 				clsname: "modifier_bloodseeker_thirst_speed",
		// 				options: {
		// 					duration: 3600,
		// 					speed: EFFECT_SPEED
		// 				}
		// 			},
		// 			3: {
		// 				ref: "bloodseeker_thirst",
		// 				clsname: "modifier_bloodseeker_thirst_vision",
		// 				options: {
		// 					duration: 3600,
		// 				}
		// 			}
		// 		}
		// 	}
		// },
		{
			name: 'warcry',
			description: 'Heartens allies for battle, increasing movement speed and armor.',
			cost: [50, 100, 150, 200],
			max: 4,
			type: ENCHANT_ONEQUIP,
			minimumHeroLevel: 1,
			setup: function(ent, name, level)
			{
				ent.enchants[name].base = dota.createAbility(enchanter.onEquipEnchantEntity, 'sven_warcry');

				ent.enchants[name].base.netprops.m_iLevel = level;

				var BONUS_ARMOR = 4;
				switch(level) {
					case 1:
						BONUS_ARMOR = 4;
						break;
					case 2:
						BONUS_ARMOR = 8;
						break;
					case 3:
						BONUS_ARMOR = 12;
						break;
					case 4:
						BONUS_ARMOR = 16;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					bonus_armor: BONUS_ARMOR,
					bonus_movespeed: 12
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: 'sven_warcry',
						clsname: 'modifier_sven_warcry',
						options: {
							duration: 3600
						}
					}
				}
				setNewModifier(ent, name);
			}
		},
		{
			name: 'surge',
			description: 'Charges you with power maintaining maximum movement speed and immunity to slow effects.',
			cost: [150],
			max: 1,
			type: ENCHANT_ONEQUIP,
			minimumHeroLevel: 1,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'dark_seer_surge';

				ent.enchants[name].base = dota.createAbility(enchanter.onEquipEnchantEntity, BASE_ABILITY);
				ent.enchants[name].base.netprops.m_iLevel = level;

				ent.enchants[name].props = {
					level: level
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_dark_seer_surge',
						options: {
							duration: 3600
						}
					}
				}
				setNewModifier(ent, name);
			}
		},
		// Invisibility
		{
			name: 'invis',
			description: 'Makes the wearer permanently invisible.',
			cost: [200, 225, 250],
			max: 3,
			type: ENCHANT_ONEQUIP,
			minimumHeroLevel: 1,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'riki_permanent_invisibility';

				ent.enchants[name].base = dota.createAbility(enchanter.onEquipEnchantEntity, BASE_ABILITY);
				ent.enchants[name].base.netprops.m_iLevel = level;

				var FADE_TIME = 3;
				switch(level)
				{
					default:
					case 1:
						FADE_TIME = 3;
						break;
					case 2:
						FADE_TIME = 2;
						break;
					case 3:
						FADE_TIME = 1;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					fade_delay: FADE_TIME + 's'
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_riki_permanent_invisibility',
						options: {
							duration: 3600
						}
					}
				}
				setNewModifier(ent, name);
			}
		},
		{
			name: 'sprite',
			description: 'A cloud of wisps heals you and any friendly units nearby.',
			cost: [150, 450, 750, 1050],
			max: 4,
			type: ENCHANT_ONEQUIP,
			minimumHeroLevel: 6,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'enchantress_natures_attendants';

				ent.enchants[name].base = dota.createAbility(enchanter.onEquipEnchantEntity, BASE_ABILITY);
				ent.enchants[name].base.netprops.m_iLevel = level;

				var WISP_COUNT = 3;
				switch(level)
				{
					default:
					case 1:
						WISP_COUNT = 3;
						break;
					case 2:
						WISP_COUNT = 5;
						break;
					case 3:
						WISP_COUNT = 7;
						break;
					case 4:
						WISP_COUNT = 9;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					wisp_count: WISP_COUNT
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_enchantress_natures_attendants',
						options: {
							duration: 3600
						}
					}
				}
				setNewModifier(ent, name);
			}
		},
		{
			name: 'firefly',
			description: 'Take to the skies, laying down a flaming trail from the air.',
			cost: [150, 450, 750, 1050],
			max: 4,
			type: ENCHANT_ONEQUIP,
			minimumHeroLevel: 6,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'batrider_firefly';

				ent.enchants[name].base = dota.createAbility(enchanter.onEquipEnchantEntity, BASE_ABILITY);
				ent.enchants[name].base.netprops.m_iLevel = level;

				var DOT = 20;
				switch(level)
				{
					default:
					case 1:
						DOT = 20;
						break;
					case 2:
						DOT = 40;
						break;
					case 3:
						DOT = 60;
						break;
					case 4:
						DOT = 80;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					damage_over_time: DOT
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_batrider_firefly',
						options: {
							duration: 3600
						}
					}
				}
				setNewModifier(ent, name);
			}
		},
		{
			name: 'spellshield',
			description: 'Increases your resistance to magic damage.',
			cost: [150, 450, 750, 1050],
			max: 4,
			type: ENCHANT_ONEQUIP,
			minimumHeroLevel: 1,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'antimage_spell_shield';

				ent.enchants[name].base = dota.createAbility(enchanter.onEquipEnchantEntity, BASE_ABILITY);
				ent.enchants[name].base.netprops.m_iLevel = level;

				var RESISTANCE = 26;
				switch(level)
				{
					default:
					case 1:
						RESISTANCE = 26;
						break;
					case 2:
						RESISTANCE = 34;
						break;
					case 3:
						RESISTANCE = 42;
						break;
					case 4:
						RESISTANCE = 50;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					spell_resistance: RESISTANCE + '%'
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_antimage_spell_shield',
						options: {
							duration: 3600
						}
					}
				}
				setNewModifier(ent, name);
			}
		},
		{
			name: 'ionshell',
			description: 'Surrounds you with a bristling shield that damages enemies in an area. ',
			cost: [150, 450, 750, 1050],
			max: 4,
			type: ENCHANT_ONEQUIP,
			minimumHeroLevel: 1,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'dark_seer_ion_shell';

				ent.enchants[name].base = dota.createAbility(enchanter.onEquipEnchantEntity, BASE_ABILITY);
				ent.enchants[name].base.netprops.m_iLevel = level;

				var DOT = 30;
				switch(level)
				{
					default:
					case 1:
						DOT = 30;
						break;
					case 2:
						DOT = 50;
						break;
					case 3:
						DOT = 70;
						break;
					case 4:
						DOT = 90;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					damage_per_second: DOT
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_dark_seer_ion_shell',
						options: {
							duration: 3600
						}
					}
				}
				setNewModifier(ent, name);
			}
		},
		{
			name: 'bloodlust',
			description: 'Incites a frenzy, increasing movement speed and attack speed.',
			cost: [150, 200, 250, 300],
			max: 4,
			type: ENCHANT_ONEQUIP,
			minimumHeroLevel: 1,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'ogre_magi_bloodlust';

				ent.enchants[name].base = dota.createAbility(enchanter.onEquipEnchantEntity, BASE_ABILITY);
				ent.enchants[name].base.netprops.m_iLevel = level;

				var BONUS_ATTACK_SPEED = 20;
				var BONUS_MOVEMENT_SPEED = 10;

				switch(level)
				{
					default:
					case 1:
						BONUS_ATTACK_SPEED = 20;
						BONUS_MOVEMENT_SPEED = 10;
						break;
					case 2:
						BONUS_ATTACK_SPEED = 30;
						BONUS_MOVEMENT_SPEED = 12;
						break;
					case 3:
						BONUS_ATTACK_SPEED = 40;
						BONUS_MOVEMENT_SPEED = 14;
						break;
					case 4:
						BONUS_ATTACK_SPEED = 50;
						BONUS_MOVEMENT_SPEED = 16;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					bonus_attack_speed: BONUS_ATTACK_SPEED,
					bonus_movespeed: BONUS_MOVEMENT_SPEED + '%'
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_ogre_magi_bloodlust',
						options: {
							duration: 3600
						}
					}
				}
				setNewModifier(ent, name);
			}
		},
		{
			name: 'brawler',
			description: 'Gives a chance to avoid attacks and deal critical damage.',
			cost: [300, 500, 700, 900],
			max: 4,
			type: ENCHANT_ONEQUIP,
			minimumHeroLevel: 1,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'brewmaster_drunken_brawler';

				ent.enchants[name].base = dota.createAbility(enchanter.onEquipEnchantEntity, BASE_ABILITY);
				ent.enchants[name].base.netprops.m_iLevel = level;

				var DODGE_CHANCE = 10;
				var CRITICAL_CHANCE = 10;

				switch(level)
				{
					default:
					case 1:
						DODGE_CHANCE = 10;
						CRITICAL_CHANCE = 10;
						break;
					case 2:
						DODGE_CHANCE = 15;
						CRITICAL_CHANCE = 15;
						break;
					case 3:
						DODGE_CHANCE = 20;
						CRITICAL_CHANCE = 20;
						break;
					case 4:
						DODGE_CHANCE = 25;
						CRITICAL_CHANCE = 25;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					dodge_chance: DODGE_CHANCE + '%',
					crit_chance: CRITICAL_CHANCE + '%'
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_brewmaster_drunken_brawler',
						options: {
							duration: 3600
						}
					}
				}
				setNewModifier(ent, name);
			}
		},
		{
			name: 'empower',
			description: 'Gives you bonus damage and cleave on attack.',
			cost: [300, 500, 700, 900],
			max: 4,
			type: ENCHANT_ONEQUIP,
			minimumHeroLevel: 1,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'magnataur_empower';

				ent.enchants[name].base = dota.createAbility(enchanter.onEquipEnchantEntity, BASE_ABILITY);
				ent.enchants[name].base.netprops.m_iLevel = level;

				var BONUS_DAMAGE = 20;
				var BONUS_CLEAVE = 20;

				switch(level)
				{
					default:
					case 1:
						BONUS_DAMAGE = 20;
						BONUS_CLEAVE = 20;
						break;
					case 2:
						BONUS_DAMAGE = 30;
						BONUS_CLEAVE = 30;
						break;
					case 3:
						BONUS_DAMAGE = 40;
						BONUS_CLEAVE = 40;
						break;
					case 4:
						BONUS_DAMAGE = 50;
						BONUS_CLEAVE = 50;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					bonus_damage: BONUS_DAMAGE + '%',
					bonus_cleave: BONUS_CLEAVE+ '%'
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_magnataur_empower',
						options: {
							duration: 3600
						}
					}
				}
				setNewModifier(ent, name);
			}
		},
		{
			name: 'unholy',
			description: 'Gives the wearer immense strength, at the cost of life.',
			cost: [500],
			max: 1,
			type: ENCHANT_ONEQUIP,
			minimumHeroLevel: 6,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'item_armlet';

				ent.enchants[name].base = dota.createAbility(enchanter.onEquipEnchantEntity, BASE_ABILITY);
				ent.enchants[name].base.netprops.m_iLevel = level;

				var BONUS_STRENGTH = 25;
				var BONUS_DAMAGE = 31;
				var BONUS_ATTACK_SPEED = 10;
				var HP_DRAIN = 40;

				ent.enchants[name].props = {
					level: level,
					bonus_strength: BONUS_STRENGTH,
					bonus_damage: BONUS_DAMAGE,
					bonus_attack_speed: BONUS_ATTACK_SPEED,
					hp_drain: HP_DRAIN
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_item_armlet_unholy_strength',
						options: {
							duration: 3600,
						}
					}
				}
				setNewModifier(ent, name);
			}
		},
		{
			name: 'enrage',
			description: 'Gain a percentage of current health as bonus damage.',
			cost: [500, 1000, 1500],
			max: 3,
			type: ENCHANT_ONEQUIP,
			minimumHeroLevel: 12,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'ursa_enrage';

				ent.enchants[name].base = dota.createAbility(enchanter.onEquipEnchantEntity, BASE_ABILITY);
				ent.enchants[name].base.netprops.m_iLevel = level;

				var MAX_HP_AS_DAMAGE = 5;

				switch(level)
				{
					case 1:
						MAX_HP_AS_DAMAGE = 5;
						break;
					case 2:
						MAX_HP_AS_DAMAGE = 6;
						break;
					case 3:
						MAX_HP_AS_DAMAGE = 7;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					health_as_damage: MAX_HP_AS_DAMAGE + '%'
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_ursa_enrage',
						options: {
							duration: 3600,
						}
					}
				}
				setNewModifier(ent, name);
			}
		},
		{
			name: 'backtrack',
			description: 'Jump backwards in time, eluding both physical and magical attacks.',
			cost: [150, 300, 750, 1000],
			max: 4,
			type: ENCHANT_ONEQUIP,
			minimumHeroLevel: 1,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'faceless_void_backtrack';

				ent.enchants[name].base = dota.createAbility(enchanter.onEquipEnchantEntity, BASE_ABILITY);
				ent.enchants[name].base.netprops.m_iLevel = level;

				var DODGE_CHANCE = 10;

				switch(level)
				{
					case 1:
						DODGE_CHANCE = 10;
						break;
					case 2:
						DODGE_CHANCE = 15;
						break;
					case 3:
						DODGE_CHANCE = 20;
						break;
					case 4:
						DODGE_CHANCE = 25;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					dodge_chance: DODGE_CHANCE + '%'
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_faceless_void_backtrack',
						options: {
							duration: 3600,
						}
					}
				}
				setNewModifier(ent, name);
			}
		},
		{
			name: 'vitality',
			description: 'Unlocks your regenerative power, with healing based on primary attribute.',
			cost: [150, 300, 450, 600],
			max: 4,
			type: ENCHANT_ONEQUIP,
			minimumHeroLevel: 1,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'huskar_inner_vitality';

				ent.enchants[name].base = dota.createAbility(enchanter.onEquipEnchantEntity, BASE_ABILITY);
				ent.enchants[name].base.netprops.m_iLevel = level;

				var HP_REGEN = 2;
				var ATTR_HEAL_AMOUNT = 5;
				var ATTR_HEAL_THRESH = 15;

				switch(level)
				{
					case 1:
						HP_REGEN = 2;
						ATTR_HEAL_AMOUNT = 5;
						ATTR_HEAL_THRESH = 15;
						break;
					case 2:
						HP_REGEN = 4;
						ATTR_HEAL_AMOUNT = 10;
						ATTR_HEAL_THRESH = 30;
						break;
					case 3:
						HP_REGEN = 6;
						ATTR_HEAL_AMOUNT = 15;
						ATTR_HEAL_THRESH = 45;
						break;
					case 4:
						HP_REGEN = 8;
						ATTR_HEAL_AMOUNT = 20;
						ATTR_HEAL_THRESH = 60;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					hp_regen: HP_REGEN,
					heal_amount: ATTR_HEAL_AMOUNT + '%',
					below_40_threshold: ATTR_HEAL_THRESH + '%'
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_huskar_inner_vitality',
						options: {
							duration: 3600,
						}
					}
				}
				setNewModifier(ent, name);
			}
		},
		{
			name: 'manashield',
			description: 'Creates a shield that absorbs 50% of incoming damage by using your mana pool.',
			cost: [150, 300, 450, 600],
			max: 4,
			type: ENCHANT_ONEQUIP,
			minimumHeroLevel: 1,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'medusa_mana_shield';

				ent.enchants[name].base = dota.createAbility(enchanter.onEquipEnchantEntity, BASE_ABILITY);
				ent.enchants[name].base.netprops.m_iLevel = level;

				var DAMAGE_PER_MANA = 0.75;

				switch(level)
				{
					case 1:
						DAMAGE_PER_MANA = 0.75;
						break;
					case 2:
						DAMAGE_PER_MANA = 1.25;
						break;
					case 3:
						DAMAGE_PER_MANA = 1.75;
						break;
					case 4:
						DAMAGE_PER_MANA = 2.25;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					damage_per_mana: DAMAGE_PER_MANA
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_medusa_mana_shield',
						options: {
							duration: 3600,
						}
					}
				}
				setNewModifier(ent, name);
			}
		},
		{
			name: 'corrosive',
			description: 'Exudes an infectious toxin that damages and slows any enemy that hurts you.',
			cost: [150, 300, 450, 600],
			max: 4,
			type: ENCHANT_ONEQUIP,
			minimumHeroLevel: 1,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'viper_corrosive_skin';

				ent.enchants[name].base = dota.createAbility(enchanter.onEquipEnchantEntity, BASE_ABILITY);
				ent.enchants[name].base.netprops.m_iLevel = level;

				var ATTK_MOVE_SLOW = 10;
				var DPS = 10;
				var SPELL_RESIST = 10;

				switch(level)
				{
					case 1:
						ATTK_MOVE_SLOW = 10;
						DPS = 10;
						SPELL_RESIST = 10;
						break;
					case 2:
						ATTK_MOVE_SLOW = 15;
						DPS = 15;
						SPELL_RESIST = 15;
						break;
					case 3:
						ATTK_MOVE_SLOW = 20;
						DPS = 20;
						SPELL_RESIST = 20;
						break;
					case 4:
						ATTK_MOVE_SLOW = 25;
						DPS = 25;
						SPELL_RESIST = 25;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					attk_move_slow: ATTK_MOVE_SLOW,
					damage_per_second: DPS,
					spell_resistance: SPELL_RESIST
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_viper_corrosive_skin',
						options: {
							duration: 3600,
						}
					}
				}
				setNewModifier(ent, name);
			}
		},
		{
			name: 'juxtapose',
			description: 'Attacks have a chance to create illusions to confuse enemies.',
			cost: [100, 200, 300, 400],
			max: 4,
			type: ENCHANT_ONEQUIP,
			minimumHeroLevel: 1,
			setup: function(ent, name, level)
			{
				var BASE_ABILITY = 'phantom_lancer_juxtapose';

				ent.enchants[name].base = dota.createAbility(enchanter.onEquipEnchantEntity, BASE_ABILITY);
				ent.enchants[name].base.netprops.m_iLevel = level;

				var ILLUSION_COUNT = 2;

				switch(level)
				{
					case 1:
						ILLUSION_COUNT = 2;
						break;
					case 2:
						ILLUSION_COUNT = 4;
						break;
					case 3:
						ILLUSION_COUNT = 6;
						break;
					case 4:
						ILLUSION_COUNT = 8;
						break;
				}

				ent.enchants[name].props = {
					level: level,
					max_illusion: ILLUSION_COUNT
				}

				ent.enchants[name].modifiers = {
					1: {
						ref: BASE_ABILITY,
						clsname: 'modifier_phantom_lancer_juxtapose',
						options: {
							duration: 3600,
						}
					}
				}
				setNewModifier(ent, name);
			}
		}
		// {
		// 	name: 'degen',
		// 	desc: 'Enemies around the wearer feel slower.',
		// 	minlevel: 1,
		// 	spell: 'omniknight_degen_aura',
		// 	level: 1,
		// 	setup: function(ent, name, level) {
		// 		ent = createProps(ent, ENCHANT_CONSTANT, name);

		// 		ent[ENCHANT_CONSTANT][name].props = {
		// 			level: level
		// 		}
				
		// 		ent[ENCHANT_CONSTANT][name].modifiers = {
		// 			1: {
		// 				ref: "omniknight_degen_aura",
		// 				clsname: "modifier_omniknight_degen_aura",
		// 				options: {
		// 					duration: 3600
		// 				}
		// 			}
		// 		}
		// 	}
		// },
	)
};

var saved = [];
game.hook('Dota_OnGetAbilityValue', onGetAbilityValue);
function onGetAbilityValue(ent, name, field, values) {
	// Check for custom values
	if (saved.indexOf(name+'.'+field) === -1)
		saved.push(name+'.'+field)
	else
		return;

	server.print(name+'.'+field);
	
}

var enchMapOnEquipNames = [];
for (var en = 0; en < enchantMap.onEquip.length; ++en) {
	var enchant = enchantMap.onEquip[en];
	if (enchant.name) {
		enchMapOnEquipNames.push(enchant.name);
	}
}
var enchMapOnHitNames = [];
for (var en = 0; en < enchantMap.onHit.length; ++en) {
	var enchant = enchantMap.onHit[en];
	if (enchant.name) {
		enchMapOnHitNames.push(enchant.name);
	}
}

timers.setInterval(function() {
	// Has the map & plugin initialized?
	if (!settings.mapLoaded || !settings.pluginLoaded) return;
	// Has the game begun?
	if (!util.getGameState(dota.STATE_GAME_IN_PROGRESS)) return;
	// Get playing players
	var playerIDs = playerManager.getConnectedPlayerIDs();
	if (playerIDs.length === 0) return;
	// Loop through the players
	for (var idx = 0; idx < playerIDs.length; ++idx) {
		var playerID = playerIDs[idx];
		// Do we have a hero?
		var hero = playerManager.grabHero(playerID);
		if (hero === null) continue; // Skip
		// Pull hero inventories
		var equipment = unitManager.pullHeroInventory(hero, 0);
		if (equipment.length === 0) continue; // Skip

		var currEquipment = [];

	    // Loop through active equipment & find removed previous
	    if (props[playerID].lastEquipment.length > 0) {
		    for (var i = 0; i < equipment.length; ++i)
		    {
		    	var index = equipment[i];
		    	if (props[playerID].lastEquipment.indexOf(index) > -1) {
		    		// Exists, remove it from the array
		    		props[playerID].lastEquipment.splice(props[playerID].lastEquipment.indexOf(index), 1);
		    	}
		    }
		   	if (props[playerID].lastEquipment.length > 0) {
		   		// Found items that weren't there before
		   		// Pull the previous entities, find their modifiers, and remove them
			    for (var i = 0; i < props[playerID].lastEquipment.length; ++i) {
			    	var ent = props[playerID].lastEquipment[i];
			    	if (!ent || ent == null) continue; // Skip
			    	if (ent.enchants) {
				        // Look at what type of enchants exist
				        for (var e = 0; e < enchMapOnEquipNames.length; ++e) {
				        	// If an enchant exists on this equipment piece
				        	if ( ent.enchants[enchMapOnEquipNames[e]] ) {
				        		var name = enchMapOnEquipNames[e];
				        		var enchName = ent.enchants[enchMapOnEquipNames[e]];
				                // Find our enchantment modifiers
								for (var value in enchName.modifiers) {
				                    if (!util.isNumber(value)) continue; // Skip 'clone' ??

									var modifier = enchName.modifiers[value];

									if (dota.hasModifier(hero, modifier.clsname)) {
										dota.removeModifier(hero, modifier.clsname);
									}
								}
				        	}
				        }
			    	}
			    }
			}
		}
	    // Loop through active equipment & apply new effects
	    for (var i = 0; i < equipment.length; ++i)
	    {
	    	// onEquip items are the enchants that require constant checking
	    	if (equipment[i].enchants) {
		    	var index = equipment[i];
		    	currEquipment.push(index);
		    	var item = equipment[i];
		        // Look at what type of enchants exist
		        for (var e = 0; e < enchMapOnEquipNames.length; ++e) {
		        	// If an enchant exists on this equipment piece
		        	if ( item.enchants[enchMapOnEquipNames[e]] ) {
		        		var name = enchMapOnEquipNames[e];
		        		var enchName = item.enchants[enchMapOnEquipNames[e]];
		                // Find our enchantment modifiers
						for (var value in enchName.modifiers) {
		                    if (!util.isNumber(value)) continue; // Skip 'clone' ??
							var modifier = enchName.modifiers[value];
							if (dota.hasModifier(hero, modifier.clsname))
								continue;

			                dota.addNewModifier(hero, enchName.base, modifier.clsname, modifier.ref, modifier.options);
						}
		        	}
		        }
	    	}
	    }
	    props[playerID].lastEquipment = currEquipment;
	}
}, 100);

// ==========================================
// Functions
// ==========================================
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

var props = playerManager.getProps();

function clearEnchantments(sourcePlayerID, targetEntityID, enchantmentName, key, timeout) {
	timers.setTimeout(function() {
		props[sourcePlayerID].enchantTimeouts[targetEntityID][enchantmentName][key] = 0;
	}, timeout * 1000);
}



// ==========================================
// Game Hooks
// ==========================================
game.hook('Dota_OnGetAbilityValue', onGetAbilityValue);
function onGetAbilityValue(ent, name, field, values) {
	// // Check for custom values
	// if(modValues) {
	// 	if(modValues[field] != null) {
	// 		// Mod the value
	// 		values[0] = modValues[field];
			
	// 		// Do the change
	// 		return values;
	// 	} else {
	// 		server.print('MISSED FIELD '+field);
	// 	}
	// }
}

game.hookEvent("entity_hurt", onEntityHurt);
function onEntityHurt(event) {
	if (enchanter.enabled) {
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
		if (!unitManager.isPlayerHero(sourceEntity) || !unitManager.isPlayerHero(targetEntity))
			return;

		var sourcePlayerID = sourceEntity.netprops.m_iPlayerID;
		var targetPlayerID = targetEntity.netprops.m_iPlayerID;

		var sourceClient = dota.findClientByPlayerID(sourcePlayerID);
		var targetClient = dota.findClientByPlayerID(sourcePlayerID);

		// Let's do work.
		var source = sourceEntity;
		var target = targetEntity;

		var enchMap = enchants.enchantMap.onHit;

		// Initialize a new chain of modifier
		var chain = new TimeoutChain();

		// Pull our hero equipment
		var hero = sourceEntity;
		var equipment = unitManager.pullHeroInventory(hero, 0);

		var appliedTypes = [];

		var props = playerManager.getProps();

	    // Loop through active equipment
	    for ( var i = 0; i < equipment.length; ++i )
	    {
	    	var ent = equipment[i];
	    	// Does this item have enchantments?
	    	if (ent.enchants)
	    	{
	    		// Loop through the enchants and discover which ones exist
				for (var en = 0; en < enchantMap.onHit.length; ++en) {
					var entry = enchantMap.onHit[en];
					// Found an enchant
					if (ent.enchants[entry.name])
					{
						server.print("Found " + entry.name);
						var name = entry.name;

						if (appliedTypes.indexOf(name) > -1) continue; // Already applied, skip

						var enchant = ent.enchants[name];
						var applied = false;

		                // Initialize enchantment timeouts
		                if ( !props[sourcePlayerID].enchantTimeouts[targetEntityID] )
		                    props[sourcePlayerID].enchantTimeouts[targetEntityID] = {};

		                // Initialize enchantment timeouts
		                if ( !props[sourcePlayerID].enchantTimeouts[targetEntityID][name] )
		                    props[sourcePlayerID].enchantTimeouts[targetEntityID][name] = {};

		                // Find our enchantment modifiers
						for (var value in enchant.modifiers)
						{
		                    // Skip 'clone' ??
		                    if (!util.isNumber(value)) continue;
							var modifier = enchant.modifiers[value];

							if (dota.hasModifier(target, modifier.clsname)) continue;

		                    // Let's see if we have a timeoutDelay
		                    if (modifier.timeout > 0)
		                    {
		                        if (!props[sourcePlayerID].enchantTimeouts[targetEntityID][name][value])
		                            props[sourcePlayerID].enchantTimeouts[targetEntityID][name][value] = 0;

		                        if (props[sourcePlayerID].enchantTimeouts[targetEntityID][name][value] === 1) {
		                        	if (DEBUG) server.print('Still in timeout');
		                            continue;
		                        }
		                        else {
		                            props[sourcePlayerID].enchantTimeouts[targetEntityID][name][value] = 1;

		                            // This will make a new copy of each thing, such that it wont be updated by the loop:
		                            clearEnchantments(sourcePlayerID, targetEntityID, name, value, modifier.timeout);

		                            if (DEBUG) server.print('Next Frame Step: Applying Modifier');

		                             // Apply the modifier
		                            applyModifier(target, enchant.base, modifier.clsname, modifier.ref, modifier.options);

		                            if (enchant.sound) {
		                            	if (sourceClient) {
											dota.sendAudio(sourceClient, false, ench.sound);
										}
		                            }
		                            applied = true;
		                       		if (DEBUG) server.print('Finished Frame Step: Applying Modifier');
		                        }
		                    }
		                    else {
			                    if (modifier.proc > 0) {
			                    	if (util.getRandomNumberExcludeZero(100) <= modifier.proc) {
			                    		applyModifier(target, enchant.base, modifier.clsname, modifier.ref, modifier.options);
			                            if (enchant.sound) {
			                            	if (sourceClient) {
												dota.sendAudio(sourceClient, false, ench.sound);
											}
			                            }
			                            applied = true;
			                    	}
			                    }
		                    	else {
		                    		applyModifier(target, enchant.base, modifier.clsname, modifier.ref, modifier.options);
		                            if (enchant.sound) {
		                            	if (sourceClient) {
											dota.sendAudio(sourceClient, false, ench.sound);
										}
		                            }
		                            applied = true;
		                    	}
		                    }

		                    if (applied) appliedTypes.push(name);

							if (DEBUG & applied) server.print('Applied modifiers');
						}


					}
				}
	    	}
	    }
	}
}

function applyModifier(target, base, clsname, ref, options) {
	dota.addNewModifier( target, base, clsname, ref, options );
}

function getMap() {
	return enchantMap;
}

// ==========================================
// Exports
// ==========================================
exports.enchantMap = enchantMap;
exports.getMap = getMap;