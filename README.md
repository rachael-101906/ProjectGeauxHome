# Project Geaux Home

## Mission Briefing

**YEAR 2089**

Your transport has crashed in Arcadia Planitia. Life support systems are
failing. Gather resources, survive the Martian frontier, restore the ship, and
return to Earth.

## Game Design Document

### Design Goals

Project Geaux Home is a small, single-player Mars survival adventure combining:

- The approachable daily loop and characterful NPCs of *Stardew Valley*.
- The gather, craft, explore, and fight progression of *Terraria*.
- The hazardous environments, resource planning, and recovery of *Subnautica*.

Keep the hackathon build focused on one readable loop: **explore a location,
collect its resources, handle a local threat, complete a short objective, and
bring materials home to repair the ship**. Locations are compact, screen-sized
zones connected from the Arcadia base; avoid a seamless open world, large
crafting trees, and systems that need lots of content to feel complete.

### Core Design: Every Location Is Playable

Every location supports **Mining, Combat, Exploration, and Resource
Collection**. Its specialty changes which of those activities is most
rewarding, not which are available. Each location has a signature resource,
one compact landmark, one main quest, and one repeatable trip incentive.

Keep the resource economy to the five listed materials. **Credits** are the
existing shop/trading currency, not an additional gathered resource. Ship
repairs consume materials; tool and weapon tiers make it safer or faster to
gather the materials needed for later repairs.

## 1. Location Overview

| Location | Primary purpose | Resources | Enemies | Landmark and exploration | Revisit reason and progression reward | NPC / quest |
| --- | --- | --- | --- | --- | --- | --- |
| **Arcadia Planitia (Home)** | Home/base building and early-game onboarding. | Ice, Iron, Silica. | B-Zero near salvage; combat is optional. | Explore the crashed transport, its repair bay, and nearby debris; inspect the ship to reveal current repair requirements. | Return to store gathered materials, complete repairs, and unlock up to three small base improvements: storage, a workbench, and a map terminal. | R.O.V.E.R. assigns **Crash Recovery**; Dr. Oxy Genn assigns **Keep the Air On**. |
| **Alba Mons (Mining)** | Main mining area and Pickaxe progression. | Iron, Basalt, Sulfur. | B-Zero roamers and A-Zero seam guards. | Explore the Basalt Crown, a short volcanic tunnel with a rich ore seam; inspect the vein to reveal a second resource node. | Return with a higher-tier Pickaxe to mine deeper nodes efficiently; unlock Pickaxe tiers through Marty and the shop. | Marty McMars assigns **A Better Pick** and unlocks the next Pickaxe tier after the player returns with mined materials. |
| **Tempe Terra (Communications)** | Communications restoration and technology progression. | Silica, Iron. | A-Zero guards the relay approach. | Explore the broken antenna towers and inspect the Silent Relay on the fractured ridge; a single interaction restores its signal. | Return after collecting the repair materials to activate the next relay segment; restored communications unlock navigation information and the next technology upgrade. | R.O.V.E.R. tracks **Call Home**; the Silent Relay is the quest objective, not a new NPC or resource. |
| **Vastitas Borealis (Trading)** | Trading hub and Credits generation. | Ice, Silica. | B-Zero creates brief danger on material runs. | Explore frozen cargo wreckage around the Frost Market; inspect one cache to reveal the current delivery request. | Return to trade surplus materials for Credits, buy available Blasters and Pickaxes, and repeat one short delivery request for a bonus. | DJ-TMoney runs the shop and assigns repeatable **Market Run** deliveries. |
| **Olympus Mons (Combat)** | Endgame combat and final rocket materials. | Basalt, Sulfur. | B-Zero, A-Zero, and Alpha Zero. | Explore a compact arena route to the Caldera Arena; after the Alpha Zero encounter, inspect the final material cache. | Return for remaining propulsion materials or to replay the arena; completing the run unlocks the ending and return to Earth. | The arena terminal starts **The Summit Run**; Hugh Mann remains the playable character. |

### Location Activity Checklist

