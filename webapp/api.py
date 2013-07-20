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


def card_add(handler):
    user = get_oauth_user()
    user_data = models.UserData.get_for_user_id(user.user_id())

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

    return card.key.urlsafe()