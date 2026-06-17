#include <Wire.h>
#include <QMC5883LCompass.h>
#include <TinyGPS++.h>

/*
  Combined RoboScan Controller

  Target board: Arduino Mega
  Serial Monitor: 115200 baud, Newline recommended

  Drive commands:
    W                  drive forward
    X                  drive backward
    A                  turn left 90 degrees from current heading
    D                  turn right 90 degrees from current heading
    S                  stop drive and plotter
    SPEED <0-255>      set drive speed
    TURN SPEED <0-255> set 90-degree turn speed
    SPEED CAP <0-255>  cap all drive/turn PWM commands
    AUTO TURN SPEED <0-255>
                       set heading correction turn speed
    COMPASS OFFSET <deg>
                       set QMC5883L compass heading correction (-180 to 180)
    MOTOR TRIM <l> <r> add static left/right PWM bias (-50 to 50)
    ENCODER PID <p> <i> <d>
                       set encoder drift PID gains
    GOTO <lat> <lng>   drive to one GPS waypoint, 2m arrival tolerance
    WP BEGIN <count>   clear and begin loading a waypoint route
    WP CLEAR           clear waypoint queue
    WP ADD <n> <lat> <lng>
                       add ordered waypoint to queue
    WP START / PAUSE / RESUME / STOP
                       control queued waypoint navigation

  Plotter commands:
    PLOT CONT          arm continuous plotting while moving
    PLOT DASH          arm dashed plotting while moving
    PLOT DASH DIST <dash_m> <gap_m>
                       dashed plotting by measured travel distance
    PLOT OFF           plotter off
    PLOT SPEED <0-255> set plotter motor speed
    PLOT DIST <meters> plot for this travel distance, 0 = unlimited
    PLOT TICKS <ticks> plot for this encoder tick distance, 0 = unlimited
    WHEEL RADIUS <m>   set wheel radius used for distance math

  Info:
    STATUS             print current heading, encoders, and plotter mode
    GPS STATUS         print GPS-only status
    GPS ONLY ON/OFF    read and stream GPS data only
    HELP               show commands
*/

QMC5883LCompass compass;
TinyGPSPlus gps;

// Left drive motor driver
const int M1_RPWM = 5;
const int M1_LPWM = 6;
const int M1_R_EN = 7;
const int M1_L_EN = 8;

// Right drive motor driver
const int M2_RPWM = 44;
const int M2_LPWM = 45;
const int M2_R_EN = 46;
const int M2_L_EN = 47;

// Plotter motor driver
const int PLOTTER_RPWM = 38;
const int PLOTTER_LPWM = 39;
const int PLOTTER_R_EN = 40;
const int PLOTTER_L_EN = 41;

// Encoder pins
const int ENC_LEFT_A = 2;
const int ENC_LEFT_B = 18;
const int ENC_RIGHT_A = 3;
const int ENC_RIGHT_B = 19;

const float TICKS_PER_REV = 2400.0;
const float ENCODER_PPR = 600.0;
const float QUADRATURE_EDGES_PER_PULSE = 4.0;

// Wheel diameter is 32 cm and wheelbase/track width is about 50 cm.
const float ROBOT_TRACK_WIDTH_M = 0.50;

const float TURN_ANGLE_DEG = 90.0;
const float HEADING_TOLERANCE_DEG = 2.5;
const unsigned long TURN_TIMEOUT_MS = 10000;
const unsigned long TELEMETRY_INTERVAL_MS = 100;
const unsigned long NAV_TIMEOUT_MS = 120000;

const int MIN_TURN_PWM = 25;
const int DEFAULT_DRIVE_SPEED = 160;
const int DEFAULT_TURN_SPEED = 60;
const int DEFAULT_SPEED_CAP = 102;
const int DEFAULT_PLOTTER_SPEED = 180;
const long SERIAL_BAUD_RATE = 115200;
const long GPS_BAUD_RATE = 9600;
const float NAV_ARRIVAL_TOLERANCE_M = 2.0;
const float NAV_TURN_IN_PLACE_DEG = 45.0;
const float NAV_HEADING_ADJUST_DEG = 8.0;
const float NAV_SLOWDOWN_DISTANCE_M = 4.0;
const float NAV_ENCODER_STEP_M = 1.50;
const float NAV_TURN_ENCODER_LIMIT_MULTIPLIER = 1.25;
const float NAV_EARTH_RADIUS_M = 6371000.0;
const int MOTOR_TRIM_LIMIT = 50;
const int MAX_WAYPOINTS = 20;

volatile long leftEncoderTicks = 0;
volatile long rightEncoderTicks = 0;

int driveSpeed = DEFAULT_DRIVE_SPEED;
int activeDriveSpeed = DEFAULT_DRIVE_SPEED;
int turnSpeed = DEFAULT_TURN_SPEED;
int speedCap = DEFAULT_SPEED_CAP;
int autoTurnSpeed = DEFAULT_TURN_SPEED;
int plotterSpeed = DEFAULT_PLOTTER_SPEED;
bool driveIsMoving = false;
int driveDirection = 0;
float driveTargetHeading = 0.0;
long driveStartLeftTicks = 0;
long driveStartRightTicks = 0;
float wheelRadiusM = 0.16;
float plotDistanceTargetM = 0.0;
bool plotDistanceStartSet = false;
bool plotDistanceReached = false;
long plotStartLeftTicks = 0;
long plotStartRightTicks = 0;
float dashPaintDistanceM = 0.50;
float dashGapDistanceM = 0.30;
long dashSegmentStartLeftTicks = 0;
long dashSegmentStartRightTicks = 0;

struct NavWaypoint {
  int order;
  double lat;
  double lng;
};

enum WaypointState {
  WP_STATE_IDLE,
  WP_STATE_LOADING,
  WP_STATE_LOADED,
  WP_STATE_RUNNING,
  WP_STATE_PAUSED,
  WP_STATE_DONE,
  WP_STATE_ERROR
};

enum PlotterMode {
  PLOTTER_OFF,
  PLOTTER_CONT,
  PLOTTER_DASH
};

PlotterMode plotterMode = PLOTTER_OFF;
bool plotterDashMotorOn = false;
bool gpsOnlyMode = false;
unsigned long lastTelemetryMs = 0;
unsigned long lastSpeedSampleMs = 0;
long lastSpeedLeftTicks = 0;
long lastSpeedRightTicks = 0;
long lastSpeedLeftDelta = 0;
long lastSpeedRightDelta = 0;
float measuredSpeedMps = 0.0;
int motorTrimLeft = 0;
int motorTrimRight = 0;
int lastHeadingCorrection = 0;
int lastLeftCommandPwm = 0;
int lastRightCommandPwm = 0;
float lastHeadingErrorDeg = 0.0;
float lastTargetBearingDeg = 0.0;
float lastTargetDistanceM = 0.0;
bool navActive = false;
bool navArrived = false;
double navTargetLat = 0.0;
double navTargetLng = 0.0;
unsigned long navStartMs = 0;
NavWaypoint waypointQueue[MAX_WAYPOINTS];
int waypointCount = 0;
int waypointIndex = 0;
int waypointExpectedCount = 0;
WaypointState waypointState = WP_STATE_IDLE;
String waypointError = "";
bool navQueueActive = false;
bool navDrivingSegment = false;
bool navHeadingAdjusting = false;
bool navTurnActive = false;
bool navInitialHeadingSampled = false;
bool navInitialTurnComplete = false;
float navInitialHeadingErrorDeg = 0.0;
long navSegmentStartLeftTicks = 0;
long navSegmentStartRightTicks = 0;
float navSegmentTargetM = 0.0;
long navTurnStartLeftTicks = 0;
long navTurnStartRightTicks = 0;
long navTurnExpectedTicks = 0;
int navTurnDirection = 0;
float encoderPidKp = 1.0;
float encoderPidKi = 0.0;
float encoderPidKd = 0.0;
float encoderPidIntegral = 0.0;
float encoderPidLastError = 0.0;
int lastEncoderPidOutput = 0;
float lastEncoderErrorTicks = 0.0;
bool compassOk = false;
float lastCompassHeadingDeg = 0.0;
float lastCompassRawHeadingDeg = 0.0;
float compassOffsetDeg = 0.0;

