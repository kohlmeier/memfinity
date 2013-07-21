/** @jsx React.DOM */
var models = require('./models.js'),
    Review = require('./review.jsx'),
    Header = require('./header.jsx'),
    Feed = require('./feed.jsx'),
    About = require('./about.jsx');

var Site = React.createClass({
    render: function() {
        var view;
        if (this.state.view === 'feed') {
            view = <Feed collection={this.state.globalCollection} />;
        } else if (this.state.view === 'about') {
            view = <About />;
        } else {
            view = <Review reviewingStack={this.state.reviewing} />;
        }

        // TODO not using page in Header
        return <div>
            <Header page={this.state.view} onNavigate={this.navigate} />
            {view}
        </div>
    },
    getInitialState: function() {
        var modelify = function(cards) {
            return _(cards).map(function(card) {
                return new models.CardModel(card);
            });
        };
        var reviewing = new models.CardCollection(
            modelify(window.userCards));
        var globalCollection = new models.CardCollection(
            modelify(window.globalCards));
        return {
            view: window.username? 'home':'about',
            reviewing: reviewing,
            globalCollection: globalCollection
        };
    },
    navigate: function(page) {
        this.setState({ view: page });
    }
});

React.renderComponent(<Site />, document.body);
