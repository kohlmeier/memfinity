/*
 * Interface for card editing
 */
import React from 'react';
import Router from 'react-router';
import { WithContext as ReactTags } from 'react-tag-input';

import * as API from './api';
import { CardModel } from './models';

// props: submitCardData
// stats:  [a dict representing fields which have been changed]
class EditorForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEnabled: true,
      tags: [],
    };
  }

  handleChange(field, event) {
    var state = {};
    if (field === 'reversible' || field === 'private') {
      state[field] = event.target.checked;
    } else {
      state[field] = event.target.value;
    }
    this.setState(state);
  }

  handleDeleteTag(i) {
    const tags = this.state.tags.slice();
    tags.splice(i, 1);
    this.setState({ tags });
  }

  handleAddTag(tag) {
    const tags = this.state.tags.slice();

    tags.push({
      id: tags.length + 1,
      text: tag
    });
    this.setState({ tags });
  }

  handleDragTag(tag, currPos, newPos) {
    const tags = this.state.tags.slice();

    // mutate array
    tags.splice(currPos, 1);
    tags.splice(newPos, 0, tag);

    // re-render
    this.setState({ tags });
  }

  handleSubmit() {
    this.setState({isEnabled: false});
    this.props.submitCardData(this.state);
  }

  render() {
    // TODO(joel) - hook this up
    // var tagsArray = this.props.cardModel.tags;
    const tagsArray = this.state.tags;
    return (
      <form className="editorForm" onSubmit={this.handleSubmit}>
        <div className="form-group">
          <label htmlFor="editor-input-front">Front</label>
          <textarea
            id="editor-input-front"
            className="form-control span6"
            placeholder="Front of card..."
            defaultValue={this.props.cardModel.front}
            onChange={event => this.handleChange('front', event)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="editor-input-back">Back</label>
          <textarea
            id="editor-input-back"
            className="form-control span6"
            placeholder="Back of card..."
            defaultValue={this.props.cardModel.back}
            onChange={event => this.handleChange('back', event)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="editor-input-tags">Tags</label>
          <ReactTags
            tags={tagsArray}
            handleDelete={this.handleDeleteTag}
            handleAddition={this.handleAddTag}
            handleDrag={this.handleDragTag}
          />
        </div>
        <div className="form-group">
          <label htmlFor="editor-input-source">Source URL</label>
          <input
            type="text"
            id="editor-input-source"
            className="form-control"
            defaultValue={this.props.cardModel.source_url}
            onChange={event => this.handleChange('source_url', event)}
          />
        </div>
        <div className="checkbox">
          <label>
            <input
              type="checkbox"
              defaultChecked={this.props.cardModel.reversible}
              onChange={event => this.handleChange('reversible', event)}
            />
            Reversible
          </label>
        </div>
        <div className="checkbox">
           <label>
             <input
               type="checkbox"
               defaultChecked={this.props.cardModel.private}
               onChange={event => this.handleChange('private', event)}
             />
             Private
           </label>
        </div>
        <input
          type="submit"
          disabled={!this.props.isEnabled}
          className="btn btn-primary"
          value="Save"
        />
      </form>
    );
  }
}


// props: params.cardKey
// state: cardModel
export default class Editor extends React.Component {
  constructor(props) {
    super(props);
    const isCreateMode = !props.params.cardKey;
    this.state = {
      isCreateMode,
      cardModel: isCreateMode ? new CardModel() : null,
      pendingSubmit: false
    };
  }

  render() {
    if (window.user_key === 'None') {
      return <div className="editor">
        Please log in to create your own cards.  :)
      </div>;
    }

    if (!this.state.cardModel) {
      // If we don't have the data yet, display a temp message.
      return <div className="editor">
        Please wait while your card data is fetched for editing. <br/>
        {this.props.params.cardKey}
      </div>;
    }

    return (
      <div className="editor">
        <EditorForm
          isEnabled={!this.state.pendingSubmit}
          cardModel={this.state.cardModel}
          submitCardData={this.submitCardData}
        />
      </div>
    );
  }

  componentDidMount(elem) {
    if (!this.state.cardModel) {
      this.fetchCardData();
    }
  }

  fetchCardData() {
    API.getCard(this.props.params.cardKey, cardModel => {
      this.setState({ cardModel });
    });
  }

  submitCardData(data) {
    var self = this;
    console.log("submitting");
    console.log(data);
    this.setState({pendingSubmit: true});
    if (this.state.isCreateMode) {
      API.createCard(
        response => {
          console.log("creation POST was successful: " + response);
          this.setState({pendingSubmit: false});
          // if you successfully created a new card, we just route
          // you back to your feed.
          setTimeout(() => {
            // setTimeout necessary due to eventual consistency.
            // TODO(jace) eliminate this setTimeout!  We should
            // pass the newly created card's key (which we have
            // in response) via a param in transitionTo to
            // the Feed component, which can explicity query
            // the API by key (which is consistent) and merge
            // that card in if it's not already present.
            Router.transitionTo('feed');
          }, 1000);
        },
        err => {
          console.error(this.props.url, err.status, err.response);
          this.setState({pendingSubmit: false});
        }
      );
    } else {
      API.updateCard(
        this.props.params.cardKey,
        response => {
          console.log("PUT was successful: " + response);
          this.setState({pendingSubmit: false});
        },
        err => {
          console.error(this.props.url, err.status, err.response);
          this.setState({pendingSubmit: false});
        }
      );
    }
  }
}
