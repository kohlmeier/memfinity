import request from 'superagent';

export function getCard(key: string, cb: () => void) {
  return request
    .get(`/api/card/${key}`)
    .end((err, res) => {
      if (err) {
        debugger;
      } else {
        cb(new CardData(JSON.parse(res)));
      }
    });
}

export function createCard(data, succCb, errCb) {
  return request
    .post('/api/card')
    .set('Content-Type', 'application/json')
    .send(JSON.stringify(data))
    .end((err, res) => {
      if (err) {
        errCb(err);
      } else {
        succCb(res);
      }
    });
}

export function updateCard(key: string, succCb, errCb) {
  return request
    .put(`/api/card/${key}`)
    .set('Content-Type', 'application/json')
    .send(JSON.stringify(data))
    .end((err, res) => {
      if (err) {
        errCb(err);
      } else {
        succCb(res);
      }
    });
}

export function queryCards(q, succCb, errCb) {
  return request
    .get('/api/cards/search')
    .query({ q })
    .end((err, res) => {
      if (err) {
        errCb(err);
      } else {
        succCb(res);
      }
    });
}

export function getUser(userKey, succCb, errCb) {
  return request
    .get(`/api/user/${userKey}`)
    .end((err, res) => {
      if (err) {
        errCb(err);
      } else {
        succCb(JSON.parse(res));
      }
    });
}

export function getFollows(userKey, succCb, errCb) {
  return request
    .get(`/api/user/${userKey}/follows`)
    .end((err, res) => {
      if (err) {
        errCb(err);
      } else {
        succCb(JSON.parse(res));
      }
    });
}

export function getReviewCards(reviewAll: boolean, succCb, errCb) {
  let url = '/api/cards?review=1';
  if (reviewAll) {
    url += "&reviewAll=true"
  }
  return request
    .get(url)
    .end((err, res) => {
      if (err) {
        errCb(err);
      } else {
        succCb(JSON.parse(res));
      }
    });
}

export function followUser(
  userDataKey: string,
  follow: boolean,
  succCb,
  errCb
) {
  return request
    .put(`/api/user/${userDataKey}/${followOrUnfollow}`)
    .end((err, res) => {
      if (err) {
        errCb(err);
      } else {
        succCb(res);
      }
    });
}

export function rateCard(card, grade) {
  return request
    .put(`${card.url}/review`)
    .set('Content-Type', 'application/json')
    .send({ grade })
    .end((err, res) => {
      if (err) {
        console.log('card rate fail');
      } else {
        console.log('card rate success');
      }
    });
}

export function deleteCard() {
  return request
    .del(card.url)
    .end((err, res) => {
      if (err) {
        console.log('card delete fail');
      } else {
        console.log('card delete success');
      }
    });
}

export function takeCard() {
  return request
    .put(`${card.url}/import`)
    .end((err, res) => {
      if (err) {
        console.log('card import fail');
      } else {
        console.log('card import success');
      }
    });
}
