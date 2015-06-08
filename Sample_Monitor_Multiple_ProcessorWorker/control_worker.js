importScripts("worker_pool.js");
var numOfWorkers = 2;	// initialize the WorkerPool whit this number of workers.
var workerPool;
var trackid;
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

onmessage = function(event) {
	if (event.data.type == "init_process_worker") {
    workerPool = new WorkerPool();
    workerPool.Init("process_worker.js", numOfWorkers);
	} else if (event.data.type == "set_trackid") {
		trackid = event.data.id;
	}
}

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

  if (!workerPool.Process(frameNum++, event.inputImageBitmap)) {
		dropNum++;
	}
};
