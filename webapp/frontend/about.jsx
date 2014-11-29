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
                            <p id="tagline">Learn with your friends. Remember forever.</p>
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
                <p className="intro"><strong>Remember all the things! We all encounter facts and information that we'd love to remember permanently, and now it's possible. Enter Memfinity, a powerful tool for personalized and social learning.</strong></p>
                <div className="feature">
                    <h2>Create flashcards on-the-fly.</h2>
                    <p>Memfinity lets you create your own flashcards right in your browser. In addition to the website, Memfinity offers a <a href="https://chrome.google.com/webstore/detail/memfinity/midljlfpdindfflgehofjoocfjmgaphg">Chrome browser extension</a> for even faster card creation. See a new vocab word while reading online? Wanna remember that incredible statistic? Stoked about an awesome keyboard shortcut, math concept, or piece of ridculous trivia?  With card creation this simple, it takes just seconds to file information away for permanent recall.</p>
                </div>
                <div className="feature">
                    <h2>Turbocharge your brain.</h2>
                    <p><a href="http://en.wikipedia.org/wiki/Spaced_repetition">Spaced repetition</a> algorithms are a game changer for personal learning. Each time you practice a card, you can rate it as "easy" or "hard". Memfinity will automatically adapt and schedule your next review of that card, maximizing your efficiency and making it possible to ensure all concepts will eventually become part of your permanent knowledge.</p>
                </div>
                <div className="feature">
                    <h2>Follow friends, and see what the world is learning.</h2>
                    <p>Memfinity is social, so you can also follow the public learning activity of people that share your learning interests. See a feed of what others care about learning, and efforlessly create a copy of cards that you want to learn, too.</p>
                </div>
                <div className="feature">
                    <h2>Built for openess.</h2>
                    <h3></h3>
                    <p>Memfinity is built from the ground up as a web-service.  That means the open source community can create new apps for phones, browsers, or any device. Also, with Memfinity your data is never held hostage. We're <a href="https://github.com/kohlmeier/memfinity">open source</a>, and you're always free to host your own personal version of Memfinity. And by learning with Memfinity, you're not only helping yourself learn; you're opening up doors for world-class research on memory and how people learn.</p>
                </div>
                <div className="feature">
                  <p>Still wanna know more? Check out our <a href="/#/faq">FAQ page</a>.</p>
                </div>
            </div>

        </div>
        </div>;
    }
});


module.exports = About;
