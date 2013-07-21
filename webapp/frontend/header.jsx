/** @jsx React.DOM */
var Header = React.createClass({
    render: function() {
        var homeActive = this.state.home,
            feedActive = this.state.feed,
            aboutActive = this.state.about;
        
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