const float DRIVE_HEADING_KP = 1.0;
const int DRIVE_TRIM_LIMIT = 35;

void updateGps() {
  while (Serial2.available() > 0) {
    gps.encode(Serial2.read());
  }
}

unsigned long gpsAgeMs() {
  if (!gps.location.isValid()) return 0;
  return gps.location.age();
}

bool gpsHasFix() {
  return gps.location.isValid() && gps.location.age() < 5000;
}

void printGpsFields() {
  bool fix = gpsHasFix();
  Serial.print("|lat=");
  Serial.print(fix ? gps.location.lat() : 0.0, 6);
  Serial.print("|lng=");
  Serial.print(fix ? gps.location.lng() : 0.0, 6);
  Serial.print("|gps_speed=");
  Serial.print(gps.speed.isValid() ? gps.speed.mps() : 0.0, 3);
  Serial.print("|gps_course=");
  Serial.print(gps.course.isValid() ? gps.course.deg() : 0.0, 2);
  Serial.print("|gps_fix=");
  Serial.print(fix ? 1 : 0);
  Serial.print("|gps_sat=");
  Serial.print(gps.satellites.isValid() ? gps.satellites.value() : 0);
  Serial.print("|gps_hdop=");
  Serial.print(gps.hdop.isValid() ? gps.hdop.hdop() : 999.0, 2);
  Serial.print("|gps_age_ms=");
  Serial.print(gpsAgeMs());
}

void printCompassFields(float heading) {
  Serial.print("|compass_raw_heading=");
  Serial.print(lastCompassRawHeadingDeg, 2);
  Serial.print("|compass_heading=");
  Serial.print(heading, 2);
  Serial.print("|compass_offset=");
  Serial.print(compassOffsetDeg, 2);
  Serial.print("|compass_ok=");
  Serial.print(compassOk ? 1 : 0);
}

const char* waypointStateName() {
  switch (waypointState) {
    case WP_STATE_LOADING: return "loading";
    case WP_STATE_LOADED: return "loaded";
    case WP_STATE_RUNNING: return "running";
    case WP_STATE_PAUSED: return "paused";
    case WP_STATE_DONE: return "done";
    case WP_STATE_ERROR: return "error";
    case WP_STATE_IDLE:
    default:
      return "idle";
  }
}

void printNavigationFields() {
  Serial.print("|nav_active=");
  Serial.print(navActive ? 1 : 0);
  Serial.print("|arrived=");
  Serial.print(navArrived ? 1 : 0);
  Serial.print("|target_lat=");
  Serial.print(navActive ? navTargetLat : 0.0, 6);
  Serial.print("|target_lng=");
  Serial.print(navActive ? navTargetLng : 0.0, 6);
  Serial.print("|target_bearing=");
  Serial.print(lastTargetBearingDeg, 2);
  Serial.print("|target_distance_m=");
  Serial.print(lastTargetDistanceM, 2);
  Serial.print("|wp_active=");
  Serial.print(waypointState == WP_STATE_RUNNING ? 1 : 0);
  Serial.print("|wp_paused=");
  Serial.print(waypointState == WP_STATE_PAUSED ? 1 : 0);
  Serial.print("|wp_status=");
  Serial.print(waypointStateName());
  Serial.print("|wp_expected=");
  Serial.print(waypointExpectedCount);
  Serial.print("|wp_error=");
  if (waypointError.length()) Serial.print(waypointError);
  else Serial.print("none");
  Serial.print("|wp_count=");
  Serial.print(waypointCount);
  Serial.print("|wp_index=");
  Serial.print(waypointIndex);
  Serial.print("|heading_error=");
  Serial.print(lastHeadingErrorDeg, 2);
  Serial.print("|correction_trim=");
  Serial.print(lastHeadingCorrection);
  Serial.print("|heading_adjusting=");
  Serial.print(navHeadingAdjusting ? 1 : 0);
  Serial.print("|turn_active=");
  Serial.print(navTurnActive ? 1 : 0);
  Serial.print("|turn_expected_ticks=");
  Serial.print(navTurnExpectedTicks);
  Serial.print("|plotter_stopped_for_heading=");
  Serial.print(navHeadingAdjusting ? 1 : 0);
  Serial.print("|encoder_error=");
  Serial.print(lastEncoderErrorTicks, 2);
  Serial.print("|encoder_pid_kp=");
  Serial.print(encoderPidKp, 3);
  Serial.print("|encoder_pid_ki=");
  Serial.print(encoderPidKi, 3);
  Serial.print("|encoder_pid_kd=");
  Serial.print(encoderPidKd, 3);
  Serial.print("|encoder_pid_output=");
  Serial.print(lastEncoderPidOutput);
  Serial.print("|motor_trim_left=");
  Serial.print(motorTrimLeft);
  Serial.print("|motor_trim_right=");
  Serial.print(motorTrimRight);
  Serial.print("|left_pwm=");
  Serial.print(lastLeftCommandPwm);
  Serial.print("|right_pwm=");
  Serial.print(lastRightCommandPwm);
}

void printGpsStatus() {
  Serial.print("STATUS");
  printGpsFields();
  printNavigationFields();
  Serial.print("|gps_only=");
  Serial.println(gpsOnlyMode ? 1 : 0);
}

void onLeftA() {
  if (digitalRead(ENC_LEFT_A) != digitalRead(ENC_LEFT_B)) leftEncoderTicks++;
  else leftEncoderTicks--;
}

void onLeftB() {
  if (digitalRead(ENC_LEFT_A) == digitalRead(ENC_LEFT_B)) leftEncoderTicks++;
  else leftEncoderTicks--;
}

void onRightA() {
  if (digitalRead(ENC_RIGHT_A) != digitalRead(ENC_RIGHT_B)) rightEncoderTicks++;
  else rightEncoderTicks--;
}

void onRightB() {
  if (digitalRead(ENC_RIGHT_A) == digitalRead(ENC_RIGHT_B)) rightEncoderTicks++;
  else rightEncoderTicks--;
}

void readEncoderTicks(long &leftTicks, long &rightTicks) {
  noInterrupts();
  leftTicks = leftEncoderTicks;
  rightTicks = rightEncoderTicks;
  interrupts();
}

float normalizeHeading(float heading) {
  while (heading < 0.0) heading += 360.0;
  while (heading >= 360.0) heading -= 360.0;
  return heading;
}

void initCompass() {
  compass.init();
  delay(10);
  compassOk = true;
}

float readHeading() {
  compass.read();
  lastCompassRawHeadingDeg = normalizeHeading((float)compass.getAzimuth());
  lastCompassHeadingDeg = normalizeHeading(lastCompassRawHeadingDeg + compassOffsetDeg);
  compassOk = true;
  return lastCompassHeadingDeg;
}

float headingError(float target, float current) {
  float error = normalizeHeading(target) - normalizeHeading(current);
  if (error > 180.0) error -= 360.0;
  if (error < -180.0) error += 360.0;
  return error;
}

float degreesToRadians(float degrees) {
  return degrees * PI / 180.0;
}

float radiansToDegrees(float radians) {
  return radians * 180.0 / PI;
}

float gpsDistanceMeters(double fromLat, double fromLng, double toLat, double toLng) {
  float fromLatRad = degreesToRadians(fromLat);
  float toLatRad = degreesToRadians(toLat);
  float dLatRad = degreesToRadians(toLat - fromLat);
  float dLngRad = degreesToRadians(toLng - fromLng);

  float sinHalfLat = sin(dLatRad / 2.0);
  float sinHalfLng = sin(dLngRad / 2.0);
  float a = (sinHalfLat * sinHalfLat) + (cos(fromLatRad) * cos(toLatRad) * sinHalfLng * sinHalfLng);
  float c = 2.0 * atan2(sqrt(a), sqrt(1.0 - a));
  return NAV_EARTH_RADIUS_M * c;
}

