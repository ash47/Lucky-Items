exports.getLifeState = function(unit) {
	if (!unit) return;

	return unit.netprops.m_lifeState;
}

exports.isBankAvailable = function(hero) {
	if (!hero) return;

	for (var i = HERO_STASH_BEGIN; i <= HERO_STASH_END; ++i) {
		var entity = hero.netprops.m_hItems[i];
		if (entity === null)
			return true;
	}
	return false;
}

exports.isInventoryAvailable = function(hero) {
	if (!hero) return;

	for (var i = HERO_INVENTORY_BEGIN; i <= HERO_INVENTORY_END; ++i) {
		var entity = hero.netprops.m_hItems[i];
		if (entity === null)
			return true;
	}
	return false;
}

exports.pullHeroEquipment = function(hero, type) {
	if (!hero) return;

	var heroItemsEquipped = [];
	for (var i = HERO_INVENTORY_BEGIN; i <= HERO_STASH_END; i++)
	{
		var entity = hero.netprops.m_hItems[i];
		if (entity === null)
			continue;

		if (type === 1)
			entity = entity.getClassname();

		heroItemsEquipped.push(entity);
	}
	return heroItemsEquipped;
}

exports.pullHeroInventory = function(hero, type) {
	if (!hero) return;

	var heroItemsEquipped = [];
	for (var i = HERO_INVENTORY_BEGIN; i <= HERO_INVENTORY_END; i++) {
		var entity = hero.netprops.m_hItems[i];
		if (entity === null)
			continue;

		if (type === 1)
			entity = entity.getClassname();

		heroItemsEquipped.push(entity);
	}
	return heroItemsEquipped;
}

exports.isPlayerHero = function(entity) {
	var props = entity.netprops;

	if (!entity.isHero())
		return false;

	if (props['m_iPlayerID'] === -1)
		return false;

	if (props['m_iTeamNum'] < 2 || props['m_iTeamNum'] > 3)
		return false;

	return true;
}

exports.checkForBoots = function(heroInventory, boots) {
	for (var i = 0; i < heroInventory.length; ++i)
	{
		if (boots.indexOf(heroInventory[i]) > -1)
			return true;
	}
	return false;
}