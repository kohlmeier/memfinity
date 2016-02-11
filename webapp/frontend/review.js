/*
 * Interface for review mode
 */
import React from 'react';
import Markdown from 'react-remarkable';
import { Link } from 'react-router';

import * as API from './api';
import Card from './card';
import { CardModel } from './models';

export default class Review extends React.Component {
  constructor (props) {
    super(props)

    // TODO(joel): make this not depend on props
    const reviewAll = (
      (props.params && props.params.reviewAll==='true') ||
      (props.query && props.query.reviewAll==='true')
    );

    this.state = {
        reviewingStack: null,
        reviewAll,
        hardStack: [],
        easyStack: [],
    };
  }

  render() {
    const { easyStack, hardStack, reviewingStack } = this.state;

    if (window.user_key === 'None') {
        return <div className="editor">
            Please log in to practice your personal cards.  :)
        </div>;
    }

    if (!reviewingStack) {
        // If we don't have the data yet, display a temp message.
        return <div>Sit tight, partner.  We&lsquo;re loading your data now!</div>;
    }

    return (
      <div className="review_workspace">
        <ReviewedStack collection={hardStack} name='Hard' />
        <ReviewedStack collection={easyStack} name='Easy' />

        <ReviewingStack
          onKeepPracticing={this.onKeepPracticing}
          collection={reviewingStack}
          rate={this.handleRate}
        />
      </div>
    );
  }

  handleRate(rating) {
    let { easyStack, hardStack, reviewingStack } = this.state;
    const model = reviewingStack[0];
    API.rate(model, rating);
    reviewingStack = reviewingStack.slice();
    reviewingStack.splice(0, 1);
    if (rating === 'easy') {
      easyStack = easyStack.concat([model]);
    } else { // hard
      hardStack = hardStack.concat([model]);
    }
    this.setState({
      reviewingStack,
      easyStack,
      hardStack,
    });
  }

  componentDidMount() {
    if (this.state.reviewingStack === null) {
      // force an API call to retrieve cards
      this.fetchCardData(this.state.reviewAll);
    }
  }

  onKeepPracticing() {
    this.setState({reviewAll: true, reviewingStack: null});
    this.fetchCardData(true);
  }

  fetchCardData(reviewAll) {
    API.getReviewCards(
      reviewAll,
      reviewCards => {
        const reviewingStack = reviewCards.map(card => new CardModel(card));
        self.setState({ reviewingStack });
      },
      err => {
        console.error(err);
      }
    );
  }
}

function stackSides<A>(
  primary: A,
  secondary: A,
  size: number,
  times: number
): A {
  times = 1;
  var ret = [];

  // XXX(joel) times is always 1?
  {
    n += 1; // 1-indexed
    var color = n % 2 === 0 ? primary : secondary,
      sz = (size * n) + 'px ';
    ret.push(sz + sz + color);
  }
  ret = ret.join(', ');
  return ret;
};

// props: collection, position ({x, y})?, rate
function ReviewingStack({ collection, onKeepPracticing, rate }) {
  const topCardModel = collection[0];
  const sideLayers = Math.max(1, collection.length);
  const stackstyle = {
    'boxShadow': stackSides('#2C3E50', '#BDC3C7', 2, sideLayers)
  };

  let stack;
  if (!topCardModel) { // empty stack
    // TODO
    stack = (
      <div
        className='reviewingstack emptyreviewingstack'
        style={stackstyle}
      >
        <h2>Congratulations!</h2>

        <p>you have no cards needing practice right now.</p>
        <p>
          <Link to="/create">Create new cards</Link> or
          <a href="javascript:void(0);" onClick={onKeepPracticing}>
            continue practicing
          </a>
        </p>
      </div>
    );
  } else {
    stack = (
      <div className='reviewingstack' style={stackstyle}>
        <Card
          model={topCardModel}
          rate={rate}
          key={topCardModel.cid}
        />
      </div>
    );
  }

  return (
    <div className='reviewingstackall'>
      <ReviewingStackMeta
        count={collection.length}
        name='Remaining'
      />
      {stack}
    </div>
  );
}

function ReviewingStackMeta({ name, count }) {
  const word = count === 1 ? 'card' : 'cards';
  const phrase = count + ' ' + word;

  return (
    <div className='reviewingstackmeta'>
      <h3>{name}</h3>
      <h4>{phrase}</h4>
    </div>
  );
}

// props: collection, name
var ReviewedStack = React.createClass({
    render: function() {
      const { collection, name } = this.props;
      var sideLayers = collection.length;
      var stackstyle = {
          'boxShadow': stackSides('#2C3E50', '#BDC3C7', 2, sideLayers)
      };

      var topCardModel = collection[collection.length - 1];
      var topCard = null;
      if (topCardModel) {
          // TODO way to view this card
          topCard = <Card model={topCardModel}
                          key={topCardModel.cid} />;
      }
      return <div className={'reviewedstackall reviewedstackall-' + name.toLowerCase()}>
          <ReviewedStackMeta count={collection.length}
                             name={name} />
          <div className='reviewedstack' style={stackstyle}>
              <div className='topcardcover' />
              {topCard}
          </div>
      </div>;
    },
});

function ReviewedStackMeta({ count, name }) {
  const word = count === 1 ? 'card' : 'cards';
  const phrase = count + ' ' + word;
  return (
    <div className='reviewedstackmeta'>
      <h4>{name}</h4>
      {phrase}
    </div>
  );
}
