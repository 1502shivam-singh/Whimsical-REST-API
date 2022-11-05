const AWS = require('aws-sdk');
const express = require('express');
const cors = require('cors');

/* setting up */
const app = express();
app.set('view engine', 'ejs');
app.use(cors({origin:true,credentials: true}));
app.use(express.static(`${__dirname}/static`));

app.use(express.json());

const port = process.env.PORT || 3000

const node_wiki = {
  title: "Node.js",
  content: "Node allows javascript to interact with hardware"
}
const js_wiki = {
  title: "JavaScript",
  content: "JavaScript is a programming language"
}
const java_wiki = {
  title: "Java",
  content: "Java is a programming language"
}

AWS.config.region = 'ap-south-1' || process.env.AWS_REGION

let ddb = new AWS.DynamoDB();
let dynamodb = new AWS.DynamoDB.DocumentClient();
let dynamodbTableName =  'GameSessionData' || process.env.TABLE;

let arrayStore = [node_wiki, js_wiki, java_wiki];

/* GET, POST, DELETE, PUT and PATCH on custom wiki title route */
app.route("/wiki/:title")
  .get((req,res)=>{
    const obj = arrayStore.find((obj)=>{
      return obj.title.toLowerCase() == req.params.title.toLowerCase();
    });

    if(obj === undefined) {
      res.set({
        'Content-Type': 'application/json',
        'Content-Length': '123',
        ETag: '12345'
      })
      res.status(404)

      res.send({error: "record not found"})
    } else {
      res.set({
        'Content-Type': 'application/json',
        'Content-Length': '123',
        ETag: '12345'
      })
      res.status(200)

      res.send(obj);
    }
  })

/* GET, POST, DELETE, PUT and PATCH on wiki route */
app.route("/wiki")
  .get((req,res)=>{
    res.set({
      'Content-Type': 'application/json',
      'Content-Length': '123',
      ETag: '12345'
    })
    res.status(200)

    res.send(arrayStore[Math.floor(Math.random()*arrayStore.length)]);
  })

app.route("/")
  .get((req,res)=>{
    res.status(200);
    res.sendFile(`${__dirname}/index.html`);
  })

  .post((req,res)=>{
    let item = {
      "roomid": req.body.roomid,
      "playerCount": req.body.playerCount,
      "playerData": req.body.playerData, // map => {player: score...}
      'active': req.body.active,
    };

    dynamodb.put({
          TableName: dynamodbTableName,
          Item: item,
          'Expected': { roomid: { Exists: false } }        
      }).promise().then(() => {
        const body = {
          Operation: 'SAVE',
          Message: 'SUCCESS',
          Item: req.body
        }
        res.json(body);
      }, error => {
        console.error("ERR: ", error);
        res.status(500).send(req.body);
      });
  });
  
  
app.listen(port,()=>{
  console.log("Server start");
});