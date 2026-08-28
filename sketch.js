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
var letters = 'The page is somewhere down here. PAGE.JS has stopped responding. Please check the URL and try again. position: absolute lost. This page has left the document flow';
var fontSizeMin = 3;
var angleDistortion = 0.0;

var counter = 0;

function setup() {
  var sketchCanvas = createCanvas(playground.clientWidth, playground.clientHeight);
  sketchCanvas.parent(playground);
  sketchCanvas.addClass('playground-canvas');
  clear();
  cursor(CROSS);

  x = mouseX;
  y = mouseY;

  textFont(font);
  textAlign(LEFT);
  setDrawingColor();
}

function draw() {
  if (mouseIsPressed && mouseButton == LEFT) {
    var d = dist(x, y, mouseX, mouseY);
    textSize(fontSizeMin + d / 2);
    var newLetter = letters.charAt(counter);
    stepSize = textWidth(newLetter);

    if (d > stepSize) {
      var angle = atan2(mouseY - y, mouseX - x);

      push();
      translate(x, y);
      rotate(angle + random(angleDistortion));
      setDrawingColor();
      text(newLetter, 0, 0);
      pop();

      counter++;
      if (counter >= letters.length) counter = 0;

      x = x + cos(angle) * stepSize;
      y = y + sin(angle) * stepSize;
    }
  }
}

function windowResized() {
  resizeCanvas(playground.clientWidth, playground.clientHeight);
}

function setDrawingColor() {
  var ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
  fill(ink || '#181619');
}

function mousePressed() {
  x = mouseX;
  y = mouseY;
}

function keyReleased() {
  if (key == 's' || key == 'S') saveCanvas('404-collision-playground', 'png');
  if (keyCode == DELETE || keyCode == BACKSPACE) clear();
}

function keyPressed() {
  // angleDistortion controls arrow keys up/down
  if (keyCode == UP_ARROW) angleDistortion += 0.1;
  if (keyCode == DOWN_ARROW) angleDistortion -= 0.1;
}
