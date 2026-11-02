# IndoorNav_8th – Dummy WebAR Client/Server Repository

Dieses Repository enthält ein vollständiges Dummy-Setup für eine WebAR-Client-Server-Architektur mit:

- **`frontend/`**: 8th Wall JavaScript-Projekt mit eigenem Pipeline-Modul für WebSocket-Frame-Streaming
- **`backend/`**: Kotlin/Ktor WebSocket-Server als Boilerplate für Niantic Spatial Localization (VPS)

## Ordnerstruktur

```text
IndoorNav_8th/
├── .gitignore
├── README.md
├── frontend/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── main.js
│       └── websocket-vps-pipeline-module.js
└── backend/
    ├── build.gradle.kts
    ├── settings.gradle.kts
    ├── gradle.properties
    ├── gradlew
    ├── gradlew.bat
    ├── gradle/
    │   ├── libs.versions.toml
    │   └── wrapper/
    └── src/
        ├── main/kotlin/com/example/webar/App.kt
        └── test/kotlin/com/example/webar/AppTest.kt
```

## Wichtige Konfigurationsdateien

- **`frontend/package.json`**  
  Definiert das Dummy-Frontend-Projekt sowie die von der 8th Wall Desktop App erwarteten `serve`- und `build`-Befehle.
- **`frontend/serve.mjs`**  
  Startet den statischen Entwicklungsserver und unterstützt sowohl `PORT=8888` als auch `--port 8888`.
- **`backend/build.gradle.kts`**  
  Enthält Kotlin-, Ktor- und WebSocket-Abhängigkeiten sowie Application-/Test-Konfiguration.
- **`.gitignore`**  
  Ignoriert Node-/Gradle-Artefakte.
- **`README.md`**  
  Dokumentiert Architektur, Struktur und Startanleitung.

## Frontend: 8th Wall Pipeline + WebSocket

- Datei: `frontend/src/websocket-vps-pipeline-module.js`
- Verhalten:
  - Öffnet WebSocket-Verbindung zum Backend (`ws://localhost:8088/vps`)
  - Sendet regelmäßig Kamera-Frames als JPEG-Binary (inkl. vorgelagerter Metadata-JSON)
  - Empfängt `vps-pose`-Nachrichten und aktualisiert die Szene

Die Pose wird in `frontend/src/main.js` auf `#vps-anchor` angewendet (Position + Rotation).

## Backend: Kotlin WebSocket-Server

- Datei: `backend/src/main/kotlin/com/example/webar/App.kt`
- Endpunkte:
  - `GET /health` → `ok`
  - `WS /vps` → empfängt Metadaten + Binary-Frames und sendet Dummy-`vps-pose` zurück

Der Server ist als Boilerplate für echte Niantic VPS-Lokalisierung vorbereitet:
- Eingehende Kamera-Frames sind bereits als WebSocket-Payload verfügbar
- Antwortschema für Pose (`position`, `rotation`, `confidence`, `timestamp`) ist definiert

## Lokal starten und verbinden

### 1) Backend starten

```bash
cd /home/runner/work/IndoorNav_8th/IndoorNav_8th/backend
./gradlew run
```

Server läuft dann auf `http://localhost:8088` und WebSocket auf `ws://localhost:8088/vps`.

### 2) Frontend starten

```bash
cd /home/runner/work/IndoorNav_8th/IndoorNav_8th/frontend
npm start
```

Danach im Browser öffnen:

```text
http://localhost:8080
```

### 3) 8th Wall Desktop App

In der 8th Wall Desktop App den Ordner `frontend/` als Non-Studio-Projekt öffnen. Die App erkennt `frontend/package.json` und startet für die Vorschau:

```bash
npm run serve -- --port 8888
```

Der Server ist damit unter `http://localhost:8888` erreichbar. Der Entwicklungsadapter `dev8.js` ist bereits in `frontend/index.html` eingebunden. Der gehostete App-Key-Loader bleibt dort auskommentiert und kann bei Bedarf später wieder aktiviert werden.