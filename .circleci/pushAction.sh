echo "https://$githubUsername:$githubToken@github.com/ParcelSolutions/actionsTransmate.git"
git clone https://$githubUsername:$githubToken@github.com/ParcelSolutions/actionsTransmate.git
cd actionsTransmate
git remote set-url origin https://$githubUsername:$githubToken@github.com/ParcelSolutions/actionsTransmate.git
git pull
touch "readme.md"
git add .
git commit -m "test"
git push
