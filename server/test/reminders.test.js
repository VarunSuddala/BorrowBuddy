const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const { reminderTypeFor } = require("../services/dueDateReminderService.js");
const ReminderLog = require("../model/reminderLog.js");
const Notification = require("../model/notification.js");

const utc = value => new Date(`${value}T12:00:00.000Z`);

test("classifies one-day-before, due-today, overdue, and future dates by UTC calendar day", () => {
  const now = utc("2026-11-05");
  assert.equal(reminderTypeFor(utc("2026-11-06"), now), "one_day_before");
  assert.equal(reminderTypeFor(utc("2026-11-05"), now), "due_today");
  assert.equal(reminderTypeFor(utc("2026-11-04"), now), "overdue");
  assert.equal(reminderTypeFor(utc("2026-11-07"), now), null);
});

test("classification is not affected by local timezone offsets", () => {
  const now = new Date("2026-11-05T01:00:00-08:00");
  const due = new Date("2026-11-07T00:15:00+05:30");
  assert.equal(reminderTypeFor(due, now), "one_day_before");
});

test("reminder log has a unique loan/type index and required references", () => {
  const indexes = ReminderLog.schema.indexes();
  assert.ok(indexes.some(([fields, options]) =>
    fields.loanId === 1 && fields.reminderType === 1 && options.unique === true
  ));

  const invalid = new ReminderLog({ reminderType: "due_today" });
  const error = invalid.validateSync();
  assert.ok(error.errors.loanId);
  assert.ok(error.errors.recipientId);
});

test("notification model constrains reminder type and supports sparse dedupe keys", () => {
  const dedupeIndex = Notification.schema.indexes().find(([fields]) => fields.dedupeKey === 1);
  assert.ok(dedupeIndex);
  assert.equal(dedupeIndex[1].unique, true);
  assert.equal(dedupeIndex[1].sparse, true);

  const invalid = new Notification({
    recipientId: new mongoose.Types.ObjectId(),
    type: "not-a-notification-type",
    title: "Reminder",
    message: "Due",
  });
  assert.ok(invalid.validateSync().errors.type);
});