Every location includes each core activity; its specialty changes the main
reward, not the available actions.

| Location | Mining | Combat | Exploration | Resource collection |
| --- | --- | --- | --- | --- |
| Arcadia Planitia | Mine loose Iron and Silica from crash debris. | Optional encounter with B-Zero near salvage. | Inspect the transport and reveal repair needs. | Gather nearby Ice, Iron, and Silica for the first repairs. |
| Alba Mons | Mine Iron, Basalt, and Sulfur veins; Pickaxe tiers improve speed. | Fight or bypass B-Zeros and seam-guarding A-Zeros. | Find the Basalt Crown and its rich seam. | Gather the materials needed for tools and later ship systems. |
| Tempe Terra | Mine Silica and Iron by the relay foundation. | Clear or avoid the A-Zero relay guard. | Explore antenna towers and activate the Silent Relay. | Collect communications-repair materials from exposed nodes. |
| Vastitas Borealis | Mine shallow Ice and Silica. | Deal with B-Zeros during trips away from the market. | Search the cargo wreck and inspect the Frost Market request. | Gather trade stock and requested delivery materials. |
| Olympus Mons | Mine deep Basalt and Sulfur. | Fight the roster through to Alpha Zero. | Find the Caldera Arena and reveal the final material cache. | Collect the last materials required for the Propulsion Engine. |

### Location Progression

1. **Arcadia Planitia** is available from the start. The crash introduces the
   base, collection, and first repairs.
2. **Alba Mons** opens after the player has a Tier 1 Pickaxe and has collected
   the initial repair materials at Arcadia.
3. **Tempe Terra** opens after the player completes **A Better Pick** at Alba
   Mons; its relay is where the Communication Array quest is completed.
4. **Vastitas Borealis** opens after communications are restored, allowing
   contact with the Frost Market.
5. **Olympus Mons** opens after communications are restored and the player
   has acquired a Tier 3 Blaster or stronger equipment from Vastitas Borealis.
   Its materials complete the Propulsion Engine repair and enable the return
   to Earth.

All zones remain short expeditions launched from a simple location selector.
The player returns to Arcadia between trips; no hunger simulation, vehicle
fuel, or complex travel system is required for the hackathon build.

## 2. Mining Activities

Mining uses visible, finite nodes on the location screen. Pressing the mining
action on a node consumes a short progress action and awards its displayed
material. Higher-tier Pickaxes reduce the number of actions required; they do
not introduce tool durability or a second ore-processing system.

| Location | Mining focus | Simple encounter |
| --- | --- | --- |
| Arcadia Planitia | Loose Iron and Silica from crash debris; occasional Ice. | Nodes are close to the base, making this a safe place to learn mining. |
| Alba Mons | Dense Iron, Basalt, and Sulfur veins. | A-Zeros guard the most valuable seam; the player may fight or leave. |
| Tempe Terra | Silica and Iron around the relay foundations. | Relay-adjacent nodes provide materials for communications upgrades. |
| Vastitas Borealis | Ice and Silica in shallow frost deposits. | Mining ice is the most reliable source of trade stock. |
| Olympus Mons | Deep Basalt and Sulfur, with the final rocket-material cache. | The richest node is guarded by the arena encounter. |

## 3. Combat Activities

Combat is optional in most expeditions and focused on a small number of
readable enemies. The player equips one of three Blaster tiers. Higher tiers
increase damage so later trips become manageable; avoid ammo crafting,
elemental damage, and complex enemy behavior for the weekend scope.

- **Arcadia Planitia:** Avoid or defeat a few B-Zeros near salvage.
- **Alba Mons:** B-Zeros roam the tunnels; A-Zeros protect rich seams.
- **Tempe Terra:** A-Zeros guard relay access and recovered components.
- **Vastitas Borealis:** B-Zeros create brief danger during trading-resource
  runs.
- **Olympus Mons:** A-Zeros guard the route; Alpha Zero is the final arena
  challenge. Defeating it awards access to the last material cache.

Combat rewards are practical: a guarded node, quest item, or safe route. Do not
make every enemy drop a unique collectible.

