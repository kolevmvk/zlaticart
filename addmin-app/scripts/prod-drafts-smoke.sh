#!/usr/bin/env bash
# Provera toka nacrta na PRODUKCIJI sa jednim probnim radom.
#
#   bash addmin-app/scripts/prod-drafts-smoke.sh [https://www.zlaticart.com]
#
# PIN se unosi skriveno i ne ispisuje se; sesijski token se ne ispisuje i na kraju
# se opoziva. Skripta pravi rad "PROBA — obrisati", provodi ga kroz
# nacrt → objava → izmena u nacrtu → pregled → objava izmene → arhiviranje.
# Posle provere rad ostaje ARHIVIRAN (nije na sajtu); obrisati ga u Studio-u (/admin).
set -uo pipefail

BASE="${1:-https://www.zlaticart.com}"
SANITY="https://qm16j7ru.api.sanity.io/v2024-01-01/data/query/production"
HERE="$(cd "$(dirname "$0")" && pwd)"
IMAGE="$HERE/../assets/icon.png"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
FAILS=0

pass() { printf '  PROŠLO  %s\n' "$1"; }
fail() { printf '  PALO    %s\n' "$1"; FAILS=$((FAILS + 1)); }
check() { if [ "$2" = "$3" ]; then pass "$1"; else fail "$1 (očekivano: $3, dobijeno: $2)"; fi; }
json() { node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const v=Function("d","return "+process.argv[1])(JSON.parse(s));console.log(v===undefined?"":typeof v==="object"?JSON.stringify(v):v)}catch{console.log("")}})' "$1"; }

# api METOD PUTANJA [JSON] → telo u $WORK/body, HTTP kod na stdout
api() {
  local args=(-s -m 60 -o "$WORK/body" -w '%{http_code}' -X "$1" -H "Authorization: Bearer $TOKEN")
  [ -n "${3:-}" ] && args+=(-H 'Content-Type: application/json' -d "$3")
  curl "${args[@]}" "$BASE$2"
}
body() { json "$1" < "$WORK/body"; }
# Telo forme: form_body NASLOV ASSET_ID|"" [clientId] [baseRevision]
form_body() {
  node -e 'const [title, asset, clientId, baseRevision] = process.argv.slice(1)
    console.log(JSON.stringify({ title, year: null, dimensions: null, shortDescription: "Probni rad za proveru nacrta.",
      featured: false, heroCandidate: false, mediumId: null,
      ...(asset ? { primaryImage: { assetId: asset, alt: "Probna slika" } } : { primaryImage: null, primaryImageAlt: "Probna slika" }),
      ...(clientId ? { clientId } : {}), ...(baseRevision ? { baseRevision } : {}) }))' "$@"
}
# Ono što javni sajt vidi: bez tokena, perspective published, status == "published".
public_title() {
  curl -s -m 30 -G "$SANITY" --data-urlencode "query=*[_id == \$id && status == \"published\"][0].title" \
    --data-urlencode "\$id=\"$ID\"" --data-urlencode 'perspective=published' | json 'd.result ?? "(nije na sajtu)"'
}

read -rsp "PIN (6 cifara): " PIN; echo
LOGIN_CODE=$(curl -s -m 30 -o "$WORK/login" -w '%{http_code}' -X POST -H 'Content-Type: application/json' \
  -d "{\"pin\":\"$PIN\"}" "$BASE/api/admin/login")
unset PIN
TOKEN=$(json 'd.data.token' < "$WORK/login"); rm -f "$WORK/login"
if [ "$LOGIN_CODE" != "200" ] || [ -z "$TOKEN" ]; then echo "Prijava nije uspela (HTTP $LOGIN_CODE)."; exit 1; fi
echo "Prijava uspela. Server: $BASE"

