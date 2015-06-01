/*
 * WorkerPool
 */
function WorkerPool() {
  this.avaialableQueue = [];
  this.workingQueue = [];
}

WorkerPool.prototype.Init = function(script, numOfWorkers) {
  for (var i = 0; i < numOfWorkers; ++i) {
    this.avaialableQueue.push(new ProcessWorker(i, script, this));
  }
}

WorkerPool.prototype.Process = function(frameNum, bitmap) {
  var task = new ProcessTask(frameNum, bitmap);
  return this.Dispatch(task);
}

WorkerPool.prototype.Dispatch = function(task) {
  if (task.taskType == ProcessTask.TASK_TYPE) {
    if (this.avaialableQueue.length > 0) {
      var processWorker = this.avaialableQueue.shift();
      processWorker.worker.postMessage(task);
      this.workingQueue.push(processWorker);
      return true;
    }
    else {
      console.log("No availabe ProcessWorker now, drop this frame[" + task.frameNum + "]......");
      return false;
    }
  } else {
    console.log("Cannot handle " + task.taskType);
    return false;
  }
}

WorkerPool.prototype.Display = function() {
  while(this.workingQueue.length > 0) {
    if (!!(this.workingQueue[0].displayTask)) {
      var processWorker = this.workingQueue.shift();
      postMessage(processWorker.displayTask);
      processWorker.displayTask = null;
      this.avaialableQueue.push(processWorker);
    } else {
      break;
    }
  }
}

WorkerPool.prototype.FindProcessWorker = function(worker) {
  for (var i = 0; i < this.workingQueue.length; ++i) {
    if (this.workingQueue[i].worker == worker) {
      return this.workingQueue[i];
    }
  }
}

/*
 * ProcessWorker
 */
function ProcessWorker(id, script, pool) {
  this.workerID = id;
  this.workerPool = pool
  this.displayTask = null;
  this.worker = new Worker(script);
  this.worker.wraper = this;
  this.worker.onmessage = function(event) {
    var processWorker = workerPool.FindProcessWorker(this);
    processWorker.displayTask = new DisplayTask(event.data.frameNum, event.data.bitmap);
    workerPool.Display();
    // workerPool.PrintInfo("in worker.onmessage()");
  }
}

/*
 * Task, ProcessTask, DisplayTask
 */
function Task(type, frameNum) {
  this.taskType = type;
  this.frameNum = frameNum;
}

function ProcessTask(frameNum, bitmap) {
  Task.call(this, ProcessTask.TASK_TYPE, frameNum);
  this.bitmap = bitmap;
}
ProcessTask.prototype = Object.create(Task.prototype);
ProcessTask.prototype.constructor = ProcessTask;
ProcessTask.TASK_TYPE = "ProcessTask";

function DisplayTask(frameNum, bitmap) {
  Task.call(this, DisplayTask.TASK_TYPE, frameNum);
  this.bitmap = bitmap;
}
DisplayTask.prototype = Object.create(Task.prototype);
DisplayTask.prototype.constructor = DisplayTask;
DisplayTask.TASK_TYPE = "DisplayTask";
