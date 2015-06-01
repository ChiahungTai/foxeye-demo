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

  var bitmapFormat = bitmap.findOptimalFormat();;
  var bitmapBufferLength = bitmap.mappedDataLength(bitmapFormat);;
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


  // convert YUV to RGBA and then invernt in the RGB color space

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

  bitmap.setDataFrom("RGBA32", rgbaBuffer, 0, rgbaBufferLength,
                     bitmap.width, bitmap.height, ywidth*4)
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

  for (var i = 0; i < bitmap.height; ++i) {
    for (var j = 0; j < bitmap.width; ++j) {
      var index = bitmap.width * i + j;
      var r = bitmapBufferView[index * 4 + 0];
      var g = bitmapBufferView[index * 4 + 1];
      var b = bitmapBufferView[index * 4 + 2];

      bitmapBufferView[index * 4 + 0] = 255 - r;
      bitmapBufferView[index * 4 + 1] = 255 - g;
      bitmapBufferView[index * 4 + 2] = 255 - b;
      // bitmapBufferView[index * 4 + 3] = 255;
    }
  }

  // set the processed data back to the input ImageBitmap
  bitmap.setDataFrom("RGBA32", bitmapBuffer, 0, bitmapBufferLength,
                     bitmap.width, bitmap.height, bitmapPixelLayout.channels[0].stride);
}


onmessage = function(event) {
  // do process
  // processOneFrame_YUV(event.data.bitmap);
  processOneFrame_RGBA(event.data.bitmap)

  // send back to the control worker
  postMessage({"type":"display_arraybuffer",
               "frameNum":event.data.frameNum,
      				 "bitmap":event.data.bitmap});
}
