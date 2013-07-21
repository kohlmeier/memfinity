/** @jsx React.DOM */
/*
 * Interface for feed mode
 */
var BackboneMixin = require('./backbonemixin.js');
var models = require('./models.js');
var gravatar = require('./gravatar.js');

// props: model
var FeedCard = React.createClass({
    mixins: [BackboneMixin],
    render: function() {
        return <div class='feedcard row-fluid'>
            <FeedCardMeta model={this.props.model} />
            <div class='feedcard_right span10'>
                <div class='feedcard_front'>
                    {this.props.model.get('front')}
                </div>
                <div class='feedcard_back'>
                    {this.props.model.get('back')}
                </div>
                <div class="feedcard_meta row-fluid">
                    <Tags list={this.props.model.get('tags')} />
                    <div class="span3 l_stealcard_container">
                        <div class='stealcard btn btn-primary btn-small' onClick={this.stealCard}>
                            Take this card
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    },
    getBackboneModels: function() {
        return [this.props.model];
    }
});

var FeedCardMeta = React.createClass({
    render: function() {
        // TODO get this info from google
        // http://stackoverflow.com/q/3591278/2121468
        var userImage = gravatar(this.props.model.get('user_email'), 60),
            photoStyle = {background: 'url(' + userImage + ') no-repeat'};
        return <div class='feedcard_userinfo span2'>
            <div class='feedcard_photo' style={photoStyle} />
            <div class='feedcard_desc'>
                <div class='feedcard_username'>
                    {this.props.model.get('user_nickname')}
                </div>
            </div>
        </div>;
    },
    stealCard: function() {
        console.log('TODO');
    }
});

var Tags = React.createClass({
    render: function() {
        var tags = _(this.props.list).map(function(tag) {
            return <span class='label label-info'>{tag}</span>;
        });
        return <div class='tags span9'>
            Tags: {tags}
        </div>;
    }
});

// props: collection
var FeedBody = React.createClass({
    mixins: [BackboneMixin],
    render: function() {
        var feedItems = _(this.props.collection.models).map(function(model) {
            return <li class="l-feedcard-container">
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
        return <div class='practicebutton btn btn-primary'
                    onClick={this.props.onClick}>
            Practice {this.props.count} cards
        </div>;
    }
});

// props: onFilterChange, onPractice, count
var FilterBar = React.createClass({
    render: function() {
        return <div class='filterbar row-fluid'>
            <div class="span9">
            <input type='text'
                   class='filtertext taginput'
                   ref='filter' />
            </div>
            <div class="span3">
            <PracticeButton count={this.props.count}
                            onClick={this.props.onPractice} />
            </div>
        </div>;
    },
    componentDidMount: function(elem) {
        var self = this;
        $(elem).find('.taginput').tagsInput({
            onChange: function(event){
                var $input = $(self.refs.filter.getDOMNode());
                var tags = $input.val()
                self.props.onFilterChange(tags);
            }
        });
    }
});

// props: collection, onPractice?
var Feed = React.createClass({
    mixins: [BackboneMixin],
    render: function() {
        var collection = this.props.collection;
        return <div class='feed clearfix'>
            <FilterBar onPractice={$.noop}
                       onFilterChange={this.onFilterChange}
                       count={collection.models.length} />
            <FeedBody collection={collection} />
        </div>;
    },
    getBackboneModels: function() {
        return [this.props.collection];
    },
    onFilterChange: function(filters) {
        var self = this;
        var filterQuery = !!filters ? ('?tag=' + filters) : '';
        $.get('/api/cards' + filterQuery, function(newCards) {
            self.props.collection.reset(JSON.parse(newCards));
        });
    }
});

module.exports = Feed;
