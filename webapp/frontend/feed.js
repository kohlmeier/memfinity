/*
 * Interface for feed mode
 */
import React from 'react';
import { Link } from 'react-router';
import Markdown from 'react-remarkable';

import * as API from './api';
import Container from './markdown-container';
import { CardModel } from './models';
import gravatar from './gravatar';
import UserHeader from './userheader';

// props: model
export const FeedCard = React.createClass({
    render: function() {
        var cardActionButtons;
        if (window.user_key === null || window.user_key === 'None') {
            cardActionButtons = null;
        } else if (window.user_key !== this.props.model.get('user_key')) {
            cardActionButtons =
                <div className='btn btn-info btn-small' onClick={this.takeCard}>
                    <i className='icon-download'></i> Take
                </div>;
        } else {
            cardActionButtons =
                <div>
                    <div className='btn btn-primary btn-small' onClick={this.deleteCard}>
                        <i className='icon-trash'></i> Delete
                    </div>
                    <Link to='/edit' className='btn btn-primary btn-small'
                          cardKey={this.props.model.get('key')}>
                        <i className='icon-edit'></i> Edit
                    </Link>
                </div>;
        };

        return (
          <div className='feedcard row-fluid'>
            <FeedCardMeta model={this.props.model} />
            <div className='feedcard_right span10'>
              <div className='feedcard_front'>
                <Markdown
                  container={Container}
                  content={this.props.model.get('front')}
                />
              </div>
              <div className='feedcard_back'>
                <Markdown
                  container={Container}
                  content={this.props.model.get('back')}
                />
              </div>
              <div className="feedcard_meta row-fluid">
                <Tags list={this.props.model.get('tags')} />
                <div className='span3 btn-container'>
                  {cardActionButtons}
                </div>
              </div>
            </div>
          </div>
        );
    },
    deleteCard: function() {
      // fire off an async DELETE to the server
      API.deleteCard(this.props.model);
      // optimistically, we remove it from the UI
      this.props.onDeleteCard(this.props.model);
    },
    takeCard: function() {
      API.takeCard(this.props.model);
    }
});

export const FeedCardMeta = React.createClass({
    render: function() {
        // TODO get this info from google
        // http://stackoverflow.com/q/3591278/2121468
        var userImage = gravatar(this.props.model.get('user_email'), 60),
            photoStyle = {background: 'url(' + userImage + ') no-repeat'};
        return <div className='feedcard_userinfo span2'>
            <Link to="/user" userKey={this.props.model.get('user_key')}>
                <div className='feedcard_photo' style={photoStyle} />
                <div className='feedcard_desc'>
                    <div className='feedcard_username'>
                        {this.props.model.get('user_nickname')}
                    </div>
                </div>
            </Link>
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

// props: collection, onDeleteCard
var FeedBody = React.createClass({
    render: function() {
        var onDeleteCard = this.props.onDeleteCard;
        var collection = this.props.collection;
        var feedItems = _(collection.models).map(function(model) {
            return <li className="l-feedcard-container" key={model.cid}>
                <FeedCard model={model} key={model.cid} collection={collection}
                    onDeleteCard={onDeleteCard} />
            </li>;
        });
        return <ol className='feedbody'>
            {feedItems}
        </ol>;
    },
});

var PracticeButton = React.createClass({
    render: function() {
        return <div className='practicebutton btn btn-primary'
                    onClick={this.props.onClick}>
            Practice {this.props.count} cards
        </div>;
    }
});

// props: onFilterChange
var FilterBar = React.createClass({
    handleSubmit: function(event) {
        event.preventDefault();
        var query = this.refs.query.value.trim();
        this.props.onFilterChange(query);
    },
    render: function() {
        return <div className="row-fluid">
        <form className='filterbar row-fluid' onSubmit={this.handleSubmit}>
            <div className='span9'>
                <input type='text'
                       placeholder='What are you looking for?  (@username, #tag, or text)'
                       className='filterbar-query'
                       ref='query'
                       name='q' />
            </div>
            <div className='span3'>
                <input type='submit'
                       className='btn btn-primary filterbar-submit'
                       value='Search' />
            </div>
        </form>
            <div className='span12 takeallbutton'>
                <button className="btn btn-small btn-info" onClick={this.props.onTakeAll}><i className="icon-download"></i> Take &rsquo;em all</button>
            </div>
        </div>;
    }
});

// props: collection, query, showSearchBar, params.refresh(optional)
var SearchFeed = React.createClass({
    render: function() {
        var filterbar = '';
        if (!this.props.hasOwnProperty('showSearchBar')
                || this.props.showSearchBar) {
            filterbar = <FilterBar filter={this.props.query}
                                   onFilterChange={this.fetchCardData}
                                   onTakeAll={this.onTakeAll} />;
        }
        return <div className='feed clearfix'>
            {filterbar}
            <FeedBody collection={this.state.cardCollection}
                      onDeleteCard={this.onDeleteCard} />
        </div>;
    },
    getInitialState: function() {
        // TODO set some state for a spinner?
        return {
            cardCollection: [],
            userKey: window.user_key
        };
    },
    componentDidMount: function() {
        this.fetchCardData(this.props.query);
    },
    cardsFromJSON: function(cardsJSON) {
        var cardData = JSON.parse(cardsJSON);
        return _(cardData).map(card => new CardModel(card));
    },
    fetchCardData: function(query) {
      API.queryCards(
        query,
        newCardsJSON => {
          this.setState({cardCollection: self.cardsFromJSON(newCardsJSON)});
        },
        response => {
          console.error(response);
        }
      );
    },
    onDeleteCard: function(cardModel) {
        var cardCollection = _(this.state.cardCollection).filter(card => {
            return card !== cardModel;
        });
        this.setState({ cardCollection });
    },
    onTakeAll: function() {
        console.log("Take ALL", this.state.cardCollection);
        for (const cardModel of this.state.cardCollection) {
            if (cardModel.get('user_key') !== this.state.userKey) {
                API.takeCard(cardModel);
            }
        }
    }
});

export const UserFeed = React.createClass({
    determineUserKey: function() {
        if (this.props.params && this.props.params.userKey) {
            return this.props.params.userKey;
        }
        if (window.user_key !== 'None') {
            return window.user_key;
        }
        return null;
    },
    render: function() {
        if (!this.determineUserKey()) {
            // hack: use a real class name
            return <div className="login-prompt">Log in to view your feed...</div>;
        }

        if (!this.state.userData || !this.state.query) {
            return <div className="feed">Hold on, reticulating splines...</div>;
        }

        return <div>
            <UserHeader userData={this.state.userData} />
            <SearchFeed query={this.state.query} showSearchBar={false} />
        </div>;

    },
    getInitialState: function() {
        return {
            userData: null,
            query: ''
        };
    },
    componentDidMount: function() {
      var userKey = this.determineUserKey();
      if (!this.state.userData && userKey) {
        API.requestUser(
          userKey,
          userData => {
            var query = [userData.key].concat(userData.following).join(' ');
            this.setState({userData: userData, query: query});
          },
          err => {
            console.error(err);
          }
        );
      }
    }
});
