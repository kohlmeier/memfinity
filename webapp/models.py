from google.appengine.ext import ndb


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
    #         "result": <"easy"|"hard">
    #     },
    #     {
    #         "timestamp": <python datetime>,
    #         "result": <"easy"|"hard">
    #     }
    # ]
    review_history = ndb.JsonProperty()

    def update_from_dict(self, data):
        """Update this entity from data in a dict."""
        # Note that we never update user_key here
        self.front = data.get('front', self.front)
        self.back = data.get('back', self.back)
        self.info = data.get('info', self.info)
        self.reversible = data.get('reversible', self.reversible)
        self.tags = data.get('tags', self.tags)
        self.source_url = data.get('source_url', self.source_url)

    @classmethod
    def get_for_user(cls, user_data):
        return cls.query(cls.user_key == user_data.key())
