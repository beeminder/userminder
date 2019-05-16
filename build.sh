#!/bin/sh
echo Starting build
electron-packager --out releases --platform=darwin,linux,win32 --overwrite . UserMinder

#Zip files
echo "Now completing releases"
cd releases
for dir in ./*/; do
    dir2=${dir:2}
    dir3=${dir2%?}
    echo $dir3
    zip -q -r $dir3.zip $dir3
done;
cd ..

    #
