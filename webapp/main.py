import json
import logging
import os
import re

from google.appengine.ext import ndb
from google.appengine.api import users

import jinja2
import webapp2

import api
import jsonify
import models

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    )


class MainPage(webapp2.RequestHandler):

    @ndb.toplevel
    def get(self):
        user = users.get_current_user()
        logging.info("Debug User: '" + str(user) + "'")
        if user:
            user_data = models.UserData.get_for_user_id(user.user_id())
        else:
            user_data = None

        if user_data:
            user_cards, global_cards = yield ((
                models.Card
                .query(models.Card.user_key ==
                    ndb.Key(urlsafe=user_data.key.urlsafe()))
                .order(models.Card.next_review)
                .fetch_async(500)),
                models.Card
                    .query()
                    .order(-models.Card.added)
                    .fetch_async(500),
                )
        else:
            user_cards = []
            global_cards = models.Card
                .query().order(-models.Card.added).fetch(1000)

        if user_data:
            username = str(user)
        else:
            username = None

        template = JINJA_ENVIRONMENT.get_template('index.html')
        env = {
            'user': user_data,
            'username': json.dumps(username),
            'users': users,
            'user_cards': jsonify.jsonify(user_cards),
            'global_cards': jsonify.jsonify(global_cards),
        }
        self.response.write(template.render(env))

class LoginHandler(webapp2.RequestHandler):
    def get(self):
        if self.request.path.startswith('/login'):
            return self.redirect(users.create_login_url('/'))
        if self.request.path.startswith('/logout'):
            return self.redirect(users.create_logout_url('/'))

class ApiHandler(webapp2.RequestHandler):

    def get(self):
        #api.get_oauth_user()  # just for authentication
        path = self.request.path
        if path.startswith('/api/card/'):
            # retrieve an individual card
            response = api.card_view(self)
        elif path == '/api/cards':
            # query for many cards
            # '/api/cards' -> returns all cards, ordered by date added desc
            # '/api/cards?tag=tag1,tag2' -> as above, but with tag filtering
            # '/api/cards?user=<user_key> -> returns cards for a single user
            # '/api/cards?user=user_key&tags=tag1,tag2' -> obvious
            # '/api/cards?user=<user_key>&review=1' -> all cards for the
            #      user but sorted by next_review
            response = api.card_query(self)
        elif path == '/api/user':
            response = api.user_view_current(self)
        elif path.startswith('/api/user/'):
            # retrieve an individual user
            response = api.user_view(self)

        else:
            raise Exception("Unsupported API path: %s" % path)

        self.response.out.write(response)

    def post(self):
        #api.get_oauth_user()  # just for authentication
        path = self.request.path
        if path == '/api/card':
            # add a new card
            response = api.card_add(self)
        else:
            raise Exception("Unsupported API path: %s" % path)

        self.response.out.write(response)

    def put(self):
        path = self.request.path
        if re.match('/api/card/.+/import', path):
            # import a card to the current user's feed
            response = api.card_import(self)
        elif re.match('/api/card/.+/review', path):
            # record a review done on a card
            response = api.card_update(self, review=True)
        elif path.startswith('/api/card/'):
            # update an individual card
            response = api.card_update(self)
        elif re.match('/api/user/.+/follow', path):
            # record a review done on a card
            response = api.user_follow_unfollow(self, 'follow')
        elif re.match('/api/user/.+/unfollow', path):
            # record a review done on a card
            response = api.user_follow_unfollow(self, 'unfollow')
        elif path.startswith('/api/user/'):
            # update an individual user
            response = api.user_update(self)
        else:
            raise Exception("Unsupported API path: %s" % path)

        self.response.out.write(response)

    def delete(self):
        logging.warning("DELETE handler executing")
        path = self.request.path
        if path.startswith('/api/card/'):
            # delete an individual card
            response = api.card_update(self, delete=True)
        else:
            raise Exception("Unsupported API path: %s" % path)

        self.response.out.write(response)




application = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/login', LoginHandler),
    ('/logout', LoginHandler),
    ('/api/.*', ApiHandler),
    ], debug=True)
