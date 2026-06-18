# Semi Mode Marking And Heading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-step marking controls and fixed 90-degree turn behavior to semi mode while fixing preview heading so map marks follow the commanded direction after turns.

**Architecture:** Extend the semi scripted step model with a per-step marking flag and central normalization helpers in `RobotContext.tsx`. Update `semiPreview.ts` so it simulates heading changes deterministically and paints only marked straight steps. Adjust `ControlTab.tsx` to derive the form from the selected direction instead of allowing invalid turn-distance combinations.

**Tech Stack:** React, TypeScript, Vite, Node test runner

---

### Task 1: Lock Down Preview Semantics With Failing Tests

**Files:**
- Modify: `RoboScanV3/src/app/lib/semiPreview.test.ts`
- Test: `RoboScanV3/src/app/lib/semiPreview.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
test('move-only step travels without painting', () => {
  const preview = generateSemiPreview({
    gps: baseGps,
    fallbackGps: baseGps,
    scriptedMoves: [step({ markingEnabled: false })],
    fallbackMove: step({ markingEnabled: false }),
    painting: solidPainting,
  });

  assert.equal(preview.estimatedTravelMeters > 9.5, true);
  assert.equal(preview.estimatedPaintMeters, 0);
  assert.equal(preview.paintedSegments.length, 0);
});

test('right turn followed by forward step uses the new heading', () => {
  const preview = generateSemiPreview({
    gps: baseGps,
    fallbackGps: baseGps,
    scriptedMoves: [
      step({ direction: 'right', movementType: 'turn', distance: 0, speed: 0.5, markingEnabled: false }),
      step({ direction: 'forward', movementType: 'straight', distance: 8, speed: 1, markingEnabled: true }),
    ],
    fallbackMove: step({}),
    painting: solidPainting,
  });

  const end = preview.movementPoints.at(-1)!;
  assert.equal(preview.finalHeading > 80 && preview.finalHeading < 100, true);
  assert.equal(end[1] > baseGps.lng, true);
  assert.equal(Math.abs(end[0] - baseGps.lat) < 0.00002, true);
});

test('turn-only step rotates in place without adding paint distance', () => {
  const preview = generateSemiPreview({
    gps: baseGps,
    fallbackGps: baseGps,
    scriptedMoves: [step({ direction: 'left', movementType: 'turn', distance: 0, speed: 0.5, markingEnabled: true })],
    fallbackMove: step({ direction: 'left', movementType: 'turn', distance: 0, speed: 0.5, markingEnabled: true }),
    painting: solidPainting,
  });

  assert.equal(preview.estimatedTravelMeters < 0.1, true);
  assert.equal(preview.estimatedPaintMeters, 0);
  assert.equal(preview.finalHeading > 260 && preview.finalHeading < 280, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/lib/semiPreview.test.ts`
Expected: FAIL because `markingEnabled` is not part of the step model and turn preview still produces travel/paint behavior inconsistent with the new expectations.

- [ ] **Step 3: Write minimal test support updates**

```typescript
function step(overrides: Partial<ScriptedMoveStep>): ScriptedMoveStep {
  return {
    id: 'step-1',
    direction: 'forward',
    movementType: 'straight',
    distance: 10,
    speed: 1,
    markingEnabled: true,
    ...overrides,
  };
}
```

- [ ] **Step 4: Run test to verify the failure is now about production behavior**

Run: `npm test -- src/app/lib/semiPreview.test.ts`
Expected: FAIL on assertions about heading, travel, or paint rather than type/setup errors.

- [ ] **Step 5: Commit**

```bash
git add RoboScanV3/src/app/lib/semiPreview.test.ts
git commit -m "test: cover semi preview turn and marking behavior"
```

### Task 2: Normalize Semi Steps In Shared Context

**Files:**
- Modify: `RoboScanV3/src/app/context/RobotContext.tsx`
- Test: `RoboScanV3/src/app/lib/semiPreview.test.ts`

- [ ] **Step 1: Write the failing normalization-focused test through preview entry points**

```typescript
test('left and right turns can be previewed with zero distance', () => {
  const preview = generateSemiPreview({
    gps: baseGps,
    fallbackGps: baseGps,
    scriptedMoves: [step({ direction: 'right', movementType: 'turn', distance: 0, markingEnabled: false })],
    fallbackMove: step({ direction: 'right', movementType: 'turn', distance: 0, markingEnabled: false }),
    painting: solidPainting,
  });

  assert.equal(preview.finalHeading > 80 && preview.finalHeading < 100, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/lib/semiPreview.test.ts`
Expected: FAIL if preview or typed state still depends on turn distance semantics.

- [ ] **Step 3: Implement shared step normalization in `RobotContext.tsx`**

