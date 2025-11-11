# GitHub CLI Authentifizierung

## Schritt 1: Token erstellen
1. Gehe zu: https://github.com/settings/tokens/new
2. Name: "Obsidian Plugin Repo"
3. Scopes: ✅ repo (vollständiger Zugriff)
4. Klicke auf "Generate token"
5. **Kopiere den Token** (wird nur einmal angezeigt!)

## Schritt 2: Authentifizierung

### Option A: Interaktiv (Browser öffnet sich)
```powershell
gh auth login
```
Folge den Anweisungen im Browser.

### Option B: Mit Token direkt
```powershell
# Token einfügen und Enter drücken
gh auth login --with-token
# Dann den Token einfügen und Strg+Z drücken, dann Enter
```

### Option C: Token als Umgebungsvariable
```powershell
$env:GH_TOKEN = "dein-token-hier"
gh auth login --with-token < $env:GH_TOKEN
```

## Schritt 3: Repository erstellen und pushen
Nach erfolgreicher Authentifizierung:
```powershell
gh repo create obsidian-special-effects --public --source=. --remote=origin --push
```


