import json

from google.appengine.api import oauth
from google.appengine.ext import ndb

import jsonify
import models


def get_oauth_user():
    """Return the OAuth authenticated user, else raise an exception."""
    try:
        # Get the db.User that represents the user on whose behalf the
        # consumer is making this request.
        user = oauth.get_current_user()

    except oauth.OAuthRequestError:
        # The request was not a valid OAuth request.
        raise  # TODO(jace) something better to do here?

    return user


def card_view(handler):
    """Query for a single card by Key."""
    path = handler.request.path
    response = '{}'

    root = '/api/card/'
    if not path.startswith(root) and len(path) > len(root):
        return response

    card_key = path[len(root):]
    card = ndb.Key(urlsafe=card_key).get()
    if card:
        response = jsonify.jsonify(card, pretty_print=True)

    return response


def card_query(handler):
    """Query for multiple cards.

    '/api/cards' -> returns all cards, ordered by date added desc
    '/api/cards/' -> returns all cards, ordered by date added desc
    '/api/cards?tag=tag1,tag2' -> as above, but with tag filtering
    '/api/cards/<user_key>' -> returns cards for a single user
    '/api/cards/<user_key>?tags=tag1,tag2' -> w/ tag filtering

    TODO(jace): return a query cursor, too?
    """
    path = handler.request.path
    root = '/api/cards/'

    tag = None
    user_key = None
    if path == root[:-1] or path == root:
        pass
    elif path.startswith(root):
        user_key = path[len(root):]
        tag = handler.request.get("tag", None)
    else:
        raise Exception("Invalid route in card_query.")

    query = models.Card.query()
    if user_key:
        query = query.filter(models.Card.user_key == ndb.Key(user_key))
    if tag:
        query = query.filter(models.Card.tag == tag)
    query = query.order(-models.Card.added)
    results = query.fetch(100)

    response = '{}'
    if results:
        response = jsonify.jsonify(results, pretty_print=True)

    return response


def card_add(handler):
    """Add a new Card."""
    user = get_oauth_user()
    user_data = models.UserData.get_for_user_id(user.user_id())
    if not user_data:
        raise Exception("No UserData found.")

    data = json.loads(handler.request.body)

    card = models.Card(
            user_key=user_data.key,
            front=data.get('front'),
            back=data.get('front'),
            info=data.get('info'),
            tags=data.get('tags', []),
            source_url=data.get('source_url')
            )
    card.put()

    card_tags = set(data.get('tags', []))  # TODO(jace): validate types
    user_tags = set(user_data.tags)
    user_data.tags = list(card_tags | user_tags)
    user_data.put()  # TODO(jace): only put if necessary

    return card.key.urlsafe()