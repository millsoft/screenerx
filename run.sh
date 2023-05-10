#!/bin/sh

# Run the screenshot process with gnu parallel:
cat links.txt | parallel --line-buffer -j 4 ./screenerx.js --url {}