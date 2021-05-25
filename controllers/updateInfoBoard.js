const fetch = require("node-fetch");
const config = require('../config');

// Get members & hours & date data from sprint-board 
let getMembersHouersDatePms = 'query {boards(ids: 671223520){ items { column_values(ids:["people3","retainer_billing8","people_assing4","date"]){ text }}}}'

// Get members by id from Info-board
let getMembersById = 'query {boards(ids:667708556){ items { id name }}}'

async function query(method, queryType, queryString) {
  return fetch("https://api.monday.com/v2", {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': config.api_key
    },
    body: JSON.stringify({
      [queryType]: queryString
    })
  })
    .then(res => res.json())
    .then(res => res);
}
async function fetchAndMutation() {
  let response = await query('post', 'query', getMembersHouersDatePms);
  let day = new Date()
  let currentMonth = day.toISOString().split('-')[1]
  boards = response.data.boards;

  const newItems = boards[0].items.reduce(function (lastValue, item) {
    debugger
    const idx = lastValue.findIndex(lastItem => lastItem.column_values[0].text === item.column_values[0].text)
    let dayCheck = item.column_values[2].text
    if (idx !== -1) {
      if (dayCheck.split('-')[1] != currentMonth) {
        return lastValue;
      }
      const sum = Number(lastValue[idx].column_values[3].text) + Number(item.column_values[3].text)
      lastValue[idx].column_values[3].text = String(sum);
      return lastValue;
    } else {
      if (dayCheck.split('-')[1] != currentMonth) {
        item.column_values[2].text = '0';
        lastValue.push(item)
        return lastValue;
      }
      lastValue.push(item)
      return lastValue;
    }
  }, [])
  boards[0].items = newItems;

  //TODO: if Board index change - newItems.length should me 55+
  //console.log('boards data ==> ', newItems.length , JSON.stringify(newItems, null, 2)); 

  // add id to each employee:
  let empArray = [];
  newObj = {};
  empArray = boards[0].items;
  let boardInfo = await query('post', 'query', getMembersById)
  let empIds = boardInfo.data.boards[0].items;

  empIds.forEach(item => {
    itemName = item.name.toLowerCase();
    newObj[itemName] = item.id
  });

  debugger
  empArray.forEach(item => {
    let allMembers = item.column_values[0].text.toLowerCase();
    let allhouers = item.column_values[3].text;
    let mutationFields = `mutation {change_column_value(board_id: 667708556, item_id: ${newObj[allMembers]}, column_id: hours_tracked, value:"${allhouers}"){ id }}`;
    query('post', 'query', mutationFields)
  })
};


module.exports = { fetchAndMutation, query };