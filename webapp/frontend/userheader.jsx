/** @jsx React.DOM */
/*
 * Interface for feed mode
 */
var React = require('react');
var Link = require('react-nested-router').Link;
var gravatar = require('./gravatar.js');

var UserHeader = React.createClass({
    getInitialState: function() {
        return {following: window.following};
    },
    render: function() {
        var userData = this.props.userData;
        var sameUser = (window.user_key && userData.key == window.user_key);
        //console.log("sameUser: ", sameUser, window.user_key, userData.key);
        var isFollowing = !sameUser && _.contains(this.state.following, userData.key);
        var followItem = '';
        var unfollowItem = '';
        if (!sameUser) {
            followItem = !isFollowing && <li className="follow-item">
                <button className="btn btn-small btn-primary"
                        onClick={this.onFollow}>Follow</button></li>;
            unfollowItem = isFollowing && <li>
                <button className="btn btn-small btn-danger"
                        onClick={this.onUnfollow}>Unfollow</button></li>;
        }
        // Update our idea of followers in case the current user has
        // followed / unfollowed.
        var followers = (isFollowing ? _.union : _.difference)(
            userData.followers, [window.user_key]);

        return <div className="user-header row-fluid">
            <div className="user-header-inner">
                <ul className="primary">
                    <li><img className="userimg" src={gravatar(userData.email)} /></li>
                    <li className="username">{userData.nickname}</li>
                    {followItem}
                    {unfollowItem}
                </ul>
                <ul className="secondary">
                    <li style={followers.length ? {} : {display: "none"}}><Link to="followers" userKey={userData.key}>{followers.length} Followers.</Link></li>
                    <li style={userData.following.length ? {} : {display: "none"}}><Link to="following" userKey={userData.key}>Following {userData.following.length}.</Link></li>
                </ul>
                </div>
            </div>;
    },
    fireAJAX: function(followOrUnfollow) {
        var self = this;
        var userDataKey = this.props.userData.key;
        $.ajax({
            url: '/api/user/' + userDataKey + '/' + followOrUnfollow,
            type: 'PUT',
            success: function(response) {
                console.log("PUT was successful: " + response);
                var fn = followOrUnfollow == "follow" ? _.union : _.difference;
                self.setState({following: fn(window.following, [userDataKey])});
            },
            error: function(xhr, status, err) {
                console.log("PUT failed: ", status, err.toString());
            }
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
