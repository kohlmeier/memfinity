/** @jsx React.DOM */
var gravatar = require('./gravatar.js');

var Header = React.createClass({
    render: function() {
        var homeActive = this.state.home,
            feedActive = this.state.feed,
            aboutActive = this.state.about;

        var login_link;
        if (window.username === "None"){
            login_link = <a href="/login">Login</a>;
        }else{
            login_link = <span><img src={gravatar(window.username + '@gmail.com')} /><a href="/logout">Logout</a></span>;
        }
        return <div class='navbar navbar-inverse'>
            <div class='navbar-inner'>
                <ul class='nav pull-left'>
                    <li class={'header_home' + (homeActive ? ' active' : '')}
                        onClick={_(this.props.onNavigate).partial('home')}
                        onMouseEnter={_(this.alertEnter).partial('home')}
                        onMouseLeave={_(this.alertLeave).partial('home')}>
                        <i class='icon-home'></i> Practice
                    </li>
                    <li class={'header_feed' + (feedActive ? ' active' : '')}
                        onClick={_(this.props.onNavigate).partial('feed')}
                        onMouseEnter={_(this.alertEnter).partial('feed')}
                        onMouseLeave={_(this.alertLeave).partial('feed')}>
                        <i class='icon-twitter'></i> Feed
                    </li>
                    <li id="header_login" class={'header_login'}>
                        {login_link}
                    </li>
                </ul>
                <ul class='nav pull-right'>
                    <li class={'header_about' + (aboutActive ? ' active' : '')}
                        onClick={_(this.props.onNavigate).partial('about')}
                        onMouseEnter={_(this.alertEnter).partial('about')}
                        onMouseLeave={_(this.alertLeave).partial('about')}>
                        <i class='icon-info'></i> About
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
