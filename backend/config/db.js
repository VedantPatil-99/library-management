const mongoose = require("mongoose");

const connectDB = async () => {
	try {
		// IMPORTANT: Create a .env file in the backend folder and add your MongoDB URI
		// Example: MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/libraryDB?retryWrites=true&w=majority
		await mongoose.connect(
			process.env.MONGO_URI,
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
			},
		);
		console.log("MongoDB Connected...");
	} catch (err) {
		console.error(
			"MongoDB connection error:",
			err.message,
		);
		// Exit process with failure
		process.exit(1);
	}
};

module.exports = connectDB;
