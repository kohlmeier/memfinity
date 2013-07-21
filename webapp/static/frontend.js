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
var BackboneMixin = require('./backbonemixin.js');
var models = require('./models.js');

// props: model
var FeedCard = React.createClass({displayName: 'FeedCard',
    mixins: [BackboneMixin],
    render: function() {
        return React.DOM.div( {className:"feedcard"}, 
            React.DOM.div( {className:"feedcard_front"}, 
                this.props.model.get('front')
            ),
            React.DOM.div( {className:"feedcard_back"}, 
                this.props.model.get('back')
            )
        );
    },
    getBackboneModels: function() {
        return [this.props.model];
    }
});

// props: collection
var FeedBody = React.createClass({displayName: 'FeedBody',
    mixins: [BackboneMixin],
    render: function() {
        var feedItems = _(this.props.collection.models).map(function(model) {
            return React.DOM.li(null, 
                FeedCard( {model:model, key:model.cid} )
            );
        });
        return React.DOM.ol( {className:"feedbody"}, 
            feedItems
        );
    },
    getBackboneModels: function() {
        return [this.props.collection];
    }
});

var PracticeButton = React.createClass({displayName: 'PracticeButton',
    render: function() {
        return React.DOM.div( {className:"practicebutton", onClick:this.props.onClick}, 
" Practice ", this.props.count, " cards "        );
    }
});

// props: onFilterChange, onPractice, count
var FilterBar = React.createClass({displayName: 'FilterBar',
    render: function() {
        return React.DOM.div( {className:"filterbar clearfix"}, 
            React.DOM.span( {className:"filterbar_description"}, "Filter"),
            React.DOM.input( {type:"text",
                   className:"filtertext",
                   value:this.props.value,
                   onChange:this.handleChange} ),
            PracticeButton( {count:this.props.count,
                            onClick:this.props.onPractice} )
        );
    },
    handleChange: function(event) {
        // '/api/cards?tag=tag1,tag2'
        console.log(event.nativeEvent);
    }
});

// props: collection, onPractice?
var Feed = React.createClass({displayName: 'Feed',
    render: function() {
        var collection = this.props.collection;
        return React.DOM.div( {className:"feed clearfix"}, 
            FilterBar( {onPractice:$.noop, count:collection.models.length} ),
            FeedBody( {collection:collection} )
        );
    }
});

module.exports = Feed;

},{"./backbonemixin.js":1,"./models.js":4}],3:[function(require,module,exports){
/** @jsx React.DOM */
var Header = React.createClass({displayName: 'Header',
    render: function() {
        var homeActive = this.state.home,
            headerActive = this.state.header;
        return React.DOM.div( {className:"navbar navbar-inverse"}, 
            React.DOM.div( {className:"navbar-inner"}, 
                React.DOM.ul( {className:"nav"}, 
                    React.DOM.li( {className:'header_home' + (homeActive ? ' active' : ''),
                        onMouseEnter:_(this.alertEnter).partial('home'),
                        onMouseLeave:_(this.alertLeave).partial('home')}, 
                        React.DOM.i( {className:"icon-home"}),"Home "                    ),
                    React.DOM.li( {className:'header_page' + (headerActive ? ' active' : ''),
                        onMouseEnter:_(this.alertEnter).partial('header'),
                        onMouseLeave:_(this.alertLeave).partial('header')}, 
                        React.DOM.i( {className:"icon-twitter"}),this.props.page
                    )
                )
            )
        );
    },
    alertEnter: function(target) {
        var state = {};
        state[target] = true;
        this.setState(state);
    },
    alertLeave: function(target) {
        var state = {};
        state[target] = false;
        this.setState(state);
    },
    getInitialState: function() {
        return {
            home: false,
            header: false
        };
    }
});

module.exports = Header;

},{}],4:[function(require,module,exports){
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
    url: '/api/cards' // TODO
    // TODO - comparator
});

