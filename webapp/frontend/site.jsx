/** @jsx React.DOM */
var React = window.React = require('react');
var Route = require('react-nested-router').Route;
var models = require('./models.js'),
    Review = require('./review.jsx'),
    Header = require('./header.jsx'),
    Feed = require('./feed.jsx'),
    Editor = require('./editor.jsx'),
    About = require('./about.jsx');

var Site = React.createClass({
    render: function() {
        return <div>
            <Header />
            {this.props.activeRoute}
        </div>;
    }
});

React.renderComponent((
    <Route handler={Site}>
        <Route name="review" path="/review" handler={Review }/>
        <Route name="feed" path="/feed" handler={Feed}/>
        <Route name="edit" path="/edit/:cardKey" handler={Editor}/>
        <Route name="about" path="/about" handler={About}/>
    </Route>
), document.body);
