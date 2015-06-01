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
	console.log("Drop rate = " + 100 * dropNum / frameNum + "%");
}

onvideoprocess = function(event) {
	if (frameNum % 100 == 1) {
		showDropRate();
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