float gpsBearingDegrees(double fromLat, double fromLng, double toLat, double toLng) {
  float fromLatRad = degreesToRadians(fromLat);
  float toLatRad = degreesToRadians(toLat);
  float dLngRad = degreesToRadians(toLng - fromLng);
  float y = sin(dLngRad) * cos(toLatRad);
  float x = (cos(fromLatRad) * sin(toLatRad)) - (sin(fromLatRad) * cos(toLatRad) * cos(dLngRad));
  return normalizeHeading(radiansToDegrees(atan2(y, x)));
}

float wheelCircumferenceM() {
  return 2.0 * PI * wheelRadiusM;
}

float ticksToMeters(long ticks) {
  return (ticks / TICKS_PER_REV) * wheelCircumferenceM();
}

float ticksToDistanceM(long ticks) {
  long absoluteTicks = ticks < 0 ? -ticks : ticks;
  return (absoluteTicks / TICKS_PER_REV) * wheelCircumferenceM();
}

void resetPlotDistanceStart() {
  readEncoderTicks(plotStartLeftTicks, plotStartRightTicks);
  plotDistanceStartSet = true;
  plotDistanceReached = false;
}

void resetDashSegmentStart() {
  readEncoderTicks(dashSegmentStartLeftTicks, dashSegmentStartRightTicks);
}

float plotTravelDistanceM() {
  long leftTicks;
  long rightTicks;
  readEncoderTicks(leftTicks, rightTicks);

  float leftDistance = ticksToDistanceM(leftTicks - plotStartLeftTicks);
  float rightDistance = ticksToDistanceM(rightTicks - plotStartRightTicks);
  return (leftDistance + rightDistance) / 2.0;
}

float dashSegmentTravelDistanceM() {
  long leftTicks;
  long rightTicks;
  readEncoderTicks(leftTicks, rightTicks);

  float leftDistance = ticksToDistanceM(leftTicks - dashSegmentStartLeftTicks);
  float rightDistance = ticksToDistanceM(rightTicks - dashSegmentStartRightTicks);
  return (leftDistance + rightDistance) / 2.0;
}

float navSegmentTravelDistanceM() {
  long leftTicks;
  long rightTicks;
  readEncoderTicks(leftTicks, rightTicks);

  float leftDistance = ticksToDistanceM(leftTicks - navSegmentStartLeftTicks);
  float rightDistance = ticksToDistanceM(rightTicks - navSegmentStartRightTicks);
  return (leftDistance + rightDistance) / 2.0;
}

void resetEncoderPid() {
  encoderPidIntegral = 0.0;
  encoderPidLastError = 0.0;
  lastEncoderPidOutput = 0;
}

void updateMeasuredSpeed() {
  unsigned long now = millis();
  if (now - lastSpeedSampleMs < TELEMETRY_INTERVAL_MS) return;

  long leftTicks;
  long rightTicks;
  readEncoderTicks(leftTicks, rightTicks);

  unsigned long dtMs = now - lastSpeedSampleMs;
  if (dtMs > 0) {
    lastSpeedLeftDelta = leftTicks - lastSpeedLeftTicks;
    lastSpeedRightDelta = rightTicks - lastSpeedRightTicks;
    float leftDistance = ticksToDistanceM(lastSpeedLeftDelta);
    float rightDistance = ticksToDistanceM(lastSpeedRightDelta);
    measuredSpeedMps = ((leftDistance + rightDistance) / 2.0) / (dtMs / 1000.0);
  }

  lastSpeedLeftTicks = leftTicks;
  lastSpeedRightTicks = rightTicks;
  lastSpeedSampleMs = now;
}

const char *plotterModeName() {
  if (plotterMode == PLOTTER_CONT) return "CONT";
  if (plotterMode == PLOTTER_DASH) return "DASH";
  return "OFF";
}

int cappedDrivePwm(int speed) {
  return constrain(speed, 0, speedCap);
}

void writeDrivePwm(int leftForward, int leftBackward, int rightForward, int rightBackward) {
  analogWrite(M1_RPWM, constrain(leftForward, 0, 255));
  analogWrite(M1_LPWM, constrain(leftBackward, 0, 255));
  analogWrite(M2_RPWM, constrain(rightForward, 0, 255));
  analogWrite(M2_LPWM, constrain(rightBackward, 0, 255));
}

void applyForwardPwm(int leftPwm, int rightPwm) {
  lastLeftCommandPwm = constrain(leftPwm + motorTrimLeft, 0, speedCap);
  lastRightCommandPwm = constrain(rightPwm + motorTrimRight, 0, speedCap);
  writeDrivePwm(lastLeftCommandPwm, 0, lastRightCommandPwm, 0);
}

void applyBackwardPwm(int leftPwm, int rightPwm) {
  lastLeftCommandPwm = constrain(leftPwm + motorTrimLeft, 0, speedCap);
  lastRightCommandPwm = constrain(rightPwm + motorTrimRight, 0, speedCap);
  writeDrivePwm(0, lastLeftCommandPwm, 0, lastRightCommandPwm);
}

void beginForwardMotion(int speed) {
  speed = cappedDrivePwm(speed);
  activeDriveSpeed = speed;
  driveIsMoving = speed > 0;
  driveDirection = driveIsMoving ? 1 : 0;
  navHeadingAdjusting = false;
  readEncoderTicks(driveStartLeftTicks, driveStartRightTicks);
  applyForwardPwm(speed, speed);
}

void beginBackwardMotion(int speed) {
  speed = cappedDrivePwm(speed);
  activeDriveSpeed = speed;
  driveIsMoving = speed > 0;
  driveDirection = driveIsMoving ? -1 : 0;
  navHeadingAdjusting = false;
  readEncoderTicks(driveStartLeftTicks, driveStartRightTicks);
  applyBackwardPwm(speed, speed);
}

void stopDrive() {
  driveIsMoving = false;
  driveDirection = 0;
  navDrivingSegment = false;
  navHeadingAdjusting = false;
  lastLeftCommandPwm = 0;
  lastRightCommandPwm = 0;
  writeDrivePwm(0, 0, 0, 0);
  stopPlotterMotor();
  plotDistanceStartSet = false;
  Serial.println("ACK:DRIVE_STOP");
}

void driveForward(int speed) {
  speed = cappedDrivePwm(speed);
  driveTargetHeading = readHeading();
  beginForwardMotion(speed);
  Serial.print("ACK:FORWARD|speed=");
  Serial.println(speed);
}

void driveBackward(int speed) {
  speed = cappedDrivePwm(speed);
  driveTargetHeading = readHeading();
  beginBackwardMotion(speed);
  Serial.print("ACK:BACKWARD|speed=");
  Serial.println(speed);
}

void startSpinLeft(int speed) {
  speed = cappedDrivePwm(speed);
  driveIsMoving = speed > 0;
  driveDirection = 0;
  navDrivingSegment = false;
  navHeadingAdjusting = speed > 0;
  lastLeftCommandPwm = speed;
  lastRightCommandPwm = speed;
  writeDrivePwm(0, speed, speed, 0);
}

void startSpinRight(int speed) {
  speed = cappedDrivePwm(speed);
  driveIsMoving = speed > 0;
  driveDirection = 0;
  navDrivingSegment = false;
  navHeadingAdjusting = speed > 0;
  lastLeftCommandPwm = speed;
  lastRightCommandPwm = speed;
  writeDrivePwm(speed, 0, 0, speed);
}

