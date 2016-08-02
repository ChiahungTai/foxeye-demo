// var Module;
var Module = {
  onRuntimeInitialized: function() {
    console.log("onRuntimeInitialized() !!!");

    detect_face_and_draw = Module.cwrap('kaku_face_detection_demo', 'number', ['number','number', 'number', 'number', 'number', 'number']);
    detect_face_getX = Module.cwrap('kaku_face_detection_get_faceX', 'number', []);
    detect_face_getY = Module.cwrap('kaku_face_detection_get_faceY', 'number', []);
    detect_face_getW = Module.cwrap('kaku_face_detection_get_faceW', 'number', []);
    detect_face_getH = Module.cwrap('kaku_face_detection_get_faceH', 'number', []);

    isASMRuntimeInitialized = true;
  }
};

var detect_face_and_draw;
var detect_face_getX;
var detect_face_getY;
var detect_face_getW;
var detect_face_getH;
var bitmapBufferOffset;
var minFaceWidth;
var minFaceHeight;
var scaleFactor;

var isFaceModuleInitialized = false;
var isASMRuntimeInitialized = false;

function initFaceModule(imageWidth, imageHeight, bitmapBufferLength) {
  bitmapBufferOffset = Module._malloc(bitmapBufferLength);
  minFaceWidth  = Math.min(imageWidth, imageHeight) / 4;
  minFaceHeight = Math.min(imageWidth, imageHeight) / 4;
  scaleFactor = 1.1;

  isFaceModuleInitialized = true;
}

function initializeASM() {
  importScripts("facedetection.js");
}

function processOneFrame_RGBA(bitmap) {
  if (!isASMRuntimeInitialized) {
    postMessage({"type":"operation_finished_without_result"});
    return;
  }
	console.log("processOneFrame_RGBA.\n");

  // force to take RGBA format data
  // handle the convertion in the Gecko
  var bitmapFormat = "RGBA32";
  var bitmapBufferLength = bitmap.mappedDataLength(bitmapFormat);;

  if (!isFaceModuleInitialized) {
    initFaceModule(bitmap.width, bitmap.height, bitmapBufferLength);
  }
  
  // Map the bitmap's data into the buffer created in the previous step.
  var promise = bitmap.mapDataInto(bitmapFormat, Module.HEAPU8.buffer, bitmapBufferOffset, bitmapBufferLength);
  promise.then(function(bitmapPixelLayout) {
	console.log("mapDataInto success!");
    try {
   	  detect_face_and_draw(bitmapBufferOffset, bitmap.width, bitmap.height, scaleFactor, minFaceWidth, minFaceHeight);
	} catch(e) {
  	  console.log(e, e.stack);
	  postMessage({"type":"operation_finished_without_result"});
	}
  // set the result back to the ImageBitmap
// 	  bitmap.setDataFrom("RGBA32", Module.HEAPU8.buffer, bitmapBufferOffset, bitmapBufferLength,
// 						 bitmap.width, bitmap.height, bitmapPixelLayout.channels[0].stride);
// 
	postMessage({"type":"display_face",
	   	         "bitmap":bitmap,
				 "x":detect_face_getX(),
				 "y":detect_face_getY(),
				 "w":detect_face_getW(),
				 "h":detect_face_getH()});
               
  });
}

onmessage = function(event) {

  if (event.data.type == "init") {
    console.log("init_face");
    initializeASM();
  } else if (event.data.type == "process_one_frame") {
    processOneFrame_RGBA(event.data.bitmap);
  }
};
