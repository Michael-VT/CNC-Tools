# PCB Bohrer-Optimierer

Optimiert den Bohrpfad fuer die PCB-Fertigung durch Minimierung der Verfahrwege der CNC-Maschine. Teil von [CNC-Tools](https://github.com/Michael-VT/CNC-Tools).

## Funktionen

- **Pfadoptimierung** — Nearest-Neighbor- + 2-Opt-Algorithmus minimiert unproduktive Verfahrwege
- **Excellon-Parser** — Liest standard Excellon NC-Bohrdateien (.drl, .xln, .exc)
- **Manuelle Eingabe** — Lochkoordinaten und Werkzeuge direkt eingeben
- **Mehrwerkzeug-Unterstuetzung** — Gruppiert Loecher nach Bohrdurchmesser, optimiert jede Gruppe, minimiert Werkzeugwechsel
- **Visualisierung** — Canvas-basierte Pfadvorschau mit farbcodierten Werkzeugen
- **Animation** — Schrittweise Bohrpfad-Animation
- **G-code-Erstellung** — Standard CNC-Bohr-G-code (kompatibel mit Grbl, Mach3, LinuxCNC)
- **Editierbare Ausgabe** — G-code ist vor dem Speichern bearbeitbar
- **Eigenstaendig** — `drill_optimizer.html` in einem beliebigen Browser oeffnen, kein Server erforderlich
- **Python-CLI** — Kommandozeilen-Tool fuer die Stapelverarbeitung

## Webanwendung

`drill_optimizer.html` in einem Browser oeffnen. Keine Installation erforderlich.

1. **Datei laden** — Excellon-Bohrdatei per Drag & Drop hineinziehen oder klicken zum Durchsuchen
2. **Oder manuell eingeben** — Werkzeuge und Loecher im Abschnitt "Manual Input" hinzufuegen
3. **Optimieren** — "Optimize Path" klicken, um die kuerzeste Bohrroute zu berechnen
4. **Visualisieren** — Zwischen den Tabs wechseln: Original / Optimized / Comparison / Animation
5. **Erstellen** — Bohrparameter festlegen und "Generate G-code" klicken
6. **Bearbeiten und Speichern** — G-code im Textbereich bearbeiten, dann Kopieren oder als .nc herunterladen

### Screenshot

![Drill Optimizer](../view02.png)

## Python-CLI

```bash
cd python
python run.py ../tests/fixtures/sample_metric.drl --stats

# Mit benutzerdefinierten Parametern
python run.py input.drl -o output.nc --feed 300 --plunge 80 --depth -1.8 --rpm 8000

# Vorschau mit matplotlib
python run.py input.drl --preview
```

### CLI-Optionen

| Option | Standard | Beschreibung |
|--------|----------|--------------|
| `-o, --output` | stdout | G-code-Ausgabedatei |
| `--feed` | 400 | Vorschubgeschwindigkeit (mm/min) |
| `--plunge` | 100 | Eintauchgeschwindigkeit (mm/min) |
| `--depth` | -2.0 | Bohrtiefe (mm) |
| `--safe` | 20 | Sicherheitsrueckzughoehe (mm) |
| `--rpm` | 10000 | Spindeldrehzahl (RPM) |
| `--iter` | 200 | 2-Opt-Iterationen |
| `--time-limit` | 5.0 | Optimierungszeitlimit (Sekunden) |
| `--dwell` | aus | Verweilzeit am Bohrungsgrund |
| `--preview` | aus | matplotlib-Vorschau anzeigen |
| `--stats` | aus | Optimierungsstatistiken ausgeben |

## Eingabeformat

Das Tool akzeptiert Excellon NC-Bohrdateien — das Standardformat fuer PCB-Bohrdaten. Unterstuetzte Funktionen:

- Metrische (`METRIC`) und imperiale (`INCH`) Einheiten
- Fuehrende (`LZ`) und nachfolgende (`TZ`) Nullunterdrueckung
- Werkzeugdefinitionen: `T01C0.8` (Werkzeug 1, Durchmesser 0.8mm)
- Bohrpunkte: `X1000Y2000`
- NuTze: `G85X...Y...X...Y...`
- Automatische Erkennung des Koordinatenformats

## Optimierungsalgorithmus

1. **Nach Werkzeug gruppieren** — Loecher werden nach Bohrdurchmesser gruppiert, um Werkzeugwechsel zu minimieren
2. **Nearest Neighbor** — Greedy-Konstruktion besucht die Loecher jeder Gruppe beginnend beim naechstgelegenen
3. **2-Opt-Verbesserung** — Vertauscht iterativ Kantenpaare, um Pfadkreuzungen zu entfernen
4. **Gruppenreihenfolge** — Werkzeuggruppen werden so angeordnet, dass die Verfahrwege zwischen den Gruppen minimiert werden

## G-code-Ausgabeformat

```
G21                          (Metric)
G90                          (Absolute positioning)
G00 Z20.000                  (Safe height)
T01
M06                          (Tool change)
M03 S10000                   (Spindle on)
G00 X10.000 Y5.000           (Rapid to hole)
G00 Z2.000                   (Approach)
G01 Z-2.000 F100             (Drill)
G00 Z2.000                   (Retract)
...
M05                          (Spindle off)
M30                          (End program)
```

## Tests ausfuehren

```bash
cd drill_optimizer
python -m pytest tests/test_optimizer.py -v
```

## Projektstruktur

```
drill_optimizer/
  drill_optimizer.html        Webanwendung (im Browser oeffnen)
  js/                         JavaScript-Module
    excellon_parser.js        Excellon-Datei-Parser
    drill_optimizer.js        NN + 2-Opt-Optimierung
    gcode_generator.js        G-code-Erstellung
    visualization.js          Canvas-Darstellung + Animation
    app.js                    UI-Controller
  python/                     Python-CLI-Tools
    excellon_parser.py        Parser
    drill_optimizer.py        Optimierer
    gcode_generator.py        G-code-Generator
    run.py                    CLI-Einstiegspunkt
  tests/                      Python-Tests + Testdaten
```

## Lizenz

Teil von [CNC-Tools](https://github.com/Michael-VT/CNC-Tools).
