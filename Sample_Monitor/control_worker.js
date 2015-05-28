var trackid;
var worker;
var isProcessing = false;
var processWorker;
onmessage = function(event) {
	if (event.data.type == "init_process_worker") {
		processWorker = new Worker("process_worker.js");

		processWorker.onmessage = function(event) {
			if (event.data.type == "display_arraybuffer") {
				// send back to the main thread
				postMessage({"type":event.data.type,
										 "buffer":event.data.buffer,
										 "bufferLength":event.data.bufferLength,
										 "imageWidth":event.data.imageWidth,
										 "imageHeight":event.data.imageHeight},
										[event.data.buffer]);
				isProcessing = false;
			}
		};
	} else if (event.data.type == "set_trackid") {
		trackid = event.data.id;
	}
}

onvideoprocess = function(event) {
	if (isProcessing) {
		// drop this frame
		return;
	} else {
		isProcessing = true;
		var bitmap = event.inputImageBitmap;
		var bitmapFormat = bitmap.findOptimalFormat();;
		var bitmapBufferLength = bitmap.mappedDataLength(bitmapFormat);;
		var bitmapBuffer = new ArrayBuffer(bitmapBufferLength);
		var bitmapPixelLayout = bitmap.mapDataInto(bitmapFormat, bitmapBuffer, 0, bitmapBufferLength);
		// send to the process worker
		processWorker.postMessage({"type":"convert_color",
  														 "ywidth":bitmapPixelLayout.channels[0].width,
															 "yheight":bitmapPixelLayout.channels[0].height,
															 "yoffset":bitmapPixelLayout.channels[0].offset,
															 "ystride":bitmapPixelLayout.channels[0].stride,
															 "yskip":bitmapPixelLayout.channels[0].skip,
															 "uwidth":bitmapPixelLayout.channels[1].width,
															 "uheight":bitmapPixelLayout.channels[1].height,
															 "uoffset":bitmapPixelLayout.channels[1].offset,
															 "ustride":bitmapPixelLayout.channels[1].stride,
															 "uskip":bitmapPixelLayout.channels[1].skip,
															 "vwidth":bitmapPixelLayout.channels[2].width,
															 "vheight":bitmapPixelLayout.channels[2].height,
															 "voffset":bitmapPixelLayout.channels[2].offset,
															 "vstride":bitmapPixelLayout.channels[2].stride,
															 "vskip":bitmapPixelLayout.channels[2].skip,
															 "imageWidth":bitmap.width,
															 "imageHeight":bitmap.height,
															 "bitmapBuffer":bitmapBuffer,
															 "bitmapBufferLength":bitmapBufferLength},
															[bitmapBuffer]);
	}
};
