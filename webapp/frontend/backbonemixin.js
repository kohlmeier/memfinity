var _validateModelArray = function(backboneModels) {
    if (!_.isArray(backboneModels)) {
        throw new Error('getBackboneModels must return an array, ' +
            'get this ' + backboneModels + ' out of here.');
    }
}

/**
 * BackboneMixin - automatic binding and unbinding for react classes mirroring
 * backbone models and views. Example:
 *
 *     var Model = Backbone.Model.extend({ ... });
 *     var Collection = Backbone.Collection.extend({ ... });
 *
 *     var Example = React.createClass({
 *         mixins: [BackboneMixin],
 *         getBackboneModels: function() {
 *             return [this.model, this.collection];
 *         }
 *     });
 *
 * List the models and collections that your class uses and it'll be
 * automatically `forceUpdate`-ed when they change.
 *
 * This binds *and* unbinds the events.
 */
var BackboneMixin = {
    // Passing this.forceUpdate directly to backbone.on will cause it to call
    // forceUpdate with the changed model, which we don't want
    _backboneForceUpdate: function() {
        this.forceUpdate();
    },
    componentDidMount: function() {
        // Whenever there may be a change in the Backbone data, trigger a
        // reconcile.
        var backboneModels = this.getBackboneModels();
        _validateModelArray(backboneModels);
        backboneModels.map(function(backbone) {
            // The add, remove, and reset events are never fired for
            // models, as far as I know.
            backbone.on('add change remove reset', this._backboneForceUpdate,
                this);
        }.bind(this));
    },
    componentWillUnmount: function() {
        var backboneModels = this.getBackboneModels();
        _validateModelArray(backboneModels);
        // Ensure that we clean up any dangling references when the
        // component is destroyed.
        backboneModels.map(function(backbone) {
            // Remove all callbacks for all events with `this` as a context
            backbone.off('add change remove reset', this._backboneForceUpdate,
                this);
        }.bind(this));
    }
};

module.exports = BackboneMixin;
