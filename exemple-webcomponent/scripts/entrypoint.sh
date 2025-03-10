#!/bin/sh
cp -R /node_modules /app

npm i
npm run build
exec npm run dev