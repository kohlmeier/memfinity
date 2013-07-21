/** @jsx React.DOM */
var Header = React.createClass({
    render: function() {
        return <div class='header clearfix'>
            <span class='header_home'>Home <i class='icon-home'></i></span>
            <span class='header_page'><i class='icon-twitter'></i>{this.props.page}</span>
        </div>;
    }
});

module.exports = Header;
