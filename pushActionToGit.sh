#!/bin/sh
#export githubToken=""
#export githubUsername=""
entryFile=$1
actionName=$2
export ENTRY_FILE=$1
export NODE_ENV='transmate' && webpack --config ibm-function-basis/webpack.config.js

echo "get $entryFile , rename to $actionName push to actionsTransmate.git with user $githubUsername"
git clone https://$githubUsername:$githubToken@github.com/ParcelSolutions/actionsTransmate.git
cd actionsTransmate
git remote set-url origin https://$githubUsername:$githubToken@github.com/ParcelSolutions/actionsTransmate.git
git pull
mkdir action
cp ../dist/bundle-local.js ./action/$actionName.js
git add .
git commit -m "update action $actionName"
git push
