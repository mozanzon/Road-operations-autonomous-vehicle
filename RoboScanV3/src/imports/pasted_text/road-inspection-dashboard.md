Autonomous Road Inspection Robot — Dashboard UI
Project Context
A desktop/mobile dashboard for controlling and monitoring a differential-drive autonomous robot used for road inspection and lane marking in Egypt. The robot navigates real Egyptian road networks using GPS waypoints, detects potholes and cracks via a YOLO model, and paints lane markings while in motion. The UI communicates with a Raspberry Pi over a local network.

Global Design Requirements

User-selectable light/dark theme (toggle persistent across sessions)
Industrial aesthetic: clean typography, strong contrast, data-dense but uncluttered
All live data fields show an animated pulse badge when receiving data, and a red error indicator when the stream is absent or stale
Emergency Stop button — always visible, fixed position, high-contrast red, accessible from every tab
Responsive: optimized for both desktop and tablet


Tab Structure (6 tabs)
1. Connection (default/first tab)

IP address input field + Connect / Disconnect button
Connection status indicator (color-coded: connected / disconnected / attempting)
Raspberry Pi system info on connect: hostname, uptime, battery level
Network latency display

2. Dashboard — Live Monitoring
Robot Status Bar (top, always visible within tab)

Mode badge: Manual / Automatic
GPS fix status
Total distance traveled (session cumulative)
Active segment distance (resets per motion segment)
Pothole counter + Crack counter (live increment with subtle animation)

Sensor Panels (card grid):

IMU: orientation (roll/pitch/yaw), accelerometer (X/Y/Z), gyroscope (X/Y/Z) — includes an interactive compass rose that rotates live with heading data
GPS: live coordinates, speed, heading; auto-detects live location when GPS fix is acquired; coordinate validity check indicator
Encoders: left/right encoder tick counts, computed RPM, calculated linear velocity, odometry error (difference between encoder-derived position and GPS position), error trend sparkline
Camera Feed: live MJPEG stream from Pi camera; toggle overlay for YOLO model output (bounding boxes for potholes/cracks); detection confidence threshold slider

3. Map & Waypoints

Full interactive map using OpenStreetMap/Leaflet with Egypt tile layers
Robot's live GPS position shown as animated marker
Waypoint tools: click-to-place waypoints on map OR enter coordinates via API/manual input fields; drag existing waypoints to reposition; delete individual waypoints
Path editing: path between waypoints can be straight-segment or curved (Bezier handle control per segment); full drag-to-reshape path editing
Path distance calculated and displayed per segment and total
Pothole and crack detections plotted as map pins (color-coded by type) as they are detected in real time
Export path as JSON / import saved path

4. Control
Mode Selector: Manual / Automatic (prominent toggle)
Manual Mode

Virtual joystick (analog stick UI, not buttons) for velocity and steering
Joystick outputs linear velocity and angular velocity values (displayed numerically)
Speed limit slider

Automatic Mode

Follows path defined in Map tab
Start / Pause / Stop path execution controls
Current target waypoint highlighted on mini-map inset

Road Painting Controls (available in both modes)

Mode: Solid Line / Dashed Line
Dashed line config: dash length (m), gap length (m)
Color selector (for UI representation)
Line width selector
Start painting / Stop painting toggle with active state glow
Set painting distance (robot auto-stops painting after N meters); remaining distance progress bar
Painting status indicator (active / idle / error)

PID Tuning Panel

Separate Kp / Ki / Kd sliders + numeric inputs for: Linear velocity controller, Angular velocity controller
Live error graph (setpoint vs actual) updating in real time
Save / Load PID preset buttons

5. Reporting

Trip log table: each session/trip with timestamp, distance, duration, potholes detected, cracks detected, path taken
Per-trip detail view: sensor data summary, detection event timeline, painted distance
Charts: detections over distance, speed profile, encoder error over time
Export options: PDF report (formatted summary with charts) and CSV (raw data rows)
Date range filter and trip selector

6. Preferences

Theme toggle: Dark / Light
Units: metric / imperial
Alert thresholds: GPS accuracy, encoder error limit, battery warning level
Stream timeout sensitivity (how quickly error indicators trigger)
Map tile source selector


Key Interaction Details

Emergency Stop: fixed floating button (bottom-right), red, always on top, sends immediate halt command
All sensor cards: green pulse dot = live stream; red ⚠ icon = no data / timeout
Compass component: circular SVG compass rose, needle rotates with live yaw from IMU
Joystick: touch/mouse draggable, returns to center on release, deadzone configurable in Preferences
Map path: click to add node, drag node to move, right-click node to delete, click segment midpoint to insert node, toggle segment between linear and curved