#!/bin/bash
eval `ssh-agent`
ssh-add $HOME/.ssh/mb_id_rsa
cd $HOME/code/mathblogging-base && \
    echo "Clean Old Feeds" && \
    find ../feeds -mtime +31 -type f -delete  && \
    echo "Start FeedFetchTrimmer" && \
    nodejs run_feedFetchTrimmer.js && \
    echo "Start app.js" && \
    nodejs ../lib/app.js && \
    echo "Do git commit and push" && \
    cd $HOME/code/mathblogging-base/mathblogging.org && \
    git add -u && \
    git commit -m "`date`" && \
    git push
