import json
import logging

from google.appengine.api import oauth
from google.appengine.api import users
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
    else:
        raise Exception("Invalid route in card_query.")

    logging.warning("Attempting to get tag.")
    tag = handler.request.get("tag", None)
    logging.warning("got tag = " + str(tag))

    query = models.Card.query()
    if user_key:
        query = query.filter(models.Card.user_key == ndb.Key(urlsafe=user_key))
    if tag:
        query = query.filter(models.Card.tags == tag)
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

    card = models.Card(user_key=user_data.key)
    card.update_from_dict(data)
    card.put()

    # Update the list of all known tags for this user
    # Update the list of all known tags for this user
    user_data.update_card_tags([], data.get('tags', []))
    user_data.put()  # TODO(jace): only put if necessary

    # TODO(jace) Notify followers

    return card.key.urlsafe()


def card_update(handler, delete=False):
    """Update or Delete an exisiting Card."""
    user = get_oauth_user()
    user_data = models.UserData.get_for_user_id(user.user_id())
    if not user_data:
        raise Exception("No UserData found.")

    path = handler.request.path
    route_root = '/api/card/'
    err_response = '{}'

    if not path.startswith(route_root) and len(path) > len(route_root):
        return err_response

    card_key = path[len(route_root):]
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
    user = get_oauth_user()
    user_data = models.UserData.get_for_user_id(user.user_id())
    if not user_data:
        raise Exception("No UserData found.")

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
    user = get_oauth_user()
    user_data = models.UserData.get_for_user_id(user.user_id())
    if not user_data:
        raise Exception("No UserData found.")

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
