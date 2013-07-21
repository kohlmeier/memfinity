/** @jsx React.DOM */
/*
 * Interface for review mode
 */
var BackboneMixin = require('./backbonemixin.js');
var models = require('./models.js');

var CardModel = models.CardModel,
    CardCollection = models.CardCollection;

var Review = React.createClass({
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

        return <div>
            <ReviewedStack collection={hardStack}
                           position={{x: 200, y: 50}}
                           scale={0.6} />
            <ReviewedStack collection={easyStack}
                           position={{x: 600, y: 50}}
                           scale={0.6} />

            <ReviewingStack collection={this.props.reviewingStack}
                            rate={rate}
                            position={{x: 400, y: 400}}
                            scale={1} />
        </div>;
    }
});

// props: collection, position ({x, y})?, scale, rate
var ReviewingStack = React.createClass({
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
            return <div class='stack' style={style}>
                empty stack!
            </div>;
        } else {
            var topCard = <Card model={topCardModel}
                                rate={this.props.rate}
                                key={topCardModel.cid} />;
            return <div class='stack' style={style}>
                {topCard}
            </div>;
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
var ReviewedStack = React.createClass({
    mixins: [BackboneMixin],
    render: function() {
        var style = {
            left: this.props.position.x,
            top: this.props.position.y,
            '-webkit-transform': 'scale(' + this.props.scale + ')'
        };
        return <div class='stack' style={style}>
            {this.props.collection.models.length}
        </div>;
    },
    getBackboneModels: function() {
        return [this.props.collection];
    }
});

// props: nextCard, front, back, (tags or meta)
// TODO this should probably take state as as prop
var Card = React.createClass({
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
            stateView = <CardFront
                content={this.props.model.get('front')}
                onClick={clickHandler} />
        } else if (this.state.state === 'back') {
            stateView = <CardBack
                content={this.props.model.get('back')}
                rate={_(this.props.rate).partial(this.props.model.cid)} />;
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

module.exports = Review;
