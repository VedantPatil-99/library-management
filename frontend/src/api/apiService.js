// --- Configuration ---
const API_URL = "http://localhost:5000/api";

// --- API Service Functions ---
export const apiService = {
	login: (username, password) =>
		fetch(`${API_URL}/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username,
				password,
			}),
		}).then((res) => res.json()),
	register: (username, password) =>
		fetch(`${API_URL}/auth/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username,
				password,
			}),
		}).then((res) => res.json()),
	getBooks: () =>
		fetch(`${API_URL}/books`).then((res) =>
			res.json(),
		),
	borrowBook: (userId, bookId, token) =>
		fetch(`${API_URL}/users/borrow`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-auth-token": token,
			},
			body: JSON.stringify({ userId, bookId }),
		}).then((res) => res.json()),
	returnBook: (userId, bookId, token) =>
		fetch(`${API_URL}/users/return`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-auth-token": token,
			},
			body: JSON.stringify({ userId, bookId }),
		}).then((res) => res.json()),
	getBorrowingHistory: (userId, token) =>
		fetch(`${API_URL}/users/${userId}/history`, {
			headers: { "x-auth-token": token },
		}).then((res) => res.json()),

	// --- NEW/UPDATED Admin functions ---
	addBook: (bookData, token) =>
		fetch(`${API_URL}/books`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-auth-token": token,
			},
			body: JSON.stringify(bookData),
		}).then((res) => res.json()),
	updateBook: (bookId, bookData, token) =>
		fetch(`${API_URL}/books/${bookId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"x-auth-token": token,
			},
			body: JSON.stringify(bookData),
		}).then((res) => res.json()),
	deleteBook: (bookId, token) =>
		fetch(`${API_URL}/books/${bookId}`, {
			method: "DELETE",
			headers: { "x-auth-token": token },
		}).then((res) => res.json()),
	getUsers: (token) =>
		fetch(`${API_URL}/users`, {
			headers: { "x-auth-token": token },
		}).then((res) => res.json()),
	deleteUser: (userId, token) =>
		fetch(`${API_URL}/users/${userId}`, {
			method: "DELETE",
			headers: { "x-auth-token": token },
		}).then((res) => res.json()),
};
