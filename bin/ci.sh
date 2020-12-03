#!/bin/bash

mkdir -p ./data
echo "Fetch csv"
wget -O data.csv "https://docs.google.com/spreadsheets/d/e/2PACX-1vTohVihVKYUFb7REtchf6PcoMejdrgEj4oTAphUhSUeREOau9QU8n1wGKg9cWNSmxMhMP1D3WKeyiw9/pub?gid=1891944288&single=true&output=csv"
echo "Generate JSON"
node ./tools/csv_to_json.js
echo "Download feeds"
mkdir -p ./feeds
sh ./tools/wgetter.sh
echo "Generate entries.json"
node ./lib/generateEntries.js
echo "Run app.js"
consumer_key=$consumer_key consumer_secret=$consumer_secret access_token=$access_token access_token_secret=$access_token_secret node ./lib/app.js $1
