;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
/** @jsx React.DOM */
/*
 * Interface for the About page
 */
var BackboneMixin = require('./backbonemixin.js');
var models = require('./models.js');

var About = React.createClass({displayName: 'About',
    render: function() {
        return React.DOM.div( {id:"features", className:"features container"}, 
            React.DOM.p( {className:"intro"}, React.DOM.strong(null, "Remember all the things!"), " We want to do it, too, and now it's possible. ", React.DOM.strong(null, "Enter spacelot, the ocelot for your memory.")),
            React.DOM.div( {className:"feature"}, 
                React.DOM.h2(null, "Turbocharge your brain."),
                React.DOM.h3(null, "Spaced repetition is a game changer for personal learning."),
                React.DOM.p(null, "Using spaced repetition algorithms makes sure you can review the things you need to review, at just the right time to maximize your efficiency.")
            ),
            React.DOM.div( {className:"feature"}, 
                React.DOM.h2(null, "Create cards on-the-fly."),
                React.DOM.h3(null, "Use our killer Chrome extension to effortlessly create cards."),
                React.DOM.p(null, "See an interesting vocab work while reading online? Clip it. Want to remember the main point or an article you just read?  Clip it. Just learned an awesome keyboard shortcut, math concept, or piece of ridculous trivia?  Clip it!  With card creation this simple, it takes just seconds file knowledge away for permanent recall.")
            ),
            React.DOM.div( {className:"feature"}, 
                React.DOM.h2(null, "Learn out loud."),
                React.DOM.h3(null, "Follow friends, and see what the world is learning."),
                React.DOM.p(null, "Now that you can easily create your own cards and master them, how can you find even more fascinating and useful knowledge?  By following the feeds of people that share your learning interests.  See a realtime feed of what others are learning, and seamlessly grab cards you want to learn, too.")
            ),
            React.DOM.div( {className:"feature"}, 
                React.DOM.h2(null, "Built for openess."),
                React.DOM.h3(null),
                React.DOM.p(null, "Ocelot is built from the ground up as a web-service.  That means the open source communicty can create new apps for phones, browsers, and or any device. Also, with Ocelot your data is never held hostage. We're open source, and you're always free to host your own personal version of Ocelot.  And by learning with Ocelot, you're not only helping yourself learn;  you're also facilitating world-class research on memory. "  )
            )
        )

    }
});


module.exports = About;

},{"./backbonemixin.js":2,"./models.js":6}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
/** @jsx React.DOM */
/*
 * Interface for feed mode
 */
var BackboneMixin = require('./backbonemixin.js');
var models = require('./models.js');
var gravatar = require('./gravatar.js');

// props: model
var FeedCard = React.createClass({displayName: 'FeedCard',
    mixins: [BackboneMixin],
    render: function() {
        return React.DOM.div( {className:"feedcard clearfix"}, 
            FeedCardMeta( {model:this.props.model} ),
            React.DOM.div( {className:"feedcard_right"}, 
                React.DOM.div( {className:"feedcard_front"}, 
                    this.props.model.get('front')
                ),
                React.DOM.div( {className:"feedcard_back"}, 
                    this.props.model.get('back')
                )
            )
        );
    },
    getBackboneModels: function() {
        return [this.props.model];
    }
});

var FeedCardMeta = React.createClass({displayName: 'FeedCardMeta',
    render: function() {
        // TODO get this info from google
        // http://stackoverflow.com/q/3591278/2121468
        var userImage = gravatar(this.props.model.get('user_email'), 120),
            photoStyle = {background: 'url(' + userImage + ') no-repeat'};
        return React.DOM.div( {className:"feedcard_meta"}, 
            React.DOM.div( {className:"feedcard_photo", style:photoStyle} ),
            React.DOM.div( {className:"feedcard_desc"}, 
                React.DOM.div( {className:"feedcard_username"}, 
                    this.props.model.get('user_nickname')
                )
            ),
            Tags( {list:this.props.model.get('tags')} ),
            React.DOM.div( {className:"stealcard btn btn-primary btn-small", onClick:this.stealCard}, 
" Take this card "            )
        );
    },
    stealCard: function() {
        console.log('TODO');
    }
});

