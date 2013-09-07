// ==========================================
// Client Commands
// ==========================================
//
console.addClientCommand("li", clientFunctions);
function clientFunctions(client, args) {
	var playerID = client.netprops.m_iPlayerID;
	playerManager.print(playerID, "commands are:", []);
	playerManager.print(playerID, "-queue (see inside queue)", []);
	playerManager.print(playerID, "-queue clear (destroy items)", []);
	if (enchanter.enabled) {
		playerManager.print(playerID, "-ei (see all enchant descriptions)", []);
		playerManager.print(playerID, "-ei 0 (scan inventory items for enchants)", []);
		playerManager.print(playerID, "-ei 1-6 (see specific item enchant properties)", []);
		playerManager.print(playerID, "-enchant 1-6 <name> (enchant item)", []);
	}
	else
		playerManager.print(playerID, "-ei (disabled, no item enchants)", []);
}

console.addClientCommand("queue", queueFunctions);
function queueFunctions(client, args) {
	var playerID = client.netprops.m_iPlayerID;
	var props = playerManager.getProps();
	if (props[playerID].queue.length === 0) {
		playerManager.print(playerID, "There are no items in the queue", []);
		return;
	}
	else
		var queueLength = props[playerID].queue.length;

	if (args.length === 0) {
		var items = [];
		for (var i = 0; i < props[playerID].queue.length; ++i) {
			var entry = props[playerID].queue[i];
			var string = itemManager.getStringName(entry[0]);
			items.push(string);
		}
		if (items.length > 4) {
			items = items.splice(0, 4);
		}
		var inline = items.join(', ');
		playerManager.print(playerID, 'There are %s items in the queue', [queueLength]);
		playerManager.print(playerID, 'Next items in queue: %s', [inline]);
	}
	if (args.length > 1)
		return;

	else {
		switch(args[0])
		{
			default:

				break;
			case "clear":
				props[playerID].queue.length = 0;
				playerManager.print(playerID, "Cleared! There were %s items in the queue", [queueLength]);
				break;
		}
	}
}
console.addClientCommand("ei", enchantFunctions);
function enchantFunctions(client, args) {
	var playerID = client.netprops.m_iPlayerID;
	if (!enchanter.enabled) {
		playerManager.print(playerID, 'Enchanter module not enabled for this lobby.', []);
		return;
	}

	var hero = client.netprops.m_hAssignedHero;
	if (!hero) return;

	if (args.length === 0 || args.length === 1 && args[0] == "list") {

		function compare(a,b) {
		  if (a.minimumHeroLevel < b.minimumHeroLevel)
		     return -1;
		  if (a.minimumHeroLevel > b.minimumHeroLevel)
		    return 1;
		  return 0;
		}

		for(var cat in enchants.enchantMap) {
			if (cat == 'clone') continue;
			var arr = enchants.enchantMap[cat];
			playerManager.print(playerID, '%s enchantments:', [util.capitaliseFirstLetter(cat)]);
			arr.sort(compare);
			for (var i = 0; i < arr.length; ++i) {
				var name = arr[i].name;
				var desc = arr[i].description;
				var reqlevel = arr[i].minimumHeroLevel;
				var props = arr[i].props;
				var maxLVL = arr[i].max;
				var cost = arr[i].cost.join(' / ');
				playerManager.print(playerID, '%s: %s (LVL %s+, COST: [%s])', [util.capitaliseFirstLetter(name), desc, reqlevel, cost]);
			}
		}
		return;
	}
		
	if (args.length !== 1) {
		playerManager.print(playerID, 'Use -ei # or types.');
		return;
	}

	var invSlot = Number(args[0]);
	if (isNaN(invSlot)) {
		playerManager.print(playerID, '# should be a number.');
		return;
	}
	
	invSlot--;
	if (invSlot < -1 || invSlot > 5) {
		playerManager.print(playerID, 'Use a value between 0 | 1 and 6.');
		return;
	}
	
	if (invSlot !== -1) {
		var item = hero.netprops.m_hItems[invSlot];
		if (item === null) {
			playerManager.print(playerID, 'There is no item in this slot.');
			return;
		}
			
		var clsname = item.getClassname();
		var named = itemManager.getStringName(clsname);

		if (item.enchants)
		{
	        // Look at what type of enchants exist
	        for (var cat in enchants.enchantMap)
	        {
	        	if (cat == 'clone') continue;

	        	var arr = enchants.enchantMap[cat];

	        	if (DEBUG) server.print("Found item cat: " + cat);

		        for (var type in arr)
		        {
		        	if (type == 'clone') continue;

		        	var ench = arr[type];

		        	if (item.enchants[ench.name])
		        	{
		        		if (DEBUG) server.print("Found item enchant: " + ench.name);
		        		var props = item.enchants[ench.name].props;

		        		playerManager.print(playerID, '%s %s: {%s}', [named, util.capitaliseFirstLetter(ench.name), util.objToString(props) ]);
		        		playerManager.print(playerID, '%s: %s', [util.capitaliseFirstLetter(ench.name), ench.description]);
		        	}
				}
	        }
		}
		else {
			playerManager.print(playerID, "%s is not enchanted", [named]);
			return;
		}
	}
	else {
		var equipment = unitManager.pullHeroInventory(hero);
		if (equipment.length === 0)
			playerManager.print(playerID, "No items to look at", []);

		var found = false;

		for (var i = 0; i < equipment.length; ++i)
		{
			if (equipment[i].enchants)
			{
				found = true;
				var entity = equipment[i];
				entity.chants = [];
		        // Look at what type of enchants exist
		        for (var cat in enchants.enchantMap)
		        {
		        	if (cat == 'clone') continue;

		        	var arr = enchants.enchantMap[cat];

		        	if (DEBUG) server.print("Found item cat: " + cat);

			        for (var type in arr)
			        {
			        	if (type == 'clone') continue;

			        	var ench = arr[type];

			        	if (entity.enchants[ench.name])
			        	{
			        		if (DEBUG) server.print("Found item enchant: " + ench.name);
			        		var props = entity.enchants[ench.name].props;

			        		entity.chants.push(util.capitaliseFirstLetter(ench.name));
			        	}
					}
		        }
			}
		}
		if (found) {
			for (var i = 0; i < equipment.length; ++i)
			{
				var equip = equipment[i];

				var clsname = equip.getClassname();
				var named = itemManager.getStringName(clsname);

				if (equip.chants && equip.chants.length > 0) {
					playerManager.print(playerID, "(Slot %s) %s is enchanted with: %s", [(i + 1), named, equip.chants.join(', ')]);
				}
			}
			playerManager.print(playerID, 'Use -ei [1-6] for detailed information.', []);
		}
		else {
			playerManager.print(playerID, "No items in the inventory appear to be enchanted.");
		}
	}
}

