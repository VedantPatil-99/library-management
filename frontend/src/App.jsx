import React, { useState } from "react";
import useAuth from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

// --- Main App Component (Router) ---
export default function App() {
	const { user, token, login, logout } =
		useAuth();
	const [page, setPage] = useState("login");

	if (!user) {
		return page === "login" ? (
			<LoginPage
				onLogin={login}
				onNavigateToRegister={() =>
					setPage("register")
				}
			/>
		) : (
			<RegisterPage
				onNavigateToLogin={() => setPage("login")}
			/>
		);
	}
	return user.role === "admin" ? (
		<AdminDashboard
			user={user}
			token={token}
			onLogout={logout}
		/>
	) : (
		<UserDashboard
			user={user}
			token={token}
			onLogout={logout}
		/>
	);
}
