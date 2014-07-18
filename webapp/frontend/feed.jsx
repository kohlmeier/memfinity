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
    getInitialState: function() {
        return {isActive: false};
    },
    render: function() {
        var isActive = this.state.isActive;
        var cardActionButtons;
        if (window.username === null) {
            cardActionButtons = null;
        } else if (window.username !== this.props.model.get('user_email')) {
            cardActionButtons = 
                <div className={'takecard btn btn-primary btn-small' + (isActive ? ' visible' : ' invisible')}
                        onClick={this.takeCard}>
                    <i className='icon-download'></i> Take
                </div>;
        } else {
            cardActionButtons = 
                <div className={'deletecard btn btn-primary btn-small' + (isActive ? ' visible' : ' invisible')}
                        onClick={this.deleteCard}>
                    <i className='icon-trash'></i> Delete
                </div>
        };

        return <div className='feedcard row-fluid'
                        onMouseEnter={this.alertEnter}
                        onMouseLeave={this.alertLeave}>
            <FeedCardMeta model={this.props.model} />
            <div className='feedcard_right span10'>
                <div className='feedcard_front'>
                    {this.props.model.get('front')}
                </div>
                <div className='feedcard_back'>
                    {this.props.model.get('back')}
                </div>
                <div className="feedcard_meta row-fluid">
                    <Tags list={this.props.model.get('tags')} />
                    <div className="span3 l_takecard_container">
                        {cardActionButtons}
                    </div>
                </div>
            </div>
        </div>;
    },
    getBackboneModels: function() {
        return [this.props.model];
    },
    deleteCard: function() {
        // fire off an async DELETE to the server
        this.props.model.deleteCard();
        // optimistically, we remove it from the UI
        this.props.collection.remove(this.props.model);
    },
    takeCard: function() {
        this.props.model.takeCard();
    },
    alertEnter: function(target) {
        this.setState({isActive: true});
    },
    alertLeave: function(target) {
        this.setState({isActive: false});
    },
});

var FeedCardMeta = React.createClass({
    render: function() {
        // TODO get this info from google
        // http://stackoverflow.com/q/3591278/2121468
        var userImage = gravatar(this.props.model.get('user_email'), 60),
            photoStyle = {background: 'url(' + userImage + ') no-repeat'};
        return <div className='feedcard_userinfo span2'>
            <div className='feedcard_photo' style={photoStyle} />
            <div className='feedcard_desc'>
                <div className='feedcard_username'>
                    {this.props.model.get('user_nickname')}
                </div>
            </div>
        </div>;
    },
    takeCard: function() {
        console.log('TODO');
    }
});

var Tags = React.createClass({
    render: function() {
        var tags = _(this.props.list).map(function(tag) {
            return <span className='label label-info'>{tag}</span>;
        });
        return <div className='tags span9'>
            Tags: {tags}
        </div>;
    }
});

// props: collection
var FeedBody = React.createClass({
    mixins: [BackboneMixin],
    render: function() {
        var collection = this.props.collection;
        var feedItems = _(this.props.collection.models).map(function(model) {
            return <li className="l-feedcard-container">
                <FeedCard model={model} key={model.cid} collection={collection} />
            </li>;
        });
        return <ol className='feedbody'>
            {feedItems}
        </ol>;
    },
    getBackboneModels: function() {
        return [this.props.collection];
    }
});

var PracticeButton = React.createClass({
    render: function() {
        return <div className='practicebutton btn btn-primary'
                    onClick={this.props.onClick}>
            Practice {this.props.count} cards
        </div>;
    }
});

// props: onFilterChange, onPractice, count
var FilterBar = React.createClass({
    render: function() {
        return <div className='filterbar row-fluid'>
            <div className="span9">
            <input type='text'
                   className='filtertext taginput'
                   ref='filter' />
            </div>
            <div className="span3">
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
        return <div className='feed clearfix'>
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