void updateDriveControl() {
  if (!driveIsMoving || driveDirection == 0) return;

  long leftTicks;
  long rightTicks;
  readEncoderTicks(leftTicks, rightTicks);

  long leftDelta = leftTicks - driveStartLeftTicks;
  long rightDelta = rightTicks - driveStartRightTicks;
  float hError = 0.0;
  if (!navDrivingSegment) {
    float currentHeading = readHeading();
    hError = headingError(driveTargetHeading, currentHeading);
    lastHeadingErrorDeg = hError;
  }
  float encoderError = (float)(leftDelta - rightDelta);
  encoderPidIntegral = constrain(encoderPidIntegral + encoderError, -2000.0, 2000.0);
  float encoderDerivative = encoderError - encoderPidLastError;
  encoderPidLastError = encoderError;
  int encoderPidOutput = constrain((int)((encoderError * encoderPidKp) + (encoderPidIntegral * encoderPidKi) + (encoderDerivative * encoderPidKd)), -DRIVE_TRIM_LIMIT, DRIVE_TRIM_LIMIT);
  int trim = constrain((int)(hError * DRIVE_HEADING_KP) + encoderPidOutput, -DRIVE_TRIM_LIMIT, DRIVE_TRIM_LIMIT);
  lastHeadingCorrection = trim;
  lastEncoderErrorTicks = encoderError;
  lastEncoderPidOutput = encoderPidOutput;

  int leftPwm = constrain(activeDriveSpeed - trim, 0, 255);
  int rightPwm = constrain(activeDriveSpeed + trim, 0, 255);

  if (driveDirection > 0) applyForwardPwm(leftPwm, rightPwm);
  else applyBackwardPwm(leftPwm, rightPwm);
}

void runPlotterForward(int speed) {
  speed = constrain(speed, 0, 255);
  analogWrite(PLOTTER_RPWM, speed);
  analogWrite(PLOTTER_LPWM, 0);
}

void stopPlotterMotor() {
  analogWrite(PLOTTER_RPWM, 0);
  analogWrite(PLOTTER_LPWM, 0);
}

void setPlotterMode(PlotterMode mode) {
  plotterMode = mode;
  plotterDashMotorOn = false;

  if (plotterMode == PLOTTER_CONT) {
    if (driveIsMoving) runPlotterForward(plotterSpeed);
    else stopPlotterMotor();
  } else if (plotterMode == PLOTTER_DASH) {
    plotterDashMotorOn = true;
    resetDashSegmentStart();
    if (driveIsMoving) runPlotterForward(plotterSpeed);
    else stopPlotterMotor();
  } else {
    stopPlotterMotor();
  }

  Serial.print("ACK:PLOT_MODE|mode=");
  Serial.println(plotterModeName());
}

void updatePlotter() {
  if (navHeadingAdjusting) {
    stopPlotterMotor();
    return;
  }

  if (!driveIsMoving) {
    stopPlotterMotor();
    plotterDashMotorOn = true;
    plotDistanceStartSet = false;
    resetDashSegmentStart();
    return;
  }

  if (plotterMode == PLOTTER_OFF) {
    stopPlotterMotor();
    return;
  }

  if (plotDistanceTargetM > 0.0) {
    if (!plotDistanceStartSet) resetPlotDistanceStart();

    if (plotTravelDistanceM() >= plotDistanceTargetM) {
      stopPlotterMotor();
      plotDistanceReached = true;
      return;
    }
  } else {
    plotDistanceReached = false;
  }

  if (plotDistanceReached) {
    stopPlotterMotor();
    return;
  }

  if (plotterMode == PLOTTER_CONT) {
    runPlotterForward(plotterSpeed);
    return;
  }

  if (plotterMode != PLOTTER_DASH) return;

  float segmentTargetM = plotterDashMotorOn ? dashPaintDistanceM : dashGapDistanceM;
  if (segmentTargetM <= 0.0) segmentTargetM = 0.01;
  if (dashSegmentTravelDistanceM() < segmentTargetM) {
    if (plotterDashMotorOn) runPlotterForward(plotterSpeed);
    else stopPlotterMotor();
    return;
  }

  plotterDashMotorOn = !plotterDashMotorOn;
  resetDashSegmentStart();

  if (plotterDashMotorOn) runPlotterForward(plotterSpeed);
  else stopPlotterMotor();
}

void clearNavigationState(bool arrived) {
  navActive = false;
  navArrived = arrived;
  navQueueActive = false;
  waypointState = arrived ? WP_STATE_DONE : WP_STATE_IDLE;
  navDrivingSegment = false;
  navHeadingAdjusting = false;
  navTurnActive = false;
  navInitialHeadingSampled = false;
  navInitialTurnComplete = false;
  navInitialHeadingErrorDeg = 0.0;
  navTurnExpectedTicks = 0;
  navTurnDirection = 0;
  lastTargetDistanceM = 0.0;
  lastTargetBearingDeg = 0.0;
}

void stopNavigation(bool arrived) {
  clearNavigationState(arrived);
  waypointState = arrived ? WP_STATE_DONE : WP_STATE_IDLE;
  stopDrive();
}

void clearWaypointQueue() {
  waypointCount = 0;
  waypointIndex = 0;
  waypointExpectedCount = 0;
  waypointState = WP_STATE_IDLE;
  waypointError = "";
  navActive = false;
  navArrived = false;
  navQueueActive = false;
  navDrivingSegment = false;
  navHeadingAdjusting = false;
  navTurnActive = false;
  navInitialHeadingSampled = false;
  navInitialTurnComplete = false;
  navInitialHeadingErrorDeg = 0.0;
  navTurnExpectedTicks = 0;
  navTurnDirection = 0;
  lastTargetDistanceM = 0.0;
  lastTargetBearingDeg = 0.0;
}

void setWaypointError(const char* message) {
  waypointState = WP_STATE_ERROR;
  waypointError = message;
  navQueueActive = false;
  navActive = false;
  stopDrive();
  Serial.print("ERROR:");
  Serial.println(message);
}

void beginWaypointRoute(int expectedCount) {
  clearWaypointQueue();

  if (expectedCount <= 0) {
    setWaypointError("WP_route_empty");
    return;
  }

  if (expectedCount > MAX_WAYPOINTS) {
    setWaypointError("WP_route_too_long");
    return;
  }

  waypointExpectedCount = expectedCount;
  waypointState = WP_STATE_LOADING;
  Serial.print("ACK:WP_BEGIN|expected=");
  Serial.println(waypointExpectedCount);
}

void sortWaypointQueue() {
  for (int i = 0; i < waypointCount - 1; i++) {
    for (int j = i + 1; j < waypointCount; j++) {
      if (waypointQueue[j].order < waypointQueue[i].order) {
        NavWaypoint tmp = waypointQueue[i];
        waypointQueue[i] = waypointQueue[j];
        waypointQueue[j] = tmp;
      }
    }
  }
}

bool addWaypointToQueue(int order, double lat, double lng) {
  if (waypointState != WP_STATE_LOADING && waypointState != WP_STATE_LOADED) return false;
  if (waypointExpectedCount > 0 && waypointCount >= waypointExpectedCount) return false;
  if (waypointCount >= MAX_WAYPOINTS) return false;
  waypointQueue[waypointCount].order = order;
  waypointQueue[waypointCount].lat = lat;
  waypointQueue[waypointCount].lng = lng;
  waypointCount++;
  sortWaypointQueue();
  if (waypointExpectedCount > 0 && waypointCount == waypointExpectedCount) waypointState = WP_STATE_LOADED;
  return true;
}

void loadActiveWaypoint() {
  navTargetLat = waypointQueue[waypointIndex].lat;
  navTargetLng = waypointQueue[waypointIndex].lng;
  navStartMs = millis();
  navActive = true;
  navArrived = false;
  navDrivingSegment = false;
  navHeadingAdjusting = false;
  navTurnActive = false;
  navInitialHeadingSampled = false;
  navInitialTurnComplete = false;
  navInitialHeadingErrorDeg = 0.0;
  navTurnExpectedTicks = 0;
  navTurnDirection = 0;
  readEncoderTicks(driveStartLeftTicks, driveStartRightTicks);
  resetEncoderPid();
}