// ==========================================
// Game Hooks
// ==========================================
console.addClientCommand("enchant", enchantItem);
// Use: -enchant 1 timestop
function enchantItem(client, args) {
	var playerID = client.netprops.m_iPlayerID;
	if (!enchanter.enabled) {
		playerManager.print(playerID, 'Enchanter module not enabled for this lobby.', []);
		return;
	}
	if (enchanter.enabled && !enchanter.shop) {
		playerManager.print(playerID, 'Shop module not enabled for this lobby.', []);
		return;
	}
	var hero = client.netprops.m_hAssignedHero;
	if (!hero) return;

	if (args.length === 0) {
		playerManager.print(playerID, 'Proper command is -enchant # name. type -ei or -ei list for names.');
		return;
	}

	var invSlot = Number(args[0]);
	if (isNaN(invSlot)) {
		playerManager.print(playerID, '# should be a number.');
		return;
	}
	
	invSlot--;
	if (invSlot < 0 || invSlot > 5) {
		playerManager.print(playerID, 'Use value between 1 and 6.');
		return;
	}

	var item = hero.netprops.m_hItems[invSlot];
	if (item === null) {
		playerManager.print(playerID, 'There is no item in this slot.');
		return;
	}

	if (args.length === 1) {
		playerManager.print(playerID, 'Proper command is -enchant %s name.', [args[0]]);
		playerManager.print(playerID, 'Forgot the enchant name? type -ei or -ei list');
		return;
	}

	var map = enchants.getMap();
	var allenchants = map.onHit.concat(map.onEquip);

	var enchtype = args[1];
	var foundEnchant = false;
	for (var i = 0; i < allenchants.length; ++i) {
		var currEnchant = allenchants[i];
		if (currEnchant.name === enchtype) {
			// Found the enchantment type
			foundEnchant = true;

			if (!item.enchants)
				item.enchants = {};

			// Check if the hero's level can actually use it.
			var hero = playerManager.grabHero(playerID);
			if (hero === null) return;
			var heroLevel = hero.netprops.m_iCurrentLevel;
			if (heroLevel < currEnchant.minimumHeroLevel) {
				playerManager.print(playerID, "You need to be level %s or higher to purchase this enchantment.", [currEnchant.minimumHeroLevel]);
				return;
			}

			function createProps(ent, name) {
				if(!ent.enchants[name])
					ent.enchants[name] = {};

				if(!ent.enchants[name].props)
					ent.enchants[name].props = {level: 0};

				return ent;
			}

			if (!item.enchants[currEnchant.name])
				item = createProps(item, currEnchant.name);

			// Enchantment level checking
			if (currEnchant.max && item.enchants[currEnchant.name].props.level >= currEnchant.max) {
				playerManager.print(playerID, "The enchantment on this item is at the maximum level.");
				return;
			}

			// Player purchase the enchantment
			var costidx = item.enchants[currEnchant.name].props.level;
			if (!playerManager.purchase(playerID, currEnchant.cost[costidx])) {
				playerManager.print(playerID, "You don't have enough gold to purchase this enchantment. (%sg)", [currEnchant.cost[costidx]]);
				return;
			}

			var newLevel = item.enchants[currEnchant.name].props.level += 1;
			currEnchant.setup(item, enchtype, newLevel);

			// Play a random enchant sound after 10 frames
			dota.sendAudio(client, false, 'ui/buy.wav');
			timers.setTimeout(function() {
				var sounds = settings.sounds.itemEnchanted;
				var sound = util.randomElement(sounds);
				dota.sendAudio(client, false, sound);
			}, 10);

			var itemName = itemManager.getStringName(item.getClassname());
			var enchantmentFormatName = util.capitaliseFirstLetter(currEnchant.name);
			playerManager.print(playerID, "[%sg] Enchanted %s with %s (%s/%s)", [currEnchant.cost[costidx], itemName, enchantmentFormatName, newLevel, currEnchant.max]);
			var props = item.enchants[currEnchant.name].props;
			playerManager.print(playerID, "Extra properties: {%s}", [util.objToString(props)]);
			break;
		}
	}
	if (!foundEnchant) {
		playerManager.print(playerID, 'There is no enchant type with that name.');
		return;
	}

	// // This item is already enchanted, list possible other enchantments
	// if (item.enchanted)

	// var enchantName = util.capitaliseFirstLetter(enchant.name);
	// enchant.setup(entity, enchant.name, level);


	// playerManager.print(playerID, "%s enchanted %s [level %s] %s", [named, name, level, type]);

}
