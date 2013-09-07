// ==========================================
// Lobby Setup
// ==========================================
var lobbyManager;
plugin.get('LobbyManager', function(obj){
	lobbyManager = obj;
	var optionTime = lobbyManager.getOptionsForPlugin('WeaponMayhem')['Speed'];
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

	var optionProp = lobbyManager.getOptionsForPlugin('WeaponMayhem')['Properties'];
	switch(optionProp)
	{
		default: case "Weighted": break;
		case "Non-weighted":
			settings.itemTable.useWeights = false;
			break;
	}
	var optionEnchant = lobbyManager.getOptionsForPlugin('WeaponMayhem')['Enchantments'];
	switch(optionEnchant)
	{
		default:
		case "Enchantments Disabled": break;
		case "Enchantments Enabled (Shop)":
			enchanter.enabled = true;
			enchanter.shop = true;
			break;
		case "Enchantments Enabled (Random)":
			enchanter.enabled = true;
			enchanter.random = true;
			break;
		case "Enchantments Enabled (Shop + Random)":
			enchanter.enabled = true;
			enchanter.random = true;
			enchanter.shop = true;
			break;
	}

	var optionSelection = lobbyManager.getOptionsForPlugin('WeaponMayhem')['Selection'];
	switch(optionSelection)
	{
		case "> 275g":
			settings.itemTable.priceRangeMin = 275;
			break;
		default: case "> 1,000g": break;
		case "> 1,500g":
			settings.itemTable.priceRangeMin = 1500;
			break;
		case "> 2,000g":
			settings.itemTable.priceRangeMin = 2000;
			break;
		case "> 2,500g":
			settings.itemTable.priceRangeMin = 2500;
			break;
		case "Mushrooms only":
			settings.itemTable.customMode = 10;
			break;
		case "Cursed Rapier & Aegis":
			settings.itemTable.customMode = 11;
			break;
		case "Rapier & Aegis":
			settings.itemTable.customMode = 2;
			break;
		case "Weapons":
			settings.itemTable.customMode = 4;
			break;
		case "Armor & Defensive":
			settings.itemTable.customMode = 5;
			break;
		case "Caster & Support":
			settings.itemTable.customMode = 3;
			break;
		case "Early Game":
			settings.itemTable.customMode = 6;
			break;
	}
	itemManager.buildItemTable();
});