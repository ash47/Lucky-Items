// ==========================================
// Hooks
// ==========================================
game.hook("OnMapStart", onMapStart);
game.hook("Dota_OnBuyItem", onBuyItem);

// ==========================================
// Functions
// ==========================================
function onBuyItem(unit, itemcls, playerID, unknown) {
	if (settings.addons.nobuy.enabled) {
		var iList = [
			"item_courier",
			"item_flying_courier",
			"item_ward_observer",
			"item_ward_sentry",
			"item_dust",
			"item_smoke_of_deceit",
			"item_tpscroll",
			"item_gem",
			"item_tango",
			"item_bottle",
			"item_magic_stick",
			"item_magic_wand",
			"item_recipe_magic_wand",
			"item_branches",
			"item_flask",
			"item_clarity",
			"item_stout_shield",
			"item_quelling_blade"
		];

		// Enable all item purchases in the white list.
		if (iList.indexOf(itemcls) > -1)
			return;

		// Disable everything else.
		return false;
	}
}

function onMapStart() {
	settings.mapLoaded = true;

	// Grab the player manager
	settings.dotaPlayerManager = game.findEntityByClassname(-1, "dota_player_manager");
	if (!settings.dotaPlayerManager || settings.dotaPlayerManager == null)
		server.print('\n\nFAILED TO FIND RESOURCE HANDLE\n\n');

	// Halloween Rapier particles
	dota.loadParticleFile('particles/hw_fx.pcf');

	if (enchanter.enabled) {
		// Bloodlust
		dota.loadParticleFile('particles/units/heroes/hero_ogre_magi.pcf');
		// Frostbite
		dota.loadParticleFile('particles/units/heroes/hero_crystalmaiden.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_doom_bringer.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_dark_seer.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_bounty_hunter.pcf');

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

		dota.loadParticleFile('particles/units/heroes/hero_medusa.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_mirana.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_antimage.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_juggernaut.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_sandking.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_keeper_of_the_light.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_troll_warlord.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_viper.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_invoker.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_gyrocopter.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_sniper.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_slardar.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_enigma.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_necrolyte.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_ursa.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_warlock.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_death_prophet.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_faceless_void.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_luna.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_leshrac.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_huskar.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_razor.pcf');
		dota.loadParticleFile('particles/units/heroes/hero_night_stalker.pcf');
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