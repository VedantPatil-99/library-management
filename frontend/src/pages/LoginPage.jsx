import React, { useState } from "react";

const LoginPage = ({
	onLogin,
	onNavigateToRegister,
}) => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!(await onLogin(username, password)))
			setError("Invalid username or password.");
	};
	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center">
			<div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
				<h1 className="text-2xl font-bold text-center mb-6">
					Library Login
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
						className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
						Sign In
					</button>
				</form>
				<p className="text-center text-xs mt-6">
					Don't have an account?{" "}
					<button
						onClick={onNavigateToRegister}
						className="text-blue-500 font-bold">
						Register here
					</button>
				</p>
			</div>
		</div>
	);
};

export default LoginPage;
