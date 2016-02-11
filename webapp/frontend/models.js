import Backbone from 'backbone';
import $ from 'jquery';

/*
 * Cards store the following data:
 * - front: markup appearing on the front of the card
 * - back: markup appearing on the back of the card
 * - tags: list of tag names
 * - ... meta ...
 */
export const CardModel = Backbone.Model.extend({
    url: function() {
        return '/api/card/' + this.get('key');
    },
    rate: function(rating) {
        $.ajax({
            url: this.url() + '/review',
            data: JSON.stringify({ grade: rating }),
            contentType: 'application/json',
            type: 'PUT'
        })
            //.done(function() { console.log('card rate success'); })
            .fail(function() { console.log('card rate fail'); });
    },
    deleteCard: function() {
        $.ajax({
            url: this.url(),
            type: 'DELETE'
        })
            //.done(function() { console.log('card delete success'); })
            .fail(function() { console.log('card delete fail'); });
    },
    takeCard: function() {
        $.ajax({
            url: this.url() + '/import',
            type: 'PUT'
        })
            //.done(function() { console.log('card import success'); })
            .fail(function() { console.log('card import fail'); });
    },
});
