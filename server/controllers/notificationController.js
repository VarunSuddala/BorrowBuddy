const Notification = require("../model/notification.js");
const Loan = require("../model/loan.js");

const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .populate("senderId", "name email avatar")
      .populate("data.loanId", "status")
      .sort({ createdAt: -1 })
      .limit(50);

    const loanIds = notifications
      .filter(notification => notification.type === "borrow_request" && notification.data?.loanId)
      .map(notification => notification.data.loanId?._id || notification.data.loanId);
    const loans = loanIds.length
      ? await Loan.find({ _id: { $in: loanIds } }).select("status")
      : [];
    const loanStatusById = new Map(loans.map(loan => [loan._id.toString(), loan.status]));
    const notificationData = notifications.map(notification => {
      const data = notification.toObject();
      if (data.type === "borrow_request" && data.data?.loanId) {
        const loanId = data.data.loanId._id || data.data.loanId;
        data.data.loanStatus = loanStatusById.get(loanId.toString()) || null;
      }
      return data;
    });

    const unreadCount = await Notification.countDocuments({
      recipientId: req.user._id,
      read: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
      data: notificationData,
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipientId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};

