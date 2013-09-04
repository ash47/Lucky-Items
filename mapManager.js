// ==========================================
// Hooks
// ==========================================
game.hook("OnMapStart", onMapStart);

// ==========================================
// Functions
// ==========================================
function onMapStart() {
	settings.mapLoaded = true;

	if (enchanter.enabled) {
		// Bloodlust
		dota.loadParticleFile('particles/units/heroes/hero_ogre_magi.pcf');
		// Frostbite
		dota.loadParticleFile('particles/units/heroes/hero_crystalmaiden.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_doom_bringer.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_dark_seer.pcf');

		dota.loadParticleFile('particles/units/heroes/hero_bane.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_omniknight.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_enchantress.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_razor.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_bloodseeker.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_axe.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_kunkka.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_tinker.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_sven.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_vengeful.pcf');

		dota.loadParticleFile('particles/units/heroes/hero_batrider.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_brewmaster.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_clinkz.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_magnataur.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_witchdoctor.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_lycan.pcf');
		game.precacheModel('models/heroes/lycan/lycan_wolf.mdl');

		// Make a dummy entity to store our item enchantment abilities
		enchanter.onHitEnchantEntity = dota.createUnit('npc_dota_units_base', dota.TEAM_NEUTRAL);
		var onHitMap = enchants.enchantMap.onHit;
		for (var i = 0; i < onHitMap.length; ++i)
		{
			if (onHitMap[i].spell)
			{
				var enchantmentName = onHitMap[i].name;

				enchanter.onHitEnchantEntity[enchantmentName] = dota.createAbility(enchanter.onHitEnchantEntity, onHitMap[i].spell);

				// Level up the ability
				if (onHitMap[i].level && onHitMap[i].level > 0)
					enchanter.onHitEnchantEntity[enchantmentName].netprops.m_iLevel = onHitMap[i].level;

				// Find the first free slot for this skill
				for (var a = 0; a < 16; ++a) {
					if (enchanter.onHitEnchantEntity.netprops.m_hAbilities[a] === null) {

						dota.setAbilityByIndex(enchanter.onHitEnchantEntity, enchanter.onHitEnchantEntity[enchantmentName], a);
						break;
					}
				}
			}
		}

		enchanter.onEquipEnchantEntity = dota.createUnit('npc_dota_units_base', dota.TEAM_NEUTRAL);
		var constantMap = enchants.enchantMap.onEquip;
		for (var i = 0; i < constantMap.length; ++i)
		{
			if (constantMap[i].spell)
			{
				var enchantmentName = constantMap[i].name;

				enchanter.onEquipEnchantEntity[enchantmentName] = dota.createAbility(enchanter.onEquipEnchantEntity, constantMap[i].spell);

				// Level up the ability
				if (constantMap[i].level && constantMap[i].level > 0)
					enchanter.onEquipEnchantEntity[enchantmentName].netprops.m_iLevel = constantMap[i].level;
			}
		}
	}
}