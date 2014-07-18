ssrs
====

social spaced repetition system

## Installation Instructions

    sudo npm install -g react-tools watchify reactify browserfiy
    # from within the webapp directory
    npm install react-nested-router

## To run
    ./server


Primary application routes
==========================

## Signed out

    / => Signup/Splash page
    /[user] => Specific [user] card list/stream

## Signed in

    / => Signed-in-user's card list/stream
    /feed => Signed-in-user's friends' chronological card-added feed
    /[user] => Specific [user] card list/stream
