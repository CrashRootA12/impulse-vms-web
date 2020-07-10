/***
 * The Server Script.
 * @__language__ Node JS
 * @module express The Appware
 *
 */
const express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
const app = express();
const sql = require("mysql");
const multer = require("multer");
const favicon = require('serve-favicon');
const theCrypt = require('./ImpulseCrypt')
const theVoteManager = require('./VoteManager')
let fs = require('fs')
const theDBDetails = JSON.parse(fs.readFileSync('./ClearDBConnection.json'))


/**
 * Multer Middleware Setup
 */
let storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./uploads");
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});
let upload = multer({ storage: storage });
let currentUserId = '';
/***
 * Express Directives
 */
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(favicon(path.join(__dirname,'public','favicon.ico')));

/***
 * @module mysql Database Connectivity Configuration
 * Mode: Pool.
 * ClearDB Heroku.
 */
var pool = sql.createPool(theDBDetails);
// con.connect(function(err) {
//     if (err) {
//         throw err;
//     }
//    else {
//     console.log("Connected to database");
// }
// });
//app.use(express.static(path.join(__dirname,'public')));
/***
 * The Routes | GET
 */
app.get("/newPoll", function (req, res) {
  res.sendFile(path.join(__dirname + "/CreatePoll.html"));
});
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});
app.get("/login", function (req, res) {
  res.sendFile(path.join(__dirname + "/LoginPage.html"));
});
app.get("/register", function (req, res) {
  res.sendFile(path.join(__dirname + "/RegisterPage.html"));
});
app.get('/getCurrentUserName', function (_req, res) {
  res.send([currentUserName,currentUserId]);
});
/***
 * The Routes | POST
 */
app.post("/userLogin", function (req, res) {
  validateLogin(req.body.name, req.body.pass, res);
});
app.post('/createPollSubmit',function(req,res) {
  addNewPoll(req);
res.end();
})

app.get('/getListOfEvents', async function (req, res) {
  //Fetch the User ID from Client
  var user_id = req.body.user_id
  var theResultSet = await theVoteManager.getEventsRelatedToUser(user_id)
  var theCommaSeperatedString = theResultSet[0].related_polls
  var theArray = theCommaSeperatedString.split(',')
  res.send(theArray)
})
app.get('/getVoteCount', async function (req,res) {
  var poll_id = req.body.poll_id
  var user_id = req.body.user_id || NONE
  var option_chosen = req.body.option_chosen || NONE
  var theVoteCount = await theVoteManager.countVotes(poll_id,user_id,option_chosen)
  res.send(theVoteCount)
  })

app.post("/saveUser", upload.single("image"), function (req, res) {
  console.log("Request recieved");
  var image = req.file;
  var username = req.body.name;
  var password = req.body.pass;
  var email = req.body.email;
  var phone = req.body.phone;

  var dob = req.body.birth;
  console.log(req.body);
  console.log(image);
  saveUser(username, password, email, phone, image, dob);
  res.redirect("/");
});
app.post('/accessKeyLogin',async function(req,res) {
  var theAccessKey = req.body.access_key;
  var success = await validateAccessKey(theAccessKey);
  if (success===true) res.sendFile(path.join(__dirname + '/LoggedInPage.html'));
  else res.end('Access Key Invalid/Expired');
  });
/*** Launching the Server  */
var port = process.env.PORT || 1215;
app.listen(port, function () {
  console.log("Running"); //Debug Status.
});
/***
 *This function saves user to the database.
 @referenced_table: impulse_users
 */
function saveUser(usr, pswd, email, phone, image, dob) {
  var query =
    "insert into impulse_users(user_id, user_name,user_password,user_picture,user_email,user_phonenumber,user_dob) values ?";

  var values = [[generateRandomUserId(), usr, pswd, image, email, phone, dob]];
  var formattedQuery = sql.format(query, [values]);
  pool.query(formattedQuery, function (err, response) {
    if (err) {
      console.error(err);
      return;
    }
  });
}
/**
 * 
 * Validates User Entering Impulse VMS
 */
// function validateLogin(user,pass) {
//     var selectQuery = "select * from impulse_users where user_name = \""+user+"\" && user_password = \""+pass+"\"";
//     pool.query(selectQuery,function(err,result,field) {
//     if (err) throw err;
//     if (result==[]) userLoginStatus = false;
//     else userLoginStatus=true;
//     });
// }
/**
 * This function Validates User Entering Impulse VMS
 */
function validateLogin(user, pass, res) {
  var selectQuery =
    'select * from impulse_users where user_name = "' +
    user +
    '" && user_password = "' +
    pass +
    '"';
  pool.query(selectQuery, function (err, result) {
    if (err) throw err;
    if (result == "") {
      res.send("<h1>User not found</h1>");
    } else {
      currentUserName = result[0].user_name;
            currentUserId = result[0].user_id;
            res.sendFile(path.join(__dirname + '/LoggedInPage.html'));
    }
  });
}
/***
 * Using Math Module, this function generates a random user ID which can
 * be between 0 and 15000.
 */
function generateRandomUserId() {
  var min = 0;
  var max = 15000;
  var random = Math.floor(Math.random() * (+max - +min)) + +min;
  return random;
}
function addNewPoll(req) {
  var title = req.body.poll_title,
  desc = req.body.poll_desc,
  cc = req.body.poll_candidateCount,
  type = req.body.radio,
  candidates = req.body.txt_name.toString(),
  candidatesid = req.body.txt_id.toString();
  var query = "insert into impulse_event(poll_id, poll_title,poll_desc,poll_type,poll_candidates) values ?";
  var values = [
      [generateRandomUserId(),title,desc,type,candidates]
  ]
  var formattedQuery = sql.format(query,[values]);
  pool.query(formattedQuery,function(err,results) {
      if (err) throw err;
      console.log("Created A New Poll in database");
  });
}
/**
 *
 *
 * @param {*} inputAccessKey
 * @returns
 */
function validateAccessKey(inputAccessKey) {
  return new Promise(function (resolve, reject) {
      var theQuery = 'select * from impulse_access_keymgr where access_key=' + sql.escape(inputAccessKey);
      pool.query(theQuery, async function (err, results) {
          if (err) reject(err);
          else if (results == "") {
              console.log("CondII");
              console.error("Access Key Not Present");
              reject (false);                
          } else {
          var isUserPresent = await fetchUserNameGivenId(results[0].user_id);
          if (isUserPresent==true) resolve(true);
              else reject(false);
          }
      });
  }).catch(function() {
      console.log("Entered");
      return false;
  });

}
function fetchUserNameGivenId(userId) {
  return new Promise(function(resolve,reject) {
      var query = 'select user_name from impulse_users where user_id = '+sql.escape(userId);
      pool.query(query,function(err,res) {
          if (err) reject(err);
          if (res=="") resolve(false);
          else {
              currentUserName = res[0].user_name;
              resolve(true);
          } 
      });
  }).catch(function() {
      console.log("MySQL ERROR REC");
      return false;
  });
}
/**
 *@requires fetchUserNameGivenId() to be executed first.
 *
 * @param {*} userid
 * @returns
 */
function getUserDetails(userid) {
  return new Promise(function(resolve,reject) {
      var query = 'select * from impulse_users where user_id = '+sql.escape(userId);
      pool.query(query,function(err,results) {
      if (err) reject(err);
      else {
          resolve(results);
      }
      }) ;
  }).catch(()=>{
      console.error("Unexpected Error Occured: ERRCODE IMPL-2");
  });
}