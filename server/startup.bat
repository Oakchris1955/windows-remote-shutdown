REM Sync with origin
git fetch
git reset origin/main
git checkout .

REM Install production dependencies, build JS files and start server
npm install --omit=dev & npm run build & npm start