void startNavigation(double targetLat, double targetLng) {
  if (!gpsHasFix()) {
    Serial.println("ERROR:GOTO_requires_valid_gps_fix");
    return;
  }

  gpsOnlyMode = false;
  navQueueActive = false;
  waypointIndex = 0;
  navTargetLat = targetLat;
  navTargetLng = targetLng;
  navStartMs = millis();
  navActive = true;
  navArrived = false;
  navDrivingSegment = false;
  navHeadingAdjusting = false;
  navTurnActive = false;
  navInitialHeadingSampled = false;
  navInitialTurnComplete = false;
  navInitialHeadingErrorDeg = 0.0;
  navTurnExpectedTicks = 0;
  navTurnDirection = 0;
  readEncoderTicks(driveStartLeftTicks, driveStartRightTicks);
  resetEncoderPid();

  Serial.print("ACK:GOTO|target_lat=");
  Serial.print(navTargetLat, 6);
  Serial.print("|target_lng=");
  Serial.println(navTargetLng, 6);
}

void startWaypointQueue() {
  if (waypointCount <= 0) {
    setWaypointError("WP_queue_empty");
    return;
  }

  if (waypointExpectedCount > 0 && waypointCount != waypointExpectedCount) {
    setWaypointError("WP_route_incomplete");
    return;
  }

  if (!gpsHasFix()) {
    setWaypointError("WP_START_requires_valid_gps_fix");
    return;
  }

  gpsOnlyMode = false;
  navQueueActive = true;
  waypointIndex = 0;
  waypointState = WP_STATE_RUNNING;
  waypointError = "";
  loadActiveWaypoint();
  Serial.print("ACK:WP_START|count=");
  Serial.println(waypointCount);
}

void pauseWaypointQueue() {
  if (waypointState != WP_STATE_RUNNING) {
    Serial.println("WARN:WP_PAUSE_ignored_not_running");
    return;
  }

  stopDrive();
  navActive = false;
  navDrivingSegment = false;
  navHeadingAdjusting = false;
  navTurnActive = false;
  waypointState = WP_STATE_PAUSED;
  Serial.print("ACK:WP_PAUSE|index=");
  Serial.println(waypointIndex);
}

void resumeWaypointQueue() {
  if (waypointState != WP_STATE_PAUSED) {
    Serial.println("WARN:WP_RESUME_ignored_not_paused");
    return;
  }

  if (!gpsHasFix()) {
    setWaypointError("WP_RESUME_requires_valid_gps_fix");
    return;
  }

  waypointState = WP_STATE_RUNNING;
  navQueueActive = true;
  waypointError = "";
  loadActiveWaypoint();
  Serial.print("ACK:WP_RESUME|index=");
  Serial.println(waypointIndex);
}

long expectedTurnTicksForAngle(float angleDeg) {
  float expectedWheelTravelM = (PI * ROBOT_TRACK_WIDTH_M) * (abs(angleDeg) / 360.0);
  return max(1L, (long)(expectedWheelTravelM / wheelCircumferenceM() * TICKS_PER_REV));
}

long navTurnEncoderDelta() {
  long leftTicks;
  long rightTicks;
  readEncoderTicks(leftTicks, rightTicks);
  long leftDelta = abs(leftTicks - navTurnStartLeftTicks);
  long rightDelta = abs(rightTicks - navTurnStartRightTicks);
  return (leftDelta + rightDelta) / 2;
}

void beginNavigationTurn(float headingErrorDeg) {
  stopDrive();
  navDrivingSegment = false;
  navHeadingAdjusting = true;
  navTurnActive = true;
  navTurnDirection = headingErrorDeg < 0.0 ? -1 : 1;
  navTurnExpectedTicks = expectedTurnTicksForAngle(headingErrorDeg);
  readEncoderTicks(navTurnStartLeftTicks, navTurnStartRightTicks);
  Serial.print("ACK:NAV_TURN_START|error=");
  Serial.print(headingErrorDeg, 2);
  Serial.print("|direction=");
  Serial.print(navTurnDirection);
  Serial.print("|expected_ticks=");
  Serial.println(navTurnExpectedTicks);
}

bool updateNavigationTurn(float headingErrorDeg) {
  if (abs(headingErrorDeg) <= HEADING_TOLERANCE_DEG) {
    navTurnActive = false;
    navHeadingAdjusting = false;
    navTurnExpectedTicks = 0;
    return true;
  }

  if (!navTurnActive) beginNavigationTurn(headingErrorDeg);

  long encoderDelta = navTurnEncoderDelta();
  if (navTurnExpectedTicks > 0 && encoderDelta >= navTurnExpectedTicks) {
    stopDrive();
    navTurnActive = false;
    navHeadingAdjusting = false;
    navTurnExpectedTicks = 0;
    Serial.print("ACK:NAV_TURN_DONE|heading_error=");
    Serial.println(headingErrorDeg, 2);
    return true;
  }

  if (navTurnExpectedTicks > 0 && encoderDelta > (long)(navTurnExpectedTicks * NAV_TURN_ENCODER_LIMIT_MULTIPLIER)) {
    stopDrive();
    navTurnActive = false;
    navHeadingAdjusting = false;
    navTurnExpectedTicks = 0;
    Serial.println("WARN:NAV_TURN_ENCODER_LIMIT");
    return true;
  }

  int previousTurnSpeed = turnSpeed;
  turnSpeed = autoTurnSpeed;
  int turnPwm = turnPwmForError(headingErrorDeg, encoderDelta, navTurnExpectedTicks);
  turnSpeed = previousTurnSpeed;
  if (headingErrorDeg < 0.0) startSpinLeft(turnPwm);
  else startSpinRight(turnPwm);
  return false;
}

void advanceWaypointOrStop(float distanceM) {
  Serial.print("ACK:WP_ARRIVED|index=");
  Serial.print(waypointIndex);
  Serial.print("|distance_m=");
  Serial.println(distanceM, 2);

  if (navQueueActive && waypointIndex + 1 < waypointCount) {
    waypointIndex++;
    loadActiveWaypoint();
    return;
  }

  navQueueActive = false;
  waypointIndex = min(waypointIndex, max(0, waypointCount - 1));
  Serial.println("ACK:WP_DONE");
  stopNavigation(true);
}

