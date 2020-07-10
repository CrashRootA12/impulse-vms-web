const express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
const app = express()
const sql = require('mysql')
const multer = require('multer')
const favicon = require('serve-favicon')
const theCrypt = require('./ImpulseCrypt')
// const crypto = require('crypto')
const mime = require('mime')
// const theFaceRecognizer = require('./FaceRecognizer')
const theVoteManager = require('./VoteManager')
const ImpulseMailer = require('./ImpulseMailer')
const theMailer = new ImpulseMailer.ImpulseMailer()
let currentPollId = ''
let currentUserId = ''
let theFileName = ''
let storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads')
    },
    filename: function (req, file, callback) {
        theFileName = generateRandomUserId() + '.' + mime.getExtension(file.mimetype)
        callback(null, theFileName);
    }
});
let userLoginStatus = false
let upload = multer({
    storage: storage
})
app.use(express.static(__dirname))
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
let currentUserName = ''
let currentUserBlob = ''
let fs = require('fs')
const theDBDetails = JSON.parse(fs.readFileSync('./LocalMySqlConnection.json'))

var pool = sql.createPool(theDBDetails)
theVoteManager.setPool(pool)
pool.getConnection(function (err) {
    if (err) throw err;
    else console.log("CONNECTED TO DB")
})
app.set('view engine', 'ejs');
// con.connect(function(err) {
//     if (err) {
//         throw err;
//     }
//    else {
//     console.log("Connected to database");
// }
// });
//app.use(express.static(path.join(__dirname,'public')));

