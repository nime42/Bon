#! /bin/sh
WDIR=`dirname $0`

if [ $# -eq 0 ]; then
        echo "Usage: $0 bonDir "
        echo "* bondir: path to bonServer directory e.g ~/bonServer"
        exit
fi


TARGET_DIR=$1

echo deploying to directory $TARGET_DIR


REPO_URL=https://github.com/nime42/bon.git
REPO_DIR=$WDIR/bon
rm -rf $REPO_DIR
git clone $REPO_URL $REPO_DIR
$WDIR/git_autotag.sh $REPO_DIR
CURRENT_VERSION=`git --git-dir=$REPO_DIR/.git --work-tree=$REPO_DIR describe --abbrev=0 --tags 2>/dev/null`

rm -rf $TARGET_DIR/public $TARGET_DIR/app
cp -r $REPO_DIR/public $REPO_DIR/app $REPO_DIR/package.json $TARGET_DIR/
rm -rf $REPO_DIR
cd $TARGET_DIR/
sed -i "s/%{version}%/$CURRENT_VERSION/g" public/index.html
npm update
npm run replaceClientVars
npm run shutdown 2>/dev/null
nohup npm run start 2>&1 &