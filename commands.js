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
		playerManager.print(playerID, "-ei 0 (scan inventory items)", []);
		playerManager.print(playerID, "-ei 1-6 (see enchant properties)", []);
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
		var nextItem = itemManager.itemName[ props[playerID].queue[0][0] ];
		playerManager.print(playerID, "There are %s items in the queue", [queueLength]);
		playerManager.print(playerID, "Next item in queue: %s", [nextItem]);
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

	if (args.length === 0) {
		for(var cat in enchants.enchantMap) {
			if (cat == 'clone') continue;
			var arr = enchants.enchantMap[cat];
			playerManager.print(playerID, '%s enchantments:', [util.capitaliseFirstLetter(cat)]);
			for (var i = 0; i < arr.length; ++i) {
				var name = arr[i].name;
				var desc = arr[i].desc;
				playerManager.print(playerID, '%s: %s', [util.capitaliseFirstLetter(name), desc]);
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

		if ( itemManager.itemName[clsname] )
			var named = itemManager.itemName[clsname];
		else
			var named = clsname;

		if (item.enchanted)
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

			        		playerManager.print(playerID, '%s %s: {%s}', [named, util.capitaliseFirstLetter(type), util.objToString(props) ]);
			        	}
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

		for (var i = 0; i < equipment.length; ++i)
		{
			if (equipment[i].enchanted)
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

			if ( itemManager.itemName[clsname] )
				var named = itemManager.itemName[clsname];
			else
				var named = clsname;

			if (equip.chants && equip.chants.length > 0) {
				playerManager.print(playerID, "(Slot %s) %s is enchanted with: %s", [(i + 1), named, equip.chants.join(', ')]);
			}
		}
		playerManager.print(playerID, 'Use -ei [1-6] for detailed information.', []);
	}
}