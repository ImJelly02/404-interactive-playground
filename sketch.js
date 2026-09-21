// This project includes code adapted from P_2_3_3_01 from
// Generative Gestaltung - Creative Coding im Web.
// Original authors: Benedikt Gross, Hartmut Bohnacker, Julia Laub,
// Claudius Lazzeroni, with contributions by Joey Lee and Niels Poldervaart.
// Original source: https://www.generative-gestaltung.de
// License: Apache License 2.0

'use strict';

var playground = document.querySelector('.canvas-container');

var x = 0;
var y = 0;
var stepSize = 5.0;

var font = 'Georgia';
var letters = 'The page is somewhere down here. Please check the URL and try again. This page has left the document flow. position: absolute lost.';
var fontSizeMin = 3;

var counter = 0;
var drawnLetters = [];
var drawingCanvas;
var activeTouchId = null;
var touchPoint = null;
var ignoreMouseUntil = 0;

function setup() {
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
  var sketchCanvas = createCanvas(playground.clientWidth, playground.clientHeight);
  drawingCanvas = sketchCanvas.elt;
  sketchCanvas.parent(playground);
  sketchCanvas.addClass('playground-canvas');
  clear();
  cursor(CROSS);

  x = mouseX;
  y = mouseY;

  textFont(font);
  textAlign(LEFT);
  setDrawingColor();
  window.addEventListener('themechange', redrawLetters);
  drawingCanvas.addEventListener('touchcancel', cancelTouchStroke);
  window.addEventListener('blur', cancelTouchStroke);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) cancelTouchStroke();
  });
}

function draw() {
  if (activeTouchId !== null && touchPoint) {
    // Catch up to fast swipes without doing unbounded work in one frame.
    drawToward(touchPoint.x, touchPoint.y, 8);
  } else if (!touches.length && performance.now() >= ignoreMouseUntil && mouseIsPressed && mouseButton == LEFT) {
    drawToward(mouseX, mouseY, 1);
  }
}

function drawToward(targetX, targetY, maxLetters) {
  for (var i = 0; i < maxLetters; i++) {
    var d = dist(x, y, targetX, targetY);
    textSize(fontSizeMin + d / 2);
    var newLetter = letters.charAt(counter);
    stepSize = textWidth(newLetter);

    if (d > stepSize) {
      var angle = atan2(targetY - y, targetX - x);
      var rotation = angle;

      var storedLetter = {
        letter: newLetter,
        x: x,
        y: y,
        size: fontSizeMin + d / 2,
        rotation: rotation
      };
      drawnLetters.push(storedLetter);
      // Preserve the existing canvas; full replays are only needed on theme/resize.
      drawStoredLetter(storedLetter);

      if (i === 0 && window.breakGridAt) window.breakGridAt(x, y);

      counter++;
      if (counter >= letters.length) counter = 0;

      x = x + cos(angle) * stepSize;
      y = y + sin(angle) * stepSize;
    } else {
      break;
    }
  }
}

function windowResized() {
  cancelTouchStroke();
  resizeCanvas(playground.clientWidth, playground.clientHeight);
  redrawLetters();
}

function setDrawingColor() {
  var ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
  fill(ink || '#181619');
}

function drawStoredLetter(storedLetter) {
  textSize(storedLetter.size);

  push();
  translate(storedLetter.x, storedLetter.y);
  rotate(storedLetter.rotation);
  text(storedLetter.letter, 0, 0);
  pop();
}

function redrawLetters() {
  clear();
  setDrawingColor();
  drawnLetters.forEach(drawStoredLetter);
}

function mousePressed() {
  if (touches.length || performance.now() < ignoreMouseUntil) return;
  if (window.startGridBreak) window.startGridBreak();
  x = mouseX;
  y = mouseY;
}

function touchStarted(event) {
  ignoreMouseUntil = performance.now() + 500;
  // Leave the theme toggle and links alone. Track one finger for each stroke.
  if (event.target !== drawingCanvas) return;
  if (activeTouchId !== null) return false;
  var touch = event.changedTouches[0];
  if (!touch) return;
  activeTouchId = touch.identifier;
  touchPoint = canvasTouchPoint(touch);
  x = touchPoint.x;
  y = touchPoint.y;
  if (window.startGridBreak) window.startGridBreak();
  return false;
}

function touchMoved(event) {
  ignoreMouseUntil = performance.now() + 500;
  if (activeTouchId === null) return;
  var touch = findActiveTouch(event.touches);
  if (touch) touchPoint = canvasTouchPoint(touch);
  if (event.target === drawingCanvas) return false;
}

function touchEnded(event) {
  ignoreMouseUntil = performance.now() + 500;
  if (activeTouchId === null) return;
  var touch = findActiveTouch(event.changedTouches);
  if (touch) {
    var point = canvasTouchPoint(touch);
    drawToward(point.x, point.y, 8);
    cancelTouchStroke();
  }
  if (event.target === drawingCanvas) return false;
}

function findActiveTouch(list) {
  for (var i = 0; i < list.length; i++) {
    if (list[i].identifier === activeTouchId) return list[i];
  }
  return null;
}

function canvasTouchPoint(touch) {
  var rect = drawingCanvas.getBoundingClientRect();
  return {
    x: (touch.clientX - rect.left) * width / (rect.width || 1),
    y: (touch.clientY - rect.top) * height / (rect.height || 1)
  };
}

function cancelTouchStroke() {
  activeTouchId = null;
  touchPoint = null;
  ignoreMouseUntil = performance.now() + 500;
}

function keyPressed(event) {
  if (keyCode !== DELETE && keyCode !== BACKSPACE) return;
  if (event && (event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey)) return;
  var target = event && event.target;
  if (target && (target.isContentEditable || target.closest('input, textarea, select, [role="textbox"]'))) return;
  drawnLetters = [];
  cancelTouchStroke();
  counter = 0;
  x = mouseX;
  y = mouseY;
  clear();
  if (window.resetPlaygroundGrid) window.resetPlaygroundGrid();
  return false;
}
