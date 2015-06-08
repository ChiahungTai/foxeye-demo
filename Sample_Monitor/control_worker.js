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
										 "bitmap":event.data.bitmap});
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

	if (frameNum % 30 == 1) {
		showDropRate();
		showFPS();
	}

	frameNum++;
	if (isProcessing) {
		// drop this frame
		console.log("drop frame[" + frameNum + "]");
		dropNum++;
		return;
	} else {
		// console.log("process frame[" + frameNum + "]")
		isProcessing = true;
		// send to the process worker
		processWorker.postMessage({"type":"convert_color",
  														 "bitmap":event.inputImageBitmap});
	}
};
