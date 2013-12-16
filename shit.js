// ==========================================
// Item Dispenser
// ==========================================
timers.setInterval(function() {
	// Map has not initialized
	if (!settings.mapLoaded)
		return;

	// No players connected
	var playerIDs = playerManager.getConnectedPlayerIDs();
	if (playerIDs.length === 0)
		return;

	// Game state invalid
	if (!util.getGameState(dota.STATE_GAME_IN_PROGRESS))
		return;

	// Initial plugin phase
	if (!settings.pluginLoaded) {
		// Load the plugin
		settings.pluginLoaded = true;

		// Randomly select our initial drop time
		var selected = settings.leadTime[util.getRandomNumber(settings.leadTime.length)];

		// Convert the time into seconds
		var converted = util.convertMinutesToSeconds(selected);

		// To communicate with the game timer when the next drop will be exactly
		settings.nextTime = converted;
		settings.gameTime = game.rules.props.m_fGameTime + converted;

		// Tell players when the first drop is
		var cmdmsg = (enchanter.enabled ? ' use -lie for enchant commands.' : '');
		playerManager.printAll(settings.dropNotifications.lead + cmdmsg, [selected]);

		// Re-build our item table if it does not exist
		if (settings.itemTable.instance === null)
			itemManager.buildItemTable();

		// Tailor per-player loot if the wardrobe addon is enabled
		if (settings.itemTable.useWeights && wardrobe.enabled) {
			var incompatiblePlugins = wardrobe.disallowPlugins;
			for (i = 0; i < incompatiblePlugins.length; ++i) {
				if (plugin.exists(incompatiblePlugins[i])) {
					wardrobe.enabled = false;
					break;
				}
			}
			if (wardrobe.enabled && !wardrobe.loaded) {
				var abilityPlugins = wardrobe.abilityPlugins;
				for (i = 0; i < abilityPlugins.length; ++i) {
					if (plugin.exists(abilityPlugins[i])) {
						wardrobe.checkAbilities = true;
						break;
					}
				}
				tailorHeroes();
				wardrobe.loaded = true;
			}
		}
		// Apply custom gold accumulation
	    if (settings.money.GP10 > 0) {
	        timers.setInterval(function() {
	            // Game state invalid
	            if (!util.getGameState(dota.STATE_GAME_IN_PROGRESS))
	                return;

	            var players = playerManager.getConnectedPlayerIDs();
	            for (var i = 0; i < players.length; ++i) {
	                var playerID = players[i];
	                var client = dota.findClientByPlayerID(playerID);
	                if (client === null) continue;

	                var gold = playerManager.getPlayerGold(playerID);
	                if (!gold) continue;

	                // Add extra gold
	                gold.u += settings.money.GP10;

	                playerManager.setPlayerGold(playerID, gold);
	            }
	        }, 10000);
	    }
	    if (settings.money.GPS > 0) {
	        timers.setInterval(function() {
	            // Game state invalid
	            if (!util.getGameState(dota.STATE_GAME_IN_PROGRESS))
	                return;

	            var players = playerManager.getConnectedPlayerIDs();
	            for (var i = 0; i < players.length; ++i) {
	                var playerID = players[i];
	                var client = dota.findClientByPlayerID(playerID);
	                if (client === null) continue;

	                var gold = playerManager.getPlayerGold(playerID);
	                if (!gold) continue;

	                // Add extra gold
	                gold.u += settings.money.GPS;

	                playerManager.setPlayerGold(playerID, gold);
	            }
	        }, 1000);
	    }
	}
	if (settings.pluginLoaded && game.rules.props.m_fGameTime >= settings.gameTime && !settings.pluginHalted) {

		// New item wave, increment item waves count
		settings.currentWave += 1;

		// Select our next base time.
		var selected = settings.nextBase[util.getRandomNumber(settings.nextBase.length)];

		// Convert the time into seconds
		var converted = util.convertMinutesToSeconds(selected);

		// Calculate additional shake seconds
		// var randomized = util.getRandomNumber( util.flipNumber( settings.shakeTime ) );

		var increment = converted; // + randomized;

		settings.nextTime += increment;
		settings.gameTime += increment;

		if (settings.dropNotifications.enabled) {
			var shakeTime = util.convertSecondsToMinutes(settings.nextTime + util.getRandomNumber(util.flipNumber(settings.shakeTime)));
			playerManager.printAll(settings.dropNotifications.subsequent, [shakeTime]);
		}

		var players = playerManager.getConnectedPlayerIDs();
		for (var i = 0; i < players.length; ++i) {
			// Skip players exempt from items
			if (settings.skipPlayers.indexOf(players[i]) > -1)
				continue;

			settings.playerList.push(players[i]);
		}

		startDispensing();

		if (settings.waveLimit > 0 && settings.currentWave >= settings.waveLimit) {
			settings.pluginHalted = true;
			playerManager.printAll('End', []);
		}
	}
}, 100);

function startDispensing() {
	var timer = timers.setInterval(function() {
		if (settings.playerList.length > 0) {
			// Randomize the playerList
			util.shuffle(settings.playerList);

			// Pop a playerID
			var playerID = settings.playerList.pop();

			// Retrieve a unique random item name
			var item = itemManager.getUniqueItemName(playerID);
			
			// Give the player their item
			playerManager.giveItem(playerID, item);
			
			// Perform our sub-par items re-loot chance
			if (settings.reLootTable.indexOf(item[0]) > -1 && util.getRandomNumber(100) < settings.reLootPercentage) {
				// Get unique item name
				item = itemManager.getUniqueItemName(playerID);

				// Disable the sounds
				settings.sounds.enabled = false;

				// Give additional item to our player
				playerManager.giveItem(playerID, item);

				// Enable the sounds
				settings.sounds.enabled = true;
			}
		}
		else {
			// Clear the player list
			settings.playerList.length = 0;
			// Clear the timer
			timers.clearInterval(timer);
		}
	}, settings.dispenseTimeout * 1000);
}

