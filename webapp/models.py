from google.appengine.ext import ndb


class UserData(ndb.Model):
    name = ndb.StringProperty()

    # maintain a list of all the tags used by this user
    tags = ndb.StringProperty(repeated=True, indexed=True)

    following = ndb.StringProperty(repeated=True, indexed=True)
    followers = ndb.StringProperty(repeated=True, indexed=True)

    # TODO(jace) add user-specific settings


class Card(ndb.Model):
    user_id = ndb.StringProperty()

    # TODO(jace): what type should the content properties
    # be?  TextProperty just for now

    # content for the 'front' of the card
    front = ndb.TextProperty()
    # the content for the 'back' of the card
    back = ndb.TextProperty()
    # the content for the  
    description = ndb.TextProperty()

    # metadata
    added = ndb.DateTimeProperty(auto_now_add=True)
    modified = ndb.DateTimeProperty(auto_now=True)
    tags = ndb.StringProperty(repeated=True, indexed=True)
    source_url = ndb.StringProperty()

    @classmethod
    def get_for_user(cls, user_data):
        return cls.query(cls.user_id == user_data.user_id)
