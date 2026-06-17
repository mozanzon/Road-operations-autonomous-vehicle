# RoboScan UI Updates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the RoboScan operations and reporting UI so model usage feels automatic, operation guidance is clearer, and reporting cards are more readable.

**Architecture:** Keep the changes localized to the existing tab components. Use `ControlTab.tsx` for behavior and operator-facing text changes, and `ReportingTab.tsx` for summary-card visibility updates.

**Tech Stack:** React, TypeScript, Vite, Tailwind-style utility classes

---

### Task 1: Update operations guidance and model flow

**Files:**
- Modify: `RoboScanV3/src/app/components/tabs/ControlTab.tsx`

- [ ] Add a small effect that automatically starts detection after a model is loaded and a camera source exists.
- [ ] Update the model status text to explain that detection now starts automatically after model load.
- [ ] Add operator-facing copy describing robot turning logic and the differences between manual, semi, and fully autonomous modes.
- [ ] Remove the Drive Calibration card from the operations section.

### Task 2: Simplify and document the sensor strap

**Files:**
- Modify: `RoboScanV3/src/app/components/tabs/ControlTab.tsx`

- [ ] Remove the `Accuracy`, `Battery`, and `Trim` metrics from the sensor strap grid.
- [ ] Add a compact explanation panel under the strap that tells the operator what each remaining metric group is used for.

### Task 3: Improve reporting-card visibility

**Files:**
- Modify: `RoboScanV3/src/app/components/tabs/ReportingTab.tsx`

- [ ] Give each reporting summary card a unique tinted background and higher-contrast label color.
- [ ] Keep the card layout and counts unchanged.

### Task 4: Verification

**Files:**
- Modify: none

- [ ] Run `npm run build` in `RoboScanV3`.
- [ ] Fix any TypeScript or bundling errors introduced by the UI changes.
