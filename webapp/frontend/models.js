/*
 * Cards store the following data:
 * - front: markup appearing on the front of the card
 * - back: markup appearing on the back of the card
 * - tags: list of tag names
 * - ... meta ...
 */
var CardModel = Backbone.Model.extend({
    url: function() {
        return '/api/card/' + this.get('key') + '/';
    },
    rate: function(rating) {
        var url = '/api/card/' + key + '/review'
        // 'easy' or 'hard'
        var data = {
        };
    }
});

var CardCollection = Backbone.Collection.extend({
    model: CardModel,
    url: '/api/cards' // TODO
    // TODO - comparator
});

module.exports = {
    CardModel: CardModel,
    CardCollection: CardCollection
};
