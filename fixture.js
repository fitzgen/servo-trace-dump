/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const millisecondsToNanoseconds = ms => ms * 1000000;

module.exports = [
  {
    "category": { "Compositing": [] },
    "metadata": null,
    "startTime": millisecondsToNanoseconds(1),
    "endTime": millisecondsToNanoseconds(5),
    "startEnergy": 0,
    "endEnergy": 0
  },
  {
    "category": { "LayoutStyleRecalc": [] },
    "metadata": {
      "url": "https://example.com",
      "iframe": { "RootWindow": [] },
      "incremental": { "FirstReflow": [] }
    },
    "startTime": millisecondsToNanoseconds(.1),
    "endTime": millisecondsToNanoseconds(3),
    "startEnergy": 0,
    "endEnergy": 0
  },
  {
    "category": { "LayoutTextShaping": [] },
    "metadata": {
      "url": "https://example.com",
      "iframe": { "RootWindow": [] },
      "incremental": { "FirstReflow": [] }
    },
    "startTime": millisecondsToNanoseconds(2),
    "endTime": millisecondsToNanoseconds(2.001),
    "startEnergy": 0,
    "endEnergy": 0
  },
  {
    "category": { "LayoutRestyleDamagePropagation": [] },
    "metadata": {
      "url": "https://example.com",
      "iframe": { "RootWindow": [] },
      "incremental": { "FirstReflow": [] }
    },
    "startTime": millisecondsToNanoseconds(.1),
    "endTime": millisecondsToNanoseconds(3),
    "startEnergy": 0,
    "endEnergy": 0
  },
  {
    "category": { "LayoutGeneratedContent": [] },
    "metadata": {
      "url": "https://example.com",
      "iframe": { "RootWindow": [] },
      "incremental": { "FirstReflow": [] }
    },
    "startTime": millisecondsToNanoseconds(8),
    "endTime": millisecondsToNanoseconds(10),
    "startEnergy": 0,
    "endEnergy": 0
  },
];
