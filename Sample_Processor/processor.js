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

function processOneFrame(inputBitmap, outputBitmap) {
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
	for (var i = 0; i < yheight; i+=1) {
		for (var j = 0; j < ywidth; j+=1) {

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

onvideoprocess = function(event) {
	processOneFrame(event.inputImageBitmap, event.outputImageBitmap);
}
