var ENCHANT_ONHIT = 'onHit';
var ENCHANT_CONSTANT = 'constant';

exports.enchantMap = {
	onHit: new Array(
		// FREEZE
		{
			name: 'timestop',
			desc: 'Freezes the opponent in time for a short duration.',
			spell: 'faceless_void_chronosphere',
			level: 3,
			setup: function(ent, name, level) {
				if(!ent[ENCHANT_ONHIT])
				{
					ent[ENCHANT_ONHIT] = {};
				}
				if(!ent[ENCHANT_ONHIT][name])
				{
					ent[ENCHANT_ONHIT][name] = {};

					var EFFECT_DURATION = 1;
					var EFFECT_TIMEOUT = 0;
					var EFFECT_PROC = 10;

					switch(level)
					{
						default:
						case 1:
							EFFECT_DURATION = 1.0;
							EFFECT_PROC = 10;
							break;
						case 2:
							EFFECT_DURATION = 1.2;
							EFFECT_PROC = 15;
							break;
						case 3:
							EFFECT_DURATION = 1.4;
							EFFECT_PROC = 20;
							break;
						case 4:
							EFFECT_DURATION = 1.6;
							EFFECT_PROC = 25;
							break;

					}

					ent[ENCHANT_ONHIT][name].sound = 'weapons/hero/faceless_void/faceless_void_timelockimpact.wav';
					ent[ENCHANT_ONHIT][name].props = {
						level: level,
						duration: EFFECT_DURATION,
						timeout: EFFECT_TIMEOUT,
						proc: EFFECT_PROC,
					}
					ent[ENCHANT_ONHIT][name].modifiers = {
						1: {
							ref: 'faceless_void_chronosphere',
							clsname: 'modifier_faceless_void_chronosphere_freeze',
							options: {
								duration: EFFECT_DURATION
							},
							timeout: EFFECT_TIMEOUT,
							proc: EFFECT_PROC,
							chainDelay: 1.2
						}
					}
				}
			}
		},
		// FORCE PUSH
		{
			name: 'forcepush',
			desc: 'Pushes an opponent with great force.',
			spell: 'item_force_staff',
			level: 0,
			setup: function(ent, name, level) {
				if(!ent[ENCHANT_ONHIT])
				{
					ent[ENCHANT_ONHIT] = {};
				}
				if(!ent[ENCHANT_ONHIT][name])
				{
					ent[ENCHANT_ONHIT][name] = {};

					var EFFECT_DURATION = 3;
					var EFFECT_TIMEOUT = 0;
					var EFFECT_PROC = 10;
					var PUSH_LENGTH = 600;

					switch(level)
					{
						default:
						case 1:
							PUSH_LENGTH = 600;
							EFFECT_PROC = 10;
							break;
						case 2:
							PUSH_LENGTH = 800;
							EFFECT_PROC = 15;
							break;
						case 3:
							PUSH_LENGTH= 1000;
							EFFECT_PROC = 20;
							break;
						case 4:
							PUSH_LENGTH = 1200;
							EFFECT_PROC = 25;
							break;

					}

					ent[ENCHANT_ONHIT][name].sound = 'items/force_staff.wav';
					ent[ENCHANT_ONHIT][name].props = {
						level: level,
						duration: EFFECT_DURATION,
						timeout: EFFECT_TIMEOUT,
						proc: EFFECT_PROC,
						push_length: PUSH_LENGTH
					}
					ent[ENCHANT_ONHIT][name].modifiers = {
						1: {
							ref: 'item_force_staff',
							clsname: 'modifier_item_forcestaff_active',
							options: {
								push_length: PUSH_LENGTH
							},
							timeout: EFFECT_TIMEOUT,
							proc: EFFECT_PROC,
							chainDelay: 0
						}
					}
				}
			}
		},
		{
			name: 'blind',
			desc: 'Makes the opponent miss autoattacks.',
			spell: 'tinker_laser',
			level: 2,
			setup: function(ent, name, level) {
				if(!ent[ENCHANT_ONHIT])
				{
					ent[ENCHANT_ONHIT] = {};
				}
				if(!ent[ENCHANT_ONHIT][name])
				{
					ent[ENCHANT_ONHIT][name] = {};

					var EFFECT_DURATION = 3;
					var EFFECT_TIMEOUT = 0;
					var EFFECT_PROC = 15;

					switch(level)
					{
						default:
						case 1:
							EFFECT_DURATION = 3;
							break;
						case 2:
							EFFECT_DURATION = 4;
							break;
						case 3:
							EFFECT_DURATION = 5;
							break;
						case 4:
							EFFECT_DURATION = 6;
							break;

					}

					ent[ENCHANT_ONHIT][name].sound = 'weapons/hero/tinker/laser_impact.wav';
					ent[ENCHANT_ONHIT][name].props = {
						level: level,
						duration: EFFECT_DURATION,
						timeout: EFFECT_TIMEOUT,
						proc: EFFECT_PROC
					}
					ent[ENCHANT_ONHIT][name].modifiers = {
						1: {
							ref: 'tinker_laser',
							clsname: 'modifier_tinker_laser_blind',
							options: {
								duration: EFFECT_DURATION
							},
							timeout: EFFECT_TIMEOUT,
							proc: EFFECT_PROC,
							chainDelay: 0
						}
					}
				}
			}
		},
		{
			name: 'rust',
			desc: 'Lower the opponents armor.',
			spell: 'vengefulspirit_wave_of_terror',
			level: 4,
			setup: function(ent, name, level) {
				if(!ent[ENCHANT_ONHIT])
				{
					ent[ENCHANT_ONHIT] = {};
				}
				if(!ent[ENCHANT_ONHIT][name])
				{
					ent[ENCHANT_ONHIT][name] = {};

					var EFFECT_DURATION = 20;
					var EFFECT_TIMEOUT = 15;
					var EFFECT_PROC = 0;

					switch(level)
					{
						default:
						case 1:
							EFFECT_DURATION = 20;
							break;
						case 2:
							EFFECT_DURATION = 22;
							break;
						case 3:
							EFFECT_DURATION = 24;
							break;
						case 4:
							EFFECT_DURATION = 26;
							break;

					}

					ent[ENCHANT_ONHIT][name].sound = 'weapons/hero/vengeful_spirit/wave_of_terror.wav';
					ent[ENCHANT_ONHIT][name].props = {
						level: level,
						duration: EFFECT_DURATION,
						timeout: EFFECT_TIMEOUT,
						proc: EFFECT_PROC
					}
					ent[ENCHANT_ONHIT][name].modifiers = {
						1: {
							ref: 'vengefulspirit_wave_of_terror',
							clsname: 'modifier_vengefulspirit_wave_of_terror',
							options: {
								duration: EFFECT_DURATION
							},
							timeout: EFFECT_TIMEOUT,
							proc: EFFECT_PROC,
							chainDelay: 0
						}
					}
				}
			}
		},
		// Silence
		{
			name: 'silence',
			desc: 'Silences the opponent.',
			spell: 'item_orchid',
			level: 0,
			setup: function(ent, name, level) {
				if(!ent[ENCHANT_ONHIT])
				{
					ent[ENCHANT_ONHIT] = {};
				}
				if(!ent[ENCHANT_ONHIT][name])
				{
					ent[ENCHANT_ONHIT][name] = {};

					var EFFECT_DURATION = 5;
					var EFFECT_TIMEOUT = 18;
					var EFFECT_PROC = 0;

					switch(level)
					{
						default:
						case 1:
							EFFECT_DURATION = 5.25;
							break;
						case 2:
							EFFECT_DURATION = 5.50;
							break;
						case 3:
							EFFECT_DURATION = 5.75;
							break;
						case 4:
							EFFECT_DURATION = 6;
							break;

					}

					ent[ENCHANT_ONHIT][name].sound = 'items/orchid.wav';
					ent[ENCHANT_ONHIT][name].props = {
						level: level,
						duration: EFFECT_DURATION,
						timeout: EFFECT_TIMEOUT,
						proc: EFFECT_PROC
					}
					ent[ENCHANT_ONHIT][name].modifiers = {
						1: {
							ref: 'item_orchid',
							clsname: 'modifier_orchid_malevolence_debuff',
							options: {
								duration: EFFECT_DURATION
							},
							timeout: EFFECT_TIMEOUT,
							proc: EFFECT_PROC,
							chainDelay: 0
						}
					}
				}
			}
		},
		// Sheepstick
		{
			name: 'sheepstick',
			desc: 'Turns the opponent into a helpless pig.',
			spell: 'item_sheepstick',
			level: 0,
			setup: function(ent, name, level) {
				if(!ent[ENCHANT_ONHIT])
				{
					ent[ENCHANT_ONHIT] = {};
				}
				if(!ent[ENCHANT_ONHIT][name])
				{
					ent[ENCHANT_ONHIT][name] = {};

					var EFFECT_DURATION = 3.5;
					var EFFECT_TIMEOUT = 35;
					var EFFECT_PROC = 0;

					switch(level)
					{
						default:
						case 1:
							EFFECT_DURATION = 3.5;
							break;
						case 2:
							EFFECT_DURATION = 3.75;
							break;
						case 3:
							EFFECT_DURATION = 4.0;
							break;
						case 4:
							EFFECT_DURATION = 4.25;
							break;

					}

					ent[ENCHANT_ONHIT][name].sound = null;
					ent[ENCHANT_ONHIT][name].props = {
						level: level,
						duration: EFFECT_DURATION,
						timeout: EFFECT_TIMEOUT,
						proc: EFFECT_PROC
					}
					ent[ENCHANT_ONHIT][name].modifiers = {
						1: {
							ref: 'item_sheepstick',
							clsname: 'modifier_sheepstick_debuff',
							options: {
								duration: EFFECT_DURATION
							},
							timeout: EFFECT_TIMEOUT,
							proc:  EFFECT_PROC,
							chainDelay: 0
						}
					}
				}
			}
		},
		// FREEZE
		{
			name: 'freeze',
			desc: 'Freezes the opponent in place for a short duration.',
			spell: 'crystal_maiden_frostbite',
			level: 0,
			setup: function(ent, name, level) {
				if(!ent[ENCHANT_ONHIT])
				{
					ent[ENCHANT_ONHIT] = {};
				}
				if(!ent[ENCHANT_ONHIT][name])
				{
					ent[ENCHANT_ONHIT][name] = {};

					var EFFECT_DURATION = 1.5;
					var EFFECT_TIMEOUT = 10;
					var EFFECT_PROC = 0;

					switch(level)
					{
						default:
						case 1:
							EFFECT_DURATION = 1.5;
							break;
						case 2:
							EFFECT_DURATION = 2;
							break;
						case 3:
							EFFECT_DURATION = 2.5;
							break;
						case 4:
							EFFECT_DURATION = 3;
							break;

					}

					ent[ENCHANT_ONHIT][name].sound = 'weapons/hero/crystal_maiden/frostbite.wav';
					ent[ENCHANT_ONHIT][name].props = {
						level: level,
						duration: EFFECT_DURATION,
						timeout: EFFECT_TIMEOUT,
						proc: EFFECT_PROC
					}
					ent[ENCHANT_ONHIT][name].modifiers = {
						1: {
							ref: 'crystal_maiden_frostbite',
							clsname: 'modifier_crystal_maiden_frostbite',
							options: {
								duration: EFFECT_DURATION
							},
							timeout: EFFECT_TIMEOUT,
							proc: EFFECT_PROC,
							chainDelay: 0
						}
					}
				}
			}
		},
		{
			name: 'slow',
			desc: 'Slows the opponent for a short duration.',
			spell: 'item_diffusal_blade',
			level: 0,
			setup: function(ent, name, level) {
				if(!ent[ENCHANT_ONHIT])
				{
					ent[ENCHANT_ONHIT] = {};
				}
				if(!ent[ENCHANT_ONHIT][name])
				{
					ent[ENCHANT_ONHIT][name] = {};

					var EFFECT_DURATION = 4;
					var EFFECT_TIMEOUT = 8;
					var EFFECT_PROC = 0;

					switch(level)
					{
						default:
						case 1:
							EFFECT_DURATION = 4;
							EFFECT_TIMEOUT = 8;
							break;
						case 2:
							EFFECT_DURATION = 5;
							EFFECT_TIMEOUT = 9;
							break;
						case 3:
							EFFECT_DURATION = 6;
							EFFECT_TIMEOUT = 10;
							break;
						case 4:
							EFFECT_DURATION = 7;
							EFFECT_TIMEOUT = 11;
							break;

					}

					ent[ENCHANT_ONHIT][name].sound = 'items/item_diffusalblade.wav';
					ent[ENCHANT_ONHIT][name].props = {
						level: level,
						duration: EFFECT_DURATION,
						timeout: EFFECT_TIMEOUT,
						proc: EFFECT_PROC
					}
					ent[ENCHANT_ONHIT][name].modifiers = {
						1: {
							ref: 'item_diffusal_blade',
							clsname: 'modifier_item_diffusal_blade_slow',
							options: {
								duration: EFFECT_DURATION
							},
							timeout: EFFECT_TIMEOUT,
							proc: EFFECT_PROC,
							chainDelay: 0
						}
					}
				}
			}
		},
		{
			name: 'weaken',
			desc: 'Weakens the opponents damage.',
			spell: 'bane_enfeeble',
			level: 4,
			setup: function(ent, name, level) {
				if(!ent[ENCHANT_ONHIT])
				{
					ent[ENCHANT_ONHIT] = {};
				}
				if(!ent[ENCHANT_ONHIT][name])
				{
					ent[ENCHANT_ONHIT][name] = {};

					var EFFECT_DURATION = 10;
					var EFFECT_TIMEOUT = 15;
					var EFFECT_PROC = 0;

					switch(level)
					{
						default:
						case 1:
							EFFECT_DURATION = 10;
							break;
						case 2:
							EFFECT_DURATION = 10;
							break;
						case 3:
							EFFECT_DURATION = 15;
							break;
						case 4:
							EFFECT_DURATION = 20;
							break;
					}

					ent[ENCHANT_ONHIT][name].sound = 'weapons/hero/bane/enfeeble.wav';
					ent[ENCHANT_ONHIT][name].props = {
						level: level,
						duration: EFFECT_DURATION,
						timeout: EFFECT_TIMEOUT,
						proc: EFFECT_PROC
					}
					ent[ENCHANT_ONHIT][name].modifiers = {
						1: {
							ref: 'bane_enfeeble',
							clsname: 'modifier_bane_enfeeble',
							options: {
								duration: EFFECT_DURATION
							},
							timeout: EFFECT_TIMEOUT,
							proc: EFFECT_PROC,
							chainDelay: 0
						}
					}
				}
			}
		}
	),
	// ALWAYS ON WHEN EQUIPPED
	constant: new Array(
		{
			name: 'haste',
			desc: 'Wearer has a constant haste buff.',
			spell: 'lycan_shapeshift',
			level: 1,
			setup: function(ent, name, level) {
				if(!ent[ENCHANT_CONSTANT])
				{
					ent[ENCHANT_CONSTANT] = {};
				}
				if(!ent[ENCHANT_CONSTANT][name])
				{
					ent[ENCHANT_CONSTANT][name] = {};

					var EFFECT_SPEED = 250;

					switch(level)
					{
						default:
						case 1:
							EFFECT_SPEED = 250;
							break;
						case 2:
							EFFECT_SPEED = 300;
							break;
						case 3:
							EFFECT_SPEED = 350;
							break;
						case 4:
							EFFECT_SPEED = 400;
							break;
					}

					ent[ENCHANT_CONSTANT][name].props = {
						level: level,
						speed: EFFECT_SPEED
					}

					ent[ENCHANT_CONSTANT][name].modifiers = {
						1: {
							ref: "lycan_shapeshift",
							clsname: "modifier_lycan_shapeshift_speed",
							options: {
								duration: 5,
								speed: EFFECT_SPEED
							}
						}
					}
				}
			}
		},
		{
			name: 'bloodthirst',
			desc: 'Wearer can see hurt enemies.',
			spell: 'bloodseeker_thirst',
			level: 4,
			setup: function(ent, name, level) {
				if(!ent[ENCHANT_CONSTANT])
				{
					ent[ENCHANT_CONSTANT] = {};
				}
				if(!ent[ENCHANT_CONSTANT][name])
				{
					ent[ENCHANT_CONSTANT][name] = {};

					var EFFECT_SPEED = 250;

					switch(level)
					{
						default:
						case 1:
							EFFECT_SPEED = 250;
							break;
						case 2:
							EFFECT_SPEED = 300;
							break;
						case 3:
							EFFECT_SPEED = 350;
							break;
						case 4:
							EFFECT_SPEED = 400;
							break;
					}

					ent[ENCHANT_CONSTANT][name].props = {
						level: level,
						speed: EFFECT_SPEED
					}

					ent[ENCHANT_CONSTANT][name].modifiers = {
						1: {
							ref: "bloodseeker_thirst",
							clsname: "modifier_bloodseeker_thirst",
							options: {
								duration: 5,
							}
						},
						2: {
							ref: "bloodseeker_thirst",
							clsname: "modifier_bloodseeker_thirst_speed",
							options: {
								duration: 5,
								speed: EFFECT_SPEED
							}
						},
						3: {
							ref: "bloodseeker_thirst",
							clsname: "modifier_bloodseeker_thirst_vision",
							options: {
								duration: 5,
							}
						}
					}
				}
			}
		},
		{
			name: 'warcry',
			desc: 'Wearer has increased armor and movespeed.',
			spell: 'sven_warcry',
			level: 3,
			setup: function(ent, name, level) {
				if(!ent[ENCHANT_CONSTANT])
				{
					ent[ENCHANT_CONSTANT] = {};
				}
				if(!ent[ENCHANT_CONSTANT][name])
				{
					ent[ENCHANT_CONSTANT][name] = {};

					ent[ENCHANT_CONSTANT][name].props = {
						level: level
					}

					ent[ENCHANT_CONSTANT][name].modifiers = {
						1: {
							ref: "crystal_maiden_freezing_field",
							clsname: "modifier_sven_warcry",
							options: {
								duration: 5,
							}
						}
					}
				}
			}
		},
		// {
		// 	name: 'icestorm',
		// 	desc: 'Wearer has a constant haste buff.',
		// 	spell: 'crystal_maiden_freezing_field',
		// 	level: 3,
		// 	setup: function(ent, name, level) {
		// 		// Grab the stat modifier
		// 		if(!ent[name])
		// 		{
		// 			ent[name] = {};
		// 			ent[name].modifiers = {
		// 				1: {
		// 					ref: "crystal_maiden_freezing_field",
		// 					clsname: "modifier_crystal_maiden_freezing_field",
		// 					options: {
		// 						duration: 5,
		// 					}
		// 				}
		// 			}
		// 		}
		// 	}
		// },
		// {
		// 	name: 'storm',
		// 	desc: 'Wearer has a constant haste buff.',
		// 	spell: 'razor_eye_of_the_storm',
		// 	level: 1,
		// 	setup: function(ent, name, level) {
		// 		// Grab the stat modifier
		// 		if(!ent[name])
		// 		{
		// 			ent[name] = {};
		// 			ent[name].modifiers = {
		// 				1: {
		// 					ref: "razor_eye_of_the_storm",
		// 					clsname: "modifier_razor_eye_of_the_storm",
		// 					options: {
		// 						duration: 5,
		// 					}
		// 				}
		// 			}
		// 		}
		// 	}
		// },
		{
			name: 'surge',
			desc: 'Wearer has is constantly surging.',
			spell: 'dark_seer_surge',
			level: 4,
			setup: function(ent, name, level) {
				if(!ent[ENCHANT_CONSTANT])
				{
					ent[ENCHANT_CONSTANT] = {};
				}
				if(!ent[ENCHANT_CONSTANT][name])
				{
					ent[ENCHANT_CONSTANT][name] = {};

					var EFFECT_SPEED = 250;

					switch(level)
					{
						default:
						case 1:
							EFFECT_SPEED = 250;
							break;
						case 2:
							EFFECT_SPEED = 300;
							break;
						case 3:
							EFFECT_SPEED = 350;
							break;
						case 4:
							EFFECT_SPEED = 400;
							break;
					}

					ent[ENCHANT_CONSTANT][name].props = {
						level: level,
						speed: EFFECT_SPEED
					}

					ent[ENCHANT_CONSTANT][name].modifiers = {
						1: {
							ref: "dark_seer_surge",
							clsname: "modifier_dark_seer_surge",
							options: {
								duration: 5,
								speed: 500
							}
						}
					}
				}
			}
		},
		// Invisibility
		{
			name: 'invisibility',
			desc: 'Makes the wearer permanently invisible.',
			spell: 'riki_permanent_invisibility',
			level: 2,
			setup: function(ent, name, level) {
				if(!ent[ENCHANT_CONSTANT])
				{
					ent[ENCHANT_CONSTANT] = {};
				}
				if(!ent[ENCHANT_CONSTANT][name])
				{
					ent[ENCHANT_CONSTANT][name] = {};

					ent[ENCHANT_CONSTANT][name].props = {
						level: level
					}

					ent[ENCHANT_CONSTANT][name].modifiers = {
						1: {
							ref: "riki_permanent_invisibility",
							clsname: "modifier_riki_permanent_invisibility",
							options: {
								duration: 5
							}
						}
					}
				}
			}
		},
		{
			name: 'spriteheal',
			desc: 'Forest creatures heal the wearer.',
			spell: 'enchantress_natures_attendants',
			level: 3,
			setup: function(ent, name, level) {
				if(!ent[ENCHANT_CONSTANT])
				{
					ent[ENCHANT_CONSTANT] = {};
				}
				if(!ent[ENCHANT_CONSTANT][name])
				{
					ent[ENCHANT_CONSTANT][name] = {};

					ent[ENCHANT_CONSTANT][name].props = {
						level: level
					}

					ent[ENCHANT_CONSTANT][name].modifiers = {
						1: {
							ref: "enchantress_natures_attendants",
							clsname: "modifier_enchantress_natures_attendants",
							options: {
								duration: 5
							}
						}
					}
				}
			}
		},
		{
			name: 'firefly',
			desc: 'Makes the wearer fly in the sky.',
			spell: 'batrider_firefly',
			level: 0,
			setup: function(ent, name, level) {
				if(!ent[ENCHANT_CONSTANT])
				{
					ent[ENCHANT_CONSTANT] = {};
				}
				if(!ent[ENCHANT_CONSTANT][name])
				{
					ent[ENCHANT_CONSTANT][name] = {};

					ent[ENCHANT_CONSTANT][name].props = {
						level: level
					}

					ent[ENCHANT_CONSTANT][name].modifiers = {
						1: {
							ref: "batrider_firefly",
							clsname: "modifier_batrider_firefly",
							options: {
								duration: 5
							}
						}
					}
				}
			}
		},
		{
			name: 'bloodlust',
			desc: 'Makes the wearer frenzied.',
			spell: 'ogre_magi_bloodlust',
			level: 2,
			setup: function(ent, name, level) {
				if(!ent[ENCHANT_CONSTANT])
				{
					ent[ENCHANT_CONSTANT] = {};
				}
				if(!ent[ENCHANT_CONSTANT][name])
				{
					ent[ENCHANT_CONSTANT][name] = {};

					ent[ENCHANT_CONSTANT][name].props = {
						level: level
					}

					ent[ENCHANT_CONSTANT][name].modifiers = {
						1: {
							ref: "ogre_magi_bloodlust",
							clsname: "modifier_ogre_magi_bloodlust",
							options: {
								duration: 5
							}
						}
					}
				}
			}
		},
		{
			name: 'brawler',
			desc: 'Passive crit chance and dodge bonus',
			spell: 'brewmaster_drunken_brawler',
			level: 2,
			setup: function(ent, name, level) {
				if(!ent[ENCHANT_CONSTANT])
				{
					ent[ENCHANT_CONSTANT] = {};
				}
				if(!ent[ENCHANT_CONSTANT][name])
				{
					ent[ENCHANT_CONSTANT][name] = {};

					ent[ENCHANT_CONSTANT][name].props = {
						level: level
					}

					ent[ENCHANT_CONSTANT][name].modifiers = {
						1: {
							ref: "brewmaster_drunken_brawler",
							clsname: "modifier_brewmaster_drunken_brawler",
							options: {
								duration: 5
							}
						}
					}
				}
			}
		},
		{
			name: 'empower',
			desc: 'Passive cleave and damage increase',
			spell: 'magnataur_empower',
			level: 2,
			setup: function(ent, name, level) {
				if(!ent[ENCHANT_CONSTANT])
				{
					ent[ENCHANT_CONSTANT] = {};
				}
				if(!ent[ENCHANT_CONSTANT][name])
				{
					ent[ENCHANT_CONSTANT][name] = {};

					ent[ENCHANT_CONSTANT][name].props = {
						level: level
					}

					ent[ENCHANT_CONSTANT][name].modifiers = {
						1: {
							ref: "magnataur_empower",
							clsname: "modifier_magnataur_empower",
							options: {
								duration: 5
							}
						}
					}
				}
			}
		},
		{
			name: 'unholy',
			desc: 'Gives the wearer immense power, at the cost of life.',
			spell: 'item_armlet',
			level: 0,
			setup: function(ent, name, level) {
				if(!ent[ENCHANT_CONSTANT])
				{
					ent[ENCHANT_CONSTANT] = {};
				}
				if(!ent[ENCHANT_CONSTANT][name])
				{
					ent[ENCHANT_CONSTANT][name] = {};

					ent[ENCHANT_CONSTANT][name].props = {
						level: level
					}

					ent[ENCHANT_CONSTANT][name].modifiers = {
						1: {
							ref: "item_armlet",
							clsname: "modifier_item_armlet_unholy_strength",
							options: {
								duration: 5
							}
						}
					}
				}
			}
		},
		{
			name: 'berserk',
			desc: 'Gives the wearer immense attack speed, at the cost of vulnerability.',
			spell: 'item_mask_of_madness',
			level: 0,
			setup: function(ent, name, level) {
				if(!ent[ENCHANT_CONSTANT])
				{
					ent[ENCHANT_CONSTANT] = {};
				}
				if(!ent[ENCHANT_CONSTANT][name])
				{
					ent[ENCHANT_CONSTANT][name] = {};

					ent[ENCHANT_CONSTANT][name].props = {
						level: level
					}
					
					ent[ENCHANT_CONSTANT][name].modifiers = {
						1: {
							ref: "item_mask_of_madness",
							clsname: "modifier_item_mask_of_madness_berserk",
							options: {
								duration: 5
							}
						}
					}
				}
			}
		}
		// {
		// 	name: '',
		// 	desc: 'Whos that handsome devil?',
		// 	setup: function(ent, name, level) {
		// 		// Grab the stat modifier
		// 		if(!ent[name])
		// 		{
		// 			// Create the ability
		// 			ent[name] = dota.createAbility(ent, "storm_spirit_ball_lightning");

		// 			// Level up the ability
		// 			ent[name].netprops.m_iLevel = (level > 3 ? 3 : level);

		// 			ent[name].modifiers = {
		// 				1: {
		// 					ref: "storm_spirit_ball_lightning",
		// 					clsname: "modifier_storm_spirit_ball_lightning",
		// 					options: {
		// 						duration: 10,
		// 						speed: 5000,
		// 						move_speed: 5000,
		// 						ball_lightning_move_speed: 5000
		// 					}
		// 				}
		// 			}
		// 		}
		// 	}
		// }
		// // Rot
		// {
		// 	name: 'stink',
		// 	desc: 'Turns the wearer into a stinky.',
		// 	setup: function(ent, name) {
		// 		// Grab the stat modifier
		// 		if(!ent[name])
		// 		{
		// 			// Create the ability
		// 			ent[name] = dota.createAbility(ent, "pudge_rot");

		// 			// Level up the ability
		// 			ent[name].netprops.m_iLevel = 3;

		// 			ent[name].modifiers = {
		// 				1: {
		// 					ref: "pudge_rot",
		// 					clsname: "modifier_pudge_rot",
		// 					options: {
		// 						duration: 2
		// 					}
		// 				}
		// 			}
		// 		}
		// 	}
		// }
		// Zombie
		// {
		// 	name: 'zombie',
		// 	desc: 'Turns the wearer into a zombie.',
		// 	setup: function(ent, name) {
		// 		// Grab the stat modifier
		// 		if(!ent[name])
		// 		{
		// 			// Create the ability
		// 			ent[name] = dota.createAbility(ent, "undying_flesh_golem");

		// 			// Level up the ability
		// 			ent[name].netprops.m_iLevel = 3;

		// 			ent[name].modifiers = {
		// 				1: {
		// 					ref: "undying_flesh_golem",
		// 					clsname: "modifier_undying_flesh_golem",
		// 					options: {
		// 						duration: 2
		// 					}
		// 				}
		// 			}
		// 		}
		// 	}
		// }
	),
	// castHurt: new Array(
	// 	{
	// 		name: '',
	// 		desc: '',
	// 		setup: function(ent, name) {
	// 			// Grab the stat modifier
	// 			if(!ent[name])
	// 			{
	// 				// Create the ability
	// 				ent[name] = dota.createAbility(ent, "");

	// 				// Level up the ability
	// 				ent[name].netprops.m_iLevel = 3;
	// 			}
	// 		}
	// 	},
	// 	{
	// 		name: '',
	// 		desc: '',
	// 		setup: function(ent, name) {
	// 			// Grab the stat modifier
	// 			if(!ent[name])
	// 			{
	// 				// Create the ability
	// 				ent[name] = dota.createAbility(ent, "");

	// 				// Level up the ability
	// 				ent[name].netprops.m_iLevel = 3;
	// 			}
	// 		}
	// 	}
	// )
}