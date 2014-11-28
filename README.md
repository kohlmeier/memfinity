Memfinity
====

Memfinity is a modern web application and API to provide a social, spaced repitition system. You can easily create flash cards and practice them practice them utlizing a spaced repetition algorithm. You can make your flash cards public or private. You can follow other users or search for topics of interest to discover new public cards that you want to learn. If you see a card you like, you can "take" (make a copy of) that card for yourself.

A current, partial list of features:
* Ability to create, edit, and delete your cards.
* Support for Markdown syntax, including support for image links.
* A Chrome extension for even faster card creation.
* Abiltiy to practice cards based on a spaced repetition algortihm (Leitner algorithm)
* Ability to follow/unfollow users. Your follows then populate a pesonalized "feed" of cards.
* Full text search, including support for @usernames and #tags.
* Authentication performed via Google accounts.
* Open source and API-based architecture, for easy extension to mobile apps, etc.

The site is developed on Google AppEngine with the Python API. The frontend is written is React. Some desires features are listed as issues, and pull requests are welcome!



## Installation Instructions
    # First, install Google App Engine SDK for Python. Clone the repo, and run:
    make deps
    make serve


Primary application routes (TODO)
==========================

## Signed out

    / => Signup/Splash page
    /[user] => Specific [user] card list/stream

## Signed in

    / => Signed-in-user's card list/stream
    /feed => Signed-in-user's friends' chronological card-added feed
    /[user] => Specific [user] card list/stream
