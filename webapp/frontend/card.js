import React from 'react';

import Container from './markdown-container';

// props: nextCard, front, back, (tags or meta)
// TODO this should probably take state as as prop
export default class Card extends React.Component {
  constructor(props) {
    super(props);
    this.state = { state: 'front' };
  }

  render() {
    const { state } = this.state;
    const { model, rate } = this.props;

    let stateView;
    if (state === 'front') {
      const content = (
        <Markdown
          container={Container}
          source={model.get('front')}
        />
      );
      stateView = (
        <CardFront
          content={content}
          onClick={() => this.setState({ state: 'back' })}
        />
      );
    } else if (state === 'back') {
      const content = (
        <Markdown
          container={Container}
          source={model.get('back')}
        />
      );
      stateView = (
        <CardBack
          content={content}
          rate={rate}
        />
      );
    } else { // meta
      stateView = <CardMeta info={model.get('meta')} />;
    }
    return (
      <div className='card'>
          {stateView}
      </div>
    );
  }
}

function CardFront({ content, onClick }) {
  return (
    <div className='cardFront' onClick={onClick}>
      <Content content={content} />
      <div className='flip_prompt'>(click to reveal and rate)</div>
    </div>
  );
}

function CardBack({ content, rate }) {
  // <MetaButton onClick={undefined} />
  return (
    <div className='clearfix'>
      <Content content={content} />
      <Choices rate={rate} />
    </div>
  );
}

function CardMeta() {
  return <span />;
}

function Content({ content }) {
  return <div className='content'>{content}</div>;
}

function Choices({ rate }) {
  return (
    <div className='choices'>
      <span className='choices_hard'
            onClick={() => rate('hard')}>
          Hard
      </span>
      <span className='choices_easy'
            onClick={() => rate('easy')}>
          Easy
      </span>
    </div>
  );
}

function MetaButton() {
  return <div />;
}
