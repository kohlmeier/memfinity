/** @jsx React.DOM */
var Header = React.createClass({
    render: function() {
        var homeActive = this.state.home,
            headerActive = this.state.header;
        return <div class='navbar navbar-inverse'>
            <div class='navbar-inner'>
                <ul class='nav'>
                    <li class={'header_home' + (homeActive ? ' active' : '')}
                        onMouseEnter={_(this.alertEnter).partial('home')}
                        onMouseLeave={_(this.alertLeave).partial('home')}>
                        <i class='icon-home'></i>Home
                    </li>
                    <li class={'header_page' + (headerActive ? ' active' : '')}
                        onMouseEnter={_(this.alertEnter).partial('header')}
                        onMouseLeave={_(this.alertLeave).partial('header')}>
                        <i class='icon-twitter'></i>{this.props.page}
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
            header: false
        };
    }
});

module.exports = Header;
