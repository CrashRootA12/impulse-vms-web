const mysql = require('mysql')
var pool = mysql.createPool({
    //Just Initialize
})

function setPool(p) {
    pool = p
}
/**
 * THE VOTING ROUTINE
 *
 * @param {*} poll_id
 * @param {*} user_id
 * @param {*} option_chosen
 * @returns True if vote is done.
 */
async function processVote(poll_id, user_id, option_chosen) {
    var hasUserAlreadyVoted = await checkIfUserHasAlreadyVoted(poll_id, user_id)
    if (hasUserAlreadyVoted === false) {
        return new Promise((resolve, reject) => {
            var theQuery = "insert into impulse_votemgr(poll_id,user_id,option_chosen) values ?"
            var theValues = [
                [poll_id, user_id, option_chosen]
            ]
            
            pool.query(mysql.format(theQuery, [theValues]), (err) => {
                if (err) reject(err)
                else {
                    resolve(true)
                }
            })
        }).catch((err) => {
            console.log("An Error Occured")
            console.error(err)
        })
    }
    return false
}
/*** 
 * @param {Number} poll_id The Poll ID
 * @param {Number} voter_id The Voter ID (Optional)
 * @param {*} option_chosen Candidate ID (Optional)
 * @returns Promise 
 */
async function countVotes(poll_id, voter_id = "NONE", option_chosen = "NONE") {
    var promise = new Promise((resolve, reject) => {
        var theQuery = `select count(*) as theCount from impulse_votemgr  where poll_id = ${poll_id}`
        if (voter_id !== "NONE") theQuery = theQuery + ` && user_id = ${voter_id}`
        if (option_chosen !== "NONE") theQuery = theQuery +`&& option_chosen = "${option_chosen}"`
        console.log(theQuery)
        pool.query(theQuery, (err, result) => {
            if (err) reject(err)
            else if (result == "") reject("NOT_FOUND")
            else resolve(result)
        })
    })
    promise.catch(err => {

        console.log("Error Occured")
        console.error(err)

    })
    return promise
}
async function getAllPolls() {
    return new Promise((resolve,reject)=>{
        var theQuery =  `select * from impulse_event`
        pool.query(theQuery,(err,res) => {
            if (err) reject(err)
            resolve(res)
        })
    }).catch(err=>{console.error(err)})
}
/**
 * Returns the list of candidates.
 * @requires mysql
 * @author JSGREWAL ---Creative_Commons
 * @param {*} poll_id Poll ID
 * @returns Promise
 */
async function getListOfCandidatesThatAreVoted(poll_id) {
    var thePromise = new Promise((resolve, reject) => {
        var theQuery = "select option_chosen from impulse_votemgr where poll_id = " + mysql.escape(poll_id) + " group by option_chosen"
        console.log(theQuery)
        pool.query(theQuery, (err, results) => {
            if (err) reject(err)
            if (results == "") reject("EMPTY_RESULT_OBJECT")
            resolve(results)
        })
    }).catch((err) => {
        console.error("A Syntax Error has been caught")

        console.error(err)
    })
    
    return thePromise
}

async function getUserRelatedEvents(user_id) {
    var promise = new Promise((resolve, reject) => {
        var theQuery = "select related_polls from impulse_users where user_id = " + pool.escape(user_id)
        pool.query(theQuery, (err, result) => {
            if (err) reject(err)
            if (result == "") resolve("EMPTY")
            resolve(result)
        })
    }).catch((err) => {
        console.log("getUserRelatedEvents votemgr catch")
        console.error(err)
    })
    return promise
}

async function getPollStatus(poll_id) {
    var promise = new Promise((resolve, reject) => {
        pool.query("select poll_status from impulse_event where poll_id = " + pool.escape(poll_id), (err, result) => {
            if (err) reject(err)
            if (result == "") reject("EMPTY")
            resolve(result)
        })
    }).catch((err) => {
        console.error(err)
    })
   
    return promise
}

