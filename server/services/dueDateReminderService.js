const Loan = require("../model/loan.js");
const Notification = require("../model/notification.js");
const ReminderLog = require("../model/reminderLog.js");
const { Constants } = require("../config/constants.js");
const { emitToUser } = require("../config/socket.js");

const DAY_MS = 24 * 60 * 60 * 1000;
const CLAIM_LEASE_MS = 10 * 60 * 1000;
const reminderTypes = ["one_day_before", "due_today", "overdue"];

const utcDayStart = value => {
  const date = new Date(value);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

const reminderTypeFor = (dueDate, now) => {
  const dayDifference = Math.floor((utcDayStart(dueDate) - utcDayStart(now)) / DAY_MS);
  if (dayDifference === 1) return "one_day_before";
  if (dayDifference === 0) return "due_today";
  if (dayDifference < 0) return "overdue";
  return null;
};

const reminderCopy = {
  one_day_before: {
    title: "Return date approaching",
    message: itemName => `${itemName} is due tomorrow. Please plan to return it by the due date.`,
  },
  due_today: {
    title: "Item due today",
    message: itemName => `${itemName} is due today. Please return it today.`,
  },
  overdue: {
    title: "Borrowed item overdue",
    message: (itemName, dueDate) => `${itemName} is overdue. It was due on ${dueDate}. Please return it as soon as possible.`,
  },
};

const displayDueDate = dueDate => new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
}).format(dueDate);

const isDuplicateKey = error => error && error.code === 11000;

const ensureReminderLog = async ({ loanId, recipientId, reminderType }) => {
  try {
    return await ReminderLog.findOneAndUpdate(
      { loanId, reminderType },
      { $setOnInsert: { loanId, recipientId, reminderType } },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
    return ReminderLog.findOne({ loanId, reminderType });
  }
};

const claimInAppReminder = async (logId, now) => {
  const staleClaim = new Date(now.getTime() - CLAIM_LEASE_MS);
  return ReminderLog.findOneAndUpdate(
    {
      _id: logId,
      inAppSentAt: { $exists: false },
      $or: [
        { inAppClaimedAt: { $exists: false } },
        { inAppClaimedAt: { $lt: staleClaim } },
      ],
    },
    { $set: { inAppClaimedAt: now } },
    { returnDocument: "after" }
  );
};

const markInAppReminderSent = (logId, now) => ReminderLog.findOneAndUpdate(
  { _id: logId },
  { $set: { inAppSentAt: now }, $unset: { inAppClaimedAt: 1 } },
  { returnDocument: "after" }
);

const releaseInAppClaim = logId => ReminderLog.findOneAndUpdate(
  { _id: logId },
  { $unset: { inAppClaimedAt: 1 } },
  { returnDocument: "after" }
);

const createInAppReminder = async ({ loan, reminderType, dueDate }) => {
  const itemName = loan.itemId?.name || "Your borrowed item";
  const copy = reminderCopy[reminderType];
  const message = reminderType === "overdue"
    ? copy.message(itemName, displayDueDate(dueDate))
    : copy.message(itemName);
  const dedupeKey = `due-date:${loan._id}:${reminderType}`;
  try {
    const notification = await Notification.findOneAndUpdate(
      { dedupeKey },
      {
        $setOnInsert: {
          recipientId: loan.borrowerId._id,
          type: "due_date_reminder",
          title: copy.title,
          message,
          dedupeKey,
          data: {
            loanId: loan._id,
            itemId: loan.itemId?._id,
            reminderType,
          },
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    emitToUser(loan.borrowerId._id, "notification", notification);
    return notification;
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
    return Notification.findOne({ dedupeKey });
  }
};

const processLoanReminder = async (loan, reminderType, now) => {
  const dueDate = new Date(loan.dueDate);
  if (!await Loan.exists({ _id: loan._id, status: "active" })) return;
  const log = await ensureReminderLog({
    loanId: loan._id,
    recipientId: loan.borrowerId._id,
    reminderType,
  });
  if (!log) return;

  const inAppClaim = await claimInAppReminder(log._id, now);
  if (inAppClaim) {
    try {
      if (!await Loan.exists({ _id: loan._id, status: "active" })) {
        await releaseInAppClaim(log._id);
        return;
      }
      await createInAppReminder({ loan, reminderType, dueDate });
      await markInAppReminderSent(log._id, now);
    } catch (error) {
      await releaseInAppClaim(log._id);
      throw error;
    }
  }
};

const runDueDateReminderCycle = async (now = new Date()) => {
  const loans = await Loan.find({
    status: "active",
    dueDate: { $exists: true, $ne: null },
    borrowerId: { $exists: true, $ne: null },
  })
    .select("_id dueDate borrowerId itemId")
    .populate("borrowerId", "name")
    .populate("itemId", "name")
    .lean();

  let processed = 0;
  for (const loan of loans) {
    if (!loan.borrowerId || !loan.dueDate) continue;
    const reminderType = reminderTypeFor(loan.dueDate, now);
    if (!reminderType || !reminderTypes.includes(reminderType)) continue;
    await processLoanReminder(loan, reminderType, now);
    processed += 1;
  }
  return { scanned: loans.length, processed };
};

const startDueDateReminderScheduler = () => {
  const run = () => runDueDateReminderCycle().catch(error => {
    console.error(`Due date reminder cycle failed: ${error.message}`);
  });
  run();
  return setInterval(run, Constants.REMINDER_INTERVAL_MS);
};

module.exports = {
  reminderTypeFor,
  runDueDateReminderCycle,
  startDueDateReminderScheduler,
};
