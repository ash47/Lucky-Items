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
  //	0 - None
  //    1 - Strength
  //    2 - Agility
  //    4 - Intelligence
  //    7 - All
  //
  // Enchant Type
  //    0 - Unenchantable
  //	1 - onHit
  //    2 - onEquip
  //    4 - onUse
  //    8 - onToggle
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
  // [0            1,           2,     3,         4,             5,         ]
  // ["Classname", weight(0-∞), price, gamePhase, attributeMask, enchantType], // Weapon Name (price)
  //
  ['item_winter_mushroom',         5,    0, 0, 0, 0], // Winter Mushroom (0g)
  ['item_aegis',                   5,    0, 0, 0, 0], // Aegis of the Immortal (0g)
  ['item_cheese',                  5,    0, 0, 0, 0], // Cheese (0g)
  //
  ['item_orb_of_venom',          300,  275, 1, 0, 1], // Orb of Venom (275g)
  ['item_null_talisman',         291,  470, 1, 4, 0], // Null Talisman (470g)
  ['item_wraith_band',           291,  485, 1, 2, 0], // Wraith Band (485g)
  ['item_magic_wand',            290,  509, 1, 7, 0], // Magic Wand (509g)
  ['item_bracer',                289,  525, 1, 1, 0], // Bracer (525g)
  ['item_poor_mans_shield',      288,  550, 1, 3, 0], // Poor Man's Shield (550g)
  ['item_headdress',             286,  603, 1, 4, 0], // Headdress (603g)
  ['item_soul_ring',             278,  800, 1, 4, 1], // Soul Ring (800g)
  ['item_buckler',               278,  803, 1, 4, 0], // Buckler (803g)
  ['item_urn_of_shadows',        275,  875, 1, 1, 7], // Urn of Shadows (875g)
  ['item_void_stone',            275,  875, 1, 0, 1], // Void Stone (875g)
  ['item_ring_of_health',        275,  875, 1, 0, 4], // Ring of Health (875g)
  ['item_helm_of_iron_will',     272,  950, 1, 0, 4], // Helm of Iron Will (950g)
  ['item_tranquil_boots',        271,  975, 1, 0, 0], // Tranquil Boots (975g)
  ['item_ring_of_aquila',        271,  985, 1, 0, 1], // Ring of Aquila (985g)
  ['item_ogre_axe',              270, 1000, 1, 1, 4], // Ogre Axe (1,000g)
  ['item_blade_of_alacrity',     270, 1000, 1, 2, 2], // Blade of Alacrity (1,000g)
  ['item_staff_of_wizardry',     270, 1000, 1, 4, 1], // Staff of Wizardry (1,000g)
  ['item_energy_booster',        270, 1000, 1, 4, 1], // Energy Booster (1,000g)
  ['item_medallion_of_courage',  267, 1075, 1, 0, 2], // Medallion of Courage (1,075g)
  ['item_vitality_booster',      266, 1100, 1, 7, 4], // Vitality Booster (1,100g)
  ['item_point_booster',         262, 1200, 1, 7, 1], // Point Booster (1,200g)
  ['item_broadsword',            262, 1200, 1, 0, 2], // Broadsword (1,200g)
  ['item_phase_boots',           256, 1350, 1, 0, 2], // Phase Boots (1,350g)
  ['item_platemail',             254, 1400, 1, 0, 4], // Platemail (1,400g)
  ['item_claymore',              254, 1400, 1, 0, 2], // Claymore (1,400g)
  ['item_power_treads',          254, 1400, 1, 7, 6], // Power Treads (1,400g)
  ['item_arcane_boots',          252, 1450, 1, 4, 1], // Arcane Boots (1,450g)
  ['item_javelin',               250, 1500, 1, 0, 2], // Javelin (1,500g)
  ['item_ghost',                 246, 1600, 1, 0, 1], // Ghost Scepter (1,600g)
  ['item_shadow_amulet',         246, 1600, 1, 0, 0], // Shadow Amulet (1,600g)
  ['item_mithril_hammer',        246, 1600, 1, 0, 2], // Mithril Hammer (1,600g)
  ['item_oblivion_staff',        243, 1675, 1, 0, 1], // Oblivion Staff (1,675g)
  ['item_pers',                  240, 1750, 1, 0, 1], // Perseverance (1,750g)
  ['item_ancient_janggo',        239, 1775, 1, 7, 0], // Drums of Endurance (1,775g)
  ['item_talisman_of_evasion',   119, 1800, 2, 0, 4], // Talisman of Evasion (1,800g)
  ['item_helm_of_the_dominator', 118, 1850, 2, 3, 2], // Helm of the Dominator (1,850g)
  ['item_hand_of_midas',         234, 1900, 1, 0, 2], // Hand of Midas (1,900g)
  ['item_mask_of_madness',       117, 1900, 2, 3, 2], // Mask of Madness (1,900g)
  ['item_vladmir',               114, 2050, 2, 3, 2], // Vladmir's Offering (2,050g)
  ['item_yasha',                 114, 2050, 2, 2, 2], // Yasha (2,050g)
  ['item_sange',                 114, 2050, 2, 1, 2], // Sange (2,050g)
  ['item_ultimate_orb',          113, 2100, 2, 7, 3], // Ultimate Orb (2,100g)
  ['item_hyperstone',            113, 2100, 2, 3, 2], // Hyperstone (2,100g)
  ['item_hood_of_defiance',      113, 2125, 2, 0, 1], // Hood of Defiance (2,125g)
  ['item_blink',                 224, 2150, 1, 0, 7], // Blink Dagger (2,150g)
  ['item_lesser_crit',           112, 2150, 2, 2, 2], // Crystalys (2,150g)
  ['item_blade_mail',            111, 2200, 2, 1, 4], // Blade Mail (2,200g)
  ['item_vanguard',              111, 2225, 2, 0, 4], // Vanguard (2,225g)
  ['item_force_staff',           220, 2250, 1, 4, 7], // Force Staff (2,250g)
  ['item_mekansm',               109, 2306, 2, 4, 1], // Mekansm (2,306g)
  ['item_demon_edge',            107, 2400, 2, 3, 2], // Demon Edge (2,400g)
  ['item_travel_boots',           71, 2450, 3, 0, 7], // Boots of Travel (2,450g)
  ['item_armlet',                103, 2600, 2, 1, 2], // Armlet of Mordiggan (2,600g)
  ['item_veil_of_discord',       102, 2650, 2, 0, 1], // Veil of Discord (2,650g)
  ['item_mystic_staff',          101, 2700, 2, 4, 1], // Mystic Staff (2,700g)
  ['item_necronomicon',          101, 2700, 2, 5, 1], // Necronomicon 1 (2,700g)
  ['item_maelstrom',             101, 2700, 2, 3, 2], // Maelstrom (2,700g)
  ['item_cyclone',               101, 2700, 2, 4, 1], // Eul's Scepter of Divinity (2,700g)
  ['item_dagon',                 100, 2730, 2, 5, 1], // Dagon 1 (2,730g)
  ['item_basher',                 96, 2950, 2, 1, 2], // Skull Basher (2,950g)
  ['item_invis_sword',            95, 3000, 2, 7, 2], // Shadow Blade (3,000g)
  ['item_rod_of_atos',            25, 3100, 3, 4, 1], // Rod of Atos (3,100g)
  ['item_reaver',                 24, 3200, 3, 1, 4], // Reaver (3,200g)
  ['item_soul_booster',           23, 3300, 3, 7, 1], // Soul Booster (3,300g)
  ['item_eagle',                  20, 3300, 3, 2, 2], // Eaglesong (3,300g)
  ['item_diffusal_blade',         21, 3300, 3, 3, 2], // Diffusal Blade (3,300g)
  ['item_pipe',                   20, 3628, 3, 5, 1], // Pipe of Insight (3,628g)
  ['item_relic',                  21, 3800, 3, 7, 2], // Sacred Relic (3,800g)
  ['item_heavens_halberd',        20, 3850, 3, 1, 2], // Heaven's Halberd (3,850g)
  ['item_black_king_bar',         21, 3900, 3, 7, 4], // Black King Bar (3,900g)
  ['item_necronomicon_2',         21, 3950, 3, 0, 1], // Necronomicon 2 (3,950g)
  ['item_dagon_2',                20, 3980, 3, 0, 1], // Dagon 2 (3,980g)
  ['item_desolator',              19, 4100, 3, 3, 2], // Desolator (4,100g)
  ['item_sange_and_yasha',        18, 4100, 3, 3, 2], // Sange & Yasha (4,100g)
  ['item_orchid',                 18, 4125, 3, 4, 1], // Orchid Malevolence (4,125g)
  ['item_diffusal_blade_2',       18, 4150, 3, 0, 2], // Diffusal Blade 2 (4,150g)
  ['item_ultimate_scepter',       17, 4200, 3, 7, 7], // Aghanim's Scepter (4,200g)
  ['item_bfury',                  16, 4350, 3, 3, 2], // Battle Fury (4,350g)
  ['item_shivas_guard',           15, 4700, 3, 4, 4], // Shiva's Guard (4,700g)
  ['item_ethereal_blade',         14, 4900, 3, 6, 6], // Ethereal Blade (4,900g)
  ['item_bloodstone',             13, 5050, 3, 4, 5], // Bloodstone (5,050g)
  ['item_manta',                  12, 5050, 3, 2, 2], // Manta Style (5,050g)
  ['item_radiance',               13, 5150, 3, 7, 2], // Radiance (5,150g)
  ['item_sphere',                 12, 5175, 3, 7, 5], // Linken's Sphere (5,175g)
  ['item_necronomicon_3',         12, 5200, 3, 0, 1], // Necronomicon 3 (5,200g)
  ['item_dagon_3',                10, 5230, 3, 0, 1], // Dagon 3 (5,230g)
  ['item_refresher',              11, 5300, 3, 5, 1], // Refresher Orb (5,300g)
  ['item_assault',                 8, 5350, 3, 3, 4], // Assault Cuirass (5,350g)
  ['item_mjollnir',                2, 5400, 3, 3, 2], // Mjollnir (5,400g)
  ['item_monkey_king_bar',         4, 5400, 3, 3, 2], // Monkey King Bar (5,400g)
  ['item_heart',                   3, 5500, 3, 7, 4], // Heart of Terrasque (5,500g)
  ['item_greater_crit',            2, 5550, 3, 3, 2], // Daedalus (5,550g)
  ['item_skadi',                   3, 5675, 3, 7, 3], // Eye of Skadi (5,675g)
  ['item_sheepstick',              2, 5675, 3, 4, 1], // Scythe of Vyse (5,675g)
  ['item_butterfly',               2, 6000, 3, 2, 2], // Butterfly (6,000g)
  ['item_satanic',                 4, 6150, 3, 3, 2], // Satanic (6,150g)
  ['item_rapier',                  4, 6200, 3, 0, 2], // Divine Rapier (6,200g)
  ['item_dagon_4',                 3, 6480, 3, 0, 1], // Dagon 4 (6,480g)
  ['item_abyssal_blade',           2, 6750, 3, 1, 2], // Abyssal Blade (6,750g)
  ['item_dagon_5',                 1, 7730, 3, 0, 1], // Dagon 5 (7,730g)
];


