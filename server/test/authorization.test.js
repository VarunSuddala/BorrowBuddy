const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { Constants } = require("../config/constants.js");
const User = require("../model/user.js");
const Loan = require("../model/loan.js");
const Notification = require("../model/notification.js");
const { protect } = require("../middleware/authMiddleware.js");
const { getUserLoans } = require("../controllers/loanController.js");
const { markAsRead } = require("../controllers/notificationController.js");

const response = () => {
  const result = { statusCode: 200, body: null };
  return {
    result,
    status(code) { result.statusCode = code; return this; },
    json(body) { result.body = body; return this; },
  };
};

test("protect rejects missing and invalid bearer tokens", async () => {
  const missing = response();
  await protect({ headers: {} }, missing, () => assert.fail("missing token passed"));
  assert.equal(missing.result.statusCode, 401);

  const invalid = response();
  await protect({ headers: { authorization: "Bearer not-a-jwt" } }, invalid, () => assert.fail("invalid token passed"));
  assert.equal(invalid.result.statusCode, 401);
});

test("protect loads the user represented by the verified token", async () => {
  const oldSecret = Constants.JWT_SECRET;
  const oldFindById = User.findById;
  const userId = "665000000000000000000001";
  Constants.JWT_SECRET = "test-only-secret";
  User.findById = () => ({ select: async () => ({ _id: userId, name: "Asha" }) });
  try {
    const token = jwt.sign({ id: userId }, Constants.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = response();
    let called = false;
    await protect(req, res, () => { called = true; });
    assert.equal(called, true);
    assert.equal(req.user._id, userId);
  } finally {
    Constants.JWT_SECRET = oldSecret;
    User.findById = oldFindById;
  }
});

test("loan history query is restricted to current borrower or lender", async () => {
  const oldFind = Loan.find;
  let query;
  const chain = {
    populate() { return this; },
    sort() { return this; },
    then(resolve, reject) { return Promise.resolve([]).then(resolve, reject); },
  };
  Loan.find = value => { query = value; return chain; };
  try {
    const res = response();
    await getUserLoans({ user: { _id: "user-from-token" } }, res, assert.fail);
    assert.deepEqual(query, {
      $or: [
        { borrowerId: "user-from-token" },
        { lenderId: "user-from-token" },
      ],
    });
  } finally {
    Loan.find = oldFind;
  }
});

test("markAsRead only updates a notification found for the current recipient", async () => {
  const oldFindOne = Notification.findOne;
  let query;
  const notification = { read: false, save: async () => notification };
  Notification.findOne = value => { query = value; return Promise.resolve(notification); };
  try {
    const res = response();
    await markAsRead({ params: { id: "notification-1" }, user: { _id: "recipient-from-token" } }, res, assert.fail);
    assert.deepEqual(query, { _id: "notification-1", recipientId: "recipient-from-token" });
    assert.equal(notification.read, true);
    assert.equal(res.result.statusCode, 200);
  } finally {
    Notification.findOne = oldFindOne;
  }
});