app.get('/', function (req, res) {
    // res.sendFile(path.join(__dirname + '/index.html'));
})
app.get('/results', async  function (req, res) {
    var poll_id = req.query.poll_id 
    var poll_name = req.query.poll_title
    var qRes = await theVoteManager.countVotes(poll_id)
    var poll_total_votes = qRes[0].theCount
    var poll_candidates_mix = await theVoteManager.getListOfCandidates(poll_id)
    var poll_candidates_ids = []
    var poll_candidates_names = []
    var poll_candidates_votes = []
    var maxVotes = -1, maxName, maxID
    for (var cm of poll_candidates_mix) {
        var splitArray = cm.split('_')
        poll_candidates_ids.push(splitArray[0])
        poll_candidates_names.push(splitArray[1])
        var votesRes = await theVoteManager.countVotes(poll_id,undefined,splitArray[0])
        var votes = votesRes[0].theCount
        poll_candidates_votes.push(votes)
        if (votes>maxVotes) {
            maxVotes = votes
            maxName = splitArray[1]
            maxID = splitArray[0]
        }
    }

    // res.send([poll_total_votes, poll_candidates_ids,poll_candidates_names,poll_candidates_votes])

    // res.render('Results', {
    //     chartLabel: "C",
    //     chartData: [4, 5, 7, 8, 25]
    // })
    res.render('ResultChart', {
        winner_name : maxName,
        winner_id:maxID,
        poll_candidates_ids:poll_candidates_ids,
        poll_candidates_names:poll_candidates_names,
        poll_candidates_votes:poll_candidates_votes,
        poll_id:poll_id,
        poll_name:poll_name
    })
})
app.get('/getCategory', async function (req, res) {
    var category = req.query.category
    // Fetch User ID
    var user_id = req.query.user_id
    //Fetch All Polls Related to User
    // var theResultSet = await theVoteManager.getEventsRelatedToUser(user_id)
    var theResultSet = await theVoteManager.getAllPolls()
    console.log(theResultSet)
    var theRequiredArray_ID = [],
        theRequiredArray_Name = []
    var categoryLabel = ""
    switch (category) {
        case 'globalLive':
            categoryLabel = "Global LIVE Polls"
            break
        case 'globalUpcoming':
            categoryLabel = "Global Upcoming Polls"
            break
        case 'globalPrevious':
            categoryLabel = "Global Finished Polls"
            break
        case 'myLive':
            categoryLabel = "My Live Polls"
            break
        case 'myUpcoming':
            categoryLabel = "My Upcoming Polls"
            break
        case "myDrafted":
            categoryLabel = "My Drafted Polls"
            break
        case "myArchived":
            categoryLabel = "My Archived Polls"
            break
    }

    for (var t of theResultSet) {
        // var t = await theVoteManager.getPollInformation(x)
        var globalLive = (category === 'globalLive' && t.poll_status == 'LIVE')
        var globalUpcoming = (category === 'globalUpcoming' && t.poll_status == 'READY')
        var globalPrevious = (category === 'globalPrevious' && t.poll_status == 'DONE')
        
        var isHost = t.poll_host == user_id
        var myLive = globalLive && isHost
        var myDrafted = t.poll_status == "DRAFT"
        var myUpcoming = isHost && globalUpcoming
        var myPrevious = isHost && globalPrevious
        var myArchived =  t.poll_status == "ARCHIVE"
        if (myLive) console.log(`xxx ${t.poll_title}`)
        if (myLive || myDrafted || myUpcoming || myPrevious || myArchived) {
            theRequiredArray_ID.push(t.poll_id)
            theRequiredArray_Name.push(t.poll_title)
        } 
        else if (globalLive && !myLive || globalUpcoming&& !myUpcoming || globalPrevious && !myPrevious || myDrafted&&!myArchived || myArchived&& !myDrafted) {
            theRequiredArray_ID.push(t.poll_id)
            theRequiredArray_Name.push(t.poll_title)
        }

    }
    console.log(theRequiredArray_ID)
    var rs = await theVoteManager.getUserInformation(user_id)
    var user_name = rs[0].user_name
    res.render("template", {
        user_id: user_id,
        user_name: user_name,
        category: categoryLabel,
        comment: "Random Comment",
        poll_ids: theRequiredArray_ID,
        poll_names: theRequiredArray_Name
    })
})
app.post('/createPollSubmit', async function (req, res) {
    console.log("Request Recieved")
    //   var arrayOfKeys = Object.keys(req.body)
    //   for (key of arrayOfKeys) {
    //       console.log(req.body['cId[]'])
    //   }
    var event_added_status = await createNewPoll(req.body.cPollTitle, req.body.cPollDesc, req.body.cPollType, req.body['cId[]'], req.body['cname[]'], req.body.cPollConfig, currentUserId)
    var event_related_status = await theVoteManager.addANewRelatedPoll(currentUserId, currentPollId)
    // addNewPoll(req);
    // createNewPoll(cPollTitle,cPollDesc,cPollType,cId,cname,cPollConfig)
    var statusMessage = (event_added_status && event_related_status) ? "The Poll Has Been Created Successfully" :
        "The Poll Could Not Be Created. Please Contact System Admin."
    res.render('CreatePollStatus', {
        statusMessage: statusMessage
    })
})
app.get('/newPoll', function (req, res) {
    res.sendFile(path.join(__dirname + '/CreatePoll.html'));
})

// app.get('/login',function (req,res) {
//     res.sendFile(path.join(__dirname+'/HomePage.html'));
// })
app.get('/register', function (req, res) {
    res.sendFile(path.join(__dirname + '/RegisterPage.html'));
})
app.post('/saveUser', upload.single('image'), async function (req, res) {

    var image = req.file;
    var username = req.body.name;
    var password = req.body.pass;
    var email = req.body.email;
    var phone = req.body.phone;

    var dob = req.body.birth;

    var success = saveUser(username, password, email, phone, theFileName, dob);
    var theMessage = success ? 'Registration Succesfull Your login ID and password are sent on your entered email address' :
        'Registration Failed. Try again or contact the system administrator for more details'
    res.render('RegStatus', {
        statusMessage: theMessage
    })

})
app.post('/userLogin', function (req, res) {

    validateLogin(req.body.name, req.body.pass, res);

})
app.get('/getPollStatus', async function (req, res) {
    var thePollId = req.query.poll_id
    var thePollStatus = await theVoteManager.getPollStatus(thePollId)
    res.send(thePollStatus)
})
app.get('/getCurrentUserName', function (_req, res) {

    res.send([currentUserName, currentUserId, currentUserBlob])
})
app.get('/openPoll', async function (req, res) {
    var thePollId = req.query.poll_id
    var theUserId = req.query.user_id


    // var thePollStatus = req.query.pollStatus;
    // switch(thePollStatus) {
    //     case "LIVE":
    //         //Code to Display Voting Page
    // }
    var thePollInfo = await theVoteManager.getPollInformation(thePollId)

    res.render('UponOpenPoll2', {
        poll_info: thePollInfo[0],
        user_id: theUserId,
        
    })
})
app.post('/initiateVote', async function (req, res) {
    var poll_id = req.body.poll_id
    var user_id = req.body.user_id
    var option_chosen = req.body.option_chosen
    var voteDone = await theVoteManager.performVote(poll_id, user_id, option_chosen)
    var statusMessage = voteDone ? 'Your Vote Has Been Successfully Recorded.' :
        'Your Vote Could Not Be Submitted. Please Contact Administrator.'
    statusMessage += '\nYou must login again to continue using Impulse.'
    res.send(statusMessage)
})
app.get('/startVoting', async function (req, res) {
    var pollInformation = await theVoteManager.getPollInformation(req.query.poll_id)
    var userInformation = await theVoteManager.getUserInformation(req.query.user_id)
    var pollCandidatesList = await theVoteManager.getListOfCandidates(req.query.poll_id)

    console.log(pollCandidatesList[0].split('_'))
    res.render('Voting Page', {
        poll_title: pollInformation[0].poll_title,
        poll_id: req.query.poll_id,
        user_id: req.query.user_id,
        user_name: userInformation[0].user_name,
        reference_image: "../uploads/" + userInformation[0].user_picture,
        pollCandidatesList: pollCandidatesList
    })
})