async function getPollCandidates(poll_id) {
    var promise = new Promise((resolve, reject) => {
        pool.query("select poll_candidates from impulse_event where poll_id = " + pool.escape(poll_id), (err, result) => {
            if (err) reject(err)
            if (result == "") reject("EMPTY")
            resolve(result[0].poll_candidates.split(','))
        })
    })
    promise.catch((err) => {
        console.error(err)
    })
    return promise
}

async function getPollParticipants(poll_id) {
    var promise = new Promise((resolve, reject) => {
        pool.query("select poll_participants from impulse_event where poll_id = " + pool.escape(poll_id), (err, result) => {
            if (err) reject(err)
            if (result == "") reject("EMPTY")
            resolve(result)
        })
    })
    promise.catch((err) => {
        console.error(err)
    })
    return promise
}
async function getUserInformation(user_id) {
    var promise = new Promise((resolve, reject) => {
        var theQuery = "select * from impulse_users where user_id = " + pool.escape(user_id)
     

        pool.query(theQuery, (err, results) => {
            if (err) reject(err)
            if (results == "") reject("EMPTY")
            console.log(results);
            
            resolve(results)
        })
    }).catch((e)=>{
        console.log("Reached UserInformation catch")
        console.err(e)
    })
return promise
}
async function getPollInformation(poll_id) {
    var promise = new Promise((resolve, reject) => {
        var theQuery = "select * from impulse_event where poll_id = " + pool.escape(poll_id)
        console.log(theQuery);

        pool.query(theQuery, (err, results) => {
            if (err) reject(err)
            if (results == "") reject("EMPTY")
            console.log(results)
            resolve(results)
        })
    }).catch((e) => {
        console.log("Reached getPollInformation catch")
        console.error(e)
    })
    return promise
}

async function checkIfUserHasAlreadyVoted(poll_id, user_id) {
    var promise = new Promise((resolve, reject) => {
        var theQuery = "select * from impulse_votemgr where poll_id =" + pool.escape(poll_id) + " && user_id=" + pool.escape(user_id)
        pool.query(theQuery, (err, result) => {
            if (err) reject(err)
            if (result == "") resolve(false)
            reject(true)
        })
    }).catch((err) => {
        if (err === true) console.log("Already Voted")
        else console.error(err)
    })
    return promise
}
    async function addANewRelatedPoll(user_id,poll_id) {
    var promise = new Promise(async(resolve,reject)=>{
     var userHasPolls = await getUserRelatedEvents(user_id)
     var toEnter=''
     if (userHasPolls==="EMPTY") toEnter = poll_id
     else {
         var theRelatedPollsArray = userHasPolls[0].related_polls.split(',')
        theRelatedPollsArray.indexOf(poll_id)===-1?theRelatedPollsArray.push(poll_id):reject("Already_Exists")
        toEnter=theRelatedPollsArray
     }
     var theQuery = 
        `update impulse_users 
        set related_polls = "${toEnter}"
        where user_id = ${user_id}
        `
        pool.query(theQuery,(err)=>{
            if (err) reject(err)
            resolve(true)
        })
        
    }).catch((err)=>{
        console.error(err)
    })
    return promise
}


module.exports = {
    performVote: processVote,
    countVotes: countVotes,
    getVotedCandidateInfo: getListOfCandidatesThatAreVoted,
    getEventsRelatedToUser: getUserRelatedEvents,
    getPollStatus: getPollStatus,
    getListOfCandidates: getPollCandidates,
    getPollParticipants: getPollParticipants,
    getPollInformation: getPollInformation,
    hasUserAlreadyVoted: checkIfUserHasAlreadyVoted,
    setPool: setPool,
    getUserInformation:getUserInformation,
    addANewRelatedPoll:addANewRelatedPoll,
    getAllPolls : getAllPolls
}