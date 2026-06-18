# Semi Mode, Map, And Turn Consistency Design

## Goal

Align the RoboScan control stack so semi-mode movement, preview rendering, live map behavior, and Arduino turn handling all follow one motion model:

- `forward` and `backward` move in straight lines and may use distance
- `left` and `right` are in-place turns only
- previewed dashed marking must match the entered dash and gap values
- the map must show a single active location source at a time
- turn behavior must use one constant speed across UI and Arduino handling
- the map viewport must not auto-refocus while telemetry updates

## Existing Context

The operator controls and semi-mode editor live in `RoboScanV3/src/app/components/tabs/ControlTab.tsx`.
The live D-pad lives in `RoboScanV3/src/app/components/DPad.tsx`.
The live map view lives in `RoboScanV3/src/app/components/tabs/MapTab.tsx`.
The map source helpers live in `RoboScanV3/src/app/lib/mapSettings.ts`.
Semi preview generation lives in `RoboScanV3/src/app/lib/semiPreview.ts`.
Semi queue state and command dispatch live in `RoboScanV3/src/app/context/RobotContext.tsx`.
Arduino drive and turn behavior live in `Arduino/combined_robot_plotter/combined_robot_plotter.ino`.

The current implementation mixes incompatible models:

- semi-mode still exposes `straight`, `turn`, and `arc`
- left/right preview logic can still depend on obsolete turn and arc branches
- previewed dashed marking uses fixed internal values instead of the operator input
- the map can recenter automatically as the chosen source updates
- map rendering can still surface multiple logical positions in the same flow
- turn speed is configurable independently instead of enforced as one constant

## Approved Behavior

### Motion Model

- `forward` and `backward` remain straight travel commands
- `forward` and `backward` accept distance input in meters
- `left` and `right` are fixed in-place rotations
- `left` and `right` never expose distance input
- no scripted step may use `arc`
- no preview path may draw an arc
- no execution branch should rely on arc semantics

### Marking Controls

- each scripted step keeps its own marking enable flag
- when marking is enabled, the operator can choose `solid` or `dashed`
- dashed marking exposes both `dash` and `gap` inputs in meters
- the previewed painted path must use the exact step dash and gap values instead of fixed defaults
- move-only steps contribute to travel and heading changes but not painted output

### Map Behavior

- the main map shows one primary location source at a time
- when the source is `robot`, show robot only
- when the source is `operator`, show operator only
- the map must not automatically fit bounds or recenter after the user has focused an area
- route and preview rendering should still update in place without moving the viewport

### Turn Consistency

- the app uses one fixed in-place turn speed constant for left/right commands
- the Arduino layer uses the matching fixed in-place turn constant
- the effective fixed turn speed is `0.1`
- turn speed is no longer user-configurable for this path in a way that can drift from the constant

## Data Model Changes

The scripted move model should be simplified to remove obsolete branching and keep step-local marking settings explicit.

Expected shape:

- `direction`: `forward | backward | left | right`
- `distance`: meaningful only for `forward | backward`
- `speed`: meaningful for straight travel steps
- `markingEnabled`: boolean
- `markingMode`: `solid | dashed`
- `markingDistance`: target painted distance for the step
- `dashLength`: per-step dashed paint length in meters
- `gapLength`: per-step dashed gap length in meters

Normalization rules:

- selecting `left` or `right` clears or ignores `distance`
- selecting `left` or `right` clears or ignores straight-only paint distance assumptions tied to travel geometry
- selecting `forward` or `backward` restores straight-travel editing
- all legacy `movementType` branches should be removed or normalized away so unsupported modes cannot be reintroduced through state

## Implementation Design

### UI

In `ControlTab.tsx`:

- remove the semi-step movement type selector
- hide distance input for `left` and `right`
- add step-local dashed `dash` and `gap` inputs when marking mode is dashed
- show queued steps using the simplified motion wording so operators can see turn-in-place versus straight travel clearly

In `DPad.tsx`:

- keep `left` and `right` as angular-only commands
- enforce the fixed turn constant so the live control layer matches the semi-mode behavior

### Context And Execution

In `RobotContext.tsx`:

- simplify scripted move types to the supported motion model only
- normalize scripted step updates when direction changes
- keep speed clamping for straight travel
- execute left/right as fixed in-place turn commands
- remove execution logic that still depends on `turn` or `arc`
- send per-step dashed paint parameters when required

### Preview

In `semiPreview.ts`:

- remove arc simulation
- remove turn-as-travel simulation
- treat left/right as heading-only `90°` updates
- keep straight movement sampling for forward/backward only
- generate dashed painted segments from each step’s configured `dash` and `gap`
- ensure every post-turn straight segment projects from the updated heading

### Map

In `MapTab.tsx` and shared helpers:

- render only the primary marker for the selected source
- keep route and heading overlays, but do not also render the inactive location source
- stop viewport auto-sync that changes the user’s focused map area
- use the preview/path dash settings only where they represent actual configured dashed output

### Arduino

In `combined_robot_plotter.ino`:

- define one fixed turn-speed constant matching the app’s `0.1` in-place turn speed
- route manual left/right turn handling through that constant instead of user-driftable values for this motion path
- keep turn execution in place only
- preserve existing forward/backward drive behavior

## Testing

Add or update tests to cover:

- forward marking step paints and moves by entered distance
- dashed step preview uses the entered dash and gap values
- move-only step moves without painted segments
- left/right turn updates heading without generating travel points
- a straight step after a turn follows the new heading
- map helper logic returns one active primary marker only
- map center logic no longer forces auto-refocus behavior through syncing components
- scripted move normalization removes unsupported motion modes

## Risks And Constraints

- preview and execution must remain aligned or the operator will trust a false map
- removing `movementType` must not break any existing queued-step rendering or command serialization
- the `0.1` turn constant must be translated consistently between UI-level units and Arduino command handling
- disabling viewport auto-focus must not block initial map load or manual interaction
