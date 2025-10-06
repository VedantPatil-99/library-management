const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// --- Register a new user ---
router.post("/register", async (req, res) => {
	const { username, password } = req.body;
	try {
		let user = await User.findOne({ username });
		if (user) {
			return res
				.status(400)
				.json({ msg: "User already exists" });
		}
		user = new User({ username, password });

		// Hash password
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(
			password,
			salt,
		);

		await user.save();
		res.status(201).json({
			msg: "User registered successfully",
		});
	} catch (err) {
		res.status(500).send("Server error");
	}
});

// --- Login user ---
router.post("/login", async (req, res) => {
	const { username, password } = req.body;
	try {
		const user = await User.findOne({ username });
		if (!user) {
			return res
				.status(400)
				.json({ msg: "Invalid credentials" });
		}

		const isMatch = await bcrypt.compare(
			password,
			user.password,
		);
		if (!isMatch) {
			return res
				.status(400)
				.json({ msg: "Invalid credentials" });
		}

		const payload = {
			user: { id: user.id, role: user.role },
		};

		// IMPORTANT: Create a .env file and add a JWT_SECRET
		jwt.sign(
			payload,
			process.env.JWT_SECRET,
			{ expiresIn: "5h" },
			(err, token) => {
				if (err) throw err;
				res.json({
					token,
					user: {
						id: user.id,
						username: user.username,
						role: user.role,
					},
				});
			},
		);
	} catch (err) {
		res.status(500).send("Server error");
	}
});

module.exports = router;
