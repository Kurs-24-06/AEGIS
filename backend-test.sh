#!/bin/bash
# Test der Frontend-Backend-Verbindung

echo "🔍 Teste AEGIS Frontend-Backend-Verbindung..."
echo ""

# 1. Backend Health Check
echo "1. Backend Health Check:"
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Backend ist erreichbar"
    echo "Response:"
    curl -s http://localhost:8080/health | jq . 2>/dev/null || curl -s http://localhost:8080/health
else
    echo "❌ Backend ist nicht erreichbar!"
    echo "Starte zuerst das Backend mit:"
    echo "cd backend && go run cmd/main.go"
    exit 1
fi
echo ""

# 2. API Endpoints testen
echo "2. API Endpoints testen:"

# Infrastructure endpoint
echo "📡 Infrastructure API:"
if curl -s http://localhost:8080/api/infrastructure > /dev/null 2>&1; then
    echo "✅ /api/infrastructure erreichbar"
else
    echo "❌ /api/infrastructure nicht erreichbar"
fi

# Auth endpoint
echo "🔐 Auth API:"
if curl -s -X POST http://localhost:8080/api/auth/login \
   -H "Content-Type: application/json" \
   -d '{"username":"test","password":"test"}' > /dev/null 2>&1; then
    echo "✅ /api/auth/login erreichbar"
else
    echo "❌ /api/auth/login nicht erreichbar"
fi

# Version endpoint
echo "📋 Version API:"
if curl -s http://localhost:8080/api/version > /dev/null 2>&1; then
    echo "✅ /api/version erreichbar"
    echo "Response:"
    curl -s http://localhost:8080/api/version | jq . 2>/dev/null || curl -s http://localhost:8080/api/version
else
    echo "❌ /api/version nicht erreichbar"
fi
echo ""

# 3. CORS prüfen
echo "3. CORS-Konfiguration prüfen:"
CORS_RESPONSE=$(curl -s -I -X OPTIONS \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  http://localhost:8080/api/infrastructure)

if echo "$CORS_RESPONSE" | grep -i "access-control-allow-origin" > /dev/null; then
    echo "✅ CORS korrekt konfiguriert"
else
    echo "⚠️  CORS möglicherweise nicht korrekt konfiguriert"
fi
echo ""

# 4. Frontend Status prüfen
echo "4. Frontend Status prüfen:"
if curl -s http://localhost:4200 > /dev/null 2>&1; then
    echo "✅ Frontend ist erreichbar (http://localhost:4200)"
else
    echo "❌ Frontend ist nicht erreichbar"
    echo "Starte das Frontend mit:"
    echo "cd frontend && npm start"
fi
echo ""

echo "🎯 Test abgeschlossen!"
echo ""
echo "Falls alles funktioniert, sollte das Frontend jetzt mit dem Backend kommunizieren können."
echo "Öffne http://localhost:4200 im Browser und navigiere zu Infrastruktur."