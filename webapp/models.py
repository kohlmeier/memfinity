import datetime

import endpoints
import logging

from google.appengine.ext import ndb
from google.appengine.api import users

from api_messages import CardResponseMessage

from endpoints_proto_datastore.ndb import EndpointsModel

TIMESTAMP_FORMAT = '%Y-%m-%d %H:%M:%S'


def get_endpoints_current_user(raise_unauthorized=True):
    """Returns a current user and (optionally) causes an HTTP 401 if no user.

    Args:
        raise_unauthorized: Boolean; defaults to True. If True, this method
            raises an exception which causes an HTTP 401 Unauthorized to be
            returned with the request.

    Returns:
        The signed in user if there is one, else None if there is no signed in
        user and raise_unauthorized is False.
    """
    current_user = endpoints.get_current_user()
    if raise_unauthorized and current_user is None:
        raise endpoints.UnauthorizedException('Invalid token.')
    return current_user


class Grades(object):
    VALID_VALUES = ['easy', 'hard']


class LeitnerAlgorithm(object):
    name = "Leitner"  # used as a key in card algo_data
    BOX_INTERVALS = [1, 5, 25, 125, 625]  # box interval lengths (in days)

    @classmethod
    def compute_next_interval(cls, result, card):
        data = card.algo_data.setdefault(cls.name, {})

        current_box = data.setdefault('box', 0)
        if result == 'easy' and datetime.datetime.now() > card.next_review:
            # Note we don't advance the scheduled review if this review
            # was done prematurely.
            current_box += 1
        else:
            current_box -= 1
        current_box = max(0, current_box)
        current_box = min(len(cls.BOX_INTERVALS) - 1, current_box)

        data['box'] = current_box

        # return the suggested interval until the next review in seconds
        return cls.BOX_INTERVALS[current_box] * 24 * 60 * 60


def user_nickname(email):
    return email[:email.find('@')]


class UserData(EndpointsModel):
    user_id = ndb.StringProperty(required=True, indexed=True)
    # TODO(chris): require this field.
    email = ndb.StringProperty(required=False, indexed=True)

    name = ndb.StringProperty()

    # maintain a list of all the tags used by this user
    tags = ndb.StringProperty(repeated=True, indexed=True)
    # maintain counters on the number of cards using each tag as a dict
    tag_counts = ndb.JsonProperty(default={})

    following = ndb.KeyProperty(repeated=True, indexed=True)
    followers = ndb.KeyProperty(repeated=True, indexed=True)

    # TODO(jace) add user-specific settings

    @property
    def nickname(self):
        return user_nickname(self.email)

    def _keys_from_urlsafes(urlsafe_list):
        return [ndb.Key(urlsafe=k) for k in urlsafe_list]

    def _urlsafes_from_keys(key_list):
        return [k.urlsafe() for k in key_list]

    def update_from_dict(self, data):
        """Update this entity from data in a dict."""
        # Note that we never update user_id here.
        # Also, tags are currently only changed via actions on Cards.
        # Adding/deleting followings also has it's own API.
        self.name = data.get('name', self.name)

    def update_card_tags(self, old_card_tags, new_card_tags):
        """Update the user with changes to Card's tags.

        Note this does not put the entity.

        Inputs:
            old_tags : list
            new_tags : list

        """
        tags = set(self.tags)
        tag_counts = self.tag_counts

        old_card_tags = set(old_card_tags)
        new_card_tags = set(new_card_tags)

        for new_tag in (new_card_tags - old_card_tags):
            tag_counts[new_tag] = tag_counts.get(new_tag, 0) + 1
        for del_tag in (old_card_tags - new_card_tags):
            tag_counts[del_tag] = min(tag_counts.get(del_tag, 0) - 1, 0)

        # if the count hit zero for any tags, we delete them
        del_tags = [tag for tag in tag_counts
                    if tag_counts[tag] <= 0]
        for del_tag in del_tags:
            del tag_counts[del_tag]
            tags = tags - set([del_tag])

        self.tags = tags | new_card_tags
        self.tag_counts = tag_counts

    @classmethod
    def get_for_user_id(cls, user_id, insert=True):
        user_data = cls.query(cls.user_id == user_id).get()

        if not user_data and insert:
            user_data = UserData(user_id=user_id)
            user_data.put()

        return user_data