```typescript
function normalizeScriptedMove(step: ScriptedMove): ScriptedMove {
  const speed = clampSpeed(step.speed, DEFAULT_ROBOT_SPEED_CAP);
  if (step.direction === 'left' || step.direction === 'right') {
    return {
      ...step,
      movementType: 'turn',
      distance: 0,
      speed,
    };
  }
  return {
    ...step,
    movementType: 'straight',
    distance: Math.max(0.1, step.distance),
    speed,
  };
}
```

- [ ] **Step 4: Apply normalization at state mutation boundaries**

```typescript
const setScriptedMove = useCallback((move: Partial<ScriptedMove>) => {
  setScriptedMoveState((prev) => normalizeScriptedMove({
    ...prev,
    ...move,
    speed: move.speed === undefined ? prev.speed : capSpeed(move.speed),
  }));
}, [capSpeed]);

const addScriptedMove = useCallback(() => {
  setScriptedMoves((prev) => [
    ...prev,
    { ...normalizeScriptedMove({ ...scriptedMoveState, speed: capSpeed(scriptedMoveState.speed || semiSpeed) }), id: `step-${Date.now()}-${prev.length}` },
  ]);
}, [capSpeed, scriptedMoveState, semiSpeed]);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/app/lib/semiPreview.test.ts`
Expected: fewer failures, with any remaining failures isolated to preview rendering or UI assumptions.

- [ ] **Step 6: Commit**

```bash
git add RoboScanV3/src/app/context/RobotContext.tsx RoboScanV3/src/app/lib/semiPreview.test.ts
git commit -m "refactor: normalize semi scripted steps"
```

### Task 3: Fix Preview Heading And Per-Step Painting

**Files:**
- Modify: `RoboScanV3/src/app/lib/semiPreview.ts`
- Modify: `RoboScanV3/src/app/lib/semiPreview.test.ts`
- Test: `RoboScanV3/src/app/lib/semiPreview.test.ts`

- [ ] **Step 1: Write the failing mixed-sequence preview test**

```typescript
test('mixed sequence tracks travel for all steps and paint only for marked straight steps', () => {
  const preview = generateSemiPreview({
    gps: baseGps,
    fallbackGps: baseGps,
    scriptedMoves: [
      step({ direction: 'forward', distance: 5, markingEnabled: true }),
      step({ direction: 'right', movementType: 'turn', distance: 0, markingEnabled: false }),
      step({ direction: 'forward', distance: 3, markingEnabled: false }),
      step({ direction: 'forward', distance: 4, markingEnabled: true }),
    ],
    fallbackMove: step({}),
    painting: solidPainting,
  });

  assert.equal(preview.estimatedTravelMeters > 11.5 && preview.estimatedTravelMeters < 12.5, true);
  assert.equal(preview.estimatedPaintMeters > 8.5 && preview.estimatedPaintMeters < 9.5, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/lib/semiPreview.test.ts`
Expected: FAIL because preview currently paints the whole path and simulates turns as curved travel.

- [ ] **Step 3: Replace global path painting with step-aware paint collection**

```typescript
type StepPreview = {
  movementPoints: LatLngTuple[];
  paintedSegments: LatLngTuple[][];
  finalCursor: Cursor;
};

function simulateStepPreview(move: ScriptedMoveStep, cursor: Cursor, painting: PaintingState): StepPreview {
  if (move.direction === 'left' || move.direction === 'right' || move.movementType === 'turn') {
    return {
      movementPoints: [[cursor.lat, cursor.lng]],
      paintedSegments: [],
      finalCursor: {
        ...cursor,
        heading: normalizeHeading(cursor.heading + (move.direction === 'right' ? 90 : -90)),
      },
    };
  }

  const movementPoints = simulateStraight(move, cursor).map(([lat, lng]) => [lat, lng] as LatLngTuple);
  const line = dedupeMovementPoints([[cursor.lat, cursor.lng], ...movementPoints]);
  const paintedSegments = move.markingEnabled ? buildPaintedSegments(line, painting) : [];
  const last = line.at(-1)!;

  return {
    movementPoints: line,
    paintedSegments,
    finalCursor: { lat: last[0], lng: last[1], heading: cursor.heading },
  };
}
```

- [ ] **Step 4: Update `generateSemiPreview` to aggregate step previews**

```typescript
const movementPoints: LatLngTuple[] = [start];
const paintedSegments: LatLngTuple[][] = [];

for (const move of steps) {
  const preview = simulateStepPreview(move, cursor, painting);
  appendMovementLine(movementPoints, preview.movementPoints);
  paintedSegments.push(...preview.paintedSegments);
  estimatedTravelMeters += measureLine(preview.movementPoints);
  cursor.lat = preview.finalCursor.lat;
  cursor.lng = preview.finalCursor.lng;
  cursor.heading = preview.finalCursor.heading;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/app/lib/semiPreview.test.ts`
