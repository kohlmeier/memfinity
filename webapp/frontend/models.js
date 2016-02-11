import { Record } from 'immutable';


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
}
