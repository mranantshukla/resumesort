# Research Paper: Study and Interview Plan

Owner: Anant Shukla
Part of: [masterplan.md](../masterplan.md)

## The paper

Anant Shukla, Prof. Indrajit Ghosh, "Real-Time Cyclist Lateral Position Detection using CV," World Conference on Transport Research (WCTR), 2026.

## Why it matters for a Product Analyst interview

The JD does not ask for computer vision. The interviewer will use the paper to test:
- **JD #4**: can you frame a messy real-world problem and solve it with structure?
- **JD #2**: do you understand measurement, error and validation?
- **JD #1**: curiosity about how people behave (cyclists in mixed traffic = user behavior in a system).

So prepare the paper as a **measurement and decision** story, not a model architecture lecture. It is also your best answer to "why analytics, coming from civil engineering?": you used data to measure behavior in a transport system.

## 2-minute pitch (fill in exact details)

1. **Problem**: where cyclists ride laterally in a lane affects safety and road design. Manual observation is slow and inconsistent.
2. **What we built**: a real-time CV pipeline that detects cyclists in video and estimates their lateral position.
3. **Data**: where and how video was collected, how many hours or frames, how ground truth was labelled.
4. **Method**: detection (which model), tracking, and conversion from pixel to road coordinates (camera calibration / perspective transform).
5. **Validation**: metric (e.g., mean absolute error in cm vs manual measurement, detection precision/recall), and the result.
6. **Use**: what a transport planner can decide with it (lane width, buffer design, safety interventions).
7. **Limitation**: night, occlusion, rain, camera angle. What you would do next.

Confirm every item against the actual paper before the interview.

## Questions to prepare

**Research basics**
- What was your contribution vs your professor's?
- What is new compared with earlier work?
- How did you validate accuracy? What was the error, and is it good enough for the use case?
- What would make the results wrong? (Calibration drift, selection of sites, time of day.)

**Bridge to the role (most important)**
- "How is this relevant to Zomato?" Answer: the same discipline of defining a metric, validating it against ground truth, and knowing its error before decisions are made on it. Delivery partner location/ETA accuracy is a similar measurement problem.
- "How would you know if a metric is wrong in production?" Link to monitoring and data quality (masterplan §9).
- "Precision vs recall: which matters more here, and for a fraud or food-safety alert at Zomato?"

## Concepts to revise (light depth)

| Concept | Depth needed |
|---|---|
| Object detection (e.g., YOLO family) | One-line explanation |
| Tracking across frames | One-line explanation |
| Precision, recall, F1, IoU | Define and calculate |
| MAE, RMSE | Define and when to use each |
| Bias in samples (site selection, time of day) | Explain with an example |
| Ground truth labelling and inter-annotator agreement | Explain |

## Study tasks

| Task | Time | Done |
|---|---|---|
| Re-read the paper; fill in the 2-minute pitch with exact numbers | 2 hrs | [ ] |
| Write 5 likely questions with answers | 1 hr | [ ] |
| Prepare the "why relevant to Zomato" bridge answer | 30 min | [ ] |
| Revise precision/recall/MAE with one worked example each | 1 hr | [ ] |
| Record the pitch; keep under 2 minutes | 30 min | [ ] |

## Folder use
Put the paper PDF, slides and your notes in this folder.
