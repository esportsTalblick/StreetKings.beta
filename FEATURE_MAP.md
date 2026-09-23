# Grand Slam → Street Kings Browser Port

Die Browserfassung übernimmt die in der Original-Dokumentation beschriebenen Systeme und ersetzt das Baseball-Thema durch 5er-Street-Soccer:

- Team-Erstellung und Kaderverwaltung (12er-Kader, Startelf 4 Feld + 1 TW)
- 3-Liga-System mit kompletter Spielplanung, Tabelle, Auf- und Abstieg
- Spielsimulation mit Teamstärke, Form, Coach-Bonus, Wetter und Heimvorteil
- Detaillierte Spielerattribute: Tempo, Schuss, Pass, Verteidigung, Kontrolle, Leadership
- Coach-Marktplatz mit 5–8%-Boost und Vertragsstrafe
- Stadionverwaltung mit 10 Upgrade-Kategorien und exponentiellen Kosten
- Transfermarkt inklusive Kauf/Verkauf
- Draftsystem (Silver/Gold/Premium)
- Sponsorensystem mit Stufen, Wochenzahlung und Bonus
- Finanzen, Gehälter, Spieltagseinnahmen, Prämien und Kredit
- Spielerentwicklung über Alter/Erfahrung
- News und regionale Ereignisse
- Team-, Liga- und Spielerstatistiken
- Lokales Savegame via localStorage + JSON Export/Import
- Mobile responsive Oberfläche für GitHub Pages

Die vorhandenen Python/Tkinter-Dateien wurden nicht in Browsercode ausgeführt. Stattdessen wurde die dokumentierte Spiellogik als statische Web-App nachgebaut, weil GitHub Pages nur statische Inhalte hostet.
