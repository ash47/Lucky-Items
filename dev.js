// ==========================================
// Developer Mode
// ==========================================
//

if (DEVELOPER) {
	server.print('----------\n\nWARNING: Developer mode is turned on!!!\n\n----------');
	load();
}
if (DEBUG) {
	server.print('----------\n\nWARNING: Debugger mode is turned on!!!\n\n----------');
}

function load() {
	settings.leadTime.length = 0;
	settings.nextBase.length = 0;
	settings.leadTime = ['0:08'];
	settings.nextBase = ['0:08'];
	var nextBase = util.convertMinutesToSeconds(settings.nextBase[0]);

	if (nextBase <= 120)
		settings.dropNotifications.enabled = false;

	// To compensate for 0:00
	settings.shakeTime = 0;

	// Set queue handler to abnormal
	// settings.queue.checkXSeconds = 0.1;

	// setupItemTable("Caster/Support items only");

	// Custom Mode 0 allows only a few items in.
	settings.itemTable.customMode = 11;
	settings.itemTable.powerWeight = 1;
	itemManager.buildItemTable();

	settings.itemTable.properties.sellable = true;
	enchanter.enabled = true;
	enchanter.percentage = 100;

	console.addClientCommand("load", liFill);
	function liFill(client, args) {

		hero = client.netprops.m_hAssignedHero;
		playerID = client.netprops.m_iPlayerID;

		var count = 0;
		do
		{
			count += 1
			for (var i = HERO_INVENTORY_BEGIN; i <= HERO_STASH_END; ++i) {
				item = itemManager.getUniqueItemName(playerID);
				playerManager.giveItem(playerID, item);
			}
			if (count >= 20) break;
		}
		while( unitManager.isInventoryAvailable(hero) || unitManager.isBankAvailable(hero) );
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
