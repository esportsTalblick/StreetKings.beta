STREET KINGS MANAGER — FIXED BUILD V3.0.0

SOURCE / DESIGN
- Club + UI assets are extracted from the two user-provided design sheets.
- 25 club crests are individual PNGs in assets/clubs/.
- Branding, menu icons, player sprites, kits, city, map, stadium, sponsors and UI reference pieces are included.

FIXES
- First start now forces the manager to choose ONE of 25 clubs before the game begins.
- Clubs are selectable by Liga 1 / Liga 2 / Liga 3.
- Transfer market now generates 48 live player listings instead of only a small 4–5 player view.
- Separate Transfers page added.
- Sponsor system is visible on Home, Team/Kit view and Sponsor menu.
- Sponsor assets from the design sheet are used in-game.
- Exact-sheet logo is used in the home hero.
- Exact-sheet club crests are used in team/table/selection views.
- Kit assets are shown on the Team page with the active sponsor.
- Navigation and dynamic buttons audited against their event handlers.
- Old saves are migrated to the new 25-team / 3-league structure and re-open the club-selection step on V3 update.

LIVE MATCH
- 120 seconds real time.
- Full 5v5 visualization: 4 field players + goalkeeper per side.
- Fixed field view: no fake camera-pan animation.
- Players reposition continuously around the ball.
- Ball has an actual holder and target.
- Pass actions move the ball from player to player.
- Dribble/carry actions move player + ball together.
- Tackles can change possession.
- Shots have trajectories toward goal.
- Saves / misses / goals resolve from player strength and pressure.
- Goals reset both teams for a new kickoff.
- Score, possession, shots, timer and live commentary update during play.

STATIC VALIDATION
- app.js syntax: PASS (node --check)
- referenced assets: PASS (0 missing)
- club crest count: PASS (25)
- render-page map: PASS (17 pages including Transfers)
- button dataset audit: PASS; non-click metadata fields side/index/fixture-type are intentionally read from elements carrying another actionable dataset.

NOTE
- A full real-tap Safari session on an iPhone cannot be reproduced inside this build environment. The code, asset paths, structure and event wiring were checked locally.
