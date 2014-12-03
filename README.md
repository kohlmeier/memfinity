Memfinity
====

Memfinity is a modern webapp and API to provide a social, spaced repetition system. You can easily create flash cards and practice them utilizing a spaced repetition algorithm. You can make your flash cards public or private. You can follow other users or search for topics of interest to discover new cards of interest. If you see a card you like, you can "take" (make a copy of) that card for yourself.

A current, partial list of features:
* Create, edit, and delete cards.
* Support for Markdown syntax, including support for image links.
* Chrome extension for even faster card creation.
* Review cards using a spaced repetition algortihm (Leitner algorithm)
* Follow/unfollow users. Your follows then populate a pesonalized "feed" of cards.
* Full text search, including support for @usernames and #tags.
* Authentication performed via Google accounts.
* Open source and API-based architecture, for easy extension to mobile apps, etc.

The site is developed on Google App Engine with the Python SDK. The frontend is written is React. Some desired features are listed as open issues, and pull requests are welcome!



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