## 4. Exploration Activities

Exploration is lightweight and node-based: find a landmark, inspect it, and
receive a short log entry, map hint, or quest interaction. Each location needs
only a few discoverable points.

- **Arcadia Planitia:** Inspect the transport wreck for the next ship-repair
  requirement and discover nearby salvage.
- **Alba Mons:** Follow a short tunnel to the Basalt Crown and reveal the
  richest mining node.
- **Tempe Terra:** Inspect the Silent Relay and restore its signal in one
  clear interaction.
- **Vastitas Borealis:** Search the cargo lander for one trade delivery and
  uncover a shortcut back to the Frost Market.
- **Olympus Mons:** Find the Caldera Arena entrance and inspect the rocket
  material cache after defeating Alpha Zero.

Exploration rewards should point toward the next useful activity rather than
require long dialogue trees, hidden pixel-perfect clues, or large maps.

## 5. Resources

The game uses only these five gathered resources. A material can appear in
multiple places, but each location has a preferred source so returning to
specialized zones feels useful. Salvaged objects and quest targets are
interactions, not additional inventory resources.

| Resource | Main sources | Primary uses |
| --- | --- | --- |
| **Ice** | Arcadia, Vastitas Borealis | Life Support System repair and a dependable trade good. |
| **Iron** | Arcadia, Alba Mons, Tempe Terra | Communication, life support, and power-system repairs; basic gear. |
| **Silica** | Arcadia, Tempe Terra, Vastitas Borealis | Communications and power-system repairs; technology upgrades. |
| **Sulfur** | Alba Mons, Olympus Mons | Fusion power and propulsion repairs; available for trade. |
| **Basalt** | Alba Mons, Olympus Mons | Base improvements and the propulsion engine repair. |

**Credits** are earned by selling surplus materials at Vastitas Borealis and
are spent at its shop on available tools and weapons. Avoid making every
resource sellable at the same rate: the trade hub should offer a simple,
visible bonus for its requested material of the day.

## 6. Enemies

Use the existing enemy roster to keep implementation and balancing small:

| Enemy | Role | Suggested placement |
| --- | --- | --- |
| **B-Zero** | Small, low-health nuisance; introduces combat and guards common salvage. | Arcadia, Alba Mons, Vastitas Borealis, Olympus Mons. |
| **A-Zero** | Faster and tougher threat that guards valuable resources and equipment. | Alba Mons, Tempe Terra, Olympus Mons. |
| **Alpha Zero** | One powerful boss encounter with a clear arena and a large health pool. | Olympus Mons only. |

Re-use enemy types across locations; vary their placement and the reward they
guard rather than creating more enemies. Every location should still have a
combat interaction, even if the player can choose to avoid it.

## 7. NPCs

**Hugh Mann** is the player character and the only playable character.
The complete character roster is Hugh Mann, R.O.V.E.R., Dr. Oxy Genn,
Marty McMars, and DJ-TMoney.

| Character | Role | Location and gameplay function |
| --- | --- | --- |
| **R.O.V.E.R.** | Ship/base assistant and concise tutorial guide. | Arcadia Planitia; explains repairs, tracks the next material goal, and accepts repair materials. |
| **Dr. Oxy Genn** | Life-support specialist. | Arcadia Planitia; introduces Ice and the Life Support System quest. |
| **Marty McMars** | Miner and practical gear vendor. | Alba Mons; gives the first mining quest and explains Pickaxe tiers. |
| **DJ-TMoney** | Energetic trader and shopkeeper. | Vastitas Borealis; exchanges surplus materials for Credits and sells available gear. |

NPC dialogue should be short: one greeting, one active quest line, and one
completion response per character is enough for a prototype. Tempe Terra's
relay and Olympus Mons's arena can be represented by interactable terminals,
so they do not require additional named characters.

## 8. Quests

Use a short critical path plus one repeatable trading request. Quests should
reuse the same collection, mining, combat, and interaction actions; avoid
separate quest mechanics.

