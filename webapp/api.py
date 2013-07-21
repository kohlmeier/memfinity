import json
import logging

from google.appengine.api import oauth
from google.appengine.api import users
from google.appengine.ext import ndb

import jsonify
import models


# STOPSHIP(jace) remove - was for debugging
class FakeUser(object):
    def user_id(self):
        return "example@example.com"


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


def get_current_user(handler):
    """Return the UserData for the currently logged in user (or None)."""
    user = users.get_current_user()

    if not user:
        #user = FakeUser()
        handler.error(401)
        return None

    return models.UserData.get_for_user_id(user.user_id())


def entity_view(handler, route_root):
    """Query for a single entity by Key."""
    path = handler.request.path
    response = '{}'

    if not path.startswith(route_root) and len(path) > len(route_root):
        return response

    entity_key = path[len(route_root):]
    entity = ndb.Key(urlsafe=entity_key).get()
    if entity:
        response = jsonify.jsonify(entity, pretty_print=True)

    return response


def user_view_current(handler):
    """Return information about the currently logged in user."""
    return jsonify.jsonify(users.get_current_user())


def user_view(handler):
    """Query for a single user by Key."""
    return entity_view(handler, '/api/user/')


def card_view(handler):
    """Query for a single user by Key."""
    return entity_view(handler, '/api/card/')


def card_query(handler):
    """Query for multiple cards.

    See main.py for usage examples.

    TODO(jace): return a query cursor, too?
    """
    user_key = handler.request.get('user', None)
    tag = handler.request.get("tag", None)
    tag_list = tag.split(',') if tag else None
    review = handler.request.get('review', None)

    query = models.Card.query()
    if user_key:
        query = query.filter(models.Card.user_key == ndb.Key(urlsafe=user_key))
    if tag_list:
        query = query.filter(models.Card.tags.IN(tag_list))

    if review:
        # For review mode, we sort by next scheduled review
        query = query.order(models.Card.next_review)
    else:
        query = query.order(-models.Card.added)

    results = query.fetch(100)

    response = '[]'
    if results:
        response = jsonify.jsonify(results, pretty_print=True)

    return response


def card_add(handler):
    """Add a new Card."""
    user_data = get_current_user(handler)
    if not user_data:
        return

    data = json.loads(handler.request.body)

    card = models.Card(user_key=user_data.key)
    card.update_from_dict(data)
    card.put()

    # Update the list of all known tags for this user
    # Update the list of all known tags for this user
    user_data.update_card_tags([], data.get('tags', []))
    user_data.put()  # TODO(jace): only put if necessary

    # TODO(jace) Notify followers

    return card.key.urlsafe()


def card_update(handler, delete=False, review=False):
    """Update or Delete an exisiting Card."""
    user_data = get_current_user(handler)
    if not user_data:
        return

    path = handler.request.path
    route_root = '/api/card/'
    err_response = '{}'

    if not path.startswith(route_root) and len(path) > len(route_root):
        return err_response

    card_key = path[len(route_root):]
    if card_key.endswith('/review'):
        card_key = card_key[:-len('/review')]

    card = ndb.Key(urlsafe=card_key).get()
    if not card:
        return err_response

    if user_data.key != card.user_key:
        # Disallow modification of other people's cards
        return err_response

    # Finally ready to do the update
    card_tags_original = set(card.tags)
    if delete:
        card_tags_updated = set()
        card.key.delete()
    elif review:
        data = json.loads(handler.request.body)
        card.record_review(data.get('grade'))
        card_tags_updated = set(card.tags)  # unchanged in this case
        card.put()
    else:
        data = json.loads(handler.request.body)
        card.update_from_dict(data)
        card_tags_updated = set(card.tags)
        card.put()

    # Update the list of all known tags for this user
    user_data.update_card_tags(card_tags_original, card_tags_updated)
    user_data.put()  # TODO(jace): only put if necessary

    # TODO(jace) Notify followers

    return card.key.urlsafe()


def card_import(handler):
    """Import another user's exisiting Card the current users account.

    Called with the form: /api/card/<card_id>/import
    """
    user_data = get_current_user(handler)
    if not user_data:
        return

    path = handler.request.path
    err_response = '{}'

    card_key = path[len('/api/card/'):-len('/import')]
    card = ndb.Key(urlsafe=card_key).get()
    if not card:
        return "card not found"

    if user_data.key == card.user_key:
        # Disallow importing a card this user already owns
        return "can't import your own card"

    # Finally ready to do the update
    new_card = models.Card()
    new_card.populate(**card.to_dict())
    new_card.user_key = user_data.key
    new_card.put()

    # Update the list of all known tags for this user
    user_data.update_card_tags([], new_card.tags)
    user_data.put()  # TODO(jace): only put if necessary

    # TODO(jace) Notify followers

    return new_card.key.urlsafe()


def user_update(handler):
    """Update and exisiting Card."""
    user_data = get_current_user(handler)
    if not user_data:
        return

    path = handler.request.path
    route_root = '/api/user/'
    err_response = '{}'

    if not path.startswith(route_root) and len(path) > len(route_root):
        return err_response

    user_key = path[len(route_root):]
    if user_data.key != ndb.Key(urlsafe=user_key):
        # Disallow modification of other people's data!
        return err_response

    # Finally ready to do the update
    data = json.loads(handler.request.body)
    user_data.update_from_dict(data)
    user_data.put()  # TODO(jace): only put if necessary

    return user_data.key.urlsafe()
