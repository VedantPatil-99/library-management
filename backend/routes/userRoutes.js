const express = require("express");
const Book = require("../models/Book");
const User = require("../models/User"); // Import User model
const BorrowingRecord = require("../models/BorrowingRecord");
const router = express.Router();

// --- NEW: Get all users (for admin) ---
router.get("/", async (req, res) => {
	try {
		// We select '-password' to exclude the hashed password from the response
		const users = await User.find().select(
			"-password",
		);
		res.json(users);
	} catch (err) {
		res.status(500).send("Server Error");
	}
});

// --- NEW: Delete a user (for admin) ---
router.delete("/:id", async (req, res) => {
	try {
		const user = await User.findById(
			req.params.id,
		);
		if (!user) {
			return res
				.status(404)
				.json({ msg: "User not found" });
		}
		// In a real app, you'd also handle their borrowing records, etc.
		await user.deleteOne();
		res.json({ msg: "User removed" });
	} catch (err) {
		res.status(500).send("Server Error");
	}
});

// Borrow a book
router.post("/borrow", async (req, res) => {
	const { userId, bookId } = req.body;
	try {
		const book = await Book.findById(bookId);
		if (!book || !book.available) {
			return res
				.status(400)
				.json({ msg: "Book is not available" });
		}
		await Book.findByIdAndUpdate(bookId, {
			available: false,
		});
		const newRecord = new BorrowingRecord({
			user: userId,
			book: bookId,
		});
		await newRecord.save();
		res.json({
			msg: "Book borrowed successfully",
		});
	} catch (err) {
		res.status(500).send("Server Error");
	}
});

// Return a book
router.post("/return", async (req, res) => {
	const { userId, bookId } = req.body;
	try {
		await Book.findByIdAndUpdate(bookId, {
			available: true,
		});
		await BorrowingRecord.findOneAndUpdate(
			{
				user: userId,
				book: bookId,
				returnDate: null,
			},
			{ returnDate: Date.now() },
		);
		res.json({
			msg: "Book returned successfully",
		});
	} catch (err) {
		res.status(500).send("Server Error");
	}
});

// Get user borrowing history
router.get(
	"/:userId/history",
	async (req, res) => {
		try {
			const records = await BorrowingRecord.find({
				user: req.params.userId,
			})
				.populate("book", ["title", "author"]) // 'populate' fetches book details
				.sort({ borrowDate: -1 }); // Sort by most recent
			res.json(records);
		} catch (err) {
			res.status(500).send("Server Error");
		}
	},
);

module.exports = router;
