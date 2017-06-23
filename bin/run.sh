#!/bin/bash

MBHOME=$HOME/code/mathblogging-base

eval `ssh-agent`
ssh-add $HOME/.ssh/mb_id_rsa
cd $MBHOME && \
    echo "Clean Old Feeds" && \
    find feeds -mtime +31 -type f -delete  && \
    echo "Start FeedFetchTrimmer" && \
    node bin/run_feedFetchTrimmer.js && \
    echo "Start app.js" && \
    node lib/app.js && \
    echo "Do git commit and push" && \
    cd mathblogging.org && \
    git add -u && \
    git commit -m "`date`" && \
    git push
