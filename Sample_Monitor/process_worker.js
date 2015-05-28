function clamp(n,low,high) {
  if (n < low) {
  	return(low);
  }
  else if (n > high) {
  	return(high);
  }

  return n;
}

onmessage = function(event) {
	// convert YUV to RGBA and then invernt in the RGB color space
	var bitmapBuffer = event.data.bitmapBuffer;
	var bitmapBufferLength = event.data.bitmapBufferLength;
	var bitmapBufferView = new Uint8ClampedArray(bitmapBuffer, 0, bitmapBufferLength);

	var ywidth  = event.data.ywidth;
	var yheight = event.data.yheight;
	var yoffset = event.data.yoffset;
	var ystride = event.data.ystride;
	var yskip   = event.data.yskip;
	var uwidth  = event.data.uwidth;
	var uheight = event.data.uheight;
	var uoffset = event.data.uoffset;
	var ustride = event.data.ustride;
	var uskip   = event.data.uskip;
	var vwidth  = event.data.vwidth;
	var vheight = event.data.vheight;
	var voffset = event.data.voffset;
	var vstride = event.data.vstride;
	var vskip   = event.data.vskip;

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

	// send back to the control worker
	postMessage({"type":"display_arraybuffer",
      				 "buffer":rgbaBuffer,
      				 "bufferLength":rgbaBufferLength,
      				 "imageWidth":event.data.imageWidth,
      				 "imageHeight":event.data.imageHeight},
				      [rgbaBuffer]);
};
