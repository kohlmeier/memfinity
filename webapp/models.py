import datetime

from google.appengine.ext import ndb

TIMESTAMP_FORMAT = '%Y-%m-%d %H:%M:%S'


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
            # was done premturely.
            current_box += 1
        else:
            current_box -= 1
        current_box = max(0, current_box)
        current_box = min(len(cls.BOX_INTERVALS) - 1, current_box)

        data['box'] = current_box

        # return the suggested interval until the next review in seconds
        return cls.BOX_INTERVALS[current_box] * 24 * 60 * 60


class UserData(ndb.Model):
    user_id = ndb.StringProperty(required=True, indexed=True)

    name = ndb.StringProperty()

    # maintain a list of all the tags used by this user
    tags = ndb.StringProperty(repeated=True, indexed=True)
    # maintain counters on the number of cards using each tag as a dict
    tag_counts = ndb.JsonProperty(default={})

    following = ndb.KeyProperty(repeated=True, indexed=True)
    followers = ndb.KeyProperty(repeated=True, indexed=True)

    # TODO(jace) add user-specific settings

    def _keys_from_urlsafes(urlsafe_list):
        return [ndb.Key(urlsafe=k) for k in urlsafe_list]

    def _urlsafes_from_keys(key_list):
        return [k.urlsafe() for k in key_list]

    def update_from_dict(self, data):
        """Update this entity from data in a dict."""
        # Note that we never update user_id here.
        # Also, tags are currently only changes via actions on Cards.
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


class Card(ndb.Model):
    user_key = ndb.KeyProperty(required=True)

    # TODO(jace): what type should the content properties
    # be?  TextProperty just for now

    # content for the 'front' of the card
    front = ndb.TextProperty()
    # the content for the 'back' of the card
    back = ndb.TextProperty()
    # the content for the  
    info = ndb.TextProperty()

    reversible = ndb.BooleanProperty(default=False, indexed=False)
    tags = ndb.StringProperty(repeated=True, indexed=True)

    # metadata
    added = ndb.DateTimeProperty(auto_now_add=True)
    modified = ndb.DateTimeProperty(auto_now=True)
    source_url = ndb.StringProperty()

    # stores a list of dicts, each dict represents a presentation
    # of this problem for review, and what happened.  The list is sorted,
    # with the most recent activity first.  E.g.,
    # review_history = [
    #     {
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
        self.front = data.get('front', self.front)
        self.back = data.get('back', self.back)
        self.info = data.get('info', self.info)
        self.reversible = data.get('reversible', self.reversible)
        self.tags = data.get('tags', self.tags)
        self.source_url = data.get('source_url', self.source_url)
        # TODO(jace) Allow updating of last/next_review?

    @classmethod
    def get_for_user(cls, user_data):
        return cls.query(cls.user_key == user_data.key())
