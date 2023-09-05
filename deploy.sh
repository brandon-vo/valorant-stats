git pull https://github.com/brandon-vo/valorant-stats.git
npm install

pm2 describe index > /dev/null

if [ $? != 0 ]; then
  pm2 start index.js
else
  pm2 restart index
fi

echo "Start deploy with pm2"