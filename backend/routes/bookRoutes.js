const express = require("express");
const Book = require("../models/Book");
// Add middleware for authentication if desired
const router = express.Router();

// Get all books
router.get("/", async (req, res) => {
	try {
		const books = await Book.find();
		res.json(books);
	} catch (err) {
		res.status(500).send("Server Error");
	}
});

// Add a new book (admin only)
router.post("/", async (req, res) => {
	const { title, author, isbn, available } =
		req.body;
	try {
		const newBook = new Book({
			title,
			author,
			isbn,
			available,
		});
		const book = await newBook.save();
		res.json(book);
	} catch (err) {
		res.status(500).send("Server Error");
	}
});

// --- NEW: Update a book (admin only) ---
router.put("/:id", async (req, res) => {
	const { title, author, isbn, available } =
		req.body;
	try {
		const updatedBook =
			await Book.findByIdAndUpdate(
				req.params.id,
				{ title, author, isbn, available },
				{ new: true }, // This option returns the updated document
			);
		if (!updatedBook) {
			return res
				.status(404)
				.json({ msg: "Book not found" });
		}
		res.json(updatedBook);
	} catch (err) {
		res.status(500).send("Server Error");
	}
});

// Delete a book (admin only)
router.delete("/:id", async (req, res) => {
	try {
		const book = await Book.findByIdAndRemove(
			req.params.id,
		);
		if (!book) {
			return res
				.status(404)
				.json({ msg: "Book not found" });
		}
		res.json({ msg: "Book removed" });
	} catch (err) {
		res.status(500).send("Server Error");
	}
});

module.exports = router;
