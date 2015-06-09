var detect_face_and_draw;
var bitmapBufferOffset;
var temp1;
var resultImageData;
var minFaceWidth;
var minFaceHeight;
var scaleFactor;

var isASMInitialized = false;

function initializeASM(imageWidth, imageHeight, bitmapBufferLength) {

  bitmapBufferOffset = Module._malloc(bitmapBufferLength);
  temp1 = new Uint8ClampedArray(Module.HEAPU8.buffer, bitmapBufferOffset, bitmapBufferLength);
  resultImageData = new ImageData(temp1, imageWidth, imageHeight);

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

  var bitmapFormat = bitmap.findOptimalFormat();
  // console.log("Original format = " + bitmapFormat);

  // force to take RGBA format data
  // handle the convertion in the Gecko
  bitmapFormat = "RGBA32";

  var bitmapBufferLength = bitmap.mappedDataLength(bitmapFormat);;
  var bitmapBuffer = new ArrayBuffer(bitmapBufferLength);
  var bitmapBufferView = new Uint8ClampedArray(bitmapBuffer, 0, bitmapBufferLength);

  if (!isASMInitialized) {
    initializeASM(bitmap.width, bitmap.height, bitmapBufferLength);
  }


  // var bitmapPixelLayout = bitmap.mapDataInto(bitmapFormat, bitmapBuffer, 0, bitmapBufferLength);
  var bitmapPixelLayout = bitmap.mapDataInto(bitmapFormat, Module.HEAPU8.buffer, bitmapBufferOffset, bitmapBufferLength);

  try {
    detect_face_and_draw(bitmapBufferOffset, bitmap.width, bitmap.height, scaleFactor, minFaceWidth, minFaceHeight);
  } catch(e) {
    console.log(e, e.stack);
  }

  bitmapBufferView.set(temp1, 0);


  postMessage({"type":"display_arraybuffer",
               "buffer":bitmapBuffer,
               "length":bitmapBufferLength,
               "width":bitmap.width,
               "height":bitmap.height},
              [bitmapBuffer]);

  // postMessage({"type":"operation_finished_without_result"});
}

onmessage = function(event) {

  if (event.data.type == "init") {
    console.log("init_face");
    initFace();
  } else if (event.data.type == "process_one_frame") {
    processOneFrame_RGBA(event.data.bitmap);
  }
};
