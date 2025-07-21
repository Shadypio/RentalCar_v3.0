@echo off
echo Optimizing React development server...

REM Clear npm cache
echo Clearing npm cache...
npm cache clean --force

REM Remove node_modules and reinstall with optimizations
echo Removing node_modules...
if exist node_modules rmdir /s /q node_modules

echo Reinstalling dependencies with optimizations...
npm install --prefer-offline --no-audit --progress=false

REM Clear React scripts cache
echo Clearing React scripts cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo Optimization complete!
echo You can now run: npm start
pause
