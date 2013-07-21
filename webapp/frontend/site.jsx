/** @jsx React.DOM */
var models = require('./models.js'),
    Review = require('./review.jsx'),
    Header = require('./header.jsx'),
    Feed = require('./feed.jsx');

var Site = React.createClass({
    render: function() {
        var view;
        if (this.state.view === 'feed') {
            view = <Feed collection={this.state.globalCollection} />;
        } else {
            view = <Review reviewingStack={this.state.reviewing} />;
        }
        return <div>
            <Header page={this.state.view} />
            {view}
        </div>
    },
    getInitialState: function() {
        // TODO make this real
        var reviewing = new models.CardCollection();
        reviewing.fetch();

        var globalCollection = new models.CardCollection();
        globalCollection.fetch();
        return {
            view: 'feed',
            reviewing: reviewing,
            globalCollection: globalCollection
        };
    }
});

React.renderComponent(<Site />, document.body);
