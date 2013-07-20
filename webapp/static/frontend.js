;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
var _validateModelArray = function(backboneModels) {
    if (!_.isArray(backboneModels)) {
        throw new Error('getBackboneModels must return an array, ' +
            'get this ' + backboneModels + ' out of here.');
    }
}

/**
 * BackboneMixin - automatic binding and unbinding for react classes mirroring
 * backbone models and views. Example:
 *
 *     var Model = Backbone.Model.extend({ ... });
 *     var Collection = Backbone.Collection.extend({ ... });
 *
 *     var Example = React.createClass({
 *         mixins: [BackboneMixin],
 *         getBackboneModels: function() {
 *             return [this.model, this.collection];
 *         }
 *     });
 *
 * List the models and collections that your class uses and it'll be
 * automatically `forceUpdate`-ed when they change.
 *
 * This binds *and* unbinds the events.
 */
var BackboneMixin = {
    // Passing this.forceUpdate directly to backbone.on will cause it to call
    // forceUpdate with the changed model, which we don't want
    _backboneForceUpdate: function() {
        this.forceUpdate();
    },
    componentDidMount: function() {
        // Whenever there may be a change in the Backbone data, trigger a
        // reconcile.
        var backboneModels = this.getBackboneModels();
        _validateModelArray(backboneModels);
        backboneModels.map(function(backbone) {
            // The add, remove, and reset events are never fired for
            // models, as far as I know.
            backbone.on('add change remove reset', this._backboneForceUpdate,
                this);
        }.bind(this));
    },
    componentWillUnmount: function() {
        var backboneModels = this.getBackboneModels();
        _validateModelArray(backboneModels);
        // Ensure that we clean up any dangling references when the
        // component is destroyed.
        backboneModels.map(function(backbone) {
            // Remove all callbacks for all events with `this` as a context
            backbone.off('add change remove reset', this._backboneForceUpdate,
                this);
        }.bind(this));
    }
};

module.exports = BackboneMixin;

},{}],2:[function(require,module,exports){
/** @jsx React.DOM */
/*
 * Interface for feed mode
 */

module.exports = null;

},{}],3:[function(require,module,exports){
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
var CardStack = React.createClass({displayName: 'CardStack',
    mixins: [BackboneMixin],
    render: function() {
        var currentCard = this.state.cardNum;
        var topCardModel = this.props.collection.models[this.state.cardNum];
        if (!topCardModel) { // empty stack
            return React.DOM.div( {className:"emptycardstack"}, 
" empty stack! "            );
        } else {
            var topCard = Card( {model:topCardModel,
                                nextCard:this.nextCard,
                                key:topCardModel.cid} );
            return React.DOM.div( {className:"cardstack", style:{left: '300px'}}, 
                topCard
            );
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
        return React.DOM.div( {className:"card"}, 
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

module.exports = {
    CardCollection: CardCollection,
    CardStack: CardStack
};

},{"./backbonemixin.js":1}],4:[function(require,module,exports){
/** @jsx React.DOM */
var review = require('./review.jsx'),
    feed = require('./feed.jsx');

var CardStack = review.CardStack;
var cards = new review.CardCollection();
cards.fetch();
React.renderComponent(CardStack( {collection:cards} ), document.body);

},{"./feed.jsx":2,"./review.jsx":3}]},{},[1,2,3,4])
;