void updateNavigation() {
  if (!navActive) return;

  if (!gpsHasFix()) {
    Serial.println("WARN:NAV_STOPPED_GPS_FIX_LOST");
    setWaypointError("NAV_STOPPED_GPS_FIX_LOST");
    return;
  }

  if (millis() - navStartMs > NAV_TIMEOUT_MS) {
    Serial.println("WARN:NAV_TIMEOUT");
    setWaypointError("NAV_TIMEOUT");
    return;
  }

  if (driveSpeed <= 0) {
    Serial.println("WARN:NAV_STOPPED_ZERO_DRIVE_SPEED");
    setWaypointError("NAV_STOPPED_ZERO_DRIVE_SPEED");
    return;
  }

  double currentLat = gps.location.lat();
  double currentLng = gps.location.lng();
  float distanceM = gpsDistanceMeters(currentLat, currentLng, navTargetLat, navTargetLng);
  float bearingDeg = gpsBearingDegrees(currentLat, currentLng, navTargetLat, navTargetLng);

  lastTargetDistanceM = distanceM;
  lastTargetBearingDeg = bearingDeg;

  if (distanceM <= NAV_ARRIVAL_TOLERANCE_M) {
    stopDrive();
    advanceWaypointOrStop(distanceM);
    return;
  }

  if (navDrivingSegment) {
    int navSpeed = cappedDrivePwm(driveSpeed);
    if (distanceM < NAV_SLOWDOWN_DISTANCE_M) {
      navSpeed = map((int)(distanceM * 100.0), (int)(NAV_ARRIVAL_TOLERANCE_M * 100.0), (int)(NAV_SLOWDOWN_DISTANCE_M * 100.0), MIN_TURN_PWM, cappedDrivePwm(driveSpeed));
    }
    int minForwardPwm = min(MIN_TURN_PWM, cappedDrivePwm(driveSpeed));
    activeDriveSpeed = constrain(navSpeed, minForwardPwm, cappedDrivePwm(driveSpeed));

    if (!driveIsMoving || driveDirection != 1) {
      beginForwardMotion(activeDriveSpeed);
    }
    return;
  }

  if (!navInitialHeadingSampled) {
    float initialHeading = readHeading();
    navInitialHeadingErrorDeg = headingError(bearingDeg, initialHeading);
    navInitialHeadingSampled = true;
    navInitialTurnComplete = abs(navInitialHeadingErrorDeg) <= HEADING_TOLERANCE_DEG;
    lastHeadingErrorDeg = navInitialHeadingErrorDeg;
  }

  if (!navInitialTurnComplete && (navTurnActive || abs(navInitialHeadingErrorDeg) > HEADING_TOLERANCE_DEG)) {
    if (!updateNavigationTurn(navInitialHeadingErrorDeg)) {
      return;
    }
    navInitialTurnComplete = true;
    return;
  }

  navHeadingAdjusting = false;
  driveTargetHeading = bearingDeg;
  int navSpeed = cappedDrivePwm(driveSpeed);
  if (distanceM < NAV_SLOWDOWN_DISTANCE_M) {
    navSpeed = map((int)(distanceM * 100.0), (int)(NAV_ARRIVAL_TOLERANCE_M * 100.0), (int)(NAV_SLOWDOWN_DISTANCE_M * 100.0), MIN_TURN_PWM, cappedDrivePwm(driveSpeed));
  }
  int minForwardPwm = min(MIN_TURN_PWM, cappedDrivePwm(driveSpeed));
  navSpeed = constrain(navSpeed, minForwardPwm, cappedDrivePwm(driveSpeed));

  readEncoderTicks(navSegmentStartLeftTicks, navSegmentStartRightTicks);
  navSegmentTargetM = max(0.10, distanceM - NAV_ARRIVAL_TOLERANCE_M);
  navDrivingSegment = true;
  resetEncoderPid();
  beginForwardMotion(navSpeed);
}

void printStatus() {
  long leftTicks;
  long rightTicks;
  readEncoderTicks(leftTicks, rightTicks);
  float heading = readHeading();

  Serial.print("STATUS");
  Serial.print("|heading=");
  Serial.print(heading, 2);
  printCompassFields(heading);
  Serial.print("|e1=");
  Serial.print(leftTicks);
  Serial.print("|e2=");
  Serial.print(rightTicks);
  Serial.print("|de1=");
  Serial.print(lastSpeedLeftDelta);
  Serial.print("|de2=");
  Serial.print(lastSpeedRightDelta);
  Serial.print("|left_m=");
  Serial.print(ticksToMeters(leftTicks), 3);
  Serial.print("|right_m=");
  Serial.print(ticksToMeters(rightTicks), 3);
  Serial.print("|speed=");
  Serial.print(measuredSpeedMps, 3);
  Serial.print("|lspeed=");
  Serial.print(driveIsMoving ? lastLeftCommandPwm : 0);
  Serial.print("|rspeed=");
  Serial.print(driveIsMoving ? lastRightCommandPwm : 0);
  Serial.print("|battery=0");
  printGpsFields();
  printNavigationFields();
  Serial.print("|drive_speed=");
  Serial.print(driveSpeed);
  Serial.print("|active_drive_speed=");
  Serial.print(activeDriveSpeed);
  Serial.print("|turn_speed=");
  Serial.print(turnSpeed);
  Serial.print("|auto_turn_speed=");
  Serial.print(autoTurnSpeed);
  Serial.print("|speed_cap=");
  Serial.print(speedCap);
  Serial.print("|drive_moving=");
  Serial.print(driveIsMoving ? 1 : 0);
  Serial.print("|wheel_radius_m=");
  Serial.print(wheelRadiusM, 3);
  Serial.print("|plot_mode=");
  Serial.print(plotterModeName());
  Serial.print("|plot_speed=");
  Serial.print(plotterSpeed);
  Serial.print("|spraying=");
  Serial.print((driveIsMoving && plotterMode != PLOTTER_OFF && !plotDistanceReached) ? 1 : 0);
  Serial.print("|dash_m=");
  Serial.print(dashPaintDistanceM, 3);
  Serial.print("|gap_m=");
  Serial.print(dashGapDistanceM, 3);
  Serial.print("|plot_target_m=");
  Serial.print(plotDistanceTargetM, 3);
  Serial.print("|plot_done=");
  Serial.println(plotDistanceReached ? 1 : 0);
}

void printStatusIfDue() {
  if (millis() - lastTelemetryMs >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryMs = millis();
    if (gpsOnlyMode) printGpsStatus();
    else printStatus();
  }
}

bool abortTurnCommandReceived() {
  if (Serial.available() == 0) return false;

  String cmd = Serial.readStringUntil('\n');
  cmd.trim();
  cmd.toUpperCase();

  if (cmd == "S" || cmd == "STOP") {
    stopDrive();
    setPlotterMode(PLOTTER_OFF);
    return true;
  }

  return false;
}

int turnPwmForError(float errorDeg, long encoderDelta, long expectedTicks) {
  int maxTurnPwm = constrain(turnSpeed, MIN_TURN_PWM, speedCap);
  float absError = abs(errorDeg);

  int headingPwm = map(constrain((int)absError, 0, 90), 0, 90, MIN_TURN_PWM, maxTurnPwm);
  int encoderPwm = maxTurnPwm;

  if (expectedTicks > 0) {
    float progress = constrain((float)encoderDelta / expectedTicks, 0.0, 1.0);
    encoderPwm = map((int)(progress * 100.0), 0, 100, maxTurnPwm, MIN_TURN_PWM);
  }

  return constrain(min(headingPwm, encoderPwm), MIN_TURN_PWM, maxTurnPwm);
}

void turnNinety(int direction) {
  long startLeftTicks;
  long startRightTicks;
  readEncoderTicks(startLeftTicks, startRightTicks);

  float startHeading = readHeading();
  float targetHeading = normalizeHeading(startHeading + (direction * TURN_ANGLE_DEG));
  float expectedWheelTravelM = (PI * ROBOT_TRACK_WIDTH_M) * (TURN_ANGLE_DEG / 360.0);
  long expectedTicks = expectedWheelTravelM / wheelCircumferenceM() * TICKS_PER_REV;
  unsigned long startMs = millis();

  Serial.print(direction < 0 ? "ACK:TURN_LEFT_90" : "ACK:TURN_RIGHT_90");
  Serial.print("|start=");
  Serial.print(startHeading, 2);
  Serial.print("|target=");
  Serial.print(targetHeading, 2);
  Serial.print("|turn_speed=");
  Serial.print(turnSpeed);
  Serial.print("|expected_ticks=");
  Serial.println(expectedTicks);

  while (millis() - startMs < TURN_TIMEOUT_MS) {
    updateGps();
    updatePlotter();
    printStatusIfDue();

    float currentHeading = readHeading();
    float error = headingError(targetHeading, currentHeading);
    if (abs(error) <= HEADING_TOLERANCE_DEG) {
      stopDrive();
      Serial.print("ACK:TURN_DONE|heading=");
      Serial.println(currentHeading, 2);
      printStatus();
      return;
    }

    if (abortTurnCommandReceived()) {
      Serial.println("ACK:TURN_ABORTED");
      return;
    }

    long leftTicks;
    long rightTicks;
    readEncoderTicks(leftTicks, rightTicks);
    long leftDelta = abs(leftTicks - startLeftTicks);
    long rightDelta = abs(rightTicks - startRightTicks);
    long averageDelta = (leftDelta + rightDelta) / 2;

    if (averageDelta > expectedTicks * 1.35) {
      stopDrive();
      Serial.println("WARN:TURN_STOPPED_BY_ENCODER_LIMIT");
      printStatus();
      return;
    }

    int turnPwm = turnPwmForError(error, averageDelta, expectedTicks);
    if (direction < 0) startSpinLeft(turnPwm);
    else startSpinRight(turnPwm);
  }

  stopDrive();
  Serial.println("WARN:TURN_TIMEOUT");
  printStatus();
}