class Card(EndpointsModel):
    user_key = ndb.KeyProperty(required=True)
    kata = ndb.StringProperty(required=True)

    # TODO(jace): Remove this hack for quick gravatar/nickname support on cards
    user_email = ndb.StringProperty()
    user_nickname = ndb.StringProperty()

    # TODO(jace): what type should the content properties
    # be?  TextProperty just for now

    # Format of user input in the rich text fields "front", "back",
    # and "info".
    input_format = ndb.StringProperty(default='text', indexed=False,
                                      choices=['text', 'markdown'])

    # content for the 'front' of the card
    front = ndb.TextProperty(indexed=True)
    # the content for the 'back' of the card
    back = ndb.TextProperty()
    # the content for any additional, optional comments or info
    info = ndb.TextProperty()

    reversible = ndb.BooleanProperty(default=False, indexed=False)
    private = ndb.BooleanProperty(default=False, indexed=True)
    tags = ndb.StringProperty(repeated=True, indexed=True)

    # metadata
    added = ndb.DateTimeProperty(auto_now_add=True)
    modified = ndb.DateTimeProperty(auto_now=True)
    source_url = ndb.StringProperty()

    # stores a list of dicts, each dict represents a presentation
    # of this problem for review, and what happened.  The list is sorted,
    # with the most recent activity first.  E.g.,
    # review_history = [
    # {
    #         "timestamp": <python datetime>,
    #         "grade": <"easy"|"hard">
    #     },
    #     {
    #         "timestamp": <python datetime>,
    #         "grade": <"easy"|"hard">
    #     }
    # ]
    review_history = ndb.JsonProperty(default=[])
    # Catch-all where algorithms are allowed to store derived metadata.
    # A dictionary, where top-level keys are the name of the algorithm.
    algo_data = ndb.JsonProperty(default={})

    # Date of the last review
    last_review = ndb.DateTimeProperty()
    # Date of the next suggested review
    next_review = ndb.DateTimeProperty(auto_now_add=True)

    def to_message(self):
        """Turns the Card entity into a ProtoRPC object.

        This is necessary so the entity can be returned in an API request.

        Returns:
            An instance of ScoreResponseMessage with the ID set to the datastore
            ID of the current entity, the outcome simply the entity's outcome
            value and the played value equal to the string version of played
            from the property 'timestamp'.
        """
        return CardResponseMessage(
#            id=self.key.id(),
            kata=self.kata,
            front=self.front,
            back=self.back,
            reversible=self.reversible,
            input_format=self.input_format,
            private=self.private,
            user_nickname=self.user_nickname,
            user_email=self.user_email,
            source_url=self.source_url or "",
            info=self.info,
            last_review=self.last_review,
            next_review=self.next_review,
            added=self.added,
            modified=self.modified,
            tags=self.tags or [],
            kind=self.key.kind(),
            algo_data=str(self.algo_data),
            review_history=str(self.review_history),
            user_key=self.user_key.urlsafe(),
            key=self.key.urlsafe()

        )

    def record_review(self, grade):
        """Record a review attempt on this card.

        Inputs:
            grade : string. Must be in Grades.VALID_VALUES.

        Note: does not call put on the Card.
        """
        if not grade in Grades.VALID_VALUES:
            return

        # TODO(jace) Allow different algorithms based on user settings.
        now = datetime.datetime.now()
        next_interval_seconds = LeitnerAlgorithm.compute_next_interval(
            grade, self)
        self.next_review = datetime.datetime.now() + (
            datetime.timedelta(seconds=next_interval_seconds))

        self.last_review = now

        self.review_history.append({
            "timestamp": now.strftime(TIMESTAMP_FORMAT),
            "grade": grade
        })

    def update_from_dict(self, data):
        """Update this entity from data in a dict."""
        # Note that we never update user_key here
        self.reversible = data.get('reversible', self.reversible)
        self.back = data.get('back', self.back)
        self.front = data.get('front', self.front)
        self.info = data.get('info', self.info)
        self.input_format = data.get('input_format', self.input_format)
        self.tags = data.get('tags', self.tags)
        self.source_url = data.get('source_url', self.source_url)
        self.private = data.get('private', self.private)
        self.kata = data.get('kata', self.kata)
        # TODO(jace) Allow updating of last/next_review?

    def update_email_and_nickname(self, user=None):
        # TODO(jace) remove the hack of storing user info on cards
        # for quick gravatar support
        if not user:
            user = users.get_current_user()
        self.user_email = user.email()
        self.user_nickname = user_nickname(user.email())

    @classmethod
    def get_for_user(cls, user_data):
        return cls.query(cls.user_key == user_data.key)

    @classmethod
    def query_current_user(cls):
        """Creates a query for the cards of the current user.

        Returns:
            An ndb.Query object bound to the current user. This can be used
            to filter for other properties or order by them.
        """
        current_user = get_endpoints_current_user()
        logging.info("value of current_user is %s", str(current_user))
        return cls.query(cls.kata == str(current_user))

    @classmethod
    def query_current_user_key(cls, key):
        """Creates a query for a specific card of the current user.

        Returns:
            An ndb.Query object bound to the current user. This can be used
            to filter for other properties or order by them.
        """

        logging.info("value of key is %d", key)
        return cls.query(cls.key==ndb.Key(Card, key))
