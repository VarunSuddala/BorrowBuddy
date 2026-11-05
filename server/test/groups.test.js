const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const Group = require("../model/group.js");
const Loan = require("../model/loan.js");
const Invitation = require("../model/invitation.js");
const BorrowableItem = require("../model/borrowableItem.js");
const Notification = require("../model/notification.js");
const { createGroup, deleteGroup } = require("../controllers/groupController.js");
const { acceptInvitation } = require("../controllers/invitationController.js");

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

test("group creation validates names and assigns the authenticated owner", async () => {
  const oldCreate = Group.create;
  let data;
  Group.create = async value => { data = value; return { _id: objectId(), ...value }; };
  try {
    const invalid = response();
    await createGroup({ body: { name: "" }, user: { _id: objectId() } }, invalid, errorNext);
    assert.equal(invalid.result.statusCode, 400);

    const ownerId = objectId();
    const valid = response();
    await createGroup({ body: { name: " Friends ", description: " Share together " }, user: { _id: ownerId } }, valid, errorNext);
    assert.equal(valid.result.statusCode, 201);
    assert.equal(data.name, "Friends");
    assert.deepEqual(data.memberIds, [ownerId]);
    assert.deepEqual(data.managerIds, [ownerId]);
  } finally {
    Group.create = oldCreate;
  }
});

test("group deletion enforces owner permission and unresolved-loan restrictions", async () => {
  const oldFindById = Group.findById;
  const oldLoanExists = Loan.exists;
  const oldDelete = Group.findOneAndDelete;
  const oldInvitationUpdate = Invitation.updateMany;
  const oldItemUpdate = BorrowableItem.updateMany;
  const groupId = objectId();
  const ownerId = objectId();
  Group.findById = () => ({ select: async () => ({ _id: groupId, ownerId }) });
  try {
    const forbidden = response();
    await deleteGroup({ params: { id: groupId }, user: { _id: objectId() } }, forbidden, errorNext);
    assert.equal(forbidden.result.statusCode, 403);

    Loan.exists = async () => ({ _id: objectId() });
    const blocked = response();
    await deleteGroup({ params: { id: groupId }, user: { _id: ownerId } }, blocked, errorNext);
    assert.equal(blocked.result.statusCode, 400);

    Loan.exists = async () => null;
    Group.findOneAndDelete = async () => ({ _id: groupId });
    Invitation.updateMany = async () => ({ modifiedCount: 0 });
    BorrowableItem.updateMany = async () => ({ modifiedCount: 0 });
    const deleted = response();
    await deleteGroup({ params: { id: groupId }, user: { _id: ownerId } }, deleted, errorNext);
    assert.equal(deleted.result.statusCode, 200);
  } finally {
    Group.findById = oldFindById;
    Loan.exists = oldLoanExists;
    Group.findOneAndDelete = oldDelete;
    Invitation.updateMany = oldInvitationUpdate;
    BorrowableItem.updateMany = oldItemUpdate;
  }
});

test("invitation acceptance rejects the wrong recipient and adds the correct member", async () => {
  const oldFindById = Invitation.findById;
  const oldUpdate = Invitation.findOneAndUpdate;
  const oldGroupUpdate = Group.findByIdAndUpdate;
  const oldNotification = Notification.create;
  const invitationId = objectId();
  const inviterId = objectId();
  const invitedUserId = objectId();
  const groupId = objectId();
  const invitation = {
    _id: invitationId,
    invitedBy: { _id: inviterId, name: "Ravi" },
    invitedUserId,
    requestType: "owner_invitation",
    status: "pending",
    groupId: { _id: groupId, name: "Friends" },
  };
  const chain = { populate() { return this; }, then(resolve, reject) { return Promise.resolve(invitation).then(resolve, reject); } };
  Invitation.findById = () => chain;
  Invitation.findOneAndUpdate = async () => ({ ...invitation, status: "accepted" });
  Group.findByIdAndUpdate = async () => ({ _id: groupId, name: "Friends", memberIds: [invitedUserId] });
  Notification.create = async data => data;
  try {
    const forbidden = response();
    await acceptInvitation({ params: { id: invitationId }, user: { _id: objectId() } }, forbidden, errorNext);
    assert.equal(forbidden.result.statusCode, 403);

    const accepted = response();
    await acceptInvitation({ params: { id: invitationId }, user: { _id: invitedUserId, name: "Asha" } }, accepted, errorNext);
    assert.equal(accepted.result.statusCode, 200);
    assert.equal(accepted.result.body.data.status, "accepted");
  } finally {
    Invitation.findById = oldFindById;
    Invitation.findOneAndUpdate = oldUpdate;
    Group.findByIdAndUpdate = oldGroupUpdate;
    Notification.create = oldNotification;
  }
});
