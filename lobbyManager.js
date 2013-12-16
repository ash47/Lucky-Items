var settings = require('settings.js').s;
var util = require('util.js');
var itemManager = require('itemManager.js');

var enchanter = settings.enchanter;

// ==========================================
// Lobby Setup
// ==========================================
var lobbyManager;
plugin.get('LobbyManager', function(obj){
	lobbyManager = obj;
	var option1 = lobbyManager.getOptionsForPlugin('WeaponMayhem')['Speed'];
	if (option1) {
		settings.leadTime.length = 0;
		settings.nextBase.length = 0;
		settings.leadTime = [option1];
		settings.nextBase = [option1];

		var s = util.convertMinutesToSeconds(option1);

		if (s < settings.sounds.timeThreshold)
			settings.sounds.enabled = false;

		if (s < settings.dropNotifications.timeThreshold)
			settings.dropNotifications.enabled = false;
	}
	var option2 = lobbyManager.getOptionsForPlugin('WeaponMayhem')["Method"];
	switch(option2)
	{
		default:
		case "Non-weighted":
			settings.itemTable.useWeights = false;
			break;
		case "Weighted":
			settings.itemTable.useWeights = true;
			break;
	}
	var option3 = lobbyManager.getOptionsForPlugin('WeaponMayhem')["Price"];
	switch(true)
	{
		default:
			settings.itemTable.priceRangeMin = 1500;
			break;
		// Minimum price range
		case (option3.indexOf("+") > -1):
			var minPrice = parseInt(option3);
			settings.itemTable.priceRangeMin = minPrice;
			break;
		// Maximum price range
		case (option3.indexOf("-") > -1):
			var maxPrice = parseInt(option3);
			settings.itemTable.priceRangeMax = maxPrice;
			settings.itemTable.priceRangeMin = 1000;
			break;
	}
	var option4 = lobbyManager.getOptionsForPlugin('WeaponMayhem')["Selection"];
	switch(option4)
	{
		default:
		case "No specifics":
			settings.itemTable.customMode = 1;
			break;
		case "Weapons":
			settings.itemTable.customMode = 4;
			break;
		case "Caster":
			settings.itemTable.customMode = 3;
			break;
		case "Defensive":
			settings.itemTable.customMode = 5;
			break;
		case "only Rapier":
			settings.itemTable.customMode = 2;
			break;
		case "only Mushrooms":
			settings.itemTable.customMode = 7;
			break;
		case "only Early Game":
			settings.itemTable.customMode = 6;
			break;
	}
	var option5 = lobbyManager.getOptionsForPlugin('WeaponMayhem')["Modifiers"];
	switch(option5)
	{
		default:
		case "Modifiers disabled": break;
		case "Modifiers enabled":
			enchanter.enabled = true;
			enchanter.random = true;
			break;
	}
	// var option6 = lobbyManager.getOptionsForPlugin('WeaponMayhem')['Gold'];
	// switch(option6)
	// {
	// 	default:
	// 	case "NBG": break;
	// 	case "+5 GP10":
	// 		settings.money.GP10 = 5;
	// 		break;
	// 	case "+6 G10":
	// 		settings.money.GP10 = 6;
	// 		break;
	// 	case "+7 GP10":
	// 		settings.money.GP10 = 7;
	// 		break;
	// 	case "+8 GP10":
	// 		settings.money.GP10 = 8;
	// 		break;
	// 	case "+1 GPS":
	// 		settings.money.GPS = 1;
	// 		break;
	// 	case "+2 GPS":
	// 		settings.money.GPS = 2;
	// 		break;
	// 	case "+3 GPS":
	// 		settings.money.GPS = 3;
	// 		break;
	// 	case "+4 GPS":
	// 		settings.money.GPS = 4;
	// 		break;
	// 	case "+5 GPS":
	// 		settings.money.GPS = 5;
	// 		break;
	// 	case "+10 GPS":
	// 		settings.money.GPS = 10;
	// 		break;
	// }
	itemManager.buildItemTable();
});

// ==========================================
// For devs to have control over plugin
// ==========================================
plugin.expose({
	// Disables items for the passed playerID
    disableItemsForPlayerID: function(playerID) {
    	var props = playerManager.getProps();
    	if (!props[playerID])
    		return false; // Invalid playerID

    	if (settings.skipPlayers.indexOf(playerID) > -1)
    		return false; // Already exists

    	settings.skipPlayers.push(playerID);
    	return true; // Success!
    },
	// Enables items for the disabled playerID
    enableItemsForPlayerID: function(playerID) {
    	var idx = settings.skipPlayers.indexOf(playerID);
    	if (idx > -1) {
    		settings.skipPlayers.splice(idx, 1);
    		return true;
    	}
    	return false;
    }
});