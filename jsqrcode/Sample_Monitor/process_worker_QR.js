function clamp(n,low,high) {
  if (n < low) {
  	return(low);
  }
  else if (n > high) {
  	return(high);
  }

  return n;
}

function processOneFrame_YUV(bitmap) {

  var bitmapFormat = bitmap.findOptimalFormat();
  var bitmapBufferLength = bitmap.mappedDataLength(bitmapFormat);
  var bitmapBuffer = new ArrayBuffer(bitmapBufferLength);
  var bitmapBufferView = new Uint8ClampedArray(bitmapBuffer, 0, bitmapBufferLength);
  var bitmapPixelLayout = bitmap.mapDataInto(bitmapFormat, bitmapBuffer, 0, bitmapBufferLength);

  var ywidth  = bitmapPixelLayout.channels[0].width;
  var yheight = bitmapPixelLayout.channels[0].height;
  var yoffset = bitmapPixelLayout.channels[0].offset;
  var ystride = bitmapPixelLayout.channels[0].stride;
  var yskip   = bitmapPixelLayout.channels[0].skip;
  var uwidth  = bitmapPixelLayout.channels[1].width;
  var uheight = bitmapPixelLayout.channels[1].height;
  var uoffset = bitmapPixelLayout.channels[1].offset;
  var ustride = bitmapPixelLayout.channels[1].stride;
  var uskip   = bitmapPixelLayout.channels[1].skip;
  var vwidth  = bitmapPixelLayout.channels[2].width;
  var vheight = bitmapPixelLayout.channels[2].height;
  var voffset = bitmapPixelLayout.channels[2].offset;
  var vstride = bitmapPixelLayout.channels[2].stride;
  var vskip   = bitmapPixelLayout.channels[2].skip;

  var rgbaBufferLength = ywidth * yheight * 4;
  var rgbaBuffer = new ArrayBuffer(rgbaBufferLength);
  var rgbaBufferView = new Uint8ClampedArray(rgbaBuffer, 0, rgbaBufferLength);

  for (var i = 0; i < yheight; ++i) {
    for (var j = 0; j < ywidth; ++j) {
      var index = ywidth * i + j;
      var halfi = parseInt(Math.floor(i/2));
      var halfj = parseInt(Math.floor(j/2));
      var y = parseFloat(bitmapBufferView[yoffset + index]);
      var u = parseFloat(bitmapBufferView[uoffset + uwidth * halfi + halfj]);
      var v = parseFloat(bitmapBufferView[voffset + vwidth * halfi + halfj]);

      var r = clamp(Math.floor(y + 1.4075 * (v - 128.0)), 0, 255);
      var g = clamp(Math.floor(y - 0.3455 * (u - 128.0) - (0.7169 * (v - 128.0))), 0, 255);
      var b = clamp(Math.floor(y + 1.7790 * (u - 128.0)), 0, 255);

      rgbaBufferView[index * 4 + 0] = 255 - r;
      rgbaBufferView[index * 4 + 1] = 255 - g;
      rgbaBufferView[index * 4 + 2] = 255 - b;
      rgbaBufferView[index * 4 + 3] = 255;
    }
  }

  // set the processed data back to the input ImageBitmap
  bitmap.setDataFrom("RGBA32", rgbaBuffer, 0, rgbaBufferLength,
                     bitmap.width, bitmap.height, ywidth*4)
}

function read(qrcode) {
  console.log("[Kaku] " + qrcode);
  postMessage({"type":"display_qrcode", "qrcode":qrcode});
}

function error() {
  postMessage({"type":"qrcode_not_found"});
}

function initQRCode() {
	importScripts("../src/grid.js");
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

function processOneFrame_RGBA(bitmap) {

  var bitmapFormat = bitmap.findOptimalFormat();
  // console.log("Original format = " + bitmapFormat);

  // force to take RGBA format data
  // handle the convertion in the Gecko
  bitmapFormat = "RGBA32";

  var bitmapBufferLength = bitmap.mappedDataLength(bitmapFormat);;
  var bitmapBuffer = new ArrayBuffer(bitmapBufferLength);
  var bitmapBufferView = new Uint8ClampedArray(bitmapBuffer, 0, bitmapBufferLength);
  var bitmapPixelLayout = bitmap.mapDataInto(bitmapFormat, bitmapBuffer, 0, bitmapBufferLength);

  try {
    qrcode.decodeRGBAArrayBuffer(bitmapBuffer, 0, bitmapBufferLength, bitmap.width, bitmap.height);
  } catch(e) {
    console.error(e, e.stack);
    error();
  }
}

onmessage = function(event) {

  if (event.data.type == "init_jsqrcode") {
    console.log("init_jsqrcode");
    initQRCode();
  } else if (event.data.type == "process_one_frame") {
    console.log("haha~");
  	// do the invernt effect
    // processOneFrame_YUV(event.data.bitmap);
    processOneFrame_RGBA(event.data.bitmap);
  }
};
