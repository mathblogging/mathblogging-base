#!/bin/bash

n=0;
while read p; do
# retry magic from https://superuser.com/a/689340
  wget --retry-connrefused --waitretry=1 --read-timeout=3 --timeout=3 -t 3   $p -O ./feeds/$n.xml
  n=$((n+1))
done <./data/wgetList.txt
