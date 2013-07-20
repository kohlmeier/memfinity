/** @jsx React.DOM */
// see it in action - http://jsfiddle.net/dinojoel/8LRge/15/

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

var cards = [
    new CardModel({front: 'allez', back: 'go', tags: ['french']}),
    new CardModel({front: 'matin', back: 'morning', tags: ['french']})
];

var CardList = React.createClass({displayName: 'CardList',
    render: function() {
        var currentCard = this.state.cardNum;
        var cards = _(this.props.models).map(function(model, ix) {
            var scale = currentCard === ix ? 1 : 0.8;
            var style = {
                '-webkit-transform': 'scale(' + scale + ')',
                left: (50060 + (ix - currentCard) * 420) + 'px'
            };
            return Card( {model:model,
                         style:style,
                         nextCard:this.nextCard}, null );
        }, this);
        return React.DOM.div( {className:"cardlist"}, cards);
    },
    // TODO - does this have to be a function?
    getInitialState: function() {
        return { cardNum: 0 };
    },
    nextCard: React.autoBind(function() {
        this.setState({cardNum: this.state.cardNum + 1});
    })
});

// props: nextCard, front, back, (tags or meta)
var Card = React.createClass({displayName: 'Card',
    render: function() {
        var stateView,
            rate = function(rating) {
                this.props.model.rate(rating);
                this.props.nextCard();
            }.bind(this);
        if (this.state.state === 'front') {
            var clickHandler = _(this.setState.bind(this))
                .partial({ state: 'back' });
            stateView = CardFront(
                {content:this.props.model.get('front'),
                onClick:clickHandler}, null )
        } else if (this.state.state === 'back') {
            stateView = CardBack(
                {content:this.props.model.get('back'),
                rate:rate}, null );
        } else { // meta
            stateView = CardMeta( {info:this.props.model.get('meta')}, null );
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
            Content( {content:this.props.content}, null )
        );
    }
});

var CardBack = React.createClass({displayName: 'CardBack',
    render: function() {
        // <MetaButton onClick={undefined} />
        return React.DOM.div( {className:"clearfix"}, [
            Content( {content:this.props.content}, null ),
            Choices( {rate:this.props.rate}, null )
        ]);
    }
});

var CardMeta = React.createClass({displayName: 'CardMeta',
    render: function() {
        return React.DOM.span(null, null );
    }
});

var Content = React.createClass({displayName: 'Content',
    render: function() {
        return React.DOM.div( {className:"content"}, this.props.content);
    }
});

var Choices = React.createClass({displayName: 'Choices',
    render: function() {
        return React.DOM.div( {className:"choices"}, [
            React.DOM.span( {className:"choices_hard",
                  onClick:_(this.props.rate).partial('hard')}, 
" Hard "            ),
            React.DOM.span( {className:"choices_easy",
                  onClick:_(this.props.rate).partial('easy')}, 
" Easy "            )
        ]);
    }
});

var MetaButton = React.createClass({displayName: 'MetaButton',
    render: function() {
        return React.DOM.div(null, null );
    }
});

