import json
import logging

from google.appengine.api import oauth

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
    data = json.loads(handler.request.body)
    
    response = {}
    if 'card_key' in data:
        card = ndb.Key(urlsafe=data['card_key'])
        if card:
            response_data = card.




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