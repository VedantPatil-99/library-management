const mongoose = require("mongoose");

const BorrowingRecordSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		book: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Book",
			required: true,
		},
		borrowDate: { type: Date, default: Date.now },
		returnDate: { type: Date, default: null },
	},
);

module.exports = mongoose.model(
	"BorrowingRecord",
	BorrowingRecordSchema,
);
