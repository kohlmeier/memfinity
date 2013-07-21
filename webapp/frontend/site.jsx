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

        // TODO not using page in Header
        return <div>
            <Header page={this.state.view} onNavigate={this.navigate} />
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
    },
    navigate: function(page) {
        console.log(page);
        this.setState({ view: page });
    }
});

React.renderComponent(<Site />, document.body);
