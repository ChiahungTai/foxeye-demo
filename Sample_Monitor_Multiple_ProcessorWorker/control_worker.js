importScripts("worker_pool.js");
var numOfWorkers = 2;	// initialize the WorkerPool whit this number of workers.
var workerPool;
var trackid;
var frameNum = 0;
var dropNum = 0;

function showDropRate() {
	console.log("Drop rate = " + 100 * dropNum / frameNum + "%");
}


onmessage = function(event) {
	if (event.data.type == "init_process_worker") {
    workerPool = new WorkerPool();
    workerPool.Init("process_worker.js", numOfWorkers);
	} else if (event.data.type == "set_trackid") {
		trackid = event.data.id;
	}
}

onvideoprocess = function(event) {
	if (frameNum % 100 == 1) {
		showDropRate();
	}

  if (!workerPool.Process(frameNum++, event.inputImageBitmap)) {
		dropNum++;
	}
};
