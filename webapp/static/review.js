/** @jsx React.DOM */
// see it in action - http://jsfiddle.net/dinojoel/8LRge/15/
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

// var cards = [
//     new CardModel({front: 'allez', back: 'go', tags: ['french']}),
//     new CardModel({front: 'matin', back: 'morning', tags: ['french']})
// ];

var CardList = React.createClass({displayName: 'CardList',
    mixins: [BackboneMixin],
    render: function() {
        var currentCard = this.state.cardNum;
        var cards = _(this.props.collection.models).map(function(model, ix) {
            var scale = currentCard === ix ? 1 : 0.8;
            var style = {
                '-webkit-transform': 'scale(' + scale + ')',
                left: (250 + (ix - currentCard) * 420) + 'px'
            };
            return Card( {model:model,
                         style:style,
                         nextCard:this.nextCard,
                         key:model.cid} );
        }, this);
        return React.DOM.div( {className:"cardlist"}, cards);
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
var Card = React.createClass({displayName: 'Card',
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
            stateView = CardFront(
                {content:this.props.model.get('front'),
                onClick:clickHandler} )
        } else if (this.state.state === 'back') {
            stateView = CardBack(
                {content:this.props.model.get('back'),
                rate:rate} );
        } else { // meta
            stateView = CardMeta( {info:this.props.model.get('meta')} );
        }
        return React.DOM.div( {className:"card", style:this.props.style}, 
            stateView
        );
    },
    getInitialState: function() {
        return {
            state: 'front'
        };
    }
});

var CardFront = React.createClass({displayName: 'CardFront',
    render: function() {
        return React.DOM.div( {className:"cardFront", onClick:this.props.onClick}, 
            Content( {content:this.props.content} )
        );
    }
});

var CardBack = React.createClass({displayName: 'CardBack',
    render: function() {
        // <MetaButton onClick={undefined} />
        return React.DOM.div( {className:"clearfix"}, 
            Content( {content:this.props.content} ),
            Choices( {rate:this.props.rate} )
        );
    }
});

var CardMeta = React.createClass({displayName: 'CardMeta',
    render: function() {
        return React.DOM.span(null );
    }
});

var Content = React.createClass({displayName: 'Content',
    render: function() {
        return React.DOM.div( {className:"content"}, this.props.content);
    }
});

var Choices = React.createClass({displayName: 'Choices',
    render: function() {
        return React.DOM.div( {className:"choices"}, 
            React.DOM.span( {className:"choices_hard",
                  onClick:_(this.props.rate).partial('hard')}, 
" Hard "            ),
            React.DOM.span( {className:"choices_easy",
                  onClick:_(this.props.rate).partial('easy')}, 
" Easy "            )
        );
    }
});

var MetaButton = React.createClass({displayName: 'MetaButton',
    render: function() {
        return React.DOM.div(null );
    }
});