var Tags = React.createClass({displayName: 'Tags',
    render: function() {
        var tags = _(this.props.list).map(function(tag) {
            return React.DOM.span( {className:"label label-info"}, tag);
        });
        return React.DOM.div( {className:"tags"}, 
            tags
        );
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
        return React.DOM.div( {className:"practicebutton btn btn-primary",
                    onClick:this.props.onClick}, 
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

},{"./backbonemixin.js":2,"./gravatar.js":4,"./models.js":6}],4:[function(require,module,exports){
function getGravatar(email, size) {
    email = email || 'example@example.com';

    // MD5 (Message-Digest Algorithm) by WebToolkit
    //

    var MD5=function(s){function L(k,d){return(k<<d)|(k>>>(32-d))}function K(G,k){var I,d,F,H,x;F=(G&2147483648);H=(k&2147483648);I=(G&1073741824);d=(k&1073741824);x=(G&1073741823)+(k&1073741823);if(I&d){return(x^2147483648^F^H)}if(I|d){if(x&1073741824){return(x^3221225472^F^H)}else{return(x^1073741824^F^H)}}else{return(x^F^H)}}function r(d,F,k){return(d&F)|((~d)&k)}function q(d,F,k){return(d&k)|(F&(~k))}function p(d,F,k){return(d^F^k)}function n(d,F,k){return(F^(d|(~k)))}function u(G,F,aa,Z,k,H,I){G=K(G,K(K(r(F,aa,Z),k),I));return K(L(G,H),F)}function f(G,F,aa,Z,k,H,I){G=K(G,K(K(q(F,aa,Z),k),I));return K(L(G,H),F)}function D(G,F,aa,Z,k,H,I){G=K(G,K(K(p(F,aa,Z),k),I));return K(L(G,H),F)}function t(G,F,aa,Z,k,H,I){G=K(G,K(K(n(F,aa,Z),k),I));return K(L(G,H),F)}function e(G){var Z;var F=G.length;var x=F+8;var k=(x-(x%64))/64;var I=(k+1)*16;var aa=Array(I-1);var d=0;var H=0;while(H<F){Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=(aa[Z]|(G.charCodeAt(H)<<d));H++}Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=aa[Z]|(128<<d);aa[I-2]=F<<3;aa[I-1]=F>>>29;return aa}function B(x){var k="",F="",G,d;for(d=0;d<=3;d++){G=(x>>>(d*8))&255;F="0"+G.toString(16);k=k+F.substr(F.length-2,2)}return k}function J(k){k=k.replace(/rn/g,"n");var d="";for(var F=0;F<k.length;F++){var x=k.charCodeAt(F);if(x<128){d+=String.fromCharCode(x)}else{if((x>127)&&(x<2048)){d+=String.fromCharCode((x>>6)|192);d+=String.fromCharCode((x&63)|128)}else{d+=String.fromCharCode((x>>12)|224);d+=String.fromCharCode(((x>>6)&63)|128);d+=String.fromCharCode((x&63)|128)}}}return d}var C=Array();var P,h,E,v,g,Y,X,W,V;var S=7,Q=12,N=17,M=22;var A=5,z=9,y=14,w=20;var o=4,m=11,l=16,j=23;var U=6,T=10,R=15,O=21;s=J(s);C=e(s);Y=1732584193;X=4023233417;W=2562383102;V=271733878;for(P=0;P<C.length;P+=16){h=Y;E=X;v=W;g=V;Y=u(Y,X,W,V,C[P+0],S,3614090360);V=u(V,Y,X,W,C[P+1],Q,3905402710);W=u(W,V,Y,X,C[P+2],N,606105819);X=u(X,W,V,Y,C[P+3],M,3250441966);Y=u(Y,X,W,V,C[P+4],S,4118548399);V=u(V,Y,X,W,C[P+5],Q,1200080426);W=u(W,V,Y,X,C[P+6],N,2821735955);X=u(X,W,V,Y,C[P+7],M,4249261313);Y=u(Y,X,W,V,C[P+8],S,1770035416);V=u(V,Y,X,W,C[P+9],Q,2336552879);W=u(W,V,Y,X,C[P+10],N,4294925233);X=u(X,W,V,Y,C[P+11],M,2304563134);Y=u(Y,X,W,V,C[P+12],S,1804603682);V=u(V,Y,X,W,C[P+13],Q,4254626195);W=u(W,V,Y,X,C[P+14],N,2792965006);X=u(X,W,V,Y,C[P+15],M,1236535329);Y=f(Y,X,W,V,C[P+1],A,4129170786);V=f(V,Y,X,W,C[P+6],z,3225465664);W=f(W,V,Y,X,C[P+11],y,643717713);X=f(X,W,V,Y,C[P+0],w,3921069994);Y=f(Y,X,W,V,C[P+5],A,3593408605);V=f(V,Y,X,W,C[P+10],z,38016083);W=f(W,V,Y,X,C[P+15],y,3634488961);X=f(X,W,V,Y,C[P+4],w,3889429448);Y=f(Y,X,W,V,C[P+9],A,568446438);V=f(V,Y,X,W,C[P+14],z,3275163606);W=f(W,V,Y,X,C[P+3],y,4107603335);X=f(X,W,V,Y,C[P+8],w,1163531501);Y=f(Y,X,W,V,C[P+13],A,2850285829);V=f(V,Y,X,W,C[P+2],z,4243563512);W=f(W,V,Y,X,C[P+7],y,1735328473);X=f(X,W,V,Y,C[P+12],w,2368359562);Y=D(Y,X,W,V,C[P+5],o,4294588738);V=D(V,Y,X,W,C[P+8],m,2272392833);W=D(W,V,Y,X,C[P+11],l,1839030562);X=D(X,W,V,Y,C[P+14],j,4259657740);Y=D(Y,X,W,V,C[P+1],o,2763975236);V=D(V,Y,X,W,C[P+4],m,1272893353);W=D(W,V,Y,X,C[P+7],l,4139469664);X=D(X,W,V,Y,C[P+10],j,3200236656);Y=D(Y,X,W,V,C[P+13],o,681279174);V=D(V,Y,X,W,C[P+0],m,3936430074);W=D(W,V,Y,X,C[P+3],l,3572445317);X=D(X,W,V,Y,C[P+6],j,76029189);Y=D(Y,X,W,V,C[P+9],o,3654602809);V=D(V,Y,X,W,C[P+12],m,3873151461);W=D(W,V,Y,X,C[P+15],l,530742520);X=D(X,W,V,Y,C[P+2],j,3299628645);Y=t(Y,X,W,V,C[P+0],U,4096336452);V=t(V,Y,X,W,C[P+7],T,1126891415);W=t(W,V,Y,X,C[P+14],R,2878612391);X=t(X,W,V,Y,C[P+5],O,4237533241);Y=t(Y,X,W,V,C[P+12],U,1700485571);V=t(V,Y,X,W,C[P+3],T,2399980690);W=t(W,V,Y,X,C[P+10],R,4293915773);X=t(X,W,V,Y,C[P+1],O,2240044497);Y=t(Y,X,W,V,C[P+8],U,1873313359);V=t(V,Y,X,W,C[P+15],T,4264355552);W=t(W,V,Y,X,C[P+6],R,2734768916);X=t(X,W,V,Y,C[P+13],O,1309151649);Y=t(Y,X,W,V,C[P+4],U,4149444226);V=t(V,Y,X,W,C[P+11],T,3174756917);W=t(W,V,Y,X,C[P+2],R,718787259);X=t(X,W,V,Y,C[P+9],O,3951481745);Y=K(Y,h);X=K(X,E);W=K(W,v);V=K(V,g)}var i=B(Y)+B(X)+B(W)+B(V);return i.toLowerCase()};

    var size = size || 80;

    return 'http://www.gravatar.com/avatar/' + MD5(email) + '.jpg?s=' + size;
}

module.exports = getGravatar

},{}],5:[function(require,module,exports){
/** @jsx React.DOM */
var Header = React.createClass({displayName: 'Header',
    render: function() {
        var homeActive = this.state.home,
            feedActive = this.state.feed,
            aboutActive = this.state.about;
        
        return React.DOM.div( {className:"navbar navbar-inverse"}, 
            React.DOM.div( {className:"navbar-inner"}, 
                React.DOM.ul( {className:"nav pull-left"}, 
                    React.DOM.li( {className:'header_home' + (homeActive ? ' active' : ''),
                        onClick:_(this.props.onNavigate).partial('home'),
                        onMouseEnter:_(this.alertEnter).partial('home'),
                        onMouseLeave:_(this.alertLeave).partial('home')}, 
                        React.DOM.i( {className:"icon-home"}), " Practice "                    ),
                    React.DOM.li( {className:'header_feed' + (feedActive ? ' active' : ''),
                        onClick:_(this.props.onNavigate).partial('feed'),
                        onMouseEnter:_(this.alertEnter).partial('feed'),
                        onMouseLeave:_(this.alertLeave).partial('feed')}, 
                        React.DOM.i( {className:"icon-twitter"}), " Feed "                    )
                ),
                React.DOM.ul( {className:"nav pull-right"}, 
                    React.DOM.li( {className:'header_about' + (aboutActive ? ' active' : ''),
                        onClick:_(this.props.onNavigate).partial('about'),
                        onMouseEnter:_(this.alertEnter).partial('about'),
                        onMouseLeave:_(this.alertLeave).partial('about')}, 
                        React.DOM.i( {className:"icon-info"}), " About "                    )
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
            feed: false,
            about: false
        };
    }
});

module.exports = Header;

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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
                           position:{x: 100, y: 50},
                           name:"Hard"} ),
            ReviewedStack( {collection:easyStack,
                           position:{x: 600, y: 50},
                           name:"Easy"} ),

            ReviewingStack( {collection:this.props.reviewingStack,
                            rate:rate,
                            position:{x: 255, y: 360}} )
        );
    }
});

