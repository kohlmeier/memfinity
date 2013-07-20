/** @jsx React.DOM */
/*
 * Interface for review mode
 */
var BackboneMixin = require('./backbonemixin.js');

/*
 * Cards store the following data:
 * - front: markup appearing on the front of the card
 * - back: markup appearing on the back of the card
 * - tags: list of tag names
 * - ... meta ...
 */
var CardModel = Backbone.Model.extend({
    rate: function(rating) { console.log('rated ' + rating); }
});

var CardCollection = Backbone.Collection.extend({
    model: CardModel,
    url: '/api/cards/' // TODO
    // TODO - comparator
});

// props: collection, position ({x, y})?
var CardStack = React.createClass({
    mixins: [BackboneMixin],
    render: function() {
        var currentCard = this.state.cardNum;
        var topCardModel = this.props.collection.models[this.state.cardNum];
        if (!topCardModel) { // empty stack
            return <div class='emptycardstack'>
                empty stack!
            </div>;
        } else {
            var topCard = <Card model={topCardModel}
                                nextCard={this.nextCard}
                                key={topCardModel.cid} />;
            return <div class='cardstack' style={{left: '300px'}}>
                {topCard}
            </div>;
        }
    },
    // TODO - does this have to be a function?
    getInitialState: function() {
        return { cardNum: 0 };
    },
    nextCard: function() {
        this.setState({cardNum: this.state.cardNum + 1});
    },
    getBackboneModels: function() {
        return [this.props.collection];
    }
});

// props: nextCard, front, back, (tags or meta)
// TODO this should probably take state as as prop
var Card = React.createClass({
    render: function() {
        var stateView,
            rate = function(rating) {
                this.props.model.rate(rating);
                this.props.nextCard();
            }.bind(this);
        if (this.state.state === 'front') {
            var clickHandler = function() {
                this.setState({state: 'back'});
            }.bind(this);
            stateView = <CardFront
                content={this.props.model.get('front')}
                onClick={clickHandler} />
        } else if (this.state.state === 'back') {
            stateView = <CardBack
                content={this.props.model.get('back')}
                rate={rate} />;
        } else { // meta
            stateView = <CardMeta info={this.props.model.get('meta')} />;
        }
        return <div class='card'>
            {stateView}
        </div>;
    },
    getInitialState: function() {
        return {
            state: 'front'
        };
    }
});

var CardFront = React.createClass({
    render: function() {
        return <div class='cardFront' onClick={this.props.onClick}>
            <Content content={this.props.content} />
        </div>;
    }
});

var CardBack = React.createClass({
    render: function() {
        // <MetaButton onClick={undefined} />
        return <div class='clearfix'>
            <Content content={this.props.content} />
            <Choices rate={this.props.rate} />
        </div>;
    }
});

var CardMeta = React.createClass({
    render: function() {
        return <span />;
    }
});

var Content = React.createClass({
    render: function() {
        return <div class='content'>{this.props.content}</div>;
    }
});

var Choices = React.createClass({
    render: function() {
        return <div class='choices'>
            <span class='choices_hard'
                  onClick={_(this.props.rate).partial('hard')}>
                Hard
            </span>
            <span class='choices_easy'
                  onClick={_(this.props.rate).partial('easy')}>
                Easy
            </span>
        </div>;
    }
});

var MetaButton = React.createClass({
    render: function() {
        return <div />;
    }
});

module.exports = {
    CardCollection: CardCollection,
    CardStack: CardStack
};
