importScripts("worker_pool.js");
var workerPool;
var trackid;
var frameNum = 0;

onmessage = function(event) {
	if (event.data.type == "init_process_worker") {
    workerPool = new WorkerPool();
    workerPool.Init("process_worker.js", 1);
	} else if (event.data.type == "set_trackid") {
		trackid = event.data.id;
	}
}

onvideoprocess = function(event) {
  workerPool.Process(frameNum++, event.inputImageBitmap);
};
