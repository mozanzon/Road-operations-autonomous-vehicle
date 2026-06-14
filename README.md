# Autonomous Vehicle for Road Operations

Autonomous Vehicle for Road Operations is a multi-part robotics project for field road work. It combines a React/Vite operator dashboard, a Raspberry Pi bridge, Arduino firmware, and YOLO-based model assets for control, telemetry, mapping, and on-device inference.

## Project Structure

- `RoboScanV3/`: frontend dashboard for connection, control, mapping, reporting, preferences, and operator monitoring
- `pi_fast_bridge/`: Python bridge for Raspberry Pi communication between the dashboard and robot hardware
- `Arduino/combined_robot_plotter/`: Arduino firmware for the road-operation robot controller
- `model/`: trained model artifacts such as `best.pt` and `best.onnx`

## Main Features

- robot connection and telemetry monitoring
- remote control dashboard for field operations
- camera inference support with ONNX/YOLO assets
- waypoint routing and mapping workflows
- reporting and road-marking related operator tools

## Getting Started

### Frontend

1. Open `RoboScanV3/`.
2. Install dependencies with `npm install`.
3. Start the development server with `npm run dev`.
4. Build the production bundle with `npm run build`.

### Raspberry Pi Bridge

1. Open `pi_fast_bridge/`.
2. Install dependencies with `pip install -r requirements.txt`.
3. Run the bridge with Python using `robot_fast_bridge.py`.

## Notes

- The frontend package name has been updated to `autnoumus-vehicle-for-road-operations`.
- The repository currently contains generated frontend assets under `RoboScanV3/dist/`.
- There are existing local changes in the worktree unrelated to this README update.
