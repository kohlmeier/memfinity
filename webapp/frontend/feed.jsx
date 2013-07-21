/** @jsx React.DOM */
/*
 * Interface for feed mode
 */
var BackboneMixin = require('./backbonemixin.js');
var models = require('./models.js');

// props: model
var FeedCard = React.createClass({
    mixins: [BackboneMixin],
    render: function() {
        return <div class='feedcard'>
            <div class='feedcard_front'>
                {this.props.model.get('front')}
            </div>
            <div class='feedcard_back'>
                {this.props.model.get('back')}
            </div>
        </div>;
    },
    getBackboneModels: function() {
        return [this.props.model];
    }
});

// props: collection
var FeedBody = React.createClass({
    mixins: [BackboneMixin],
    render: function() {
        var feedItems = _(this.props.collection.models).map(function(model) {
            return <li>
                <FeedCard model={model} key={model.cid} />
            </li>;
        });
        return <ol class='feedbody'>
            {feedItems}
        </ol>;
    },
    getBackboneModels: function() {
        return [this.props.collection];
    }
});

var PracticeButton = React.createClass({
    render: function() {
        return <div class='practicebutton' onClick={this.props.onClick}>
            Practice {this.props.count} cards
        </div>;
    }
});

// props: onFilterChange, onPractice, count
var FilterBar = React.createClass({
    render: function() {
        return <div class='filterbar clearfix'>
            <input type='text'
                   class='filtertext'
                   value={this.props.value}
                   onChange={this.handleChange} />
            <PracticeButton count={this.props.count}
                            onClick={this.props.onPractice} />
        </div>;
    },
    handleChange: function(event) {
        // '/api/cards?tag=tag1,tag2'
        console.log(event.nativeEvent);
    }
});

// props: collection, onPractice?
var Feed = React.createClass({
    render: function() {
        var collection = this.props.collection;
        return <div class='feed clearfix'>
            <FilterBar onPractice={$.noop} count={collection.models.length} />
            <FeedBody collection={collection} />
        </div>;
    }
});

module.exports = Feed
