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
        $.ajax({
            url: this.url() + 'review',
            data: { grade: rating },
            contentType: 'application/json; charset=utf-8',
            type: 'PUT'
        })
            .done(function() { console.log('success'); })
            .fail(function() { console.log('fail'); });
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
