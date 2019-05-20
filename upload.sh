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
hub release create $add_command $version