// ==========================================
// Addon: Wardrobe
// ==========================================

function tailorHeroes() {
	var baseTable = settings.itemTable.instance;
	var tmpTable = util.clone(itemManager.baseTable);
	// Loop through the playerList
	for (var i = 0; i < settings.playerList.length; i++) {
		var playerID = settings.playerList[i];

		// Check if we have a hero
		var hero = playerManager.grabHero(playerID);
		if (hero === null) continue; // Skip

		// Have we already built the loot table for this player?
		if (playerProps[playerID].buildLootTable) {

			var isMelee = (hero.netprops.m_iAttackCapabilities === dota.UNIT_CAP_MELEE_ATTACK ? true : false);
			var heroName = hero.getClassname();

			playerProps[playerID].lootTable = tmpTable;

			var hFile = wardrobe.heroFile;
			var sFile = wardrobe.spellFile;

			var heroExists = (typeof hFile.Heroes[heroName] !== "undefined" ? true : false);

			if (!heroExists)
				continue;

			// Remove the chance to random banned melee items on ranged heroes
			if (!isMelee) {
				for (var j = 0; j < wardrobe.rules.rangedBanned.length; ++j) {
					var banName = wardrobe.rules.rangedBanned[j];
					for (k = 0; k < playerProps[playerID].lootTable.length; k++) {
						var entry = playerProps[playerID].lootTable[k];
						if (entry[0] == banName)
							entry[1] = 0;
					}
				}
			}

			// Primary Hero Attribute Modification
			var fileFieldPrimaryExists = (typeof hFile.Heroes[heroName].attributePrimary !== "undefined" ? true : false);
			if (fileFieldPrimaryExists) {
				var attr = hFile.Heroes[heroName].attributePrimary;
				for (var j = 0; j < playerProps[playerID].lootTable.length; j++) {
					var entry = playerProps[playerID].lootTable[j];

					if (entry[4] === 0)
						continue;

					var itemPhase = entry[3];

					if (attr & entry[4])
						entry[1] += (wardrobe.rules.attributePrimary / itemPhase);
					else {
						entry[1] -= (wardrobe.rules.attributePrimary / itemPhase);
						if (entry[1] <= 0)
							entry[1] = 1;
					}
				}
			}
			if (!wardrobe.checkAbilities) {
				// Weight modifications based on hero.
				if (heroExists) {
					if (typeof hFile.Heroes[heroName].itemBuild !== "undefined") {
						for (var j = 0; j < hFile.Heroes[heroName].itemBuild.length; j++) {
							var prop = hFile.Heroes[heroName].itemBuild[j];
							for (var k = 0; k < playerProps[playerID].lootTable.length; k++) {
								var entry = playerProps[playerID].lootTable[k];
								if (entry[0] == prop) {
									var price = entry[2];
									var itemPhase = entry[3];
									var primAttributeMask = entry[4];
									var recBuild = (wardrobe.rules.recommendedBuildList / itemPhase);
									playerProps[playerID].lootTable[k][1] += recBuild;
								}
							}
						}
					}
					if (typeof hFile.Heroes[heroName].bannedBuild !== "undefined") {
						for (var j = 0; j < hFile.Heroes[heroName].bannedBuild.length; j++) {
							for (var k = 0; k < playerProps[playerID].lootTable.length; k++) {
								var entry = playerProps[playerID].lootTable[k];

								if (entry[0] == hFile.Heroes[heroName].bannedBuild[j]) {
									entry[1] = 0;
								}
							}
						}
					}
					for (var j = 0; j < playerProps[playerID].lootTable.length; j++) {
						var entry = playerProps[playerID].lootTable[j];

						// Scepter changes
						if (entry[0] == "item_ultimate_scepter") {
							if (hFile.Heroes[heroName].ultimateUpgrade === 0) {
								entry[1] = 0;
							} else if (hFile.Heroes[heroName].ultimateUpgrade === 1) {
								entry[1] = wardrobe.rules.scepterUpgrade;
							}
						}
					}
				}
			} else {
				var abilities = [];
				for (var j = 0; j < 15; j++) {
					if (hero.netprops.m_hAbilities[j] !== null) {
						var name = hero.netprops.m_hAbilities[j].getClassname();
						abilities.push(name);
					}
				}
				var scepterAbility = false;

				// Analyze the abilities
				for (var k = 0; k < abilities.length; ++k) {
					if (sFile.Abilities.scepter.indexOf(abilities[k]) > -1) {
						scepterAbility = true;
						break;
					} else
						continue;
				}

				// Weight modifications based on hero abilities
				for (var j = 0; j < playerProps[playerID].lootTable.length; j++) {
					var entry = playerProps[playerID].lootTable[j];

					// Scepter changes
					if (entry[0] == "item_ultimate_scepter") {
						if (scepterAbility)
							entry[1] = wardrobe.rules.scepterUpgrade;
						else
							entry[1] = 0;
					}
				}
			}
			playerProps[playerID].buildLootTable = false;
		}
	}
}