function getEntryByClassname(clsname) {
	var loot = baseItemTable;
	for (var i = 0; i < loot.length; i++) {
		if (loot[i][0] === clsname)
			return loot[i];
    }
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
			var possibleEnchants = enchants.enchantMap.onEquip;
			var type = "onEquip";
			break;
		// Add entries below to not enchant
		case (item[0] === "item_aegis"):
		case (item[0] === "item_cheese"):
		case (item[0] === "item_winter_mushroom"):
			break;
	}
	if (isEnchantable)
	{
		// Chance of additional item properties is lowered based on the time setting
		var isEnchanted = ( util.getRandomNumber(100) < enchanter.percentage ? true : false );
		if (isEnchanted)
		{
			entity.enchanted = true;

			// Play a sound indicating this item was enchanted
			var client = dota.findClientByPlayerID(playerID);
			if (client !== null) {
				var sounds = settings.sounds.itemEnchanted;
				var sound = util.randomElement(sounds);
				dota.sendAudio(client, false, sound);
			}

			// Shuffle enchant map
			util.shuffle(possibleEnchants);

			// See how many we have total
			// var total = possibleEnchants.length;
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

				if ( itemManager.itemName[entityName] )
					var named = itemManager.itemName[entityName];
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

					playerManager.print(playerID, "%s enchanted %s [level %s] %s", [named, name, level, type]);
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
					playerManager.print(playerID, "%s enchanted %s [levels %s] %s", [named, enchantNames.join(", "), levels.join(", "), type]);
				}
			}
		}
	}
}