echo "1. Novi rad nastaje samo kao nacrt"
CODE=$(curl -s -m 120 -o "$WORK/body" -w '%{http_code}' -X POST -H "Authorization: Bearer $TOKEN" -F "file=@$IMAGE;type=image/png" "$BASE/api/admin/upload-image")
check "upload fotografije" "$CODE" 200
ASSET=$(body 'd.data.assetId')
CLIENT_ID="artwork-proba$(date +%s)$RANDOM"
CREATE=$(form_body "PROBA — obrisati" "$ASSET" "$CLIENT_ID")
check "create" "$(api POST /api/admin/artworks "$CREATE")" 201
ID=$(body 'd.data._id'); REV=$(body 'd.data.revision'); SLUG=$(body 'd.data.slug')
check "ID je clientId (bez drafts.)" "$ID" "$CLIENT_ID"
check "javni sajt ne vidi nacrt" "$(public_title)" "(nije na sajtu)"
check "ponovni create vraća postojeći rad" "$(api POST /api/admin/artworks "$CREATE")" 200
check "ponovni create: existed" "$(body 'd.data.existed')" true
api GET /api/admin/artworks >/dev/null
check "lista ima tačno jednu stavku" "$(body "d.data.artworks.filter(a=>a._id===\"$ID\").length")" 1

echo "2. Objava"
check "publish" "$(api POST "/api/admin/artworks/$ID/publish" "{\"revision\":\"$REV\"}")" 200
check "javni sajt vidi rad" "$(public_title)" "PROBA — obrisati"
check "stranica rada na sajtu" "$(curl -s -m 60 -o /dev/null -w '%{http_code}' "$BASE/works/$SLUG")" 200

echo "3. Izmena objavljenog rada ide u nacrt"
api GET "/api/admin/artworks/$ID" >/dev/null
REV=$(body 'd.data.artwork.revision')
EDITED=$(form_body "PROBA — izmena u nacrtu" "" "" "$REV")
check "čuvanje nacrta" "$(api PATCH "/api/admin/artworks/$ID" "$EDITED")" 200
DRAFT_REV=$(body 'd.data.revision')
check "javna verzija nepromenjena" "$(public_title)" "PROBA — obrisati"
api GET "/api/admin/artworks/$ID" >/dev/null
check "detalj: sadržaj iz nacrta" "$(body 'd.data.artwork.title')" "PROBA — izmena u nacrtu"
check "detalj: hasDraft + objavljeno" "$(body 'd.data.artwork.hasDraft + "/" + d.data.artwork.status')" "true/published"
api GET /api/admin/artworks >/dev/null
check "lista i dalje jedna stavka" "$(body "d.data.artworks.filter(a=>a._id===\"$ID\").length")" 1
check "zastarela forma dobija 409" "$(api PATCH "/api/admin/artworks/$ID" "$EDITED")" 409

echo "4. Pregled prikazuje nacrt"
check "preview link" "$(api POST /api/admin/preview-link "{\"type\":\"artwork\",\"slug\":\"$SLUG\"}")" 200
PREVIEW_URL=$(body 'd.data.url')
PAGE=$(curl -s -m 60 -L -c "$WORK/jar" -b "$WORK/jar" "$PREVIEW_URL")
if grep -q "PROBA — izmena u nacrtu" <<<"$PAGE"; then pass "pregled sadrži izmenu iz nacrta"; else fail "pregled sadrži izmenu iz nacrta"; fi
if grep -q "PREGLED" <<<"$PAGE"; then pass "traka pregleda prikazana"; else fail "traka pregleda prikazana"; fi

echo "5. Objava izmene"
check "publish izmene" "$(api POST "/api/admin/artworks/$ID/publish" "{\"revision\":\"$DRAFT_REV\"}")" 200
check "javni sajt vidi izmenu" "$(public_title)" "PROBA — izmena u nacrtu"
api GET "/api/admin/artworks/$ID" >/dev/null
check "nacrt uklonjen posle objave" "$(body 'd.data.artwork.hasDraft')" false

echo "6. Arhiviranje i odjava"
check "arhiviranje" "$(api PATCH "/api/admin/artworks/$ID/status" '{"status":"archived"}')" 200
check "rad sklonjen sa sajta" "$(public_title)" "(nije na sajtu)"
check "odjava" "$(api POST /api/admin/logout)" 200
check "opozvan token više ne radi" "$(api GET /api/admin/artworks)" 401
unset TOKEN

echo
if [ "$FAILS" -eq 0 ]; then echo "SVE PROVERE PROŠLE."; else echo "PALIH PROVERA: $FAILS"; fi
echo "Probni rad je arhiviran (ID $ID). Obrišite ga u Studio-u: $BASE/admin"
exit "$FAILS"
