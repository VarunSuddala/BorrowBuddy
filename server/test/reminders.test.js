const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const Loan = require("../model/loan.js");
const { reminderTypeFor } = require("../services/dueDateReminderService.js");
const ReminderLog = require("../model/reminderLog.js");
const Notification = require("../model/notification.js");
const { runDueDateReminderCycle } = require("../services/dueDateReminderService.js");

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

test("repeated reminder cycles create one in-app notification per loan and type", async () => {
  const oldFind = Loan.find;
  const oldExists = Loan.exists;
  const oldReminderUpdate = ReminderLog.findOneAndUpdate;
  const oldNotificationUpdate = Notification.findOneAndUpdate;
  const loanId = new mongoose.Types.ObjectId();
  const borrowerId = new mongoose.Types.ObjectId();
  const logId = new mongoose.Types.ObjectId();
  let sent = false;
  let notificationCreates = 0;
  let query;
  const loan = {
    _id: loanId,
    dueDate: utc("2026-11-06"),
    borrowerId: { _id: borrowerId, name: "Asha" },
    itemId: { _id: new mongoose.Types.ObjectId(), name: "Camera" },
  };
  const chain = {
    select() { return this; },
    populate() { return this; },
    lean() { return Promise.resolve([loan]); },
  };
  Loan.find = value => { query = value; return chain; };
  Loan.exists = async () => true;
  ReminderLog.findOneAndUpdate = async (filter, update) => {
    if (update.$setOnInsert) return { _id: logId };
    if (update.$set?.inAppClaimedAt) return sent ? null : { _id: logId };
    if (update.$set?.inAppSentAt) { sent = true; return { _id: logId }; }
    return { _id: logId };
  };
  Notification.findOneAndUpdate = async () => {
    notificationCreates += 1;
    return { _id: new mongoose.Types.ObjectId(), recipientId: borrowerId };
  };
  try {
    const now = utc("2026-11-05");
    await runDueDateReminderCycle(now);
    await runDueDateReminderCycle(now);
    assert.equal(notificationCreates, 1);
    assert.equal(query.status, "active");
    assert.deepEqual(query.dueDate, { $exists: true, $ne: null });
    assert.deepEqual(query.borrowerId, { $exists: true, $ne: null });
  } finally {
    Loan.find = oldFind;
    Loan.exists = oldExists;
    ReminderLog.findOneAndUpdate = oldReminderUpdate;
    Notification.findOneAndUpdate = oldNotificationUpdate;
  }
});

test("reminder cycles skip returned, rejected, cancelled and missing-due-date records", async () => {
  const oldFind = Loan.find;
  let query;
  const chain = {
    select() { return this; },
    populate() { return this; },
    lean() { return Promise.resolve([]); },
  };
  Loan.find = value => { query = value; return chain; };
  try {
    const result = await runDueDateReminderCycle(utc("2026-11-05"));
    assert.deepEqual(result, { scanned: 0, processed: 0 });
    assert.equal(query.status, "active");
    assert.deepEqual(query.dueDate, { $exists: true, $ne: null });
  } finally {
    Loan.find = oldFind;
  }
});

test("missing item references use safe reminder copy while preserving borrower ownership", async () => {
  const oldFind = Loan.find;
  const oldExists = Loan.exists;
  const oldReminderUpdate = ReminderLog.findOneAndUpdate;
  const oldNotificationUpdate = Notification.findOneAndUpdate;
  const borrowerId = new mongoose.Types.ObjectId();
  let notification;
  const chain = {
    select() { return this; },
    populate() { return this; },
    lean() { return Promise.resolve([{ _id: new mongoose.Types.ObjectId(), dueDate: utc("2026-11-05"), borrowerId: { _id: borrowerId } }]); },
  };
  Loan.find = () => chain;
  Loan.exists = async () => true;
  ReminderLog.findOneAndUpdate = async (filter, update) => update.$setOnInsert ? { _id: new mongoose.Types.ObjectId() } : { _id: new mongoose.Types.ObjectId() };
  Notification.findOneAndUpdate = async (filter, update) => { notification = update.$setOnInsert; return notification; };
  try {
    await runDueDateReminderCycle(utc("2026-11-05"));
    assert.equal(notification.recipientId, borrowerId);
    assert.match(notification.message, /Your borrowed item is|Your borrowed item|due today/i);
  } finally {
    Loan.find = oldFind;
    Loan.exists = oldExists;
    ReminderLog.findOneAndUpdate = oldReminderUpdate;
    Notification.findOneAndUpdate = oldNotificationUpdate;
  }
});