void stopAll() {
  clearNavigationState(false);
  stopDrive();
  setPlotterMode(PLOTTER_OFF);
}

void printHelp() {
  Serial.println();
  Serial.println("Combined RoboScan Commands");
  Serial.println("  W / X / A / D / S       forward / backward / left 90 / right 90 / stop all");
  Serial.println("  SPEED <0-255>           set drive speed");
  Serial.println("  TURN SPEED <0-255>      set slower/faster turn speed");
  Serial.println("  SPEED CAP <0-255>       cap all drive and turn PWM");
  Serial.println("  AUTO TURN SPEED <0-255> set autonomous heading turn speed");
  Serial.println("  COMPASS OFFSET <deg>    QMC5883L correction added to raw compass heading");
  Serial.println("  MOTOR TRIM <l> <r>      static left/right PWM bias (-50 to 50)");
  Serial.println("  ENCODER PID <p> <i> <d> encoder drift PID gains");
  Serial.println("  GOTO <lat> <lng>        drive to one GPS waypoint, stops within 2m");
  Serial.println("  WP BEGIN <count>        clear and begin loading a waypoint route");
  Serial.println("  WP CLEAR                clear queued waypoints");
  Serial.println("  WP ADD <n> <lat> <lng>  add ordered waypoint to queue");
  Serial.println("  WP START / PAUSE / RESUME / STOP control queued waypoint navigation");
  Serial.println("  PLOT CONT               plotter continuous while moving");
  Serial.println("  PLOT DASH               plotter dashed while moving");
  Serial.println("  PLOT DASH DIST <d> <g>  dashed plot/gap distances in meters");
  Serial.println("  PLOT OFF                plotter off");
  Serial.println("  PLOT SPEED <0-255>      set plotter speed");
  Serial.println("  PLOT DIST <meters>      plot for distance, 0 = unlimited");
  Serial.println("  PLOT TICKS <ticks>      plot for encoder ticks, 0 = unlimited");
  Serial.println("  WHEEL RADIUS <meters>   set wheel radius for distance math");
  Serial.println("  STATUS                  print sensor and mode data");
  Serial.println("  GPS STATUS              print GPS-only status");
  Serial.println("  GPS ONLY ON/OFF         read and stream GPS data only");
  Serial.println("  HELP                    show this menu");
  Serial.println();
}

