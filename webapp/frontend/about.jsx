/** @jsx React.DOM */
/*
 * Interface for the About page
 */
var BackboneMixin = require('./backbonemixin.js');
var models = require('./models.js');

var About = React.createClass({
    render: function() {
        return <div>
            This is the About page!
        </div>;
    }
});


module.exports = About;
