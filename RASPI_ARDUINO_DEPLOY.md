# Raspberry Pi And Arduino Deployment Branch

This branch keeps only the files needed for Raspberry Pi bridge deployment and Arduino firmware upload.

## Included Paths

- `pi_fast_bridge/`
- `Arduino/combined_robot_plotter/`

## Raspberry Pi Bridge

1. Open `pi_fast_bridge/`.
2. Install dependencies with `pip install -r requirements.txt`.
3. Run `robot_fast_bridge.py`.

## Arduino Firmware

1. Open `Arduino/combined_robot_plotter/`.
2. Build and upload `combined_robot_plotter.ino` with the Arduino IDE or Arduino CLI.
