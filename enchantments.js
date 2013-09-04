// ==========================================
// Player Enchantments
// ==========================================
var ENCHANT_ONHIT = 'onHit';
var ENCHANT_CONSTANT = 'onEquip';
var ENCHANT_ONUSE = 'onUse';

function createProps(ent, cat, name) {
	if(!ent[cat])
		ent[cat] = {};

	if(!ent[cat][name])
		ent[cat][name] = {};

	return ent;
}

var enchantMap = {
	onHit: new Array(
		// FREEZE
		{
			name: 'timestop',
			desc: 'Freezes the opponent in time for a short duration.',
			spell: 'faceless_void_chronosphere',
			level: 3,
			setup: function(ent, name, level) {

				ent = createProps(ent, ENCHANT_ONHIT, name);

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

				ent[ENCHANT_ONHIT][name].sound = null; // 'weapons/hero/faceless_void/faceless_void_timelockimpact.wav';
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
		},
		// FORCE PUSH
		{
			name: 'forcepush',
			desc: 'Pushes an opponent with great force.',
			spell: 'item_force_staff',
			level: 0,
			setup: function(ent, name, level) {
				ent = createProps(ent, ENCHANT_ONHIT, name);

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

				ent[ENCHANT_ONHIT][name].sound = null;
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
		},
		{
			name: 'blind',
			desc: 'Makes the opponent miss autoattacks.',
			spell: 'tinker_laser',
			level: 2,
			setup: function(ent, name, level) {

				ent = createProps(ent, ENCHANT_ONHIT, name);

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

				ent[ENCHANT_ONHIT][name].sound = null; // 'weapons/hero/tinker/laser_impact.wav';
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
		},
		{
			name: 'rust',
			desc: 'Lower the opponents armor.',
			spell: 'vengefulspirit_wave_of_terror',
			level: 4,
			setup: function(ent, name, level) {

				ent = createProps(ent, ENCHANT_ONHIT, name);

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

				ent[ENCHANT_ONHIT][name].sound = null; // 'weapons/hero/vengeful_spirit/wave_of_terror.wav';
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
		},
		// Silence
		{
			name: 'silence',
			desc: 'Silences the opponent.',
			spell: 'item_orchid',
			level: 0,
			setup: function(ent, name, level) {

				ent = createProps(ent, ENCHANT_ONHIT, name);

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

				ent[ENCHANT_ONHIT][name].sound = null; // 'items/orchid.wav';
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
		},
		// Sheepstick
		{
			name: 'sheepstick',
			desc: 'Turns the opponent into a helpless pig.',
			spell: 'item_sheepstick',
			level: 0,
			setup: function(ent, name, level) {

				ent = createProps(ent, ENCHANT_ONHIT, name);

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
		},
		// FREEZE
		{
			name: 'freeze',
			desc: 'Freezes the opponent in place for a short duration.',
			spell: 'crystal_maiden_frostbite',
			level: 0,
			setup: function(ent, name, level) {

				ent = createProps(ent, ENCHANT_ONHIT, name);

				var EFFECT_DURATION = 2.5;
				var EFFECT_TIMEOUT = 12;
				var EFFECT_PROC = 0;

				switch(level)
				{
					default:
					case 1:
						EFFECT_DURATION = 2.5;
						break;
					case 2:
						EFFECT_DURATION = 3.0;
						break;
					case 3:
						EFFECT_DURATION = 3.5;
						break;
					case 4:
						EFFECT_DURATION = 4.0;
						break;

				}

				ent[ENCHANT_ONHIT][name].sound = null, // 'weapons/hero/crystal_maiden/frostbite.wav';
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
		},
		{
			name: 'slow',
			desc: 'Slows the opponent for a short duration.',
			spell: 'item_diffusal_blade',
			level: 0,
			setup: function(ent, name, level) {

				ent = createProps(ent, ENCHANT_ONHIT, name);

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

				ent[ENCHANT_ONHIT][name].sound = null; //'items/item_diffusalblade.wav';
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
		},
		{
			name: 'weaken',
			desc: 'Weakens the opponents damage.',
			spell: 'bane_enfeeble',
			level: 4,
			setup: function(ent, name, level) {

				ent = createProps(ent, ENCHANT_ONHIT, name);

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

				ent[ENCHANT_ONHIT][name].sound = null; // 'weapons/hero/bane/enfeeble.wav';
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
	),
	// ALWAYS ON WHEN EQUIPPED
	onEquip: new Array(
		{
			name: 'haste',
			desc: 'Wearer has a constant haste buff.',
			spell: 'lycan_shapeshift',
			level: 0,
			setup: function(ent, name, level) {
				ent = createProps(ent, ENCHANT_CONSTANT, name);

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
					// 2: {
					// 	ref: "lycan_shapeshift",
					// 	clsname: "modifier_lycan_shapeshift",
					// 	options: {
					// 		duration: 10
					// 	}
					// }
				}
			}
		},
		{
			name: 'bloodthirst',
			desc: 'Wearer can see hurt enemies.',
			spell: 'bloodseeker_thirst',
			level: 4,
			setup: function(ent, name, level) {
				ent = createProps(ent, ENCHANT_CONSTANT, name);

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
		},
		{
			name: 'warcry',
			desc: 'Wearer has increased armor and movespeed.',
			spell: 'sven_warcry',
			level: 3,
			setup: function(ent, name, level) {
				ent = createProps(ent, ENCHANT_CONSTANT, name);

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
		},
		{
			name: 'surge',
			desc: 'Wearer has is constantly surging.',
			spell: 'dark_seer_surge',
			level: 4,
			setup: function(ent, name, level) {
				ent = createProps(ent, ENCHANT_CONSTANT, name);

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
		},
		// Invisibility
		{
			name: 'invisibility',
			desc: 'Makes the wearer permanently invisible.',
			spell: 'riki_permanent_invisibility',
			level: 2,
			setup: function(ent, name, level) {
				ent = createProps(ent, ENCHANT_CONSTANT, name);

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
		},
		{
			name: 'spriteheal',
			desc: 'Forest creatures heal the wearer.',
			spell: 'enchantress_natures_attendants',
			level: 2,
			setup: function(ent, name, level) {
				ent = createProps(ent, ENCHANT_CONSTANT, name);
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
		},
		{
			name: 'firewalk',
			desc: 'Makes the wearer a firewalker.',
			spell: 'batrider_firefly',
			level: 1,
			setup: function(ent, name, level) {
				ent = createProps(ent, ENCHANT_CONSTANT, name);

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
		},
		{
			name: 'ionshell',
			desc: 'Coats the wearer in an ion shell.',
			spell: 'dark_seer_ion_shell',
			level: 1,
			setup: function(ent, name, level) {

				ent = createProps(ent, ENCHANT_CONSTANT, name);

				ent[ENCHANT_CONSTANT][name].props = {
					level: level
				}

				ent[ENCHANT_CONSTANT][name].modifiers = {
					1: {
						ref: 'dark_seer_ion_shell',
						clsname: 'modifier_dark_seer_ion_shell',
						options: {
							duration: 5
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
				ent = createProps(ent, ENCHANT_CONSTANT, name);
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
		},
		{
			name: 'brawler',
			desc: 'Passive crit chance and dodge bonus',
			spell: 'brewmaster_drunken_brawler',
			level: 2,
			setup: function(ent, name, level) {

				ent = createProps(ent, ENCHANT_CONSTANT, name);

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
		},
		{
			name: 'empower',
			desc: 'Passive cleave and damage increase',
			spell: 'magnataur_empower',
			level: 2,
			setup: function(ent, name, level) {

				ent = createProps(ent, ENCHANT_CONSTANT, name);

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
		},
		{
			name: 'unholy',
			desc: 'Gives the wearer immense power, at the cost of life.',
			spell: 'item_armlet',
			level: 0,
			setup: function(ent, name, level) {

				ent = createProps(ent, ENCHANT_CONSTANT, name);

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
		},
		{
			name: 'berserk',
			desc: 'Gives the wearer immense attack speed, at the cost of vulnerability.',
			spell: 'item_mask_of_madness',
			level: 0,
			setup: function(ent, name, level) {
				ent = createProps(ent, ENCHANT_CONSTANT, name);

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
	)
	// // When the item is activated
	// onUse: new Array(
	// 	{
	// 		name: 'berserk',
	// 		desc: 'Gives the wearer immense attack speed, at the cost of vulnerability.',
	// 		spell: 'item_mask_of_madness',
	// 		level: 0,
	// 		setup: function(ent, name, level) {
	// 			ent = createProps(ent, ENCHANT_ONUSE, name);

	// 			ent[ENCHANT_ONUSE][name].props = {
	// 				level: level
	// 			}
				
	// 			ent[ENCHANT_ONUSE][name].modifiers = {
	// 				1: {
	// 					ref: "item_mask_of_madness",
	// 					clsname: "modifier_item_mask_of_madness_berserk",
	// 					options: {
	// 						duration: 4
	// 					}
	// 				}
	// 			}
	// 		}
	// 	}
	// )
};

var enchMapOnEquipNames = [];
for (var en = 0; en < enchantMap.onEquip.length; ++en) {
	var enchant = enchantMap.onEquip[en];
	if (enchant.name) {
		enchMapOnEquipNames.push(enchant.name);
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
	    // Loop through active equipment
	    for ( var i = 0; i < equipment.length; ++i ) {
	    	var item = equipment[i];
	    	// onEquip items are the enchants that require constant checking
	    	if (equipment[i].onEquip) {
		        // Look at what type of enchants exist
		        for (var e = 0; e < enchMapOnEquipNames.length; ++e) {
		        	// If an enchant exists on this equipment piece
		        	if ( item.onEquip[enchMapOnEquipNames[e]] ) {
		        		var name = enchMapOnEquipNames[e];
		        		var enchName = item.onEquip[enchMapOnEquipNames[e]];
		                // Find our enchantment modifiers
						for (var value in enchName.modifiers) {
		                    if (!util.isNumber(value)) continue; // Skip 'clone' ??
							var modifier = enchName.modifiers[value];

			                dota.addNewModifier(hero, enchanter.onEquipEnchantEntity[name], modifier.clsname, modifier.ref, modifier.options);
						}
		        	}
		        }
	    	}
	    }
	}
}, 4995);

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
	    	if ( ent.enchanted )
	    	{
	    		if (DEBUG) server.print('Found entity: ' + equipment[i].getClassname());
	    		if (ent.onHit) {
	    			var arr = ent.onHit;
	    			for (var type in arr) {
	    				if (type == 'clone') continue; // Skip
	    				if (appliedTypes.indexOf(type) > -1) continue; // Skip

	    				var applied = false;

						if (DEBUG) server.print('Found enchant: ' + type);

						var ench = arr[type];

						var enchName = type;

		                // Initialize enchantment timeouts
		                if ( !props[sourcePlayerID].enchantTimeouts[targetEntityID] )
		                    props[sourcePlayerID].enchantTimeouts[targetEntityID] = {};

		                // Initialize enchantment timeouts
		                if ( !props[sourcePlayerID].enchantTimeouts[targetEntityID][enchName] )
		                    props[sourcePlayerID].enchantTimeouts[targetEntityID][enchName] = {};

		                // Find our enchantment modifiers
						for (var value in ench.modifiers)
						{
		                    // Skip 'clone' ??
		                    if (!util.isNumber(value)) continue;

							var modifier = ench.modifiers[value];

		                    // Let's see if we have a timeoutDelay
		                    if (modifier.timeout > 0)
		                    {
		                        if ( !props[sourcePlayerID].enchantTimeouts[targetEntityID][enchName][value] )
		                            props[sourcePlayerID].enchantTimeouts[targetEntityID][enchName][value] = 0;

		                        if (props[sourcePlayerID].enchantTimeouts[targetEntityID][enchName][value] === 1) {
		                        	if (DEBUG) server.print('Still in timeout');
		                            continue;
		                        }
		                        else {
		                            props[sourcePlayerID].enchantTimeouts[targetEntityID][enchName][value] = 1;

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
}

// ==========================================
// Exports
// ==========================================
exports.enchantMap = enchantMap;