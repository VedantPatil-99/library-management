const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

// Load env vars
dotenv.config();

// Load models
const User = require("./models/User");
const Book = require("./models/Book");

// Sample Data
const users = [
	{
		username: "admin",
		// Use a secure, generic password for the initial admin
		password: "password123",
		role: "admin",
	},
];

const books = [
	{
		title: "The Great Gatsby",
		author: "F. Scott Fitzgerald",
		isbn: "9780743273565",
		available: true,
	},
	{
		title: "To Kill a Mockingbird",
		author: "Harper Lee",
		isbn: "9780061120084",
		available: true,
	},
	{
		title: "1984",
		author: "George Orwell",
		isbn: "9780451524935",
		available: true,
	},
	{
		title: "Pride and Prejudice",
		author: "Jane Austen",
		isbn: "9780141439518",
		available: false,
	},
	{
		title: "The Catcher in the Rye",
		author: "J.D. Salinger",
		isbn: "9780316769488",
		available: true,
	},
];

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// Import data into DB
const importData = async () => {
	try {
		// Clear existing data
		await User.deleteMany();
		await Book.deleteMany();

		// Hash admin password before inserting
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(
			users[0].password,
			salt,
		);
		const adminUser = [
			{ ...users[0], password: hashedPassword },
		];

		await User.create(adminUser);
		await Book.create(books);

		console.log("Data Imported Successfully...");
		process.exit();
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

// Destroy data from DB
const destroyData = async () => {
	try {
		await User.deleteMany();
		await Book.deleteMany();
		console.log("Data Destroyed Successfully...");
		process.exit();
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

// Check command line arguments to decide whether to import or destroy
if (process.argv[2] === "-i") {
	importData();
} else if (process.argv[2] === "-d") {
	destroyData();
}
