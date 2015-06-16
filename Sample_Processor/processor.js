importScripts("../LibOpenCV/opencv.js");

var trackid;
onmessage = function(event) {
  if(event.data.type == "set_trackid") {
  	trackid = event.data.id;
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
var rgbaBuffer;
var rgbaBufferLength;
var rgbaBufferView;
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

function processOneFrame_OnlyCopy(inputBitmap, outputBitmap) {
	var bitmap = inputBitmap;
	var format = bitmap.findOptimalFormat();
  format = "RGBA32"; // force it to be RGBA32, do conversion in Gecko
	var length = bitmap.mappedDataLength(format);

	if (format != bitmapFormat || length != bitmapBufferLength) {
		bitmapFormat = format;
		bitmapBufferLength = length;
		bitmapBuffer = new ArrayBuffer(bitmapBufferLength);
		bitmapBufferView = new Uint8ClampedArray(bitmapBuffer, 0, bitmapBufferLength);
	}
	var bitmapPixelLayout = bitmap.mapDataInto(bitmapFormat, bitmapBuffer, 0, bitmapBufferLength);

	// write back to event outputImageBitmap
	outputBitmap.setDataFrom("RGBA32", bitmapBuffer, 0, bitmapBufferLength,
                           bitmap.width, bitmap.height, bitmapPixelLayout.channels[0].stride);
}

function processOneFrame_Invert(inputBitmap, outputBitmap) {
	var bitmap = inputBitmap;
	var format = bitmap.findOptimalFormat();
  format = "RGBA32"; // force it to be RGBA32, do conversion in Gecko
	var length = bitmap.mappedDataLength(format);

	if (format != bitmapFormat || length != bitmapBufferLength) {
		bitmapFormat = format;
		bitmapBufferLength = length;
		bitmapBuffer = new ArrayBuffer(bitmapBufferLength);
		bitmapBufferView = new Uint8ClampedArray(bitmapBuffer, 0, bitmapBufferLength);
	}
	var bitmapPixelLayout = bitmap.mapDataInto(bitmapFormat, bitmapBuffer, 0, bitmapBufferLength);

	if (!isInitialized) {
		rgbaBufferLength = bitmapBufferLength;
		rgbaBuffer = new ArrayBuffer(rgbaBufferLength);
		rgbaBufferView = new Uint8ClampedArray(rgbaBuffer, 0, rgbaBufferLength);

		isInitialized = true;
	}

	// convert YUV to Gray or RGBA
	for (var i = 0; i < bitmap.height; ++i) {
		for (var j = 0; j < bitmap.width; ++j) {

      /*
       *  do invert effect
       */
			var index = bitmap.width * i + j;
			rgbaBufferView[index * 4 + 0] = 255 - bitmapBufferView[index * 4 + 0];
			rgbaBufferView[index * 4 + 1] = 255 - bitmapBufferView[index * 4 + 1];
			rgbaBufferView[index * 4 + 2] = 255 - bitmapBufferView[index * 4 + 2];
			rgbaBufferView[index * 4 + 3] = bitmapBufferView[index * 4 + 3]; // no change in the appha channel
		}
	}

	// write back to event outputImageBitmap
	outputBitmap.setDataFrom("RGBA32", rgbaBuffer, 0, rgbaBufferLength,
                           bitmap.width, bitmap.height, bitmapPixelLayout.channels[0].stride);
}

function processOneFrame_YUV2Gray(inputBitmap, outputBitmap) {
	var bitmap = inputBitmap;
	var format = bitmap.findOptimalFormat();
	var length = bitmap.mappedDataLength(format);

	if (format != bitmapFormat || length != bitmapBufferLength) {
		bitmapFormat = format;
		bitmapBufferLength = length;
		bitmapBuffer = new ArrayBuffer(bitmapBufferLength);
		bitmapBufferView = new Uint8ClampedArray(bitmapBuffer, 0, bitmapBufferLength);
	}
	var bitmapPixelLayout = bitmap.mapDataInto(bitmapFormat, bitmapBuffer, 0, bitmapBufferLength);

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
		rgbaBuffer = new ArrayBuffer(rgbaBufferLength);
		rgbaBufferView = new Uint8ClampedArray(rgbaBuffer, 0, rgbaBufferLength);

		isInitialized = true;
	}

	// convert YUV to Gray or RGBA
	for (var i = 0; i < yheight; ++i) {
		for (var j = 0; j < ywidth; ++j) {

      /*
       *  Convert to Gray, this is faster for demo
       */
			var index = ywidth * i + j;
			var y = parseFloat(bitmapBufferView[yoffset + index]);
			rgbaBufferView[index * 4 + 0] = y;
			rgbaBufferView[index * 4 + 1] = y;
			rgbaBufferView[index * 4 + 2] = y;
			rgbaBufferView[index * 4 + 3] = 255;

      /*
       *  Convert to RGBA, this javascript implementation is too slow.
       *  A emscripten verison is fast enough for demo.
       */
			// var index = ywidth * i + j;
			// var halfi = parseInt(Math.floor(i/2));
			// var halfj = parseInt(Math.floor(j/2));
			// var y = parseFloat(bitmapBufferView[yoffset + index]);
			// var u = parseFloat(bitmapBufferView[uoffset + uwidth * halfi + halfj]);
			// var v = parseFloat(bitmapBufferView[voffset + vwidth * halfi + halfj]);
      //
			// var r = clamp(Math.floor(y + 1.4075 * (v - 128.0)), 0, 255);
			// var g = clamp(Math.floor(y - 0.3455 * (u - 128.0) - (0.7169 * (v - 128.0))), 0, 255);
			// var b = clamp(Math.floor(y + 1.7790 * (u - 128.0)), 0, 255);
      //
			// rgbaBufferView[index * 4 + 0] = r;
			// rgbaBufferView[index * 4 + 1] = g;
			// rgbaBufferView[index * 4 + 2] = b;
			// rgbaBufferView[index * 4 + 3] = 255;
		}
	}

	// write back to event outputImageBitmap
	outputBitmap.setDataFrom("RGBA32", rgbaBuffer, 0, rgbaBufferLength, ywidth, yheight, ystride*4);
}

function createMat() {

}

var kernel = 5;
var soruce;
var dest;
var element;

function processOneFrame_OpenCV_Erode(inputBitmap, outputBitmap) {
  var bitmap = inputBitmap;
  var format = bitmap.findOptimalFormat();
  format = "RGBA32"; // force it to be RGBA32, do conversion in Gecko
  var length = bitmap.mappedDataLength(format);

  if (format != bitmapFormat || length != bitmapBufferLength) {
    bitmapFormat = format;
    bitmapBufferLength = length;
    bitmapBuffer = new ArrayBuffer(bitmapBufferLength);
    bitmapBufferView = new Uint8ClampedArray(bitmapBuffer, 0, bitmapBufferLength);

    source = new Module.Mat(bitmap.height, bitmap.width, Module.CV_8UC4);
    element = Module.getStructuringElement(0,
                                           [kernel, kernel],
                                           [(kernel - 1) / 2, (kernel - 1) / 2]);
    dest = new Module.Mat();
  }

  // write data into the mat.
  // actually, write data into ASM.JS heap
  var bitmapPixelLayout = bitmap.mapDataInto(bitmapFormat, Module.HEAPU8.buffer, source.data, bitmapBufferLength);

  // Algorithm
  var begin = performance.now();
  Module.erode(source, dest, element);
  // Module.dilate(source, dest, element);
  // Module.blur(source, dest, [kernel, kernel], [-1,-1], Module.BORDER_DEFAULT);
  // Module.GaussianBlur(source, dest, [kernel, kernel], 0, 0, Module.BORDER_DEFAULT);
  // Module.medianBlur(source, dest, kernel);
  var duration = performance.now() - begin;
  console.log("duration = " + duration);

  // write back to event outputImageBitmap
  outputBitmap.setDataFrom("RGBA32", Module.HEAPU8.buffer, dest.data, bitmapBufferLength,
                           bitmap.width, bitmap.height, bitmapPixelLayout.channels[0].stride);

  // // release resource
  // dest.delete();
  // element.delete();
  // source.delete();
}

onvideoprocess = function(event) {
  processOneFrame_OpenCV_Erode(event.inputImageBitmap, event.outputImageBitmap);
  // processOneFrame_OnlyCopy(event.inputImageBitmap, event.outputImageBitmap);
  // processOneFrame_Invert(event.inputImageBitmap, event.outputImageBitmap);
  // processOneFrame_YUV2Gray(event.inputImageBitmap, event.outputImageBitmap);
}
