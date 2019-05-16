#!/bin/sh
echo Starting build
electron-packager --out releases --platform=darwin,linux,win32 --overwrite . UserMinder

#Zip files
cd releases
for d in *; do
    echo $d
    zip -r $d.zip $d
done;
cd ..