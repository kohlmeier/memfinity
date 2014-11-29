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
            loginLink = <a href="/logout"><img src={gravatar(window.user_email)} /> Logout</a>;
        }
        return <div className="navbar navbar-inverse">
            <div className=' navbar-inner'>
                <ul className='nav navbar-nav'>
                    <li><Link to="create"><i className='icon-edit'></i> Create</Link></li>
                    <li><Link to="review"><i className='icon-check'></i> Practice</Link></li>
                    <li><Link to="feed"><i className='icon-list'></i> Feed</Link></li>
                    <li><Link to="search"><i className='icon-search'></i> Search</Link></li>
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
