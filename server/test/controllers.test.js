const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { Constants } = require("../config/constants.js");
const User = require("../model/user.js");
const Group = require("../model/group.js");
const Invitation = require("../model/invitation.js");
const BorrowableItem = require("../model/borrowableItem.js");
const Loan = require("../model/loan.js");
const Notification = require("../model/notification.js");
const {
  registerUser,
  loginUser,
} = require("../controllers/authController.js");
const {
  getMyInvitations,
} = require("../controllers/invitationController.js");
const {
  createItem,
  deleteItem,
} = require("../controllers/itemController.js");
const {
  approveLoan,
  returnLoan,
} = require("../controllers/loanController.js");
const {
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController.js");

const objectId = () => new mongoose.Types.ObjectId();

const response = () => {
  const result = { statusCode: 200, body: null };
  return {
    result,
    status(code) { result.statusCode = code; return this; },
    json(body) { result.body = body; return this; },
  };
};

const errorNext = error => { throw error; };

test("registration validates input and returns a JWT without exposing a password", async () => {
  const oldFindOne = User.findOne;
  const oldCreate = User.create;
  User.findOne = async () => null;
  User.create = async data => ({
    ...data,
    _id: objectId(),
    phone: data.phone,
    avatar: "",
    createdAt: new Date(),
  });
  try {
    const res = response();
    await registerUser({ body: { name: " Asha ", email: "ASHA@example.com", password: "secret1" } }, res, errorNext);
    assert.equal(res.result.statusCode, 201);
    assert.equal(res.result.body.success, true);
    assert.equal(res.result.body.data.email, "asha@example.com");
    assert.equal("password" in res.result.body.data, false);
    assert.ok(jwt.verify(res.result.body.data.token, Constants.JWT_SECRET));
  } finally {
    User.findOne = oldFindOne;
    User.create = oldCreate;
  }
});

test("registration and login reject invalid credentials and malformed input", async () => {
  const oldFindOne = User.findOne;
  User.findOne = async () => null;
  try {
    const missing = response();
    await registerUser({ body: { name: "Asha", password: "short" } }, missing, errorNext);
    assert.equal(missing.result.statusCode, 400);

    const login = response();
    User.findOne = () => ({ select: async () => null });
    await loginUser({ body: { email: "unknown@example.com", password: "secret1" } }, login, errorNext);
    assert.equal(login.result.statusCode, 401);
  } finally {
    User.findOne = oldFindOne;
  }
});

test("invitation history is queried by schema fields and returns direction", async () => {
  const oldFind = Invitation.find;
  let query;
  const invitations = [{
    _id: objectId(),
    invitedUserId: objectId(),
    requestType: "owner_invitation",
    toString() { return "unused"; },
    toObject() { return { _id: this._id, invitedUserId: this.invitedUserId, requestType: this.requestType }; },
  }];
  const userId = invitations[0].invitedUserId;
  const chain = {
    populate() { return this; },
    sort() { return Promise.resolve(invitations); },
  };
  Invitation.find = value => { query = value; return chain; };
  try {
    const res = response();
    await getMyInvitations({ user: { _id: userId } }, res, errorNext);
    assert.deepEqual(query, { $or: [{ invitedUserId: userId }, { requestedBy: userId }] });
    assert.equal(res.result.body.data[0].direction, "incoming");
  } finally {
    Invitation.find = oldFind;
  }
});

test("item creation validates names and persists ownership", async () => {
  const oldCreate = BorrowableItem.create;
  let created;
  BorrowableItem.create = async data => { created = data; return { _id: objectId(), ...data }; };
  try {
    const invalid = response();
    await createItem({ body: { name: "   " }, user: { _id: objectId() } }, invalid, errorNext);
    assert.equal(invalid.result.statusCode, 400);

    const ownerId = objectId();
    const valid = response();
    await createItem({ body: { name: " Camera ", category: " Electronics " }, user: { _id: ownerId } }, valid, errorNext);
    assert.equal(valid.result.statusCode, 201);
    assert.equal(created.name, "Camera");
    assert.equal(created.ownerId, ownerId);
    assert.equal(created.status, "available");
  } finally {
    BorrowableItem.create = oldCreate;
  }
});

test("item deletion rejects non-owners and unresolved loans", async () => {
  const oldFindById = BorrowableItem.findById;
  const oldLoanExists = Loan.exists;
  const id = objectId();
  const ownerId = objectId();
  BorrowableItem.findById = async () => ({ _id: id, ownerId, status: "available" });
  try {
    const forbidden = response();
    await deleteItem({ params: { id }, user: { _id: objectId() } }, forbidden, errorNext);
    assert.equal(forbidden.result.statusCode, 403);

    Loan.exists = async () => ({ _id: objectId() });
    const unresolved = response();
    await deleteItem({ params: { id }, user: { _id: ownerId } }, unresolved, errorNext);
    assert.equal(unresolved.result.statusCode, 400);
  } finally {
    BorrowableItem.findById = oldFindById;
    Loan.exists = oldLoanExists;
  }
});

test("loan approval is restricted to the lender and transitions only requests", async () => {
  const oldFindById = Loan.findById;
  const oldExists = Loan.exists;
  const oldItemUpdate = BorrowableItem.findOneAndUpdate;
  const oldLoanUpdate = Loan.findOneAndUpdate;
  const oldNotificationUpdate = Notification.findOneAndUpdate;
  const oldNotificationCreate = Notification.create;
  const loanId = objectId();
  const lenderId = objectId();
  const borrowerId = objectId();
  const itemId = objectId();
  const loan = { _id: loanId, lenderId, borrowerId, status: "requested", itemId: { _id: itemId, name: "Camera" }, groupId: null };
  Loan.findById = () => ({ populate: async () => loan });
  Loan.exists = async () => null;
  BorrowableItem.findOneAndUpdate = async () => ({ _id: itemId, name: "Camera" });
  Loan.findOneAndUpdate = async () => ({ ...loan, status: "active" });
  Notification.findOneAndUpdate = async () => null;
  Notification.create = async data => data;
  try {
    const forbidden = response();
    await approveLoan({ params: { id: loanId }, user: { _id: borrowerId } }, forbidden, errorNext);
    assert.equal(forbidden.result.statusCode, 403);

    const approved = response();
    await approveLoan({ params: { id: loanId }, user: { _id: lenderId, name: "Lender" } }, approved, errorNext);
    assert.equal(approved.result.statusCode, 200);
    assert.equal(approved.result.body.data.status, "active");
  } finally {
    Loan.findById = oldFindById;
    Loan.exists = oldExists;
    BorrowableItem.findOneAndUpdate = oldItemUpdate;
    Loan.findOneAndUpdate = oldLoanUpdate;
    Notification.findOneAndUpdate = oldNotificationUpdate;
    Notification.create = oldNotificationCreate;
  }
});

test("returning a loan rejects users who are neither borrower nor lender", async () => {
  const oldFindById = Loan.findById;
  const loan = { _id: objectId(), borrowerId: objectId(), lenderId: objectId(), status: "active", itemId: { _id: objectId(), name: "Camera" } };
  Loan.findById = () => ({ populate: async () => loan });
  try {
    const res = response();
    await returnLoan({ params: { id: loan._id }, user: { _id: objectId() } }, res, errorNext);
    assert.equal(res.result.statusCode, 403);
  } finally {
    Loan.findById = oldFindById;
  }
});

test("notification read operations are scoped to the authenticated recipient", async () => {
  const oldFindOne = Notification.findOne;
  const oldUpdateMany = Notification.updateMany;
  let findQuery;
  let updateQuery;
  const notification = { read: false, save: async () => notification };
  Notification.findOne = query => { findQuery = query; return Promise.resolve(notification); };
  Notification.updateMany = async (query, update) => { updateQuery = { query, update }; return { modifiedCount: 1 }; };
  try {
    const userId = objectId();
    const one = response();
    await markAsRead({ params: { id: objectId() }, user: { _id: userId } }, one, errorNext);
    assert.equal(findQuery.recipientId, userId);
    assert.equal(notification.read, true);
    assert.equal(one.result.statusCode, 200);

    const all = response();
    await markAllAsRead({ user: { _id: userId } }, all, errorNext);
    assert.deepEqual(updateQuery, { query: { recipientId: userId, read: false }, update: { $set: { read: true } } });
    assert.equal(all.result.statusCode, 200);
  } finally {
    Notification.findOne = oldFindOne;
    Notification.updateMany = oldUpdateMany;
  }
});
