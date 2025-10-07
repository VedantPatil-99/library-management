import React, { useState } from "react";
import { apiService } from "../api/apiService";

const RegisterPage = ({ onNavigateToLogin }) => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const handleSubmit = async (e) => {
		e.preventDefault();
		const result = await apiService.register(
			username,
			password,
		);
		if (result.msg.includes("success")) {
			alert(
				"Registration successful! Please log in.",
			);
			onNavigateToLogin();
		} else {
			setError(
				result.msg || "Registration failed.",
			);
		}
	};
	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center">
			<div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
				<h1 className="text-2xl font-bold text-center mb-6">
					Create Account
				</h1>
				<form onSubmit={handleSubmit}>
					{error && (
						<p className="text-red-500 text-sm mb-4">
							{error}
						</p>
					)}
					<div className="mb-4">
						<label className="block">
							Username
						</label>
						<input
							type="text"
							value={username}
							onChange={(e) =>
								setUsername(e.target.value)
							}
							className="w-full px-3 py-2 border rounded"
							required
						/>
					</div>
					<div className="mb-6">
						<label className="block">
							Password
						</label>
						<input
							type="password"
							value={password}
							onChange={(e) =>
								setPassword(e.target.value)
							}
							className="w-full px-3 py-2 border rounded"
							required
						/>
					</div>
					<button
						type="submit"
						className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
						Register
					</button>
				</form>
				<p className="text-center text-xs mt-6">
					Already have an account?{" "}
					<button
						onClick={onNavigateToLogin}
						className="text-blue-500 font-bold">
						Login here
					</button>
				</p>
			</div>
		</div>
	);
};

export default RegisterPage;
