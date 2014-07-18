"""High-level search API.

This module implements application-specific search semantics on top of
App Engine's search API. There are two chief operations: querying for
entities, and managing entities in the search facility.

Add and remove Card entities in the search facility:

  insert_cards([models.Card])
  delete_cards([models.Card])

Query for Card entities:

  query_cards(query_string, limit=20) -> search.SearchResults

The results items will have the following fields:

  user_key, user_nickname, front, back, info, tag (repeated), added,
  modified, source_url

The query_string is free-form, as a user would enter it, and passes
through a custom query processor before the query is submitted to App
Engine. Notably, pass @username to restrict the query to entities
authored by username, and #tag to restrict the query to only documents
matching the given tag. Multiple @usernames or #tags result in an OR
query.

"""

import re

from google.appengine.api import search
from google.appengine.ext import ndb

QUERY_LIMIT = 20
CARD_INDEX_NAME = 'cards'

# Increase this value when _card2doc changes its format so that
# queries can determine the data available on returned documents.
CARD_DOCUMENT_VERSION = '1'

# Ensure we're under the 2000 character limit from
# https://developers.google.com/appengine/docs/python/search/query_strings
MAX_QUERY_LEN = 200

# TODO(chris): it would be better if this module didn't know about
# specific entity types, but instead defined a protocol to get
# metadata from an entity and generate a document.


def insert_cards(cards):
    """Insert or update models.Card entities in the search facility."""
    # TODO(chris): should we allow more than 200 cards per call?
    assert len(cards) <= 200, len(cards)
    card_docs = map(_card2doc, cards)
    index = search.Index(name=CARD_INDEX_NAME)
    index.put(card_docs)


def delete_cards(cards):
    """Delete models.Card entities from the search facility."""
    index = search.Index(name=CARD_INDEX_NAME)
    card_doc_ids = map(_card2docid, cards)
    index.delete(card_doc_ids)


def query_cards(query_str, limit=QUERY_LIMIT, web_safe_cursor=None):
    index = search.Index(name=CARD_INDEX_NAME)
    query_processor = _QueryProcessor(query_str,
                                      name_field='user_nickname',
                                      tag_field='tag',
                                      limit=limit,
                                      web_safe_cursor=web_safe_cursor)
    search_results = index.search(query_processor.query())
    # TODO(chris): should this return partially-instantiated
    # models.Card instances instead of leaking implementation details
    # like we do now?
    return search_results


def _card2doc(card):
    # TODO(chris): should we include all fields that would be needed
    # for rendering a search results item to avoid entity lookup?
    tag_fields = [search.AtomField(name='tag', value=tag) for tag in card.tags]
    doc = search.Document(
        doc_id=_card2docid(card),
        fields=[
            search.AtomField(name='doc_version', value=CARD_DOCUMENT_VERSION),
            search.AtomField(name='user_key', value=card.user_key.urlsafe()),
            # TODO(chris): is user_nickname always a direct-match
            # shortname, e.g., @chris?
            search.AtomField(name='user_nickname', value=card.user_nickname),
            # TODO(chris): support HtmlField for richer cards?
            search.TextField(name='front', value=card.front),
            search.TextField(name='back', value=card.back),
            search.TextField(name='info', value=card.info),
            search.DateField(name='added', value=card.added),
            search.DateField(name='modified', value=card.modified),
            search.AtomField(name='source_url', value=card.source_url),
            ] + tag_fields)
    return doc


def _card2docid(card):
    # We set the search.Document's ID to the entity key it mirrors.
    return card.key.urlsafe()


def _sanitize_user_input(query_str):
    # The search API puts special meaning on certain inputs and we
    # don't want to expose the internal query language to users so
    # we strictly restrict inputs. The rules are:
    #
    # Allowed characters for values are  [a-zA-Z0-9_-].
    # @name is removed and 'name' values returned as a list.
    # #tag is removed and 'tag' values returned as a list.
    names = []
    tags = []

    def token_extract(match):
        s = match.group(1)
        if s.startswith('@'):
            names.append(s[1:])
        else:
            assert s.startswith('#'), s
            tags.append(s[1:])
        return ' '  # remove from input, leaving space b/w other tokens

    # TODO(chris): allow international characters.
    ok_chars = r'a-zA-Z0-9_-'

    # Extract tokens, removing them from the input.
    query_str = re.sub(r'(?:^|\s)(@[%s]+|#[%s]+)(?:\s|$)' % (ok_chars, ok_chars),
                       token_extract, query_str)

    # Replace non-allowed characters with a space so normal text
    # search rules apply.
    query_str = re.sub(r'[^%s]+' % ok_chars, ' ', query_str)

    # Remove keywords.
    query_str = re.sub(r'\bAND\b|\bOR\b', '', query_str)

    return query_str, names, tags


class _QueryProcessor(object):
    """Simple queries, possibly with @name and #tag tokens.

    name_field is the field @name tokens should apply to.
    tag_field is the name of the field #tag tokens should apply to.
    """
    def __init__(self, query_str, name_field=None, tag_field=None,
                 limit=QUERY_LIMIT, web_safe_cursor=None):
        self.query_str = query_str
        self.name_field = name_field
        self.tag_field = tag_field
        self.limit = limit
        self.web_safe_cursor = web_safe_cursor

    def _sanitize_user_input(self):
        query_str = self.query_str[:MAX_QUERY_LEN]
        return _sanitize_user_input(query_str)

    def _build_query_string(self):
        query_str, names, tags = self._sanitize_user_input()
        # Our simply query logic is to OR together all terms from the
        # user, then AND in the name or tag filters.
        query_str = ' OR '.join(re.split(r'\s+', query_str.strip()))
        if self.name_field and names:
            query_str += ' AND %s: (%s)' % (self.name_field, ' OR '.join(names))
        if self.tag_field and tags:
            query_str += ' AND %s: (%s)' % (self.tag_field, ' OR '.join(tags))
        return query_str

    def query(self):
        if self.web_safe_cursor:
            cursor = search.Cursor(web_safe_string=self.web_safe_cursor)
        else:
            cursor = None
        query = search.Query(
            query_string=self._build_query_string(),
            options=search.QueryOptions(limit=self.limit, cursor=cursor))
        return query