// TODO handle size = 0
var stackSides = function (primary, secondary, size, times) {
    var ret = [];
    _(times).times(function(n) {
        n += 1; // 1-indexed
        var color = n % 2 === 0 ? primary : secondary,
            sz = (size * n) + 'px ';
        ret.push(sz + sz + color);
    });
    ret = ret.join(', ');
    return ret;
};

// props: collection, position ({x, y})?, rate
var ReviewingStack = React.createClass({displayName: 'ReviewingStack',
    mixins: [BackboneMixin],
    render: function() {
        var currentCard = this.state.cardNum;
        var topCardModel = this.props.collection.models[this.state.cardNum];
        var sideLayers = Math.max(1, this.props.collection.models.length);
        var style = {
            left: this.props.position.x,
            top: this.props.position.y,
            'box-shadow': stackSides('#2C3E50', '#BDC3C7', 2, sideLayers)
        };
        if (!topCardModel) { // empty stack
            // TODO
            return React.DOM.div( {className:"reviewingstack emptyreviewingstack", style:style}, 
                React.DOM.h2(null, "Congratulations!"),

                React.DOM.p(null, "you're done for the day"),
                React.DOM.p(null, React.DOM.a(null, "make more"), " or ", React.DOM.a(null, "continue practicing"))
            );
        } else {
            var topCard = Card( {model:topCardModel,
                                rate:this.props.rate,
                                key:topCardModel.cid} );
            return React.DOM.div( {className:"reviewingstack", style:style}, 
                topCard
            );
        }
    },
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

// props: collection, position, (some handler)
var ReviewedStack = React.createClass({displayName: 'ReviewedStack',
    mixins: [BackboneMixin],
    render: function() {
        var sideLayers = this.props.collection.models.length;
        var allstyle = {
            left: this.props.position.x,
            top: this.props.position.y
        };

        var stackstyle = {
            'box-shadow': stackSides('#2C3E50', '#BDC3C7', 2, sideLayers)
        };

        var topCardModel = _(this.props.collection.models).last();
        if (topCardModel) {
            // TODO way to view this card
            topCard = Card( {model:topCardModel,
                            rate:$.noop,
                            key:topCardModel.cid} );
        } else {
            topCard = null;
        }
        return React.DOM.div( {className:"reviewedstackall", style:allstyle}, 
            ReviewedStackMeta( {count:this.props.collection.models.length,
                               name:this.props.name} ),
            React.DOM.div( {className:"reviewedstack", style:stackstyle}, 
                React.DOM.div( {className:"topcardcover"} ),
                topCard
            )
        );
    },
    getBackboneModels: function() {
        return [this.props.collection];
    }
});

var ReviewedStackMeta = React.createClass({displayName: 'ReviewedStackMeta',
    render: function() {
        var count = this.props.count,
            word = this.props.count === 1 ? 'card' : 'cards',
            phrase = count + ' ' + word;
        return React.DOM.div( {className:"reviewedstackmeta"}, 
            React.DOM.h4(null, this.props.name),
            phrase
        );
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

},{"./backbonemixin.js":2,"./models.js":6}],8:[function(require,module,exports){
/** @jsx React.DOM */
var models = require('./models.js'),
    Review = require('./review.jsx'),
    Header = require('./header.jsx'),
    Feed = require('./feed.jsx'),
    About = require('./about.jsx')
    ;

var Site = React.createClass({displayName: 'Site',
    render: function() {
        var view;
        if (this.state.view === 'feed') {
            view = Feed( {collection:this.state.globalCollection} );
        } else if (this.state.view === 'about') {
            view = About(null );
        } else {
            view = Review( {reviewingStack:this.state.reviewing} );
        }

        // TODO not using page in Header
        return React.DOM.div(null, 
            Header( {page:this.state.view, onNavigate:this.navigate} ),
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
            view: 'home',
            reviewing: reviewing,
            globalCollection: globalCollection
        };
    },
    navigate: function(page) {
        this.setState({ view: page });
    }
});

React.renderComponent(Site(null ), document.body);

},{"./about.jsx":1,"./feed.jsx":3,"./header.jsx":5,"./models.js":6,"./review.jsx":7}]},{},[1,2,3,4,5,6,7,8])
;