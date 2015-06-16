var trackid;
var worker;
var isProcessing = false;
var processWorker;
onmessage = function(event) {
	if (event.data.type == "init_process_worker") {

		console.log("event.data.function = " + event.data.function);

		if (event.data.function == "face") {
			processWorker = new Worker("process_worker_face.js");
		} else if (event.data.function == "qrcode") {
			processWorker = new Worker("process_worker_QR.js");
		}

		processWorker.postMessage({"type":"init"});

		processWorker.onmessage = function(event) {
			if (event.data.type == "display_imagebitmap") {
				// send back to the main thread
				postMessage({"type":event.data.type,
										 "bitmap":event.data.bitmap});
				isProcessing = false;
			} else if (event.data.type == "display_arraybuffer") {
				postMessage({"type":event.data.type,
										 "buffer":event.data.buffer,
										 "length":event.data.length,
										 "width":event.data.width,
										 "height":event.data.height},
										[event.data.buffer]);
				isProcessing = false;
			} else if (event.data.type == "display_qrcode") {
				// send back to the main thread
				postMessage({"type":event.data.type,
										 "qrcode":event.data.qrcode});
				isProcessing = false;
			} else if (event.data.type == "operation_finished_without_result") {
				isProcessing = false;
			}
		};
	} else if (event.data.type == "set_trackid") {
		trackid = event.data.id;
	}
}

var frameNum = 0;
var dropNum = 0;

function showDropRate() {
	var dropRate = 100 * dropNum / frameNum + "%";
	console.log("Drop rate = " + dropRate);
	postMessage({"type":"display_dropRateInfo",
							 "dropRate":dropRate});
}

function showFPS() {
	var fps = 1000.0 * (frameNum - dropNum) / (currentTime - veryStartTime);
	console.log("FPS = " + fps);
	postMessage({"type":"display_fpsinfo",
							 "fps":fps});
}

var isVeryStartTimeInitialized = false;
var veryStartTime;
var previousTime;
var currentTime;

onvideoprocess = function(event) {

	currentTime = new Date().getTime();

	if (!isVeryStartTimeInitialized) {
		veryStartTime = currentTime;
		isVeryStartTimeInitialized = true;
	}

	if (frameNum % 100 == 1) {
		showDropRate();
		showFPS();
	}

	frameNum++;
	if (isProcessing) {
		// drop this frame
		// console.log("drop frame[" + frameNum + "]");
		dropNum++;
		return;
	} else {
		// console.log("process frame[" + frameNum + "]")
		isProcessing = true;
		// send to the process worker
		processWorker.postMessage({"type":"process_one_frame",
  														 "bitmap":event.inputImageBitmap});
	}
};
