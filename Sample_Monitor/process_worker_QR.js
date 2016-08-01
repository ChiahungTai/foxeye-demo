function read(qrcode) {
  postMessage({"type":"display_qrcode", "qrcode":qrcode});
}

function error(e) {
  // console.error(e, e.stack);
  postMessage({"type":"operation_finished_without_result"});
}

function initQRCode() {
	importScripts("../jsqrcode/src/grid.js");
  importScripts("../jsqrcode/src/version.js");
	importScripts("../jsqrcode/src/detector.js");
	importScripts("../jsqrcode/src/formatinf.js");
	importScripts("../jsqrcode/src/errorlevel.js");
	importScripts("../jsqrcode/src/bitmat.js");
	importScripts("../jsqrcode/src/datablock.js");
	importScripts("../jsqrcode/src/bmparser.js");
	importScripts("../jsqrcode/src/datamask.js");
	importScripts("../jsqrcode/src/rsdecoder.js");
	importScripts("../jsqrcode/src/gf256poly.js");
	importScripts("../jsqrcode/src/gf256.js");
	importScripts("../jsqrcode/src/decoder.js");
	importScripts("../jsqrcode/src/qrcode.js");
	importScripts("../jsqrcode/src/findpat.js");
	importScripts("../jsqrcode/src/alignpat.js");
	importScripts("../jsqrcode/src/databr.js");

  // init qrcode module
  qrcode.callback = read;
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
  var promise = bitmap.mapDataInto(bitmapFormat, bitmapBuffer, 0, bitmapBufferLength);
  promise.then(function(bitmapPixelLayout){
	try {
	  qrcode.decodeRGBAArrayBuffer(bitmapBuffer, 0, bitmapBufferLength, bitmap.width, bitmap.height);
	} catch(e) {
	  error(e);
    }  
  });	
}

onmessage = function(event) {

  if (event.data.type == "init") {
    console.log("init_jsqrcode");
    initQRCode();
  } else if (event.data.type == "process_one_frame") {
  	// do the invernt effect
    // processOneFrame_YUV(event.data.bitmap);
    processOneFrame_RGBA(event.data.bitmap);
  }
};
