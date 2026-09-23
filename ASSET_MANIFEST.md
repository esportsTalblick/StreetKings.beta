# STREET KINGS MANAGER — Asset Pack v1.0

Dieses Paket trennt die im Design-Sheet gezeigten visuellen Bausteine in einzelne Dateien,
damit sie im Browser separat verwendet werden können.

## Struktur
- `assets/branding/` — Logos, Krone, Wappen
- `assets/icons/` — Navigation/Management-Icons
- `assets/players/` — Pixel-Sprites
- `assets/kits/` — Trikots
- `assets/club/` — Vereinswappen/Markenzeichen
- `assets/stadium/` — Stadion-Pixelart
- `assets/city/` — Katzenelnbogen-/Stadt-Hintergründe
- `assets/ui/` — Buttons, Panels, Balken, Popups
- `assets/screens/` — Referenz-Mobilansichten aus dem Asset Board
- `assets/reference/` — Original-Design-Sheet und exakte Referenz-Crops

## Hinweis
Die PNGs sind bewusst in einem Pixel-/Nearest-Neighbor-Look gehalten. Die Dateien unter
`reference/` sind reine Referenz-Crops; die übrigen Dateien sind die separat verwendbaren Assets.


## Integration priority
For a visual match to the reference, start with:
1. `assets/branding/logo-main.png`
2. `assets/city/hero-city-exact.png`
3. `assets/stadium/live-field-exact.png`
4. `assets/players/*`
5. `assets/kits/*`
6. `assets/icons/*`
7. `assets/ui/*`
8. `assets/sponsors/*`

The `reference/` and `screens/` folders are design/reference material and can be omitted from production if desired.
