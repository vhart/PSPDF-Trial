var express = require("express");
var app = express();
const bodyParser = require('body-parser');

var cors = require('cors')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cors())

var pdfAnnotations = {}

app.get("/", (req, res, next) => {
  res.json(pdfAnnotations);
 });
 
 app.post('/', function (req, res) {
  const body = req.body
  console.log(body)

  pdfAnnotations = body
  res.send('POST request to the homepage')
})

app.listen(8081, () => {
 console.log("Server running on port 8081");
});
