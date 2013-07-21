/** @jsx React.DOM */
/*
 * Interface for the About page
 */
var BackboneMixin = require('./backbonemixin.js');
var models = require('./models.js');

var About = React.createClass({
    render: function() {
        return <div>
        	<div id="above-fold">
        		<div class="row">
        			<div class="span3 offset4"><img src="/static/iloop.png" /></div>
        			<div class="span6" id="introbox">
        				<div id="textintro">
        					<h1>Memfinity</h1>
        					<p id="acronym">Social spaced repetition system.</p>
        					<p id="tagline">Learn with your friends. Remember, forever.</p>
        				</div>
        				<button class="btn btn-primary btn-large" id="login-big">Log in with Google now.</button>
        			</div>
        		</div>
        	</div>


        </div>;
    }
});


module.exports = About;
