# GitHub Repository Setup Guide

## Schritt 1: Git installieren (falls noch nicht installiert)

1. Lade Git herunter: https://git-scm.com/download/win
2. Installiere Git mit den Standard-Einstellungen
3. Starte PowerShell/Terminal neu

## Schritt 2: GitHub Repository erstellen

1. Gehe zu https://github.com/new
2. Repository-Name: `obsidian-special-effects`
3. Beschreibung: "Shader-based visual effects plugin for Obsidian"
4. Wähle **Public** oder **Private**
5. **NICHT** "Initialize with README" ankreuzen (wir haben schon ein README)
6. Klicke auf "Create repository"

## Schritt 3: Lokales Repository initialisieren und pushen

Öffne PowerShell im Projektordner und führe diese Befehle aus:

```powershell
# Git initialisieren
git init

# Alle Dateien hinzufügen
git add .

# Ersten Commit erstellen
git commit -m "Initial commit: Obsidian Special Effects Renderer plugin"

# Branch umbenennen zu main (falls nötig)
git branch -M main

# GitHub Repository als Remote hinzufügen
# ERSETZE 'alephtex' mit deinem GitHub-Username!
git remote add origin https://github.com/alephtex/obsidian-special-effects.git

# Code zum GitHub pushen
git push -u origin main
```

## Schritt 4: GitHub Credentials

Beim ersten Push wirst du nach deinen GitHub-Credentials gefragt:
- **Username**: Dein GitHub-Username
- **Password**: Verwende ein **Personal Access Token** (nicht dein Passwort!)
  - Erstelle eins hier: https://github.com/settings/tokens
  - Scopes: `repo` (vollständiger Zugriff auf private Repositories)

## Alternative: GitHub CLI verwenden

Falls du GitHub CLI installiert hast:

```powershell
# GitHub CLI installieren (falls nicht vorhanden)
winget install GitHub.cli

# Repository erstellen und pushen in einem Schritt
gh repo create obsidian-special-effects --public --source=. --remote=origin --push
```

## Nach dem ersten Push

1. Gehe zu deinem Repository auf GitHub
2. Überprüfe, dass alle Dateien hochgeladen wurden
3. Optional: Erstelle ein Release:
   - Gehe zu "Releases" → "Create a new release"
   - Tag: `v0.0.1`
   - Title: `v0.0.1 - Initial Release`
   - Beschreibung: Siehe README.md für Features
   - Upload `main.js`, `manifest.json`, `styles.css` als Assets

## Repository-Struktur

Das Repository sollte folgende Dateien enthalten:
- ✅ README.md
- ✅ LICENSE
- ✅ .gitignore
- ✅ manifest.json
- ✅ package.json
- ✅ tsconfig.json
- ✅ esbuild.config.mjs
- ✅ styles.css
- ✅ src/ (Source-Code)
- ✅ main.js (gebautes Plugin - optional, kann auch ignoriert werden)

## Troubleshooting

### "git is not recognized"
- Git ist nicht installiert oder nicht im PATH
- Installiere Git neu oder füge es zum PATH hinzu

### "remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/alephtex/obsidian-special-effects.git
```

### "Authentication failed"
- Verwende ein Personal Access Token statt Passwort
- Oder verwende SSH: `git remote set-url origin git@github.com:alephtex/obsidian-special-effects.git`