module.exports = {
    CardModel: CardModel,
    CardCollection: CardCollection
};

},{}],5:[function(require,module,exports){
/** @jsx React.DOM */
/*
 * Interface for review mode
 */
var BackboneMixin = require('./backbonemixin.js');
var models = require('./models.js');

var CardModel = models.CardModel,
    CardCollection = models.CardCollection;

var Review = React.createClass({displayName: 'Review',
    render: function() {
        var hardStack = new CardCollection(),
            easyStack = new CardCollection();

        var rate = function(cid, rating) {
            var reviewingStack = this.props.reviewingStack,
                model = reviewingStack.get(cid);
            reviewingStack.remove(model);
            if (rating === 'easy') {
                easyStack.add(model);
            } else { // hard
                hardStack.add(model);
            }
        }.bind(this);

        return React.DOM.div(null, 
            ReviewedStack( {collection:hardStack,
                           position:{x: 200, y: 50},
                           scale:0.6} ),
            ReviewedStack( {collection:easyStack,
                           position:{x: 600, y: 50},
                           scale:0.6} ),

            ReviewingStack( {collection:this.props.reviewingStack,
                            rate:rate,
                            position:{x: 400, y: 400},
                            scale:1} )
        );
    }
});

// props: collection, position ({x, y})?, scale, rate
var ReviewingStack = React.createClass({displayName: 'ReviewingStack',
    mixins: [BackboneMixin],
    render: function() {
        var currentCard = this.state.cardNum;
        var topCardModel = this.props.collection.models[this.state.cardNum];
        var style = {
            left: this.props.position.x,
            top: this.props.position.y,
            '-webkit-transform': 'scale(' + this.props.scale + ')'
        };
        if (!topCardModel) { // empty stack
            // TODO
            return React.DOM.div( {className:"stack", style:style}, 
" empty stack! "            );
        } else {
            var topCard = Card( {model:topCardModel,
                                rate:this.props.rate,
                                key:topCardModel.cid} );
            return React.DOM.div( {className:"stack", style:style}, 
                topCard
            );
        }
    },
    // TODO - does this have to be a function?
    getInitialState: function() {
        return { cardNum: 0 };
    },
    /*nextCard: function() {
        this.setState({cardNum: this.state.cardNum + 1});
    },*/
    getBackboneModels: function() {
        return [this.props.collection];
    }
});

// props: collection, position, scale, (some handler)
var ReviewedStack = React.createClass({displayName: 'ReviewedStack',
    mixins: [BackboneMixin],
    render: function() {
        var style = {
            left: this.props.position.x,
            top: this.props.position.y,
            '-webkit-transform': 'scale(' + this.props.scale + ')'
        };
        return React.DOM.div( {className:"stack", style:style}, 
            this.props.collection.models.length
        );
    },
    getBackboneModels: function() {
        return [this.props.collection];
    }
});

// props: nextCard, front, back, (tags or meta)
// TODO this should probably take state as as prop
var Card = React.createClass({displayName: 'Card',
    render: function() {
        var stateView;
            /*
            rate = function(rating) {
                this.props.rate(rating);
                // this.props.model.rate(rating);
                // this.props.nextCard();
            }.bind(this);
            */
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
                rate:_(this.props.rate).partial(this.props.model.cid)} );
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

module.exports = Review;

},{"./backbonemixin.js":1,"./models.js":4}],6:[function(require,module,exports){
/** @jsx React.DOM */
var models = require('./models.js'),
    Review = require('./review.jsx'),
    Header = require('./header.jsx'),
    Feed = require('./feed.jsx');

var Site = React.createClass({displayName: 'Site',
    render: function() {
        var view;
        if (this.state.view === 'feed') {
            view = Feed( {collection:this.state.globalCollection} );
        } else {
            view = Review( {reviewingStack:this.state.reviewing} );
        }
        return React.DOM.div(null, 
            Header( {page:this.state.view} ),
            view
        )
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

React.renderComponent(Site(null ), document.body);

},{"./feed.jsx":2,"./header.jsx":3,"./models.js":4,"./review.jsx":5}]},{},[1,2,3,4,5,6])
;