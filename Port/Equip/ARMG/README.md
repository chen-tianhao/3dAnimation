# SANY ARMG 3D Demonstrator

This directory hosts a lightweight Three.js scene that visualizes the automated workflow of the automated rail-mounted gantry crane (ARMG). The visualization references key parameters published on the [official SANY product page](https://www.sanyglobal.com/product/port_machinery/customized_container_cranes/73/444).

## Features

- Parametric ARMG structure (40&nbsp;m rail span, 18.2&nbsp;m hoisting height, 7.5&nbsp;m cantilever)
- Stylised automated operation cycle:
  1. Travelling to an AGV waiting under the crane
  2. Hoisting a loaded container from the vehicle
  3. Traversing to the yard block
  4. Stacking inside the yard block
  5. Returning to the home position and awaiting the next task
- Container yard block populated with existing stacks and progressively filled by the crane
- Orbit, pan and zoom camera controls for inspection (OrbitControls)
- Keyboard shortcut `R` resets the animation and clears dynamically stacked containers

## Running the scene locally

1. Serve the folder with any static file server. Examples:
   - **PowerShell (Windows):** `python -m http.server 8080`
   - **Node.js users:** `npx http-server` (install globally if preferred)
2. Browse to `http://localhost:8080/Port/Equip/ARMG/` and open `index.html`.

> **Note**: The code imports Three.js and OrbitControls directly from the unpkg CDN using ES modules. An internet connection is required the first time the scene is loaded.

## File overview

- `index.html` – base markup and UI scaffold for the viewer
- `style.css` – styles for the layout and legend
- `main.js` – scene setup, yard environment, and animation state machine
- `armg.js` – parametric ARMG crane model and utility methods
- `README.md` – this documentation

Feel free to tune dimensions, materials, or animation timings in `main.js` and `armg.js` to match alternative container sizes or operating policies.
