import { useState, useEffect } from "react";
import { apiService } from "../api/apiService";

const useAuth = () => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(
		localStorage.getItem("token"),
	);
	useEffect(() => {
		const storedUser =
			localStorage.getItem("user");
		if (storedUser && token)
			setUser(JSON.parse(storedUser));
	}, [token]);

	const login = async (username, password) => {
		const data = await apiService.login(
			username,
			password,
		);
		if (data.token) {
			localStorage.setItem("token", data.token);
			localStorage.setItem(
				"user",
				JSON.stringify(data.user),
			);
			setToken(data.token);
			setUser(data.user);
			return true;
		}
		return false;
	};
	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setUser(null);
		setToken(null);
	};
	return { user, token, login, logout };
};

export default useAuth;
