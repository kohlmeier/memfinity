/*
 * Interface for feed mode
 */
import React from 'react';
import { Link } from 'react-router';

import * as API from './api';
import gravatar from './gravatar';
import UserHeader from './userheader';

// props: model
function UserCard({ user }) {
  var cardActionButtons;
  if (window.username === null) {
    cardActionButtons = null;
  } else if (window.username !== user.email) {
    cardActionButtons = null;
    // TODO.. should implement a *follow* button here...
    //<div className='btn btn-primary btn-small' onClick={this.takeCard}>
    //   <i className='icon-download'></i> Take
    //</div>;
  };

  return (
    <div className='feedcard row-fluid'>
      <UserCardMeta user={user} />
      <div className='feedcard_right span10'>
        <div className='feedcard_front'>{user.nickname}</div>
        <div className='feedcard_back'>{user.name}</div>
        <div className="feedcard_meta row-fluid">
          <div className='span3 btn-container'>
            {cardActionButtons}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserCardMeta({ user }) {
  // TODO get this info from google
  // http://stackoverflow.com/q/3591278/2121468
  // TODO DRY this up with-- duplicates FeedCardMeta in feed.jsx
  const userImage = gravatar(user.email, 60);
  const photoStyle = {background: 'url(' + userImage + ') no-repeat'};
  return (
    <div className='feedcard_userinfo span2'>
      <Link to="/user" userKey={user.key}>
        <div className='feedcard_photo' style={photoStyle} />
        <div className='feedcard_desc'>
          <div className='feedcard_username'>
            {user.nickname}
          </div>
        </div>
      </Link>
    </div>
  );
}

// props: userKey, followersOrFollowing
var Follows = React.createClass({
    render: function() {
        if (!this.state.followsData) {
            return <div>Count to ten, your data will be arriving shortly.</div>;
        }

        var userDicts;
        if (this.props.followersOrFollowing === 'following') {
            userDicts = this.state.followsData.following;
        } else {
            userDicts = this.state.followsData.followers;
        }

        const userItems = userDicts.map(user => (
          <li className="l-feedcard-container" key={user.email}>
            <UserCard user={user} key={user.email} />
          </li>
        ));

        return <div>
            <UserHeader userData={this.state.followsData.user_data} />
            <div className='feed clearfix'>
                <ol className='feedbody'>
                    {userItems}
                </ol>
            </div>
        </div>;
    },
    getInitialState: function() {
        // TODO set some state for a spinner?
        return { followsData: null };
    },
    componentDidMount: function() {
        if (!this.state.followsData) {
            // force an API call to retrieve cards
            this.fetchData();
        }
    },
    fetchData: function() {
      API.getFollows(
        this.props.userKey,
        followsData => {
          self.setState({ followsData });
        },
        err => {
          console.error(err);
        }
      );
    }
});

export function Following({ params }) {
  return <Follows userKey={params.userKey} followersOrFollowing="following" />;
}

export function Followers({ params }) {
  return <Follows userKey={params.userKey} followersOrFollowing="followers" />;
}
