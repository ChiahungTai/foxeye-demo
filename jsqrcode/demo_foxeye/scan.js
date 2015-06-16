var kaku_make_noice;
var kaku_yuv_to_rgba_demo;

function initASMJS() {
	importScripts("facedetection.js");
	kaku_make_noice = Module.cwrap('kaku_face_detection_demo', 'number', ['number','number', 'number', 'number', 'number', 'number']);
	kaku_yuv_to_rgba_demo = Module.cwrap('kaku_yuv_to_rgba_demo', 'number', ['number','number', 'number', 'number', 'number', 'number', 'number','number', 'number', 'number', 'number']);
}

function read(qrcode) {
    postMessage({"type":"display_qrcode", "qrcode":qrcode});
}

function initQRCode() {
	importScripts("../src/grid.js");
	importScripts("../src/version.js");
	importScripts("../src/detector.js");
	importScripts("../src/formatinf.js");
	importScripts("../src/errorlevel.js");
	importScripts("../src/bitmat.js");
	importScripts("../src/datablock.js");
	importScripts("../src/bmparser.js");
	importScripts("../src/datamask.js");
	importScripts("../src/rsdecoder.js");
	importScripts("../src/gf256poly.js");
	importScripts("../src/gf256.js");
	importScripts("../src/decoder.js");
	importScripts("../src/qrcode.js");
	importScripts("../src/findpat.js");
	importScripts("../src/alignpat.js");
	importScripts("../src/databr.js");

    // init qrcode module
    qrcode.callback = read;
}

var trackid;
onmessage = function(event) {
  if(event.data.type == "set_trackid") {
  	trackid = event.data.id;
  	setTimeout(1000);
  	initASMJS();
  	initQRCode()
  }
}

function clamp(n,low,high) {
  if (n < low) {
  	return(low);
  }
  else if (n > high) {
  	return(high);
  }

  return n;
}

var bitmapFormat;
var bitmapBuffer;
var bitmapBufferOffset;
var bitmapBufferView;
var bitmapBufferLength;
var rgbaBufferLength;
var rgbaASMBufferOffset;
var rgbaASMBufferView;
var ywidth;
var yheight;
var yoffset;
var ystride;
var yskip;
var uwidth;
var uheight;
var uoffset;
var ustride;
var uskip;
var vwidth;
var vheight;
var voffset;
var vstride;
var vskip;
var isInitialized = false;

onvideoprocess = function(event) {
	var bitmap = event.inputImageBitmap;
	var format = bitmap.findOptimalFormat();
	var length = bitmap.mappedDataLength(format);

	if (format != bitmapFormat || length != bitmapBufferLength) {
		bitmapFormat = format;
		bitmapBufferLength = length;

		bitmapBufferOffset = Module._malloc(bitmapBufferLength);
		bitmapBufferView = new Uint8ClampedArray(Module.HEAPU8.buffer, bitmapBufferOffset, bitmapBufferLength);
		console.log("Create YUV buffer.");
	}
	var bitmapPixelLayout = bitmap.mapDataInto(bitmapFormat, Module.HEAPU8.buffer, bitmapBufferOffset, bitmapBufferLength);

	if (!isInitialized) {
		ywidth  = bitmapPixelLayout.channels[0].width;
		yheight = bitmapPixelLayout.channels[0].height;
		yoffset = bitmapPixelLayout.channels[0].offset;
		ystride = bitmapPixelLayout.channels[0].stride;
		yskip   = bitmapPixelLayout.channels[0].skip;
		uwidth  = bitmapPixelLayout.channels[1].width;
		uheight = bitmapPixelLayout.channels[1].height;
		uoffset = bitmapPixelLayout.channels[1].offset;
		ustride = bitmapPixelLayout.channels[1].stride;
		uskip   = bitmapPixelLayout.channels[1].skip;
		vwidth  = bitmapPixelLayout.channels[2].width;
		vheight = bitmapPixelLayout.channels[2].height;
		voffset = bitmapPixelLayout.channels[2].offset;
		vstride = bitmapPixelLayout.channels[2].stride;
		vskip   = bitmapPixelLayout.channels[2].skip;

		rgbaBufferLength = ywidth * yheight * 4;
		rgbaASMBufferOffset = Module._malloc(rgbaBufferLength);
		rgbaASMBufferView = new Uint8ClampedArray(Module.HEAPU8.buffer, rgbaASMBufferOffset, rgbaBufferLength);

		isInitialized = true;
	}

	// convert YUV to RGBA
	kaku_yuv_to_rgba_demo(bitmapBufferOffset, rgbaASMBufferOffset, ywidth, yheight, yoffset, uwidth, uheight, uoffset, vwidth, vheight, voffset);

	// scan QR code
	qrcode.decodeRGBAArrayBuffer(Module.HEAPU8.buffer, rgbaASMBufferOffset, rgbaBufferLength, ywidth, yheight);
	// qrcode.decodeYUVArrayBuffer(Module.HEAPU8.buffer, bitmapBufferOffset, ywidth*yheight, ywidth, yheight);
};
