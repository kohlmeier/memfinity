/** @jsx React.DOM */
var review = require('./review.jsx'),
    feed = require('./feed.jsx');

var CardStack = review.CardStack;
var cards = new review.CardCollection();
cards.fetch();
React.renderComponent(<CardStack collection={cards} />, document.body);
