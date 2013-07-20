from google.appengine.api import users

import webapp2

import api


class MainPage(webapp2.RequestHandler):

    def get(self):
        user = users.get_current_user()
        if user:
            greeting = ('Welcome, %s! (<a href="%s">sign out</a>)' %
                        (user.nickname(), users.create_logout_url('/')))
        else:
            greeting = ('<a href="%s">Sign in or register</a>.' %
                        users.create_login_url('/'))

        self.response.out.write('<html><body>%s</body></html>' % greeting)


class ApiHandler(webapp2.RequestHandler):

    def get(self):
        #api.get_oauth_user()  # just for authentication
        path = self.request.path
        if path.startswith('/api/card/'):
            response = api.card_view(self)

        self.response.out.write(response)

    def post(self):
        #api.get_oauth_user()  # just for authentication
        path = self.request.path
        if path == '/api/card':
            response = api.card_add(self)
        else:
            raise Exception("Unsupported API path: %s" % path)

        self.response.out.write(response)



application = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/api/card', ApiHandler),
    ], debug=True)