void handleCommand(String cmd) {
  cmd.trim();
  if (cmd.length() == 0) return;
  cmd.toUpperCase();

  if (navActive && (cmd == "W" || cmd == "X" || cmd == "A" || cmd == "D")) {
    Serial.println("WARN:NAV_ACTIVE_MANUAL_MOVE_IGNORED");
    return;
  }

  if (cmd == "W") {
    gpsOnlyMode = false;
    clearNavigationState(false);
    driveForward(driveSpeed);
  } else if (cmd == "X") {
    gpsOnlyMode = false;
    clearNavigationState(false);
    driveBackward(driveSpeed);
  } else if (cmd == "A") {
    gpsOnlyMode = false;
    clearNavigationState(false);
    turnNinety(-1);
  } else if (cmd == "D") {
    gpsOnlyMode = false;
    clearNavigationState(false);
    turnNinety(1);
  } else if (cmd == "S" || cmd == "STOP") {
    stopAll();
  } else if (cmd.startsWith("SPEED CAP ")) {
    speedCap = constrain(cmd.substring(10).toInt(), 0, 255);
    driveSpeed = cappedDrivePwm(driveSpeed);
    turnSpeed = cappedDrivePwm(turnSpeed);
    autoTurnSpeed = cappedDrivePwm(autoTurnSpeed);
    Serial.print("ACK:SPEED_CAP|speed_cap=");
    Serial.println(speedCap);
  } else if (cmd.startsWith("SPEED ")) {
    driveSpeed = cappedDrivePwm(cmd.substring(6).toInt());
    Serial.print("ACK:SPEED|drive_speed=");
    Serial.println(driveSpeed);
  } else if (cmd.startsWith("TURN SPEED ")) {
    turnSpeed = cappedDrivePwm(cmd.substring(11).toInt());
    Serial.print("ACK:TURN_SPEED|speed=");
    Serial.println(turnSpeed);
  } else if (cmd.startsWith("AUTO TURN SPEED ")) {
    autoTurnSpeed = cappedDrivePwm(cmd.substring(16).toInt());
    Serial.print("ACK:AUTO_TURN_SPEED|speed=");
    Serial.println(autoTurnSpeed);
  } else if (cmd.startsWith("COMPASS OFFSET ")) {
    compassOffsetDeg = constrain(cmd.substring(15).toFloat(), -180.0, 180.0);
    Serial.print("ACK:COMPASS_OFFSET|degrees=");
    Serial.println(compassOffsetDeg, 2);
  } else if (cmd.startsWith("MOTOR TRIM ")) {
    int valuesStart = 11;
    int separator = cmd.indexOf(' ', valuesStart);
    if (separator < 0) {
      Serial.println("ERROR:Use_MOTOR_TRIM_left_bias_right_bias");
      return;
    }
    motorTrimLeft = constrain(cmd.substring(valuesStart, separator).toInt(), -MOTOR_TRIM_LIMIT, MOTOR_TRIM_LIMIT);
    motorTrimRight = constrain(cmd.substring(separator + 1).toInt(), -MOTOR_TRIM_LIMIT, MOTOR_TRIM_LIMIT);
    Serial.print("ACK:MOTOR_TRIM|left=");
    Serial.print(motorTrimLeft);
    Serial.print("|right=");
    Serial.println(motorTrimRight);
  } else if (cmd.startsWith("ENCODER PID ")) {
    int valuesStart = 12;
    int firstSeparator = cmd.indexOf(' ', valuesStart);
    int secondSeparator = firstSeparator < 0 ? -1 : cmd.indexOf(' ', firstSeparator + 1);
    if (firstSeparator < 0 || secondSeparator < 0) {
      Serial.println("ERROR:Use_ENCODER_PID_kp_ki_kd");
      return;
    }
    encoderPidKp = cmd.substring(valuesStart, firstSeparator).toFloat();
    encoderPidKi = cmd.substring(firstSeparator + 1, secondSeparator).toFloat();
    encoderPidKd = cmd.substring(secondSeparator + 1).toFloat();
    resetEncoderPid();
    Serial.print("ACK:ENCODER_PID|kp=");
    Serial.print(encoderPidKp, 3);
    Serial.print("|ki=");
    Serial.print(encoderPidKi, 3);
    Serial.print("|kd=");
    Serial.println(encoderPidKd, 3);
  } else if (cmd.startsWith("GOTO ")) {
    int valuesStart = 5;
    int separator = cmd.indexOf(' ', valuesStart);
    if (separator < 0) {
      Serial.println("ERROR:Use_GOTO_lat_lng");
      return;
    }
    double targetLat = cmd.substring(valuesStart, separator).toFloat();
    double targetLng = cmd.substring(separator + 1).toFloat();
    startNavigation(targetLat, targetLng);
  } else if (cmd.startsWith("WP BEGIN ")) {
    beginWaypointRoute(cmd.substring(9).toInt());
  } else if (cmd == "WP CLEAR") {
    clearWaypointQueue();
    stopDrive();
    Serial.println("ACK:WP_CLEAR");
  } else if (cmd.startsWith("WP ADD ")) {
    int valuesStart = 7;
    int firstSeparator = cmd.indexOf(' ', valuesStart);
    int secondSeparator = firstSeparator < 0 ? -1 : cmd.indexOf(' ', firstSeparator + 1);
    if (firstSeparator < 0 || secondSeparator < 0) {
      Serial.println("ERROR:Use_WP_ADD_order_lat_lng");
      return;
    }
    int order = cmd.substring(valuesStart, firstSeparator).toInt();
    double targetLat = cmd.substring(firstSeparator + 1, secondSeparator).toFloat();
    double targetLng = cmd.substring(secondSeparator + 1).toFloat();
    if (!addWaypointToQueue(order, targetLat, targetLng)) {
      setWaypointError(waypointCount >= MAX_WAYPOINTS ? "WP_queue_full" : "WP_route_not_loading");
      return;
    }
    Serial.print("ACK:WP_ADD|order=");
    Serial.print(order);
    Serial.print("|count=");
    Serial.println(waypointCount);
  } else if (cmd == "WP START") {
    startWaypointQueue();
  } else if (cmd == "WP PAUSE") {
    pauseWaypointQueue();
  } else if (cmd == "WP RESUME") {
    resumeWaypointQueue();
  } else if (cmd == "WP STOP") {
    stopNavigation(false);
    Serial.println("ACK:WP_STOP");
  } else if (cmd == "PLOT CONT" || cmd == "CONT") {
    setPlotterMode(PLOTTER_CONT);
  } else if (cmd == "PLOT DASH" || cmd == "DASH") {
    setPlotterMode(PLOTTER_DASH);
  } else if (cmd.startsWith("PLOT DASH DIST ")) {
    int valuesStart = 15;
    int separator = cmd.indexOf(' ', valuesStart);
    if (separator < 0) {
      Serial.println("ERROR:Use_PLOT_DASH_DIST_dash_m_gap_m");
      return;
    }
    float nextDashM = cmd.substring(valuesStart, separator).toFloat();
    float nextGapM = cmd.substring(separator + 1).toFloat();
    if (nextDashM <= 0.0 || nextGapM <= 0.0) {
      Serial.println("ERROR:Dash_and_gap_must_be_positive");
      return;
    }
    dashPaintDistanceM = nextDashM;
    dashGapDistanceM = nextGapM;
    resetDashSegmentStart();
    Serial.print("ACK:PLOT_DASH_DIST|dash_m=");
    Serial.print(dashPaintDistanceM, 3);
    Serial.print("|gap_m=");
    Serial.println(dashGapDistanceM, 3);
  } else if (cmd == "PLOT OFF") {
    setPlotterMode(PLOTTER_OFF);
  } else if (cmd.startsWith("PLOT SPEED ")) {
    plotterSpeed = constrain(cmd.substring(11).toInt(), 0, 255);
    Serial.print("ACK:PLOT_SPEED|speed=");
    Serial.println(plotterSpeed);
  } else if (cmd.startsWith("PLOT DIST ")) {
    plotDistanceTargetM = cmd.substring(10).toFloat();
    if (plotDistanceTargetM < 0.0) plotDistanceTargetM = 0.0;
    plotDistanceStartSet = false;
    plotDistanceReached = false;
    Serial.print("ACK:PLOT_DIST|meters=");
    Serial.println(plotDistanceTargetM, 3);
  } else if (cmd.startsWith("PLOT TICKS ")) {
    long targetTicks = cmd.substring(11).toInt();
    if (targetTicks < 0) targetTicks = 0;
    plotDistanceTargetM = ticksToDistanceM(targetTicks);
    plotDistanceStartSet = false;
    plotDistanceReached = false;
    Serial.print("ACK:PLOT_TICKS|ticks=");
    Serial.print(targetTicks);
    Serial.print("|meters=");
    Serial.println(plotDistanceTargetM, 3);
  } else if (cmd.startsWith("WHEEL RADIUS ")) {
    float newRadius = cmd.substring(13).toFloat();
    if (newRadius > 0.0) {
      wheelRadiusM = newRadius;
      plotDistanceStartSet = false;
      plotDistanceReached = false;
      Serial.print("ACK:WHEEL_RADIUS|meters=");
      Serial.println(wheelRadiusM, 3);
    } else {
      Serial.println("ERROR:Wheel_radius_must_be_positive");
    }
  } else if (cmd == "STATUS") {
    printStatus();
  } else if (cmd == "GPS STATUS") {
    printGpsStatus();
  } else if (cmd == "GPS ONLY ON") {
    gpsOnlyMode = true;
    stopAll();
    Serial.println("ACK:GPS_ONLY|enabled=1");
    printGpsStatus();
  } else if (cmd == "GPS ONLY OFF") {
    gpsOnlyMode = false;
    Serial.println("ACK:GPS_ONLY|enabled=0");
    printStatus();
  } else if (cmd == "HELP") {
    printHelp();
  } else {
    Serial.print("ERROR:Unknown_command|cmd=");
    Serial.println(cmd);
    printHelp();
  }
}

void setup() {
  Serial.begin(SERIAL_BAUD_RATE);
  Serial2.begin(GPS_BAUD_RATE);
  Serial.setTimeout(100);

  pinMode(M1_RPWM, OUTPUT);
  pinMode(M1_LPWM, OUTPUT);
  pinMode(M1_R_EN, OUTPUT);
  pinMode(M1_L_EN, OUTPUT);
  pinMode(M2_RPWM, OUTPUT);
  pinMode(M2_LPWM, OUTPUT);
  pinMode(M2_R_EN, OUTPUT);
  pinMode(M2_L_EN, OUTPUT);
  pinMode(PLOTTER_RPWM, OUTPUT);
  pinMode(PLOTTER_LPWM, OUTPUT);
  pinMode(PLOTTER_R_EN, OUTPUT);
  pinMode(PLOTTER_L_EN, OUTPUT);
  pinMode(ENC_LEFT_A, INPUT_PULLUP);
  pinMode(ENC_LEFT_B, INPUT_PULLUP);
  pinMode(ENC_RIGHT_A, INPUT_PULLUP);
  pinMode(ENC_RIGHT_B, INPUT_PULLUP);

  digitalWrite(M1_R_EN, HIGH);
  digitalWrite(M1_L_EN, HIGH);
  digitalWrite(M2_R_EN, HIGH);
  digitalWrite(M2_L_EN, HIGH);
  digitalWrite(PLOTTER_R_EN, HIGH);
  digitalWrite(PLOTTER_L_EN, HIGH);

  attachInterrupt(digitalPinToInterrupt(ENC_LEFT_A), onLeftA, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENC_LEFT_B), onLeftB, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENC_RIGHT_A), onRightA, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENC_RIGHT_B), onRightB, CHANGE);

  Wire.begin();
  initCompass();

  stopAll();
  readEncoderTicks(lastSpeedLeftTicks, lastSpeedRightTicks);
  lastSpeedSampleMs = millis();

  Serial.print("READY:Combined_RoboScan_controller|baud=");
  Serial.println(SERIAL_BAUD_RATE);
  Serial.print("READY:GPS_Serial2|baud=");
  Serial.println(GPS_BAUD_RATE);
  printHelp();
}

void loop() {
  updateGps();

  if (gpsOnlyMode) {
    printStatusIfDue();
    if (Serial.available() > 0) {
      handleCommand(Serial.readStringUntil('\n'));
    }
    return;
  }

  updateMeasuredSpeed();
  updateNavigation();
  updateDriveControl();
  updatePlotter();
  printStatusIfDue();

  if (Serial.available() > 0) {
    handleCommand(Serial.readStringUntil('\n'));
  }
}
