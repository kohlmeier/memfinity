/** @jsx React.DOM */
/*
 * Interface for feed mode
 */
var React = require('react');
var Link = require('react-nested-router').Link;
var gravatar = require('./gravatar.js');

var UserHeader = React.createClass({
    render: function() {
        var userData = this.props.userData;
        var sameUser = (window.user_key && this.props.userData.key == window.user_key);
        //console.log("sameUser: ", sameUser, window.user_key, this.props.userData.key);

        return <div className="feedcard row-fluid">
            <div><img src={gravatar(userData.email)} /></div>
            <div>
                <div>Name: {userData.name}</div>
                <div>UserId: {userData.user_id}</div>
                <div>Following: &nbsp;
                    <Link to="following" userKey={this.props.userData.key}>{userData.following.length}</Link>
                </div>
                <div>Followers: &nbsp;
                    <Link to="followers" userKey={this.props.userData.key}>{userData.followers.length}</Link>
                </div>
                <div visible={!sameUser}>
                    <a disabled={sameUser} href="javascript:void(0);" onClick={this.onFollow}>Follow</a>
                </div>
                <div visible={!sameUser}>
                    <a disabled={sameUser} href="javascript:void(0);" onClick={this.onUnfollow}>Unfollow</a>
                </div>
            </div>
        </div>;
    },
    fireAJAX: function(followOrUnfollow) {
        $.ajax({
            url: '/api/user/' + this.props.userData.key + '/' + followOrUnfollow,
            type: 'PUT',
            success: function(response) { console.log("PUT was successful: " + response); },
            error: function(xhr, status, err) { console.log("PUT failed: ", status, err.toString()); }
        });
    },
    onFollow: function() {
        this.fireAJAX('follow');
    },
    onUnfollow: function() {
        this.fireAJAX('unfollow');
    }
});

module.exports = UserHeader;
