#!/bin/sh
echo Starting build
npm electron-packager --out releases --platform=darwin,linux,win32 --overwrite . UserMinder

#Zip files
echo "Now completing releases"
cd releases
for dir in ./*/; do
    dir2=${dir:2}
    dir3=${dir2%?}
    echo $dir3
    add_command+="-a releases/$dir3.zip "
    zip -q -r $dir3.zip $dir3
done;
cd ..


