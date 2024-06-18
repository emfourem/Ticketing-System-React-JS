'use strict';
const dayjs = require('dayjs');

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
  this.state = Object.values(State).includes(state)? state:State.open;
  this.category = Object.values(Category).includes(state)? category : null;
  this.title = title;
  this.text = text;
  this.date = date && dayjs(date);
  this.ownerId = ownerId;
  // saved as dayjs object only if watchDate is truthy
  //this.watchDate = watchDate && dayjs(watchDate);

  this.toString = () => {
    return `Id: ${this.id}, ` +
    `Title: ${this.title}, Category: ${this.category}, ` +
    `Date: ${this.date.format('YYYY-MM-DD HH:mm')}, ` +
    `State: ${this.state},` + `Owner Id: ${this.ownerId},` + `Text: ${this.text}` ;
  }
}


function main() {
    const t1=new Ticket( 1,"ciao", "pa", "Payment required","Where are my money?","2024-06-19 21:00",1);
    console.log(t1.toString());
  // Additional instruction to enable debug 
  debugger;
}
main();