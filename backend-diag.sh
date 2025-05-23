#!/bin/bash
# Backend-Diagnose-Script für AEGIS

echo "=== AEGIS Backend Diagnose ==="
echo ""

# 1. Prüfe, ob Go installiert ist
echo "1. Go-Version prüfen:"
if command -v go &> /dev/null; then
    go version
else
    echo "❌ Go ist nicht installiert!"
    exit 1
fi
echo ""

# 2. Prüfe Backend-Verzeichnis
echo "2. Backend-Verzeichnis prüfen:"
if [ -d "backend" ]; then
    echo "✅ Backend-Verzeichnis gefunden"
    cd backend
else
    echo "❌ Backend-Verzeichnis nicht gefunden!"
    exit 1
fi
echo ""

# 3. Prüfe go.mod
echo "3. Go-Module prüfen:"
if [ -f "go.mod" ]; then
    echo "✅ go.mod gefunden"
    echo "Module: $(head -1 go.mod)"
else
    echo "❌ go.mod nicht gefunden!"
    exit 1
fi
echo ""

# 4. Prüfe Konfigurationsdateien
echo "4. Konfigurationsdateien prüfen:"
if [ -f "config/config.dev.yaml" ]; then
    echo "✅ Development-Konfiguration gefunden"
else
    echo "⚠️  Development-Konfiguration fehlt"
fi
echo ""

# 5. Prüfe main.go
echo "5. Main-Datei prüfen:"
if [ -f "cmd/main.go" ]; then
    echo "✅ cmd/main.go gefunden"
else
    echo "❌ cmd/main.go nicht gefunden!"
    exit 1
fi
echo ""

# 6. Prüfe, ob Port 8080 bereits verwendet wird
echo "6. Port 8080 prüfen:"
if command -v lsof &> /dev/null; then
    if lsof -i :8080 &> /dev/null; then
        echo "⚠️  Port 8080 wird bereits verwendet:"
        lsof -i :8080
    else
        echo "✅ Port 8080 ist frei"
    fi
elif command -v netstat &> /dev/null; then
    if netstat -tuln | grep :8080 &> /dev/null; then
        echo "⚠️  Port 8080 wird bereits verwendet"
    else
        echo "✅ Port 8080 ist frei"
    fi
else
    echo "📍 Kann Port-Status nicht prüfen (lsof/netstat nicht verfügbar)"
fi
echo ""

# 7. Dependencies prüfen
echo "7. Dependencies prüfen:"
echo "Dependencies herunterladen..."
if go mod download 2>/dev/null; then
    echo "✅ Dependencies erfolgreich heruntergeladen"
else
    echo "❌ Fehler beim Herunterladen der Dependencies"
fi
echo ""

# 8. Testbuild
echo "8. Test-Build durchführen:"
if go build -o test-aegis ./cmd 2>/dev/null; then
    echo "✅ Build erfolgreich"
    rm -f test-aegis
else
    echo "❌ Build fehlgeschlagen"
    echo "Build-Fehler:"
    go build -o test-aegis ./cmd
fi
echo ""

echo "=== Diagnose abgeschlossen ==="
echo ""
echo "Zum Starten des Backends:"
echo "cd backend && go run cmd/main.go"
echo ""
echo "Oder mit Docker:"
echo "docker-compose -f docker-compose.dev.yml up -d"