| Quest | Location / giver | Objective | Reward / unlock |
| --- | --- | --- | --- |
| **Crash Recovery** | Arcadia / R.O.V.E.R. | Collect a small starter bundle of Iron and Silica from nearby debris. | Basic base access and the route to Alba Mons. |
| **Keep the Air On** | Arcadia / Dr. Oxy Genn | Gather Ice and Iron to stabilize the Life Support System. | Life support repair; unlock a longer safe expedition loop. |
| **A Better Pick** | Alba Mons / Marty McMars | Mine a first Alba vein and return its Iron and Basalt. | Tier 2 Pickaxe access and the route to Tempe Terra. |
| **Call Home** | Tempe Terra / Silent Relay | Deliver Silica and Iron, then activate the Communication Array. | Communications restored; open contact with Vastitas Borealis. |
| **Keep the Lights On** | Arcadia / R.O.V.E.R. | Bring Silica and Sulfur to repair the Fusion Power System. | Stable base power and access to the remaining ship systems. |
| **Market Run** | Vastitas Borealis / DJ-TMoney | Deliver the Frost Market's requested material. | Credits; repeatable after each return to the trading hub. |
| **The Summit Run** | Olympus Mons / arena terminal | Defeat Alpha Zero and collect Basalt and Sulfur for the Propulsion Engine. | Propulsion repaired and the return-to-Earth ending. |

The four ship-repair objectives remain exactly:

1. **Communication Array**
2. **Life Support System**
3. **Fusion Power System**
4. **Propulsion Engine**

## 9. Progression Rewards

### Tools

Keep all four tool tiers as **Pickaxes**. Each tier increases mining speed; the
materials remain the same.

| Tool | Unlock | Reward |
| --- | --- | --- |
| **Tier 1 Pickaxe** | Starting equipment. | Mines loose material and early nodes. |
| **Tier 2 Pickaxe** | Early Alba Mons quest / shop. | Faster Iron, Silica, and Basalt gathering. |
| **Tier 3 Pickaxe** | Communications restored; available at the trading shop. | Efficient access to deeper Alba and Olympus nodes. |
| **Tier 4 Pickaxe** | Late-game purchase using accumulated Credits and materials. | Fastest mining for the final rocket-material run. |

### Weapons

Keep all three weapons as **Blasters**. They share the same basic attack and
improve damage by tier.

| Weapon | Unlock | Reward |
| --- | --- | --- |
| **Tier 1 Blaster** | Starting equipment. | Enough to handle B-Zeros. |
| **Tier 2 Blaster** | Available after the first Alba Mons trip. | Makes A-Zeros less costly to fight. |
| **Tier 3 Blaster** | Available at Vastitas Borealis using Credits. | Recommended for the Olympus Mons arena. |

### Ship and Base

- Ship repairs form the main progression gate. Each completed system makes
  the next expedition safer or opens the next location.
- Base building is intentionally small: start with the crash-site repair bay
  and unlock up to three useful stations or improvements. Each should have
  one clear benefit, such as storage, a shop, or a tool upgrade.
- Completing the Propulsion Engine repair triggers a short ending scene:
  Hugh Mann boards the repaired ship and returns to Earth.

### Weekend Hackathon Scope

**Must ship**

- Five compact locations with one screen-sized play area each.
- Five gatherable resources, three enemy types, three Blaster tiers, and four
  Pickaxe tiers.
- Four ship repairs, one main quest per location, and the repeatable Market
  Run.
- Four named NPCs, with short text interactions.
- A small inventory, Credits, tool/weapon shop, and persistent save slots.

**Keep intentionally simple**

- Reuse a single mining interaction, blaster attack, enemy behavior, and
  location layout.
- Represent each landmark with one visible object and one interaction.
- Use fixed quest quantities and a small number of resource nodes.
- Save current location, inventory, Credits, equipment tiers, completed
  repairs, and quest flags.

**Leave out of the hackathon build**

- Procedural worlds, multiplayer, survival meters that constantly drain,
  farming, complex crafting trees, random loot tables, and branching dialogue.

This keeps the full survival-adventure loop represented while making the
critical path achievable in a weekend.
