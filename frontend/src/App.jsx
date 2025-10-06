import React, {
	useState,
	useEffect,
	useCallback,
	useMemo,
} from "react";

// --- Configuration ---
// Make sure your backend is running on this port
const API_URL = "http://localhost:5000/api";

// --- API Service Functions ---
// A central place to handle all communication with the backend.

const apiService = {
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

	// Admin functions
	addBook: (bookData, token) =>
		fetch(`${API_URL}/books`, {
			method: "POST",
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
};

// --- Custom Hook for Authentication ---
// Manages user state and interaction with Local Storage.

const useAuth = () => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(
		localStorage.getItem("token"),
	);

	useEffect(() => {
		const storedUser =
			localStorage.getItem("user");
		if (storedUser && token) {
			setUser(JSON.parse(storedUser));
		}
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

// --- Reusable UI Components ---

const BookCard = ({
	book,
	onBorrow,
	onReturn,
	borrowed,
}) => (
	<div className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between transition-transform duration-300 hover:scale-105">
		<div>
			<h3 className="font-bold text-lg text-gray-800">
				{book.title}
			</h3>
			<p className="text-gray-600 text-sm">
				by {book.author}
			</p>
		</div>
		<div className="mt-4 flex flex-col space-y-2">
			{borrowed ? (
				<button
					onClick={() => onReturn(book._id)}
					className="w-full px-3 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600">
					Return
				</button>
			) : book.available ? (
				<button
					onClick={() => onBorrow(book._id)}
					className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600">
					Borrow
				</button>
			) : (
				<p className="text-center text-sm font-semibold text-red-500">
					Unavailable
				</p>
			)}
		</div>
	</div>
);

// --- Page Components ---

const LoginPage = ({
	onLogin,
	onNavigateToRegister,
}) => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		const success = await onLogin(
			username,
			password,
		);
		if (!success) {
			setError("Invalid username or password.");
		}
	};

	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center">
			<div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
				<h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
					Library Login
				</h1>
				<form onSubmit={handleSubmit}>
					{error && (
						<p className="text-red-500 text-sm mb-4">
							{error}
						</p>
					)}
					<div className="mb-4">
						<label className="block text-gray-700">
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
						<label className="block text-gray-700">
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
				<p className="text-center text-gray-500 text-xs mt-6">
					Don't have an account?{" "}
					<button
						onClick={onNavigateToRegister}
						className="text-blue-500 hover:text-blue-700 font-bold">
						Register here
					</button>
				</p>
			</div>
		</div>
	);
};

const UserDashboard = ({
	user,
	token,
	onLogout,
}) => {
	const [books, setBooks] = useState([]);
	const [history, setHistory] = useState([]);

	const fetchAllData = useCallback(async () => {
		const booksData = await apiService.getBooks();
		const historyData =
			await apiService.getBorrowingHistory(
				user.id,
				token,
			);
		setBooks(booksData);
		setHistory(historyData);
	}, [user.id, token]);

	useEffect(() => {
		fetchAllData();
	}, [fetchAllData]);

	const borrowedBookIds = useMemo(
		() =>
			history
				.filter((record) => !record.returnDate)
				.map((record) => record.book._id),
		[history],
	);

	const handleBorrow = async (bookId) => {
		await apiService.borrowBook(
			user.id,
			bookId,
			token,
		);
		fetchAllData(); // Refresh data
	};

	const handleReturn = async (bookId) => {
		await apiService.returnBook(
			user.id,
			bookId,
			token,
		);
		fetchAllData(); // Refresh data
	};

	return (
		<div className="bg-gray-100 min-h-screen">
			<header className="bg-white shadow-md">
				<nav className="container mx-auto px-6 py-3 flex justify-between items-center">
					<h1 className="text-xl font-bold text-gray-800">
						Library Portal
					</h1>
					<div>
						<span className="text-gray-700 mr-4">
							Welcome, {user.username}!
						</span>
						<button
							onClick={onLogout}
							className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
							Logout
						</button>
					</div>
				</nav>
			</header>
			<main className="container mx-auto p-6">
				<h2 className="text-2xl font-bold text-gray-800 mb-4">
					Available Books
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{books.map((book) => (
						<BookCard
							key={book._id}
							book={book}
							onBorrow={handleBorrow}
							onReturn={handleReturn}
							borrowed={borrowedBookIds.includes(
								book._id,
							)}
						/>
					))}
				</div>
			</main>
		</div>
	);
};

// Simplified Admin Dashboard for brevity. Can be expanded like the User Dashboard.
const AdminDashboard = ({
	user,
	token,
	onLogout,
}) => {
	const [books, setBooks] = useState([]);

	const fetchBooks = useCallback(async () => {
		const booksData = await apiService.getBooks();
		setBooks(booksData);
	}, []);

	useEffect(() => {
		fetchBooks();
	}, [fetchBooks]);

	const handleAddBook = async (e) => {
		e.preventDefault();
		const { title, author, isbn } =
			e.target.elements;
		const newBook = {
			title: title.value,
			author: author.value,
			isbn: isbn.value,
		};
		await apiService.addBook(newBook, token);
		fetchBooks();
		e.target.reset();
	};

	const handleDeleteBook = async (bookId) => {
		if (
			window.confirm(
				"Are you sure you want to delete this book?",
			)
		) {
			await apiService.deleteBook(bookId, token);
			fetchBooks();
		}
	};

	return (
		<div className="bg-gray-100 min-h-screen">
			<header className="bg-white shadow-md">
				<nav className="container mx-auto px-6 py-3 flex justify-between items-center">
					<h1 className="text-xl font-bold text-gray-800">
						Admin Dashboard
					</h1>
					<div>
						<span className="text-gray-700 mr-4">
							Welcome, {user.username}!
						</span>
						<button
							onClick={onLogout}
							className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
							Logout
						</button>
					</div>
				</nav>
			</header>
			<main className="container mx-auto p-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div>
						<h2 className="text-2xl font-bold text-gray-800 mb-4">
							Add a New Book
						</h2>
						<form
							onSubmit={handleAddBook}
							className="bg-white p-6 rounded-lg shadow-md">
							<div className="mb-4">
								<label className="block text-gray-700">
									Title
								</label>
								<input
									name="title"
									type="text"
									required
									className="w-full px-3 py-2 border rounded"
								/>
							</div>
							<div className="mb-4">
								<label className="block text-gray-700">
									Author
								</label>
								<input
									name="author"
									type="text"
									required
									className="w-full px-3 py-2 border rounded"
								/>
							</div>
							<div className="mb-4">
								<label className="block text-gray-700">
									ISBN
								</label>
								<input
									name="isbn"
									type="text"
									required
									className="w-full px-3 py-2 border rounded"
								/>
							</div>
							<button
								type="submit"
								className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
								Add Book
							</button>
						</form>
					</div>
					<div>
						<h2 className="text-2xl font-bold text-gray-800 mb-4">
							Manage Books
						</h2>
						<div className="space-y-3">
							{books.map((book) => (
								<div
									key={book._id}
									className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
									<div>
										<p className="font-semibold">
											{book.title}
										</p>
										<p className="text-sm text-gray-600">
											{book.author}
										</p>
									</div>
									<button
										onClick={() =>
											handleDeleteBook(book._id)
										}
										className="text-red-500 hover:text-red-700 font-bold">
										Delete
									</button>
								</div>
							))}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

// --- Main App Component (Router) ---
export default function App() {
	const { user, token, login, logout } =
		useAuth();
	// Simple router, can be replaced with React Router for more complex apps
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
				onRegister={apiService.register}
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

// A simple register page component.
const RegisterPage = ({
	onRegister,
	onNavigateToLogin,
}) => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		const result = await onRegister(
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
				<h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
					Create Account
				</h1>
				<form onSubmit={handleSubmit}>
					{error && (
						<p className="text-red-500 text-sm mb-4">
							{error}
						</p>
					)}
					<div className="mb-4">
						<label className="block text-gray-700">
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
						<label className="block text-gray-700">
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
				<p className="text-center text-gray-500 text-xs mt-6">
					Already have an account?{" "}
					<button
						onClick={onNavigateToLogin}
						className="text-blue-500 hover:text-blue-700 font-bold">
						Login here
					</button>
				</p>
			</div>
		</div>
	);
};
