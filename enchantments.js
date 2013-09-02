exports.enchantMap = {
	onHit: new Array(
		// TIMESTOP
		{
			name: 'freeze',
			desc: 'Freezes the opponent in place for a short duration.',
			spell: 'faceless_void_chronosphere',
			level: 3,
			setup: function(ent, name, level) {
				// Grab the stat modifier
				if(!ent[name])
				{
					ent[name] = {};
					ent[name].modifiers = {
						1: {
							ref: "faceless_void_chronosphere",
							clsname: "modifier_faceless_void_chronosphere_freeze",
							options: {
								duration: 5
							},
							timeout: 15,
							chainDelay: 2.8
						}
					}
				}
			}
		},
		//FORCEPUSH
		{
			name: 'push',
			desc: 'Pushes an opponent with great force.',
			spell: 'item_force_staff',
			level: 0,
			setup: function(ent, name, level) {
				// Grab the stat modifier
				if(!ent[name])
				{
					ent[name] = {};
					var push = 600;
					var time = 2;
					switch(level)
					{
						case 1:
							push += 200;
							time += 3;
							break;
						case 2:
							push += 400;
							time += 4;
							break;
						case 3:
							push += 800;
							time += 5;
							break;
						case 4:
							push += 1000;
							time += 6;
							break;
					}

					ent[name].modifiers = {
						1: {
							ref: "item_force_staff",
							clsname: "modifier_item_forcestaff_active",
							options: {
								push_length: push
							},
							timeout: time,
							chainDelay: 0
						}
					}
				}
			}
		},
		{
			name: 'blind',
			desc: 'Strike your opponents eye, he is now blind.',
			spell: 'tinker_laser',
			level: 4,
			setup: function(ent, name, level) {
				// Grab the stat modifier
				if(!ent[name])
				{
					ent[name] = {};
					ent[name].modifiers = {
						1: {
							ref: 'tinker_laser',
							clsname: 'modifier_tinker_laser_blind',
							options: {
								duration: 10,
								silence_damage_percent: 30
							},
							timeout: 25,
							chainDelay: 0
						}
					}
				}
			}
		},
		{
			name: 'terror',
			desc: 'Lower your striked foes armor.',
			spell: 'vengefulspirit_wave_of_terror',
			level: 4,
			setup: function(ent, name, level) {
				// Grab the stat modifier
				if(!ent[name])
				{
					ent[name] = {};
					ent[name].modifiers = {
						1: {
							ref: 'vengefulspirit_wave_of_terror',
							clsname: 'modifier_vengefulspirit_wave_of_terror',
							options: {
								duration: 10,
								silence_damage_percent: 30
							},
							timeout: 25,
							chainDelay: 0
						}
					}
				}
			}
		},
		// Orchid
		{
			name: 'silence',
			desc: 'Silences the opponent you strike.',
			spell: 'item_orchid',
			level: 0,
			setup: function(ent, name, level) {
				// Grab the stat modifier
				if(!ent[name])
				{
					ent[name] = {};
					ent[name].modifiers = {
						1: {
							ref: 'item_orchid',
							clsname: 'modifier_orchid_malevolence_debuff',
							options: {
								duration: 10,
								silence_damage_percent: 30
							},
							timeout: 25,
							chainDelay: 0
						}
					}
				}
			}
		},
		// Sheepstick
		{
			name: 'sheepstick',
			desc: 'Morphs the attacked into a piggy.',
			spell: 'item_sheepstick',
			level: 0,
			setup: function(ent, name, level) {
				// Grab the stat modifier
				if(!ent[name])
				{
					ent[name] = {};

					var dura = 0;
					var move = 0;
					var time = 2;
					switch(level)
					{
						case 1:
							dura = 4;
							move = 400;
							time += 3;
							break;
						case 2:
							dura = 6;
							move = 300;
							time += 4;
							break;
						case 3:
							dura = 8;
							move = 200;
							time += 5;
							break;
						case 4:
							dura = 10;
							move = 100;
							time += 6;
							break;
					}

					ent[name].modifiers = {
						1: {
							ref: "item_sheepstick",
							clsname: "modifier_sheepstick_debuff",
							options: {
								duration: dura,
								sheep_movement_speed: move
							},
							timeout: time,
							chainDelay: 0
						}
					}
				}
			}
		},
		{
			name: 'frostbite',
			desc: 'Throws down the disco ball.',
			spell: 'crystal_maiden_frostbite',
			level: 4,
			setup: function(ent, name, level) {
				// Grab the stat modifier
				if(!ent[name])
				{
					ent[name] = {};
					ent[name].modifiers = {
						1: {
							ref: "crystal_maiden_frostbite",
							clsname: "modifier_crystal_maiden_frostbite",
							options: {
								duration: 4
							},
							timeout: 10,
							chainDelay: 0
						}
					}
				}
			}
		},
		{
			name: 'slow',
			desc: 'Slower than mollassus.',
			spell: 'item_diffusal_blade',
			level: 0,
			setup: function(ent, name, level) {
				// Grab the stat modifier
				if(!ent[name])
				{
					ent[name] = {};
					ent[name].modifiers = {
						1: {
							ref: "item_diffusal_blade",
							clsname: "modifier_item_diffusal_blade_slow",
							options: {
								duration: 5
							},
							timeout: 10,
							chainDelay: 0
						}
					}
				}
			}
		},
		{
			name: 'enfeeble',
			desc: 'Strike a blow to your foes and make them weak.',
			spell: 'bane_enfeeble',
			level: 1,
			setup: function(ent, name, level) {
				// Grab the stat modifier
				if(!ent[name])
				{
					ent[name] = {};
					ent[name].modifiers = {
						1: {
							ref: 'bane_enfeeble',
							clsname: 'modifier_bane_enfeeble',
							options: {
								duration: 10
							},
							timeout: 25,
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
			level: 3,
			setup: function(ent, name, level) {
				// Grab the stat modifier
				if(!ent[name])
				{
					ent[name] = {};
					ent[name].modifiers = {
						1: {
							ref: "lycan_shapeshift",
							clsname: "modifier_lycan_shapeshift_speed",
							options: {
								duration: 5,
								speed: 500
							}
						}
						// 2: {
						// 	ref: "lycan_shapeshift",
						// 	clsname: "modifier_lycan_shapeshift",
						// 	options: {
						// 		duration: 5,
						// 	}
						// },
					}
				}
			}
		},
		{
			name: 'bloodthirst',
			desc: 'Wearer has a constant haste buff.',
			spell: 'bloodseeker_thirst',
			level: 4,
			setup: function(ent, name, level) {
				// Grab the stat modifier
				if(!ent[name])
				{
					ent[name] = {};
					ent[name].modifiers = {
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
			desc: 'Wearer has a constant haste buff.',
			spell: 'sven_warcry',
			level: 4,
			setup: function(ent, name, level) {
				// Grab the stat modifier
				if(!ent[name])
				{
					ent[name] = {};
					ent[name].modifiers = {
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
			desc: 'Wearer has a constant haste buff.',
			spell: 'dark_seer_surge',
			level: 4,
			setup: function(ent, name, level) {
				// Grab the stat modifier
				if(!ent[name])
				{
					ent[name] = {};
					ent[name].modifiers = {
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
			name: 'windwalk',
			desc: 'Makes the wearer invisible.',
			spell: 'clinkz_wind_walk',
			level: 4,
			setup: function(ent, name, level) {
				// Grab the stat modifier
				if(!ent[name])
				{
					ent[name] = {};
					ent[name].modifiers = {
						1: {
							ref: "clinkz_wind_walk",
							clsname: "modifier_clinkz_wind_walk",
							options: {
								duration: 5
							}
						}
					}
				}
			}
		},
		{
			name: 'restoration',
			desc: 'Makes the wearer heal themselves.',
			spell: 'witch_doctor_voodoo_restoration',
			level: 4,
			setup: function(ent, name, level) {
				// Grab the stat modifier
				if(!ent[name])
				{
					ent[name] = {};
					ent[name].modifiers = {
						1: {
							ref: "witch_doctor_voodoo_restoration",
							clsname: "modifier_voodoo_restoration_heal",
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
			desc: 'Makes the wearer heal themselves.',
			spell: 'enchantress_natures_attendants',
			level: 4,
			setup: function(ent, name, level) {
				// Grab the stat modifier
				if(!ent[name])
				{
					ent[name] = {};
					ent[name].modifiers = {
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
			desc: 'Makes the wearer fly in the sky as high.',
			spell: 'batrider_firefly',
			level: 0,
			setup: function(ent, name, level) {
				// Grab the stat modifier
				if(!ent[name])
				{
					ent[name] = {};
					ent[name].modifiers = {
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
			level: 4,
			setup: function(ent, name, level) {
				// Grab the stat modifier
				if(!ent[name])
				{
					ent[name] = {};
					ent[name].modifiers = {
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
			desc: 'How many times are you gonna miss?',
			spell: 'brewmaster_drunken_brawler',
			level: 4,
			setup: function(ent, name, level) {
				// Grab the stat modifier
				if(!ent[name])
				{
					ent[name] = {};
					ent[name].modifiers = {
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
			desc: 'Empowers the wearer',
			spell: 'magnataur_empower',
			level: 4,
			setup: function(ent, name, level) {
				// Grab the stat modifier
				if(!ent[name])
				{
					ent[name] = {};
					ent[name].modifiers = {
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
				// Grab the stat modifier
				if(!ent[name])
				{
					ent[name] = {};
					ent[name].modifiers = {
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
			desc: 'Gives the wearer immense speed, at the cost of vulnerability.',
			spell: 'item_mask_of_madness',
			level: 0,
			setup: function(ent, name, level) {
				// Grab the stat modifier
				if(!ent[name])
				{
					ent[name] = {};
					ent[name].modifiers = {
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
	castHurt: new Array(
		{
			name: '',
			desc: '',
			setup: function(ent, name) {
				// Grab the stat modifier
				if(!ent[name])
				{
					// Create the ability
					ent[name] = dota.createAbility(ent, "");

					// Level up the ability
					ent[name].netprops.m_iLevel = 3;
				}
			}
		},
		{
			name: '',
			desc: '',
			setup: function(ent, name) {
				// Grab the stat modifier
				if(!ent[name])
				{
					// Create the ability
					ent[name] = dota.createAbility(ent, "");

					// Level up the ability
					ent[name].netprops.m_iLevel = 3;
				}
			}
		}
	)
}