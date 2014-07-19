/** @jsx React.DOM */
/*
 * Interface for review mode
 */
var React = require('react');
var BackboneMixin = require('./backbonemixin.js');
var models = require('./models.js');

// TODO(chris): this is chock-full of XSS potential. Plz fix. We
// really ought to sanitize the generated HTML, probably on the
// server. See Markdown and Bleach for Python.
var converter = new Showdown.converter();

var CardModel = models.CardModel,
    CardCollection = models.CardCollection;

var Review = React.createClass({
    render: function() {
        var hardStack = new CardCollection(),
            easyStack = new CardCollection();

        var rate = function(cid, rating) {
            var reviewingStack = this.state.reviewingStack,
                model = reviewingStack.get(cid);
            model.rate(rating);
            reviewingStack.remove(model);
            if (rating === 'easy') {
                easyStack.add(model);
            } else { // hard
                hardStack.add(model);
            }
        }.bind(this);

        return <div className="review_workspace">
            <ReviewedStack collection={hardStack}
                           name='Hard' />
            <ReviewedStack collection={easyStack}
                           name='Easy' />

            <ReviewingStack collection={this.state.reviewingStack}
                            rate={rate} />
        </div>;
    },
    getInitialState: function() {
        var cardModels = _(window.userCards).map(function(card) {
            return new models.CardModel(card);
        });
        reviewingStack = new models.CardCollection(cardModels);
        return { reviewingStack: reviewingStack };
    }
});

var stackSides = function (primary, secondary, size, times) {
    times = 1;
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
var ReviewingStack = React.createClass({
    mixins: [BackboneMixin],
    render: function() {
        var topCardModel = _(this.props.collection.models).first();
        var sideLayers = Math.max(1, this.props.collection.models.length);
        var stackstyle = {
            'box-shadow': stackSides('#2C3E50', '#BDC3C7', 2, sideLayers)
        };

        var stack;
        if (!topCardModel) { // empty stack
            // TODO
            stack = <div className='reviewingstack emptyreviewingstack'
                        style={stackstyle}>
                <h2>Congratulations!</h2>

                <p>you're done for the day</p>
                <p><a>make more</a> or <a>continue practicing</a></p>
            </div>;
        } else {
            var topCard = <Card model={topCardModel}
                                rate={this.props.rate}
                                key={topCardModel.cid} />;
            stack = <div className='reviewingstack' style={stackstyle}>
                {topCard}
            </div>;
        }
        return <div className='reviewingstackall'>
            <ReviewingStackMeta
                    count={this.props.collection.models.length}
                    name='Remaining' />
            {stack}
        </div>;
    },
    getBackboneModels: function() {
        return [this.props.collection];
    }
});

var ReviewingStackMeta = React.createClass({
    render: function() {
        var count = this.props.count,
            word = this.props.count === 1 ? 'card' : 'cards',
            phrase = count + ' ' + word;
        return <div className='reviewingstackmeta'>
            <h3>{this.props.name}</h3>
            <h4>{phrase}</h4>
        </div>;
    }
});

// props: collection, position, (some handler)
var ReviewedStack = React.createClass({
    mixins: [BackboneMixin],
    render: function() {
        var sideLayers = this.props.collection.models.length;
        var stackstyle = {
            'box-shadow': stackSides('#2C3E50', '#BDC3C7', 2, sideLayers)
        };

        var topCardModel = _(this.props.collection.models).last();
        if (topCardModel) {
            // TODO way to view this card
            topCard = <Card model={topCardModel}
                            key={topCardModel.cid} />;
        } else {
            topCard = null;
        }
        return <div className={'reviewedstackall reviewedstackall-' + this.props.name.toLowerCase()}>
            <ReviewedStackMeta count={this.props.collection.models.length}
                               name={this.props.name} />
            <div className='reviewedstack' style={stackstyle}>
                <div className='topcardcover' />
                {topCard}
            </div>
        </div>;
    },
    getBackboneModels: function() {
        return [this.props.collection];
    }
});

var ReviewedStackMeta = React.createClass({
    render: function() {
        var count = this.props.count,
            word = this.props.count === 1 ? 'card' : 'cards',
            phrase = count + ' ' + word;
        return <div className='reviewedstackmeta'>
            <h4>{this.props.name}</h4>
            {phrase}
        </div>;
    }
});

// props: nextCard, front, back, (tags or meta)
// TODO this should probably take state as as prop
var Card = React.createClass({
    render: function() {
        var stateView,
            content;
        if (this.state.state === 'front') {
            var clickHandler = function() {
                this.setState({state: 'back'});
            }.bind(this);
            content = this.props.model.get('front');
            if (this.props.model.get('input_format') == 'markdown') {
                content = <div className="userhtml"
                             dangerouslySetInnerHTML={{__html: converter.makeHtml(content)}}></div>;
            }
            stateView = <CardFront
                content={content}
                onClick={clickHandler} />;
        } else if (this.state.state === 'back') {
            content = this.props.model.get('back');
            if (this.props.model.get('input_format') == 'markdown') {
                content = <div className="userhtml"
                             dangerouslySetInnerHTML={{__html: converter.makeHtml(content)}}></div>;
            }
            stateView = <CardBack
                content={content}
                rate={_(this.props.rate).partial(this.props.model.cid)} />;
        } else { // meta
            stateView = <CardMeta info={this.props.model.get('meta')} />;
        }
        return <div className='card'>
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
        return <div className='cardFront' onClick={this.props.onClick}>
            <Content content={this.props.content} />
        </div>;
    }
});

var CardBack = React.createClass({
    render: function() {
        // <MetaButton onClick={undefined} />
        return <div className='clearfix'>
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
        return <div className='content'>{this.props.content}</div>;
    }
});

var Choices = React.createClass({
    render: function() {
        return <div className='choices'>
            <span className='choices_hard'
                  onClick={_(this.props.rate).partial('hard')}>
                Hard
            </span>
            <span className='choices_easy'
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

module.exports = Review;
