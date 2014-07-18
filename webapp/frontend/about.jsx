/** @jsx React.DOM */
/*
 * Interface for the About page
 */
var React = require('react');
var BackboneMixin = require('./backbonemixin.js');
var models = require('./models.js');

var About = React.createClass({
    render: function() {
        return <div>
        <div id="above-fold">
                <div className="row">
                    <div className="span3 offset4"><img src="/static/iloop.png" /></div>
                    <div className="span6" id="introbox">
                        <div id="textintro">
                            <h1>Memfinity</h1>
                            <p id="acronym">A social spaced-repetition system.</p>
                            <p id="tagline">Learn with your friends. Remember, forever.</p>
                        </div>
                        <button
                            className="btn btn-primary btn-large"
                            id="login-big"
                            onClick={function(){window.location = '/login'}}>
                            Log in with Google now.
                        </button>
                    </div>
                </div>
            </div>
        <div className="wrap">
            <div id="features" className="features container">
                <p className="intro"><strong>Remember all the things!</strong> We want to do it, too, and now it's possible. <strong>Enter Memfinity, a powerful tool for personal and social learning.</strong></p>
                <div className="feature">
                    <h2>Turbocharge your brain.</h2>
                    <h3>Spaced repetition is a game changer for personal learning.</h3>
                    <p>Using spaced repetition algorithms makes sure you can review the things you need to review, at just the right time to maximize your efficiency.</p>
                </div>
                <div className="feature">
                    <h2>Create cards on-the-fly.</h2>
                    <h3>Use our killer Chrome extension to effortlessly create cards.</h3>
                    <p>See an interesting vocab work while reading online? Clip it. Want to remember the main point or an article you just read?  Clip it. Just learned an awesome keyboard shortcut, math concept, or piece of ridculous trivia?  Clip it!  With card creation this simple, it takes just seconds file knowledge away for permanent recall.</p>
                </div>
                <div className="feature">
                    <h2>Learn out loud.</h2>
                    <h3>Follow friends, and see what the world is learning.</h3>
                    <p>Now that you can easily create your own cards and master them, how can you find even more fascinating and useful knowledge?  By following the feeds of people that share your learning interests.  See a realtime feed of what others are learning, and seamlessly grab cards you want to learn, too.</p>
                </div>
                <div className="feature">
                    <h2>Built for openess.</h2>
                    <h3></h3>
                    <p>Memfinity is built from the ground up as a web-service.  That means the open source communicty can create new apps for phones, browsers, and or any device. Also, with Memfinity your data is never held hostage. We're open source, and you're always free to host your own personal version of Memfinity.  And by learning with Memfinity, you're not only helping yourself learn;  you're also facilitating world-class research on memory.  </p>
                </div>
            </div>
        </div>
        </div>;
    }
});


module.exports = About;
