# RoboScan UI Design

**Scope**

Adjust the RoboScan operations and reporting UI to reduce operator confusion and improve readability.

**Approved Changes**

1. Make model usage feel automatic after the operator selects an ONNX file by starting detection as soon as a camera source is available.
2. Remove the Drive Calibration card from the operations area.
3. Remove `Accuracy`, `Battery`, and `Trim` from the sensor strap and add plain-language explanations for the remaining sensor strap items.
4. Explain how the robot turns and how `manual`, `semi`, and `fully` modes work from the operations UI.
5. Improve reporting summary card visibility by giving each card a distinct accent color.

**Constraints**

- Keep the existing layout and visual language.
- Do not introduce a new dependency or a large structural refactor.
- Preserve current robot-control behavior apart from the model auto-start flow and UI copy changes.

**Design**

- Use the existing `ControlTab.tsx` as the single place for operation guidance and sensor explanations.
- Keep model selection file-based, but auto-start detection once a model is loaded and a live or test camera source exists.
- Replace hidden operational knowledge with inline explanations near the controls that need it.
- Use tinted backgrounds and brighter labels in reporting summary cards so card names remain readable against dark surfaces.
