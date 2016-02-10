import React from 'react';
import ReactDOM from 'react-dom';
import { IndexRoute, Router, Route, browserHistory } from 'react-router';
import Review from './review';
import Header from './header';
import { SearchFeed, UserFeed } from './feed';
import Editor from './editor';
import { Following, Followers } from './follows';
import About from './about';
import FAQ from './faq';

window.React = React;

function Site({ children }) {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
}

ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={Site}>
      <IndexRoute component={About} />
      <Route path="review" component={Review } />
      <Route path="feed" component={UserFeed} />
      <Route path="search" component={SearchFeed} />
      <Route path="create" component={Editor} />
      <Route path="edit/:cardKey" component={Editor} />
      <Route path="about" component={About} />
      <Route path="faq" component={FAQ} />
      <Route path="user/:userKey" component={UserFeed} />
      <Route path="user/:userKey/following" component={Following} />
      <Route path="user/:userKey/followers" component={Followers} />
    </Route>
  </Router>
), document.getElementById('inject'));
