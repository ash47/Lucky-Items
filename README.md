Lucky-Items
===========

  javascript plugin for dota2 http://d2ware.net/plugin?WeaponMayhem

###Previous History###

***

##### 1.3.0 (8/25/13)
- Finished a bulk update for the tailoring module, all heroes are personally tailored for their core & extension items, whilst also having an item ban list
 - Added a tiny weight increase for primary attribute items.
 - 1.3.1 will include support for OMG plugins.
- **Component exclusion list** changes:
 - Wraith Band [Exempt: Bracer, Null Talisman]
 - Null Talisman [Exempt: Wraith Band, Bracer]
 - Bracer [Exempt: Wraith Band, Null Talisman]
 - Mekansm [Exempt: Buckler]
 - Manta Style [Exempt: Yasha]
 - Heaven's Halberd [Exempt: Sange]
 - All main lifesteal items (Vlad's, Dom Helm, and Madness)
- **Team-wide exclusion list** changes:
 - Added Medallion of Courage (limit: 1)
 - Added Shiva's Guard (limit: 2)
 - Added Bloodstone (limit: 2)
 - Added Desolator (limit: 2)
 - Added Radiance (limit: 2)
 - Lowered Mekansm from 2 to 1
 - Lowered Hood of Defiance from 2 to 1
- Lowered base weights of cheese & aegis from 10 to 5.
- Re-ordered the time Lobby dropdown.
- Sound effects now play only when an item was placed in your inventory or stash.
- Cleaned up code once more.
- Moved version control to Github

***

##### 1.2.3 (8/24/13)

- Begin adding a tailoring system (WIP) that analyzes the current played hero and performs multiple actions on a per-player loot table system.
 - Added a check for aghanim's scepter upgrades (Heroes without a scepter upgrade will not recieve a scepter.) More to come.
 - Only available using the Weights setting.
 - Disabled on DeathMatch Dota and will only use the base item table.
- Added an aura based / team-wide item check. Items include: pipe, hood, vlads, mek, ring of basi/aquila, assault cuirass, drums, urn, and veil of discord (This prevents all 5 players being elegibile for drums. Instead, an X amount of persons of each team to get X item will also eliminate the possibility for their other teammates to get X item.)
- Added a percentage chance (75%) to reLoot on rolling a cheese or aegis instead of 100%
- Disabled subsequent item notifications for times lower than 2:15
- Moved the player inventory queue to a seperate timer instance.
- Increased items delay from queue to player inventory from 0.1s to 1 second
- Lowered queue reminder time from 3:30 to 2 minutes
- Lowered retries for finding an item from 15 to 8
- Changed item sharability from 0 to 1. (All players to team-only)

***

##### 1.2.2 (8/22/13)

- Modified Lobby time intervals to include 15-second seperators, and under 1-minute drop times.
- Modified Lobby loot table items to be more clear and have a minimum range of items.
- Changed default sound effect
- Increased max tries for an item from 10 to 15
- Added the following items to the component exclusion list: Randomed -> Excluded
lothar's (shadow amulet), pipe (hood of defiance), (butterfly/halberd) talisman of evasion, satanic (helm of the dominator), bloodstone (soul booster), daedalus (lesser crit), e-blade (ghost scepter), abyssal (basher) 

***

##### 1.2.1 (8/21/13)

- Added items less than 1,000g
- Added components & recipe upgrades
- Added a component & recipe exclusion list to prevent multiple randoms of the same item as a different upgrade.
- Altered weights. Every ~100-200 total gold value, reduced weight by 5.
- Modified Lobby lesser priced items selection in the loot table dropdown.

***

##### 1.2.0 (8/20/13)

- Removed chat color code on subsequent item drops
- Disabled pendulum until the methods determining item rewards are favorable for both teams.
- Fixed a check disallowing rapier and aegis to be randomed more than once.
- Lowered the shakeTime value from 10 to 4.
- Lobby Modes removed and replaced with direct time settings.
- Added new Lobby select to enable/disable item weights.
- Added new Lobby select to change what items are in the loot table.
- Added a sound effect when an item is randomed to you.
- Cleaned up code

***

##### 1.1.0

- First revision of the team performance adjustments are in full swing.
 - If either team have a difference of 4-7 kills, weights are fluctuated by (difference / 2).
 - If either team have a kill difference of 8+, the winning team will get items under 1,000g, and the losing team have higher chances at high-tier items.
- Code refactoring
- Moved weights around
- Added another hero check when giving items to heros
- Added in item components and items under 2,000g and over 1,000g in the item pool.
- Removed rapier from overloot, if it can't find you an item, get cheese.
- Removed chat message times if you are in Fast or WTF mode.

***

##### 1.0.5

- Moved weights around.
- Shortened plugin strings, keeping it simple.

***

##### 1.0.4

- Fixed compatibility with Reinforcements plugin, or any other plugin involving creeps with items
    
***

##### 1.0.3

- Changed name to better reflect on what this plugin does.
- Added lobby dropdown to customize the drop times.
 - Normal: Weighted drops every ~5 minutes.
 - No Weights: Non-weighted drops every ~5 minutes.
 - Slow: Weighted drops every ~7-8 minutes.
 - Fast: Weighted drops every ~3-4 minutes.
 - WTF: Weighted drops every ~1 minute.
    
***

##### 1.0.2

- Moved weights and times around
- If you random an aegis or cheese, you get a second item

***

##### 1.0.0 (7/12/13)

- Initial release
