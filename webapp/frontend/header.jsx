/** @jsx React.DOM */
var React = require('react');
var Link = require('react-nested-router').Link;
var gravatar = require('./gravatar.js');

var Header = React.createClass({
    render: function() {
        var homeActive = this.state.home,
            feedActive = this.state.feed,
            aboutActive = this.state.about;

        var login_link;
        if (window.username === null){
            login_link = <a href="/login">Login</a>;
        }else{
            login_link = <span><img src={gravatar(window.username + '@gmail.com')} /><a href="/logout">Logout</a></span>;
        }
        return <div className="navbar navbar-inverse">
            <div className='navbar-inner'>
                <ul className='nav pull-left'>
                    <li className={'header_home' + (homeActive ? ' active' : '')}
                        onMouseEnter={_(this.alertEnter).partial('home')}
                        onMouseLeave={_(this.alertLeave).partial('home')}>
                        <span><i className='icon-home'></i> <Link to="review">Practice</Link></span>
                    </li>
                    <li className={'header_feed' + (feedActive ? ' active' : '')}
                        onMouseEnter={_(this.alertEnter).partial('feed')}
                        onMouseLeave={_(this.alertLeave).partial('feed')}>
                        <span><i className='icon-twitter'></i> <Link to="feed">Feed</Link></span>
                    </li>
                </ul>
                <ul className='nav pull-right'>
                    <li className={'header_about' + (aboutActive ? ' active' : '')}
                        onMouseEnter={_(this.alertEnter).partial('about')}
                        onMouseLeave={_(this.alertLeave).partial('about')}>
                        <span><i className='icon-info'></i> <Link to="about">About</Link></span>
                    </li>
                    <li id="header_login" className={'header_login'}>
                        {login_link}
                    </li>
                </ul>
            </div>
        </div>;
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
