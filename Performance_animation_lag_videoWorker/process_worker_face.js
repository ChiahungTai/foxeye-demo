var detect_face_and_draw;
var bitmapBufferOffset;
var minFaceWidth;
var minFaceHeight;
var scaleFactor;

var isASMInitialized = false;

function initializeASM(imageWidth, imageHeight, bitmapBufferLength) {

  bitmapBufferOffset = Module._malloc(bitmapBufferLength);
  minFaceWidth  = Math.min(imageWidth, imageHeight) / 4;
  minFaceHeight = Math.min(imageWidth, imageHeight) / 4;
  scaleFactor = 1.1;

  isASMInitialized = true;
}

function initFace() {
  importScripts("facedetection.js");
  detect_face_and_draw = Module.cwrap('kaku_face_detection_demo', 'number', ['number','number', 'number', 'number', 'number', 'number']);
}

function processOneFrame_RGBA(bitmap) {

  // force to take RGBA format data
  // handle the convertion in the Gecko
  var bitmapFormat = "RGBA32";
  var bitmapBufferLength = bitmap.mappedDataLength(bitmapFormat);;

  if (!isASMInitialized) {
    initializeASM(bitmap.width, bitmap.height, bitmapBufferLength);
  }

  var bitmapPixelLayout = bitmap.mapDataInto(bitmapFormat, Module.HEAPU8.buffer, bitmapBufferOffset, bitmapBufferLength);

  try {
    detect_face_and_draw(bitmapBufferOffset, bitmap.width, bitmap.height, scaleFactor, minFaceWidth, minFaceHeight);
  } catch(e) {
    console.log(e, e.stack);
    postMessage({"type":"operation_finished_without_result"});
  }

  // set the result back to the ImageBitmap
  bitmap.setDataFrom("RGBA32", Module.HEAPU8.buffer, bitmapBufferOffset, bitmapBufferLength,
                     bitmap.width, bitmap.height, bitmapPixelLayout.channels[0].stride);

  postMessage({"type":"display_imagebitmap",
               "bitmap":bitmap});
}

onmessage = function(event) {

  if (event.data.type == "init") {
    console.log("init_face");
    initFace();
  } else if (event.data.type == "process_one_frame") {
    processOneFrame_RGBA(event.data.bitmap);
  }
};
