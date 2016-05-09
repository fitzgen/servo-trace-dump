/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const assert = require("chai").assert;
const traceDump = require("./trace-dump");
const traces = require("./fixture");

describe("servo-trace-dump", () => {
  describe("State", () => {
    it("should be able to create State instances", () => {
      assert.ok(new traceDump.State(traces, 1000));
    });

    it("should sort traces", () => {
      const state = new traceDump.State(traces, 1000);

      let lastStartTime = -Infinity;
      let lastEndTime = -Infinity;
      for (let trace of state.traces) {
        assert.ok(trace.startTime > lastStartTime ||
                  (trace.startTime === lastStartTime && trace.endTime <= lastEndTime));
        lastStartTime = trace.startTime;
        lastEndTime = trace.endTime;
      }
    });

    it("should make trace times relative to 0", () => {
      const state = new traceDump.State([{
        "category": { "LayoutGeneratedContent": [] },
        "metadata": null,
        "startTime": 1000000,
        "endTime": 5000000,
        "startEnergy": 0,
        "endEnergy": 0
      }], 1000);

      assert.equal(state.minTime, 0);
      assert.equal(state.traces[0].startTime, 0);
      assert.equal(state.traces[0].endTime, 4000000);
    });

    it("should remove idle time", () => {
      const state = new traceDump.State([
        {
          "category": { "LayoutGeneratedContent": [] },
          "metadata": null,
          "startTime": 1000000,
          "endTime": 5000000,
          "startEnergy": 0,
          "endEnergy": 0
        },
        {
          "category": { "LayoutGeneratedContent": [] },
          "metadata": null,
          "startTime": 6000000,
          "endTime": 7000000,
          "startEnergy": 0,
          "endEnergy": 0
        },
        {
          "category": { "LayoutGeneratedContent": [] },
          "metadata": null,
          "startTime": 8000000,
          "endTime": 9000000,
          "startEnergy": 0,
          "endEnergy": 0
        },
      ], 1000);

      assert.equal(state.traces[0].endTime, 4000000);
      assert.equal(state.traces[1].startTime, 4000000);
      assert.equal(state.traces[1].endTime, 5000000);
      assert.equal(state.traces[2].startTime, 5000000);
      assert.equal(state.traces[2].endTime, 6000000);
    });

    describe("getColorForCategory", () => {
      const state = new traceDump.State(traces, 1000);

      it("should give the same color back for the same category", () => {
        assert.equal(state.getColorForCategory("Layout"),
                     state.getColorForCategory("Layout"));
      });
    });

    describe("selection", () => {
      const newSelectionState = () => new traceDump.State([{
        "category": { "LayoutGeneratedContent": [] },
        "metadata": null,
        "startTime": 0,
        "endTime": 1000000,
        "startEnergy": 0,
        "endEnergy": 0
      }], 1000);

      describe("pxToNs", () => {
        it("should translate positions into times", () => {
          const state = newSelectionState();
          assert.equal(state.pxToNs(50), 50000);
        });
      });

      describe("nsToPx", () => {
        it("should translate times to pixel positions", () => {
          const state = newSelectionState();
          assert.equal(state.nsToPx(50000), 50);
        });
      });

      describe("updateStartSelection", () => {
        it("should change the start selection", () => {
          const state = newSelectionState();
          state.updateStartSelection(50);
          assert.equal(state.startSelection, 50000);
        });

        it("should not move it past the end selection", () => {
          const state = newSelectionState();

          state.endSelection = 500000;
          state.updateStartSelection(999999999999);
          assert.equal(state.startSelection, state.endSelection);
        });
      });

      describe("updateEndSelection", () => {
        it("should change the end selection", () => {
          const state = newSelectionState();

          state.updateEndSelection(950);
          assert.equal(state.endSelection, 950000);
        });

        it("should not move it past the start selection", () => {
          const state = newSelectionState();

          state.startSelection = 300000;
          state.updateEndSelection(0);
          assert.equal(state.endSelection, state.startSelection);
        });
      });

      describe("moveSelection", () => {
        it("should move the selection", () => {
          const state = newSelectionState();

          const initialStartSelection = state.startSelection = 250000;
          const initialEndSelection = state.endSelection = 750000;

          state.moveSelection(10);

          assert.equal(state.startSelection, initialStartSelection + 10000);
          assert.equal(state.endSelection, initialEndSelection + 10000);
        });

        it("should not move the selection out of the profile", () => {
          const state = newSelectionState();

          const initialStartSelection = state.startSelection = 50000;
          const initialEndSelection = state.endSelection = 70000;

          state.moveSelection(9999999999);

          assert.equal(state.startSelection,
                       state.maxTime - (initialEndSelection - initialStartSelection));
          assert.equal(state.endSelection, state.maxTime);
        });
      });

      describe("zoom Selection", () => {
        it("should zoom the selection in and out", () => {
          const state = newSelectionState();
          state.startSelection = 50000;
          state.endSelection = 70000;

          state.zoomSelection(1);
          assert.equal(state.startSelection, 49000);
          assert.equal(state.endSelection, 71000);

          state.zoomSelection(-2);
          assert.equal(state.startSelection, 51000);
          assert.equal(state.endSelection, 69000);
        });

        it("should not zoom out of the profile", () => {
          const state = newSelectionState();
          state.startSelection = 50000;
          state.endSelection = 70000;

          state.zoomSelection(999999999999999999999999);
          assert.equal(state.startSelection, state.minTime);
          assert.equal(state.endSelection, state.maxTime);
        });

        it("should not zoom start and end past each other", () => {
          const state = newSelectionState();
          state.startSelection = 50000;
          state.endSelection = 70000;

          state.zoomSelection(-999999999999999999999999);
          assert.equal(state.startSelection, state.endSelection);
          assert.ok(state.startSelection <= state.maxTime);
          assert.ok(state.startSelection >= state.minTime);
        });
      });
    });
  });

  describe("Utilities", () => {
    describe("clamp", () => {
      it("should clamp values to the given range", () => {
        assert.equal(traceDump.clamp(5, 0, 10), 5);
        assert.equal(traceDump.clamp(-1, 0, 10), 0);
        assert.equal(traceDump.clamp(20, 0, 10), 10);
      });
    });

    describe("closestPowerOfTen", () => {
      it("should find the closes power of ten", () => {
        assert.equal(traceDump.closestPowerOfTen(3), 1);
        assert.equal(traceDump.closestPowerOfTen(30), 10);
        assert.equal(traceDump.closestPowerOfTen(300), 100);
        assert.equal(traceDump.closestPowerOfTen(3000), 1000);
      });
    });

    describe("selectIncrement", () => {
      it("should choose sane tick increments", () => {
        let increment;

        increment = traceDump.selectIncrement(37, 10);
        assert.equal(increment, 4);

        increment = traceDump.selectIncrement(1000, 11);
        assert.equal(increment, 100);

        increment = traceDump.selectIncrement(256, 20);
        assert.equal(increment, 20);
      });
    });

    describe("traceCategory", () => {
      it("should return the category", () => {
        const trace = {
          "category": { "LayoutGeneratedContent": [] },
          "metadata": null,
          "startTime": 0,
          "endTime": 1000000,
          "startEnergy": 0,
          "endEnergy": 0
        };

        assert.equal(traceDump.traceCategory(trace), "LayoutGeneratedContent");
      });
    });
  });
});
