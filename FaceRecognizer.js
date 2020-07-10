/*** Load the FaceAPI -- npm install  */
const faceapi = require('face-api.js')
const fetch = require('node-fetch')
const path = require('path');
const canvas = require('canvas');
const tf = require('@tensorflow/tfjs-node');
faceapi.env.monkeyPatch({fetch:fetch})
const MODELS_URL = path.join(__dirname,'/models')
/*** Load The Models */
Promise.all([
    faceapi.loadFaceExpressionModel(MODELS_URL),
    faceapi.loadSsdMobilenetv1Model(MODELS_URL),
    faceapi.loadFaceDetectionModel(MODELS_URL)

])

 
/**
 * Initiate the Face Recognition Process
 *
 * @param {HTMLImageElement} mainImage Image in which face-recognition will be done
 * @param {HTMLImageElement} referenceImage Image from which the FaceMatch data will be fetched
 */
async function initiateFaceRecognition(mainImage,referenceImage) {
// Detecting all faces and storing the face descriptors
var main_descriptors = await faceapi.detectAllFaces(mainImage).withFaceLandmarks().withFaceDescriptors()
// Detecting the single face from reference image and storing the face descriptors
var ref_descriptors = await faceapi.detectSingleFace(referenceImage).withFaceLandmarks().withFaceDescriptors()
// Create a Face Matcher Object from Referenced Descriptors
var faceMatcher = new faceapi.FaceMatcher(ref_descriptors,0.5)
// Find out the best match
if (main_descriptors) {
    var bestMatch = faceMatcher.findBestMatch(main_descriptors.descriptor)
    console.log(bestMatch.toString())
}
}
exports.start = initiateFaceRecognition
