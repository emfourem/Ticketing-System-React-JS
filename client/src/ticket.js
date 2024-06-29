'use strict';
import dayjs from 'dayjs';

const State = {
    open: 'open',
    close: 'close'
};

const Category = {
    payment: 'payment',
    maintenance: 'maintenance',
    inquiry: 'inquiry',
    newFeature: 'new feature',
    administrative: 'administrative'
};



function Ticket(id, state, category, title, text, date, ownerId) {
  this.id = id;
  this.state = Object.values(State).includes(state)? state : State.open;
  this.category = Object.values(Category).includes(category)? category : Category.newFeature;
  this.title = title;
  this.text = text;
  this.date = date && dayjs(date);
  this.ownerId = ownerId;

  this.toString = () => {
    return `Id: ${this.id}, ` +
    `Title: ${this.title}, Category: ${this.category}, ` +
    `Date: ${this.date.format('YYYY-MM-DD HH:mm')}, ` +
    `State: ${this.state},` + `Owner Id: ${this.ownerId},` + `Text: ${this.text}` ;
  }
}

export {Ticket, Category};