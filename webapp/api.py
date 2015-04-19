import datetime
import json

from google.appengine.api import oauth
from google.appengine.api import users
from google.appengine.ext import ndb

import jsonify
import models
import search

import logging

import endpoints
from protorpc import remote

from api_messages import CardViewRequest
from api_messages import CardsViewRequest
from api_messages import CardViewResponse

CLIENT_ID = '290690870153-s9h3p1i91mtrshen020tc2hlnu85qnad.apps.googleusercontent.com'
API_ID = 'AIzaSyC9lDWLb8lcxcx-p45ZfsN-9TMTOBGgtA0.apps.googleusercontent.com'

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
    """Query for a single card by Key."""
    logging.info("card_view is %s", str(entity_view(handler, '/api/card/')))
    return entity_view(handler, '/api/card/')


def card_query(handler):
    """Query for multiple cards.

    See main.py for usage examples.

    TODO(jace): return a query cursor, too?
    """

    tag = handler.request.get("tag", None)
    tag_list = tag.split(',') if tag else None
    review = handler.request.get('review', None)
    reviewAll = handler.request.get('reviewAll', False)
    include_followers = handler.request.get('include_followers', None)
    user_key = handler.request.get('user', None)

    if review and user_key:
        handler.error(400)
        return "'review' and 'user_key' cannot be used together."

    if review and include_followers:
        handler.error(400)
        return "'review' and 'include_followers' cannot be used together."

    if include_followers and not user_key:
        handler.error(400)
        return "'review' and 'include_followers' cannot be used together."


    if review:
        # if asked for review cards, get them for the current user only
        current_user = get_current_user(handler)
        if not current_user:
            handler.error(400)
            return "must be logged in to query for review cards."
        user_key = current_user.key.urlsafe()


    query = models.Card.query()

    if include_followers:
        user_data = ndb.Key(urlsafe=user_key).get()
        if not user_data:
            handler.error(500)
            return "UserData not found."
        user_list = user_data.following + [ndb.Key(urlsafe=user_key)]
        query = query.filter(models.Card.user_key.IN(user_list))
    elif user_key:
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
        if review and not reviewAll:
            # TODO(jace) if the current user is asking for review cards but
            # hasn't explicitly asked to review ALL cards, then we truncate
            # the results to include just cards scheduled on or before
            # today... the future can wait.
            now = datetime.datetime.now()
            results = [card for card in results if card.next_review <= now]

        response = jsonify.jsonify(results, pretty_print=True)

    return response


def card_search(handler):
    """Search cards with query parameter "q".

    Returns a (possibly empty) list of JSONified models.Card
    entities. See search.py for query processing details.
    """
    user = users.get_current_user()
    if user:
        user_data = models.UserData.get_for_user_id(user.user_id())
        user_key = user_data.key.urlsafe()
    else:
        user_key = None

    query = handler.request.get('q', '')
    search_results = search.query_cards(query, limit=20, ids_only=True,
                                        user_key=user_key)
    results = ndb.get_multi([ndb.Key(urlsafe=result.doc_id)
                             for result in search_results])
    return jsonify.jsonify(results)


def card_add(handler):
    """Add a new Card."""
    user_data = get_current_user(handler)
    if not user_data:
        return

    data = json.loads(handler.request.body)

    user = users.get_current_user()
    card = models.Card(user_key=user_data.key, kata=str(user))
    card.update_from_dict(data)
    card.update_email_and_nickname()

    card.put()
    search.insert_cards([card])

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
        search.delete_cards([card])
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
        search.insert_cards([card])

    # Update the list of all known tags for this user
    user_data.update_card_tags(card_tags_original, card_tags_updated)
    user_data.put()  # TODO(jace): only put if necessary

    # TODO(jace) Notify followers

    return card.key.urlsafe()


def card_import(handler):
    """Import another user's existing Card to the current user's account.

    Called with the form: /api/card/<card_id>/import
    """
    user_data = get_current_user(handler)
    if not user_data:
        return

    path = handler.request.path

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
    new_card.update_email_and_nickname()
    new_card.put()
    search.insert_cards([new_card])

    # Update the list of all known tags for this user
    user_data.update_card_tags([], new_card.tags)
    user_data.put()  # TODO(jace): only put if necessary

    # TODO(jace) Notify followers

    return new_card.key.urlsafe()


