const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to Database
connectDB();

// Middlewares
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON request bodies

// --- API Routes ---
app.use(
	"/api/auth",
	require("./routes/authRoutes"),
);
app.use(
	"/api/books",
	require("./routes/bookRoutes"),
);
app.use(
	"/api/users",
	require("./routes/userRoutes"),
);

// Define the port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () =>
	console.log(
		`Server is running on port ${PORT}`,
	),
);
