import { Record } from 'immutable';
import $ from 'jquery';


const CardData = Record({
  front: null,
  back: null,
  tags: null,
  reversible: false,
  'private': false,

  // metadata
  added: null,
  modified: null,
  source_url: null,

  // TODO(joel): more fields
});


export class CardModel {
  get url() {
    return `/api/card/${this.key}`;
  }

  rate(grade) {
    $.ajax({
      url: `${this.url}/review`,
      data: JSON.stringify({ grade }),
      contentType: 'application/json',
      type: 'PUT',
    })
      //.done(() => { console.log('card rate success'); })
      .fail(() => { console.log('card rate fail'); });
  }

  deleteCard() {
    $.ajax({
      url: this.url,
      type: 'DELETE'
    })
      //.done(() => { console.log('card delete success'); })
      .fail(() => { console.log('card delete fail'); });
  }

  takeCard() {
    $.ajax({
      url: `${this.url}/import`,
      type: 'PUT'
    })
      //.done(() => { console.log('card import success'); })
      .fail(() => { console.log('card import fail'); });
  }
}