app.get('/getPollInformation', async function (req, res) {

    var thePollInformation = await theVoteManager.getPollInformation(req.query.poll_id)

    res.send(thePollInformation)
})
app.get('/getListOfEvents', async function (req, res) {
    //Fetch the User ID from Client
    var user_id = req.query.usrid
    var theResultSet = await theVoteManager.getEventsRelatedToUser(user_id)
    var theCommaSeperatedString = theResultSet[0].related_polls
    var theArray = theCommaSeperatedString.split(',')
    res.send(theArray)
})
app.post('/accessKeyLogin', async function (req, res) {
    var theAccessKey = req.body.access_key
    var success = await validateAccessKey(theAccessKey)
    if (success === true) res.sendFile(path.join(__dirname + '/NewLoggedInPage.html'))
    else res.end('Access Key Invalid/Expired')
})
app.post('/getALoginKey', async function (req, res) {
    var theUserId = req.body.user_id
    saveAccessKey(theUserId, function () {
        console.log("Login Key Generated And Saved")
    })
})
app.get('/test', function (req, res) {
    res.sendFile(path.join(__dirname + '/VotingPage.html'))
})
app.get('/getVoteCount', async function (req, res) {
    var poll_id = req.body.poll_id
    var user_id = req.body.user_id || NONE
    var option_chosen = req.body.option_chosen || NONE
    var theVoteCount = await theVoteManager.countVotes(poll_id, user_id, option_chosen)
    res.send(theVoteCount)
})

var port = process.env.PORT || 1215
app.listen(port, function () {
    console.log('Running')
})


/**
 *
 *
 * @param {*} usr
 * @param {*} pswd
 * @param {*} email
 * @param {*} phone
 * @param {*} image
 * @param {*} dob
 */
async function saveUser(usr, pswd, email, phone, image, dob) {
    //Encrypting the Password
    var encryptedPassword = theCrypt.impulseEncrypt(pswd)

    var query = "insert into impulse_users(user_id, user_name,user_password,user_picture,user_email,user_phonenumber,user_dob) values ?";
    var theId = generateRandomUserId()
    var values = [
        [theId, usr, encryptedPassword, image, email, phone, dob]
    ]
    var formattedQuery = sql.format(query, [values])
    pool.query(formattedQuery, function (err) {
        if (err) {
            console.error(err);
            return false
        }
        theMailer.prepareMail(email, theId, pswd)
        theMailer.sendMail()
        return true
    })
}
/**
 *
 *
 * @returns
 */
function generateRandomUserId() {
    var min = 0
    var max = 999999
    var random =
        Math.floor(Math.random() * (+max - +min)) + +min
    return random
}
/**
 * @author JSGREWAL
 * Validates User Entering Impulse VMS
 */
