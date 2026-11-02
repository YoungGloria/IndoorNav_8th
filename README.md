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
  Definiert das Dummy-Frontend-Projekt und den lokalen Start per Static Server (`python3 -m http.server 8080`).
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

### 3) 8th Wall Hinweis

In `frontend/index.html` muss für echte 8th Wall-Ausführung der Platzhalter ersetzt werden:

```html
<script async src="https://apps.8thwall.com/xrweb?appKey=YOUR_8THWALL_APP_KEY"></script>
```

`YOUR_8THWALL_APP_KEY` durch den echten App-Key ersetzen.