ssrs
====

social spaced repetition system

## Installation Instructions

    make deps
    make serve


Primary application routes
==========================

## Signed out

    / => Signup/Splash page
    /[user] => Specific [user] card list/stream

## Signed in

    / => Signed-in-user's card list/stream
    /feed => Signed-in-user's friends' chronological card-added feed
    /[user] => Specific [user] card list/stream
