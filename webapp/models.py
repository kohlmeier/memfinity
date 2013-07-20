from google.appengine.ext import ndb


class UserData(ndb.Model):
    user_id = ndb.StringProperty(required=True, indexed=True)

    name = ndb.StringProperty()

    # maintain a list of all the tags used by this user
    tags = ndb.StringProperty(repeated=True, indexed=True)

    following = ndb.KeyProperty(repeated=True, indexed=True)
    followers = ndb.KeyProperty(repeated=True, indexed=True)

    # TODO(jace) add user-specific settings

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

    # metadata
    added = ndb.DateTimeProperty(auto_now_add=True)
    modified = ndb.DateTimeProperty(auto_now=True)
    tags = ndb.StringProperty(repeated=True, indexed=True)
    source_url = ndb.StringProperty()

    @classmethod
    def get_for_user(cls, user_data):
        return cls.query(cls.user_key == user_data.key())
