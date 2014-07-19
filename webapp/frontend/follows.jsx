/** @jsx React.DOM */
/*
 * Interface for feed mode
 */
var React = require('react');
var Link = require('react-nested-router').Link;
var gravatar = require('./gravatar.js');

// props: model
var UserCard = React.createClass({
    render: function() {
        var cardActionButtons;
        if (window.username === null) {
            cardActionButtons = null;
        } else if (window.username !== this.props.user.user_email) {
            cardActionButtons = 
                <div className='btn btn-primary btn-small' onClick={this.takeCard}>
                    <i className='icon-download'></i> Take
                </div>;
        };
        var front = this.props.user.user_email,
            back = this.props.user.user_nickname;
        return <div className='feedcard row-fluid'>
            <UserCardMeta user={this.props.user} />
            <div className='feedcard_right span10'>
                <div className='feedcard_front'>{front}</div>
                <div className='feedcard_back'>{back}</div>
                <div className="feedcard_meta row-fluid">
                    <div className='span3 btn-container'>
                        {cardActionButtons}
                    </div>
                </div>
            </div>
        </div>;
    }
});

var UserCardMeta = React.createClass({
    render: function() {
        // TODO get this info from google
        // http://stackoverflow.com/q/3591278/2121468
        var userImage = gravatar(this.props.user.user_email, 60),
            photoStyle = {background: 'url(' + userImage + ') no-repeat'};
        return <div className='feedcard_userinfo span2'>
            <div className='feedcard_photo' style={photoStyle} />
            <div className='feedcard_desc'>
                <div className='feedcard_username'>
                    {this.props.user.user_nickname}
                </div>
            </div>
        </div>;
    }
});

// props: userKey, followersOrFollowing
var Follows = React.createClass({
    render: function() {
        var feedItems = _(this.state.users).map(function(user) {
            return <li className="l-feedcard-container" key={user.user_email}>
                <UserCard user={user} key={user.user_email} />
            </li>;
        });
        return <div className='feed clearfix'>
            <ol className='feedbody'>
                {feedItems}
            </ol>

        </div>;
    },
    getInitialState: function() {
        // TODO set some state for a spinner?
        return { users: null };
    },
    componentDidMount: function() {
        if (!this.state.users) {
            // force an API call to retrieve cards
            this.fetchData('');
        }
    },
    cardsFromJSON: function(cardsJSON) {
        var cardData = JSON.parse(cardsJSON);
        var cardModels = _(cardData).map(function(card) {
            return new models.CardModel(card);
        });
        return new models.CardCollection(cardModels);
    },
    fetchData: function(queryString) {
        //var self = this;
        //$.get('/api/cards' + queryString, function(newCardsJSON) {
        //    console.log("fetchData got some card data");
        //    console.log(newCardsJSON);
        //    self.setState({cardCollection: self.cardsFromJSON(newCardsJSON)});
        //});
        this.setState({users: [{"user_email": "test@example.com", "user_nickname": "theBOSS"}]});
    }
});

module.exports = Follows;
