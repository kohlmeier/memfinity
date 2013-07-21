import os
import re

from google.appengine.api import users

import jinja2
import webapp2

import api


JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    )


class MainPage(webapp2.RequestHandler):

    def get(self):
        user = users.get_current_user()
        template = JINJA_ENVIRONMENT.get_template('index.html')
        env = {
            'user': user,
            'users': users,
        }
        self.response.write(template.render(env))
        # if user:
        #     greeting = ('Welcome, %s! (<a href="%s">sign out</a>)' %
        #                 (user.nickname(), users.create_logout_url('/')))
        # else:
        #     greeting = ('<a href="%s">Sign in or register</a>.' %
        #                 users.create_login_url('/'))

        # self.response.out.write('<html><body>%s</body></html>' % greeting)


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
        if re.match('/api/card/.+/review', path):
            # record a review done on a card
            response = api.card_update(self, review=True)
        elif path.startswith('/api/card/'):
            # update an individual card
            response = api.card_update(self)
        elif path.startswith('/api/user/'):
            # update an individual user
            response = api.user_update(self)
        else:
            raise Exception("Unsupported API path: %s" % path)

        self.response.out.write(response)

    def delete(self):
        path = self.request.path
        if path.startswith('/api/card/'):
            # delete an individual card
            response = api.card_update(self, delete=True)
        else:
            raise Exception("Unsupported API path: %s" % path)

        self.response.out.write(response)




application = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/api/.*', ApiHandler),
    ], debug=True)
