echo "Uploading files"
add_command=""
#Discover files to upload
cd releases
for dir in *.zip; do
    add_command+="-a releases/$dir "
done;
cd ..

#Upload
version=`cat version`
found=`hub release | grep "^$version$"`
if [ -z "$found" ]; then
	hub release create $add_command $version
else
	echo "Release already created. Please edit ./version"
fi

