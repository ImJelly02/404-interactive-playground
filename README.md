# 404 Interactive Playground

An interactive 404 error page where drawing with the cursor disturbs and tears a cloth-like grid. It includes responsive layouts and light and dark themes.

## Controls

- Drag to draw text and interact with the grid.
- Press `Delete` or `Backspace` to reset the drawing and restore the grid.
- On supported phones and tablets, shake the device to wobble the grid without tearing it. Serve the page over HTTPS. If motion permission is required, the browser asks after your first touch on the drawing canvas; allow it to enable shaking. Drawing still works if permission is denied or sensors are unavailable.
- Shake detection is disabled on desktop browsers and while the page is hidden or reduced motion is preferred.

## Built With

- HTML, CSS, and JavaScript
- [p5.js](https://p5js.org/)
- [Matter.js](https://brm.io/matter-js/)

## Credits

The text-drawing interaction is adapted from `P_2_3_3_01` in *Generative Gestaltung - Creative Coding im Web* by Benedikt Gross, Hartmut Bohnacker, Julia Laub, and Claudius Lazzeroni, with contributions by Joey Lee and Niels Poldervaart. The original code is licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
