#/bin/bash

TOKEN="d447ae96a267937de882b39a27a7fd2b265efecd"
prettyjson="python -m json.tool"
LOC="/var/www/wiw/data/json"

curl https://api.wheniwork.com/2/account -H "W-Token: $TOKEN" | cat > $LOC/acct.json
curl https://api.wheniwork.com/2/account -H "W-Token: $TOKEN" | $prettyjson > $LOC/acct-pretty.json

curl https://api.wheniwork.com/2/users -H "W-Token: $TOKEN" | cat > $LOC/users.json
curl https://api.wheniwork.com/2/users -H "W-Token: $TOKEN" | $prettyjson > $LOC/users-pretty.json

curl https://api.wheniwork.com/2/positions -H "W-Token: $TOKEN" | cat > $LOC/pos.json
curl https://api.wheniwork.com/2/positions -H "W-Token: $TOKEN" | $prettyjson > $LOC/pos-pretty.json

curl https://api.wheniwork.com/2/positions?show_deleted=true -H "W-Token: $TOKEN" | cat > $LOC/pos-del.json
curl https://api.wheniwork.com/2/positions?show_deleted=true -H "W-Token: $TOKEN" | $prettyjson > $LOC/pos-del-pretty.json

curl https://api.wheniwork.com/2/locations -H "W-Token: $TOKEN" | cat > $LOC/loc.json
curl https://api.wheniwork.com/2/locations -H "W-Token: $TOKEN" | $prettyjson > $LOC/loc-pretty.json

curl https://api.wheniwork.com/2/blocks -H "W-Token: $TOKEN" | cat > $LOC/blocks.json
curl https://api.wheniwork.com/2/blocks -H "W-Token: $TOKEN" | $prettyjson > $LOC/blocks-pretty.json

curl -H "W-Token: $TOKEN" https://api.wheniwork.com/2/annotations?start_date=2016-01-15&end_date=2016-06-21  | cat > $LOC/ann.json
curl -H "W-Token: $TOKEN" https://api.wheniwork.com/2/annotations?start_date=2016-01-15&end_date=2016-06-21  | $prettyjson > $LOC/ann-pretty.json