function changeItemProperties(entity, entry, playerID) {
	// Find the entities' classname
	var name = entity.getClassname();
	// Most items have the same properties
	if (name === 'item_aegis' || name === 'item_cheese') {
		entity.netprops.m_bKillable = true;
	}
	else {
		entity.netprops.m_bSellable = (settings.itemTable.properties.sellable ? true : false);
		entity.netprops.m_bKillable = false;
	}
	// All items
	entity.netprops.m_iSharability = 0;
	entity.netprops.m_bDisassemblable = false;
	entity.netprops.m_bDroppable = true;

	// Play a normal add sound if our item is not enchanted
	if (settings.sounds.enabled && !entity.enchanted) {
		var sounds = settings.sounds.addToInventory;
		var sound = util.randomElement(sounds);
		var client = dota.findClientByPlayerID(playerID);
		if (client !== null)
			dota.sendAudio(client, false, sound);
	}

	// Save the entity
	var ents = playerManager.getProp(playerID, 'equipmentEntities');
	ents.push(entity.index);
	playerManager.setProp(playerID, 'equipmentEntities', ents);

	return true;
}

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
	var tmp = util.clone(baseItemTable);
	// Always included in table
	for (i = 0; i < tmp.length; ++i) {
		if ( tmp[i][2] === 0 ) {
			mainItemTable.push(tmp[i]);
		}
	}
	// Apply additional modifications to tmp table
	switch(settings.itemTable.customMode)
	{
		case 0:
			for (i = 0; i < tmp.length; ++i) {
				var itemList = ["item_greevil_whistle_toggle", "item_greevil_whistle"];
				if ( itemList.indexOf(tmp[i][0]) > -1 ) {
					mainItemTable.push(tmp[i]);
				}
			}
			break;
		default:
		case 1:
			for (var i = 0; i < tmp.length; ++i) {
				if ( tmp[i][2] > settings.itemTable.priceRangeMin && tmp[i][2] < settings.itemTable.priceRangeMax ) {
					mainItemTable.push(tmp[i]);
				}
			}
			break;
		case 2: // Aegis & Rapier
			for (var i = 0; i < tmp.length; ++i) {
				var itemList = ["item_rapier"];
				if ( itemList.indexOf(tmp[i][0]) > -1 ) {
					if (settings.itemTable.useWeights) {
						if (tmp[i][0] == "item_rapier")
							tmp[i][1] = 65;
					}
					mainItemTable.push(tmp[i]);
				}
			}
			break;
		case 3: // Caster/Support items only
			for (var i = 0; i < tmp.length; ++i) {
				if ( util.containsFlag(tmp[i][5], 1) && tmp[i][5] !== 0 ) {
					mainItemTable.push(tmp[i]);
				}
			}
			break;
		case 4: // Damage items only
			for (var i = 0; i < tmp.length; ++i) {
				if ( util.containsFlag(tmp[i][5], 2) && tmp[i][5] !== 0 ) {
					mainItemTable.push(tmp[i]);
				}
			}
			break;
		case 5: // Armor/Defensive items only
			for (var i = 0; i < tmp.length; ++i) {
				if ( util.containsFlag(tmp[i][5], 4) && tmp[i][5] !== 0 ) {
					mainItemTable.push(tmp[i]);
				}
			}
			break;
		case 6: // Early Game items only
			for (var i = 0; i < tmp.length; ++i) {
				if ( tmp[i][3] === 1 ) {
					mainItemTable.push(tmp[i]);
				}
			}
			break;
	}
	if (settings.itemTable.powerWeight > 1) {
		for (var i = mainItemTable.length - 1; i > 0; i--) {
			mainItemTable[i][1] = Math.pow(mainItemTable[i][1], settings.itemTable.powerWeight);
		}
	}

	settings.itemTable.instance = mainItemTable;

	// Setup our enchantment percentage
	if (enchanter.enabled) {
		var time = util.convertMinutesToSeconds( settings.nextBase[ util.getRandomNumber( settings.nextBase.length ) ] );
		enchanter.percentage = (70 + (time / 13) );
	}
}

