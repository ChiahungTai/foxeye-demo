var degree = 0;
var numOfCircles = 3;
var delta = 2;
var animationStartTime;
var updateCount = 0;
var updateFPSRate = 30;
var resetFPSRate = 3 * updateFPSRate;

function initAnimation(ctx, canvas) {
  resetFPS();
  ctx.width = 300;
  ctx.height = 300;
  requestAnimationFrame(function() {animate(ctx, canvas);});
}

function resetFPS() {
  animationStartTime = new Date().getTime();
  updateCount = 0;
}

function rotateAt(ctx, degree, x, y) {
  ctx.translate(x, y);
  ctx.rotate(degree * Math.PI / 180);
  ctx.translate(-x, -y);
}

function drawCircle(ctx, centerX, centerY, radius, color) {
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
}

function animate(ctx, canvas) {
  // calculate FPS
  updateCount += 1;
  if ((updateCount % updateFPSRate) == (updateFPSRate-1)) {
    showAnimationFPS(canvas);
  }

  if ((updateCount % resetFPSRate) == (resetFPSRate-1)) {
    console.log("reset...");
    resetFPS();
  }

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (var i = 0; i < numOfCircles; ++i) {
    rotateAt(ctx, degree + (i*360/numOfCircles), ctx.canvas.width/2, ctx.canvas.height/2);
    var alpha = ((i+1)*1.0/(numOfCircles+1));
    var color = 'rgba(193, 56, 50, ' + alpha + ')';
    drawCircle(ctx, 100, 100, 10, color);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  degree += delta;
  requestAnimationFrame(function() {animate(ctx, canvas);});
  // setTimeout(animate, 10);
}

function getAnimationFPS() {
  var currentTime = new Date().getTime();
  var fps = 1000.0 * (updateCount) / (currentTime - animationStartTime);
  return fps;
}

function showAnimationFPS(canvas) {
  canvas.textContent = "Animation FPS = " + getAnimationFPS();
}