Expected: PASS for all preview behavior tests, including post-turn heading and move-only paint suppression.

- [ ] **Step 6: Commit**

```bash
git add RoboScanV3/src/app/lib/semiPreview.ts RoboScanV3/src/app/lib/semiPreview.test.ts
git commit -m "fix: correct semi preview heading and paint segments"
```

### Task 4: Update Semi Mode Editor And Queue Display

**Files:**
- Modify: `RoboScanV3/src/app/components/tabs/ControlTab.tsx`
- Modify: `RoboScanV3/src/app/context/RobotContext.tsx`
- Test: `RoboScanV3/src/app/lib/semiPreview.test.ts`

- [ ] **Step 1: Write the UI-driven behavior checklist in code comments near the semi editor**

```tsx
// Semi mode rules:
// - forward/backward show distance and use straight movement
// - left/right are fixed 90-degree turns
// - each step can be mark or move-only
```

- [ ] **Step 2: Derive turn-vs-linear UI state from the selected direction**

```tsx
const isTurnDirection = robot.scriptedMove.direction === 'left' || robot.scriptedMove.direction === 'right';
const markingMode = robot.scriptedMove.markingEnabled ? 'mark' : 'move-only';
```

- [ ] **Step 3: Replace invalid controls with constrained inputs**

```tsx
<Select
  label="Direction"
  value={robot.scriptedMove.direction}
  onChange={(value) => robot.setScriptedMove({ direction: value as any })}
  options={['forward', 'backward', 'left', 'right']}
  th={th}
/>
{!isTurnDirection && (
  <NumberInput
    label="Distance (m)"
    value={robot.scriptedMove.distance}
    min={0.1}
    step={0.1}
    onChange={(value) => robot.setScriptedMove({ distance: value })}
    th={th}
  />
)}
<Select
  label="Step Mode"
  value={markingMode}
  onChange={(value) => robot.setScriptedMove({ markingEnabled: value === 'mark' })}
  options={['mark', 'move-only']}
  th={th}
/>
```

- [ ] **Step 4: Label turn steps and queue rows clearly**

```tsx
<span className="truncate">
  {step.direction === 'left' || step.direction === 'right'
    ? `${step.direction} • turn 90 deg • ${step.markingEnabled ? 'mark' : 'move-only'}`
    : `${step.direction} • ${step.distance.toFixed(1)} m • ${step.markingEnabled ? 'mark' : 'move-only'}`}
</span>
```

- [ ] **Step 5: Run targeted tests to verify no preview regression**

Run: `npm test -- src/app/lib/semiPreview.test.ts`
Expected: PASS while semi-mode UI changes remain type-safe.

- [ ] **Step 6: Commit**

```bash
git add RoboScanV3/src/app/components/tabs/ControlTab.tsx RoboScanV3/src/app/context/RobotContext.tsx
git commit -m "feat: constrain semi mode step inputs"
```

### Task 5: Verify End-To-End Behavior

**Files:**
- Modify: `RoboScanV3/src/app/components/tabs/ControlTab.tsx` (only if cleanup is needed)
- Modify: `RoboScanV3/src/app/context/RobotContext.tsx` (only if cleanup is needed)
- Modify: `RoboScanV3/src/app/lib/semiPreview.ts` (only if cleanup is needed)
- Test: `RoboScanV3/package.json` scripts as invoked below

- [ ] **Step 1: Run the full targeted test file**

Run: `npm test -- src/app/lib/semiPreview.test.ts`
Expected: PASS

- [ ] **Step 2: Run the broader app test suite**

Run: `npm test`
Expected: PASS with no new failures

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: build completes successfully

- [ ] **Step 4: Review the diff for plan/spec alignment**

```bash
git diff -- RoboScanV3/src/app/context/RobotContext.tsx RoboScanV3/src/app/lib/semiPreview.ts RoboScanV3/src/app/lib/semiPreview.test.ts RoboScanV3/src/app/components/tabs/ControlTab.tsx
```

Expected: changes show per-step marking, fixed turn rules, and corrected heading preview with no unrelated edits.

- [ ] **Step 5: Commit**

```bash
git add RoboScanV3/src/app/context/RobotContext.tsx RoboScanV3/src/app/lib/semiPreview.ts RoboScanV3/src/app/lib/semiPreview.test.ts RoboScanV3/src/app/components/tabs/ControlTab.tsx
git commit -m "feat: improve semi mode marking and heading preview"
```
