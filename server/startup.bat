# Sync with origin
git fetch
git reset origin/main
git checkout .

# Install production dependencies
npm install --omit=dev

# Build JS files
npm run build

# Start server
npm start
