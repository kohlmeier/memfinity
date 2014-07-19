/** @jsx React.DOM */

var React = require('react');
var Link = require('react-nested-router').Link;
var gravatar = require('./gravatar.js');

var Header = React.createClass({
    render: function() {
        var loginLink;
        if (window.username === null) {
            loginLink = <a href="/login">Login</a>;
        } else {
            loginLink = <a href="/logout"><img src={gravatar(window.username + '@gmail.com')} /> Logout</a>;
        }
        return <div className="navbar navbar-inverse">
            <div className=' navbar-inner'>
                <ul className='nav navbar-nav'>
                    <li><Link to="review"><i className='icon-home'></i> Practice</Link></li>
                    <li><Link to="feed"><i className='icon-twitter'></i> Feed</Link></li>
                </ul>
                <ul className='nav navbar-nav pull-right'>
                    <li><Link to="about"><i className='icon-info'></i> About</Link></li>
                    <li className="header-login">{loginLink}</li>
                </ul>
            </div>
        </div>;
    }
});

module.exports = Header;
