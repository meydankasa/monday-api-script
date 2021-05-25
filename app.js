const dotenv = require('dotenv').config()
var bodyParser = require('body-parser')
const express = require('express')
const app = express()
const mondayFunc = require('./controllers/updateInfoBoard')
const emailPm = require('./controllers/emailPm')
const port = 3000;
const CronJob = require('cron').CronJob;
const cors = require('cors')

app.use(bodyParser.json())
app.use(cors());
callFunctionOnLoad()
function callFunctionOnLoad() {
    debugger
      mondayFunc.fetchAndMutation();
}
const displayQueryHourly = new CronJob('0 * * * *', async() => {
    await mondayFunc.fetchAndMutation();
}, null, true);


displayQueryHourly.start();

//TODO: after review & email check
// const testingMails = new CronJob('00 20 * * *', async() => {
//     debugger
//     await emailPm.fetchAndMaillPms();
// }, null, true);
// testingMails.start();


app.post('/dailyHouersEmail', async (req, res) => {
    const result = await emailPm.fetchAndMaillPms()
    res.json(result)
});

app.post('/hoursTracked', async (req, res) => {
    const result = await mondayFunc.fetchAndMutation();
    res.json(result)
});


app.listen(port,()=> console.log(`App listening at PORT :${port}`))
module.exports = app;
