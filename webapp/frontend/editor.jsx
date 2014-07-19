/** @jsx React.DOM */
/*
 * Interface for card editing
 */
var React = require('react');
var BackboneMixin = require('./backbonemixin.js');
var models = require('./models.js');


// props: submitCardData
// stats:  [a dict representing fields which have been changed]
var EditorForm = React.createClass({
    getInitialState: function() {
        return {};
    },
    handleChange: function(field, event) {
        var state = {};
        if (field === 'reversible' || field === 'public') {
            state[field] = event.target.checked;
        } else {
            state[field] = event.target.value;
        }
        this.setState(state);
    },
    handleTagsInputChange: function(elt) {
        // The tagsInput arguments aren't helpful or consistent, so we
        // go straight to the source.
        // TODO(chris): this is called once per tag on initialization,
        // which is silly.
        var tags = this.refs.tagsinput.getDOMNode().value.split(',');
        this.setState({tags: tags});
    },
    handleSubmit: function() {
        this.props.submitCardData(this.state);
    },
    render: function() {
        var tagsCSV = this.props.cardModel.tags.join(",");
        console.log("cardModel=", this.props.cardModel);
        console.log(tagsCSV);
        return <form className="editorForm" onSubmit={this.handleSubmit}>
            <div className="form-group">
                <label htmlFor="editor-input-front">Front</label>
                <textarea id="editor-input-front" className="form-control span6"
                          placeholder="Front of card..."
                          defaultValue={this.props.cardModel.front}
                          onChange={_.partial(this.handleChange, 'front')} />
            </div>
            <div className="form-group">
                <label htmlFor="editor-input-back">Back</label>
                <textarea id="editor-input-back" className="form-control span6"
                          placeholder="Back of card..."
                          defaultValue={this.props.cardModel.back}
                          onChange={_.partial(this.handleChange, 'back')} />
            </div>
            <div className="form-group">
                <label htmlFor="editor-input-tags">Tags</label>
                <input type="text" id="editor-input-tags"
                               className="tagsinput form-control"
                               defaultValue={tagsCSV}
                               ref="tagsinput" />
            </div>
            <div className="form-group">
                <label htmlFor="editor-input-source">Source URL</label>
                <input type="text" id="editor-input-source" className="form-control"
                       defaultValue={this.props.cardModel.source_url}
                       onChange={_.partial(this.handleChange, 'source_url')} />
            </div>
            <div className="checkbox">
                <label><input type="checkbox"
                              defaultChecked={this.props.cardModel.reversible}
                              onChange={_.partial(this.handleChange, 'reversible')}/> Reversible</label>
            </div>
            <div className="checkbox">
                <label><input type="checkbox"
                              defaultChecked={this.props.cardModel.public}
                              onChange={_.partial(this.handleChange, 'public')}/> Public</label>
            </div>
            <input type="submit" className="btn btn-primary" value="Save" />
        </form>;
    },
    componentDidMount: function() {
        $(this.refs.tagsinput.getDOMNode()).tagsInput({
            onChange: this.handleTagsInputChange
        });
    }
});


// props: params.cardKey
// state: cardModel
var Editor = React.createClass({
    render: function() {
        if (this.state.cardModel) {
            return <div className="editor">
                <EditorForm cardModel={this.state.cardModel} submitCardData={this.submitCardData} />
            </div>;

        }

        // If we don't have the data yet, display a temp message.
        return <div className="editor">
            Please wait while your card data is fetched for editing. <br/>
            {this.props.params.cardKey}
        </div>;
    },
    getInitialState: function() {
        return {cardModel: null};
    },
    componentDidMount: function(elem) {
        if (!this.state.cardModel) {
            this.fetchCardData();
        }
    },
    fetchCardData: function() {
        var self = this;
        $.get('/api/card/' + this.props.params.cardKey, function(cardData) {
            cardData = JSON.parse(cardData);
            self.setState({cardModel: cardData});
        });
    },
    submitCardData: function(data) {
        var self = this;
        console.log("submitting");
        console.log(data);
        $.ajax({
            url: '/api/card/' + this.props.params.cardKey,
            contentType: "application/json",
            type: 'PUT',
            data: JSON.stringify(data),
            success: function(response) {
                console.log("PUT was successful: " + response);
            },
            error: function(xhr, status, err) {
                console.error(self.props.url, status, err.toString());
            }
        });
    }
});

module.exports = Editor;
