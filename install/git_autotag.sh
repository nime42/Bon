#!/bin/bash

if [ "$#" -gt 0 ]; then
    cd $1
fi



#get highest tag number
VERSION=`git describe --abbrev=0 --tags 2>/dev/null`

if [ -z $VERSION ];then
    NEW_TAG="1.0.0"
    echo "No tag present."
    echo "Creating tag: $NEW_TAG"
    git tag $NEW_TAG
    git push --tags
    echo "Tag created and pushed: $NEW_TAG"
    exit 0;
fi

#replace . with space so can split into an array
VERSION_BITS=(${VERSION//./ })

#get number parts and increase last one by 1
VNUM1=${VERSION_BITS[0]}
VNUM2=${VERSION_BITS[1]}
VNUM3=${VERSION_BITS[2]}
VNUM3=$((VNUM3+1))

#create new tag
NEW_TAG="${VNUM1}.${VNUM2}.${VNUM3}"

#get current hash and see if it already has a tag
GIT_COMMIT=`git rev-parse HEAD`
CURRENT_COMMIT_TAG=`git describe --contains $GIT_COMMIT 2>/dev/null`

#only tag if no tag already (would be better if the git describe command above could have a silent option)
if [ -z "$CURRENT_COMMIT_TAG" ]; then
    echo "Updating $VERSION to $NEW_TAG"
    git tag $NEW_TAG
    git push --tags
    echo "Tag created and pushed: $NEW_TAG"
else
    echo "This commit is already tagged as: $CURRENT_COMMIT_TAG"
fi