def user_follows(handler):
    """Get the users followed by and following a certain users.

    Called via a route like:
    /api/user/<user_key>/follows
    """
    path = handler.request.path

    user_key = path[len('/api/user/'):-len('/follows')]
    user_data = ndb.Key(urlsafe=user_key).get()
    if not user_data:
        return "User not found"

    # TODO make async
    following_data = ndb.get_multi(user_data.following)
    followers_data = ndb.get_multi(user_data.followers)

    # Finally ready to do the update
    data = {
        'user_data': user_data,
        'following': following_data,
        'followers': followers_data
    }

    return jsonify.jsonify(data)


def user_update(handler):
    """Update an exisiting User."""
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


def user_follow_unfollow(handler, follow_or_unfollow):
    """Follow a new user."""
    user_data = get_current_user(handler)
    if not user_data:
        return

    path = handler.request.path

    suffix = '/' + follow_or_unfollow
    # path form is '/api/user/<user_key>/[un]follow'
    follow_user_key = ndb.Key(urlsafe=path[len('/api/user/'):-len(suffix)])
    follow_user = follow_user_key.get()

    if not follow_user:
        handler.error(500)
        return "User to follow not found."

    if follow_user_key == user_data.key:
        handler.error(500)
        return "Users may not follow themselves."

    if follow_or_unfollow == 'follow':
        if follow_user_key not in user_data.following:
            user_data.following.append(follow_user_key)
            user_data.put()

            if user_data.key not in follow_user.followers:
                follow_user.followers.append(user_data.key)
                follow_user.put()

    elif follow_or_unfollow == 'unfollow':
        if follow_user_key in user_data.following:
            user_data.following.remove(follow_user_key)
            user_data.put()

            if user_data.key in follow_user.followers:
                follow_user.followers.remove(user_data.key)
                follow_user.put()

    return user_data.key.urlsafe()


class _JSONCardArchive(object):
    """Simple format for storing cards used by bulk import & export."""
    # TODO(chris): unit tests for import / export.

    VERSION = "v1"
    """Increment VERSION when the JSON archive format changes."""

    def __init__(self, cards=None):
        self.cards = cards or []

    def _card_to_archive_card(self, card):
        """Python object representation of a model.Card for export."""
        obj = {"front": card.front or "",
               "back": card.back or "",
               "input_format": card.input_format or "text",
               }
        if card.tags:
            obj["tags"] = card.tags
        return obj

    def get_cards(self):
        return self.cards

    def to_json(self):
        archive = {"format": "JSONCardArchive",
                   "version": self.VERSION,
                   "cards": map(self._card_to_archive_card, self.cards),
                   }
        return jsonify.jsonify(archive)

    @classmethod
    def from_json(cls, json_str):
        obj = json.loads(json_str)
        assert obj.get("format") == "JSONCardArchive", obj.get("format")
        assert obj.get("version") == "v1", obj.get("version")
        assert "cards" in obj
        cards = []
        for card_obj in obj["cards"]:
            card = models.Card()
            card.update_from_dict(card_obj)
            cards.append(card)
        archive = _JSONCardArchive(cards)
        return archive


def card_bulk_export(handler):
    """Return all cards for the current user in JSON archive format."""
    user_data = get_current_user(handler)
    if not user_data:
        return

    query = models.Card.query()
    query = query.filter(models.Card.user_key == user_data.key)
    # TODO(chris): support export of >1k cards.
    # TODO(chris): support streaming JSON w/a fixed memory buffer to
    # avoid OOMs due to large card content.
    archive = _JSONCardArchive(query.fetch(limit=1000))
    return archive.to_json()


def card_bulk_import(handler):
    """Create POSTed cards for the current user."""
    user_data = get_current_user(handler)
    user = users.get_current_user()
    if not user_data or not user:
        return

    archive_json_str = handler.request.body
    archive = _JSONCardArchive.from_json(archive_json_str)

    tags = set()
    cards = archive.get_cards()
    # TODO(chris): support streaming JSON w/a fixed memory buffer to
    # avoid OOMs due to large card content.
    for card in cards:
        card.user_key = user_data.key
        card.update_email_and_nickname(user)
        tags.update(card.tags)

    # Update the list of all known tags for this user.
    user_data.update_card_tags([], tags)
    ndb.put_multi(cards + [user_data])  # TODO(chris): only put if necessary
    search.insert_cards(cards)

@endpoints.api(name='memfinity', version='v1',
               description='Memfinity API',
               allowed_client_ids=[API_ID, CLIENT_ID, endpoints.API_EXPLORER_CLIENT_ID])
class Memfinity(remote.Service):
    """Class which defines memfinity API v1."""


APPLICATION = endpoints.api_server([Memfinity],
                                   restricted=False)