function validateLogin(user, pass, res) {
    // Encrypting the password 
    var encryptedPassword = theCrypt.impulseEncrypt(pass)
    var selectQuery = "select * from impulse_users where user_id = \"" + user + "\" && user_password = \"" + encryptedPassword + "\"";
    pool.query(selectQuery, function (err, result) {
        if (err) throw err
        if (result == "") {
            res.send("<h1>User not found</h1>")
        } else {
            currentUserName = result[0].user_name
            currentUserId = result[0].user_id
            currentUserBlob = result[0].user_picture
            // res.sendFile(path.join(__dirname + '/NewLoggedInPage.html'))
            res.render("NewLoggedInPage", {
                user_name: currentUserName,
                user_id: currentUserId
            })
        }
    })
}

async function createNewPoll(ptitle, pdescription, ptype, cId, cname, cPollConfig, pHost) {
    var thePromise = new Promise(function (resolve, reject) {
        //Convert cId and cname arrays to a candidate field 
        // console.log(cId)
        var candidateField = []
        for (var i = 0; i < cId.length; i++) {
            var theCid = cId[i]
            var theCname = cname[i]
            var theCString = theCid + '_' + theCname
            candidateField.push(theCString)
        }
        console.log(candidateField)
        var theQuery = "insert into impulse_event(poll_id,poll_title,poll_desc,poll_candidates,poll_type,poll_status,poll_host) values ?"
        currentPollId = generateRandomUserId()
        var theValues = [
            [currentPollId, ptitle, pdescription, candidateField.toString(), ptype, cPollConfig, pHost]
        ]
        var updatedQuery = sql.format(theQuery, [theValues])
        pool.query(updatedQuery, function (err) {
            if (err) reject(err)
            resolve(true)
        })


    }).catch(function (err) {
        console.error(err)
    })
    return thePromise
}
// /**
//  *
//  *
//  * @param {*} req
//  */
// function addNewPoll(req) {
//     console.log(req.body)
//     var title = req.body.poll_title,
//         desc = req.body.poll_desc,
//         cc = req.body.poll_candidateCount,
//         type = req.body.radio,
//         candidates = req.body.txt_name.toString(),
//         candidatesid = req.body.txt_id.toString()
//     var query = "insert into impulse_event(poll_id, poll_title,poll_desc,poll_type,poll_candidates) values ?";
//     var values = [
//         [generateRandomUserId(), title, desc, type, candidates]
//     ]
//     var formattedQuery = sql.format(query, [values]);
//     pool.query(formattedQuery, function (err, results) {
//         if (err) throw err;

//     })
// }

function saveAccessKey(userId, cb) {
    var theAccessKey = theCrypt.impulseEncrypt(userId + generateRandomUserId());
    var thequery = "insert into impulse_access_keymgr(user_id,access_key) values ?";
    var values = [
        [userId, theAccessKey]
    ]
    pool.query(sql.format(thequery, [values]), function (err, result) {
        if (err) cb(err);
        else cb(null, result);
    })
    return theAccessKey;
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

                reject(false);
            } else {
                currentUserId = results[0].user_id
                var isUserPresent = await fetchUserNameGivenId(results[0].user_id);
                if (isUserPresent == true) resolve(true);
                else reject(false);
            }
        })
    }).catch(function () {
        return false
    })

}

async function fetchUserNameGivenId(userId) {
    try {
        return new Promise(function (resolve, reject) {
            var query = 'select user_name from impulse_users where user_id = ' + sql.escape(userId)
            pool.query(query, function (err, res) {
                if (err)
                    reject(err)
                if (res == "")
                    resolve(false)
                else {
                    currentUserName = res[0].user_name
                    resolve(true)
                }
            })
        })
    } catch (e) {
        return false
    }
}
/**
 *@requires fetchUserNameGivenId() to be executed first.
 *
 * @param {*} userid
 * @returns
 */
function getUserDetails(userid) {
    return new Promise(function (resolve, reject) {
        var query = 'select * from impulse_users where user_id = ' + sql.escape(userId);
        pool.query(query, function (err, results) {
            if (err) reject(err);
            else {
                resolve(results)
            }
        })
    }).catch(() => {
        console.error("Unexpected Error Occured: ERRCODE IMPL-2");
    })
}