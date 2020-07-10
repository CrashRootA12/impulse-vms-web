// const faceapi = require('face-api.js')
const MODEL_URL = './models'
async function ft(id) {
    var option_chosen = id
Promise.all([
    faceapi.loadSsdMobilenetv1Model(MODEL_URL),
    faceapi.loadFaceLandmarkModel(MODEL_URL),
    faceapi.loadFaceRecognitionModel(MODEL_URL)
]).then(initiateTheFV)

const input = document.getElementById('theimg')


async function initiateTheFV() {
const dContainer = document.getElementById('mycanvadiv')

const canvas = faceapi.createCanvasFromMedia(input)
canvas.id = 'mycanva'


// input.style.top = "50"
dContainer.append(canvas)
canvas.offsetTop = input.offsetTop
canvas.offsetLeft = input.offsetLeft
console.log(canvas.offsetTop)
var displaySize = {
    width : input.width,
    height : input.height
}
var referenceImage = 
document.getElementById("refImage")

faceapi.matchDimensions(canvas,displaySize)
    var singleFaceDesc = await faceapi.detectSingleFace(input).withFaceLandmarks().withFaceDescriptor()
    var llsfd = await faceapi.computeFaceDescriptor(input)
    var llrfd = await faceapi.computeFaceDescriptor(referenceImage)
    // var resizedResults = faceapi.resizeResults(singleFaceDesc,displaySize)
    // faceapi.draw.drawDetections(canvas,resizedResults)
    var referenceFaceDescriptors = await faceapi.detectSingleFace(referenceImage).withFaceLandmarks().withFaceDescriptor()
    var face_matcher = new faceapi.FaceMatcher(referenceFaceDescriptors,0.5)
    if (singleFaceDesc) {
        var bestMatch = face_matcher.findBestMatch(singleFaceDesc.descriptor)
        if (bestMatch) {
            faceapi.draw.drawFaceLandmarks(canvas,singleFaceDesc)
            console.log("Returning true: "+bestMatch.toString)
            console.log(faceapi.euclideanDistance(llsfd,llrfd))
            document.getElementById("fnferror").innerHTML = "Face Verified. Processing Vote."
            processTheVote(option_chosen)
            // return true
        } 
        else {
            document.getElementById("fnferror").innerHTML = "Face Doesn't Match with Database"
            // console.log("Returning False")
            // return false
    }} else {
        document.getElementById("fnferror").innerHTML = "Face Not Found"
        // return false
    }

}
}