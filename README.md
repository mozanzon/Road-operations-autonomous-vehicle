# Autonomous Vehicle for Road Operations

This branch contains only the files needed for the Raspberry Pi bridge and Arduino firmware deployment.

## Project Structure

- `pi_fast_bridge/`: Python bridge for Raspberry Pi communication between the dashboard and robot hardware
- `Arduino/combined_robot_plotter/`: Arduino firmware for the road-operation robot controller

## Raspberry Pi Bridge

1. Open `pi_fast_bridge/`.
2. Install dependencies with `pip install -r requirements.txt`.
3. Run the bridge with Python using `robot_fast_bridge.py`.

## Arduino Firmware

1. Open `Arduino/combined_robot_plotter/`.
2. Build and upload `combined_robot_plotter.ino` with the Arduino IDE or Arduino CLI.