function getRandomLoot(playerID) {
	// Which item table are we using?
	switch(true)
	{
		case (settings.itemTable.useWeights && wardrobe.enabled):
			var loot = playerManager.getProp(playerID, 'lootTable');
			if (DEBUG) server.print('-- USING PER-PLAYER LOOT TABLE --');
			if (!loot) {
				if (DEBUG) server.print('-- [NO PPL] -> USING BASE LOOT TABLE --');
				loot = baseItemTable;
			}
			break;
		case (settings.itemTable.instance):
			var loot = settings.itemTable.instance;
			if (DEBUG) server.print('-- USING LOBBY LOOT TABLE --');
			break;
		default:
			var loot = baseItemTable;
			if (DEBUG) server.print('-- USING BASE LOOT TABLE --');
			break;
	}
	// Does the player have his drops rigged?
	if (playerManager.getProp(playerID, 'nextDropFavored')) {
		if (util.getRandomNumber(100) < settings.itemDropFavorPercent) {
			var chanceLoot = [];
			for (var i = 0; i < loot.length; ++i) {
				if (loot[i][2] > 2500 && loot[i][2] < 5000)
					chanceLoot.push(loot[i]);
			}
			loot = chanceLoot;
			if (DEBUG) server.print('-- USING FAVORED LOOT TABLE --');
		}
	}

	if (!settings.itemTable.useWeights) {
		if (DEBUG) server.print('-- USING NON-WEIGHTED LOOT TABLE --');
		return util.randomElement(loot);
	}

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

exports.itemName = {
	"item_winter_mushroom": "Winter Mushroom",
	"item_aegis": "Aegis of the Immortal",
	"item_cheese": "Cheese",
	"item_orb_of_venom": "Orb of Venom",
	"item_null_talisman": "Null Talisman",
	"item_wraith_band": "Wraith Band",
	"item_magic_wand": "Magic Wand",
	"item_bracer": "Bracer",
	"item_poor_mans_shield": "Poor Man's Shield",
	"item_headdress": "Headdress",
	"item_soul_ring": "Soul Ring",
	"item_buckler": "Buckler",
	"item_urn_of_shadows": "Urn of Shadows",
	"item_void_stone": "Void Stone",
	"item_ring_of_health": "Ring of Health",
	"item_helm_of_iron_will": "Helm of Iron Will",
	"item_tranquil_boots": "Tranquil Boots",
	"item_ring_of_aquila": "Ring of Aquila",
	"item_ogre_axe": "Ogre Axe",
	"item_blade_of_alacrity": "Blade of Alacrity",
	"item_staff_of_wizardry": "Staff of Wizardry",
	"item_energy_booster": "Energy Booster",
	"item_medallion_of_courage": "Medallion of Courage",
	"item_vitality_booster": "Vitality Booster",
	"item_point_booster": "Point Booster",
	"item_broadsword": "Broadsword",
	"item_phase_boots": "Phase Boots",
	"item_platemail": "Platemail",
	"item_claymore": "Claymore",
	"item_power_treads": "Power Treads",
	"item_arcane_boots": "Arcane Boots",
	"item_javelin": "Javelin",
	"item_ghost": "Ghost Scepter",
	"item_shadow_amulet": "Shadow Amulet",
	"item_mithril_hammer": "Mithril Hammer",
	"item_oblivion_staff": "Oblivion Staff",
	"item_pers": "Perseverance",
	"item_ancient_janggo": "Drums of Endurance",
	"item_talisman_of_evasion": "Talisman of Evasion",
	"item_helm_of_the_dominator": "Helm of the Dominator",
	"item_hand_of_midas": "Hand of Midas",
	"item_mask_of_madness": "Mask of Madness",
	"item_vladmir": "Vladmir's Offering",
	"item_yasha": "Yasha",
	"item_sange": "Sange",
	"item_ultimate_orb": "Ultimate Orb",
	"item_hyperstone": "Hyperstone",
	"item_hood_of_defiance": "Hood of Defiance",
	"item_blink": "Blink Dagger",
	"item_lesser_crit": "Crystalys",
	"item_blade_mail": "Blade Mail",
	"item_vanguard": "Vanguard",
	"item_force_staff": "Force Staff",
	"item_mekansm": "Mekansm",
	"item_demon_edge": "Demon Edge",
	"item_travel_boots": "Boots of Travel",
	"item_armlet": "Armlet of Mordiggan",
	"item_veil_of_discord": "Veil of Discord",
	"item_mystic_staff": "Mystic Staff",
	"item_necronomicon": "Necronomicon 1",
	"item_maelstrom": "Maelstrom",
	"item_cyclone": "Eul's Scepter of Divinity",
	"item_dagon": "Dagon 1",
	"item_basher": "Skull Basher",
	"item_invis_sword": "Shadow Blade",
	"item_rod_of_atos": "Rod of Atos",
	"item_reaver": "Reaver",
	"item_soul_booster": "Soul Booster",
	"item_eagle": "Eaglesong",
	"item_diffusal_blade": "Diffusal Blade",
	"item_pipe": "Pipe of Insight",
	"item_relic": "Sacred Relic",
	"item_heavens_halberd": "Heaven's Halberd",
	"item_black_king_bar": "Black King Bar",
	"item_necronomicon_2": "Necronomicon 2",
	"item_dagon_2": "Dagon 2",
	"item_desolator": "Desolator",
	"item_sange_and_yasha": "Sange & Yasha",
	"item_orchid": "Orchid Malevolence",
	"item_diffusal_blade_2": "Diffusal Blade 2",
	"item_ultimate_scepter": "Aghanim's Scepter",
	"item_bfury": "Battle Fury",
	"item_shivas_guard": "Shiva's Guard",
	"item_ethereal_blade": "Ethereal Blade",
	"item_bloodstone": "Bloodstone",
	"item_manta": "Manta Style",
	"item_radiance": "Radiance",
	"item_sphere": "Linken's Sphere",
	"item_necronomicon_3": "Necronomicon 3",
	"item_dagon_3": "Dagon 3",
	"item_refresher": "Refresher Orb",
	"item_assault": "Assault Cuirass",
	"item_mjollnir": "Mjollnir",
	"item_monkey_king_bar": "Monkey King Bar",
	"item_heart": "Heart of Terrasque",
	"item_greater_crit": "Daedalus",
	"item_skadi": "Eye of Skadi",
	"item_sheepstick": "Scythe of Vyse",
	"item_butterfly": "Butterfly",
	"item_satanic": "Satanic",
	"item_rapier": "Divine Rapier",
	"item_dagon_4": "Dagon 4",
	"item_abyssal_blade": "Abyssal Blade",
	"item_dagon_5": "Dagon 5"
};

exports.buildItemTable = buildItemTable;
exports.enchantLoot = enchantLoot;
exports.changeItemProperties = changeItemProperties;
exports.getEntryByClassname = getEntryByClassname;
exports.random = getRandomLoot;
exports.baseTable = baseItemTable;