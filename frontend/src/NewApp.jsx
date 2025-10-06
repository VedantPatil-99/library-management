import React, {
	useState,
	useEffect,
	useCallback,
	useMemo,
} from "react";

// --- Configuration ---
const API_URL = "http://localhost:5000/api";

// --- API Service Functions ---
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

// --- Custom Hook for Authentication ---
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

// --- Reusable UI Components ---
const Modal = ({ children, onClose }) => (
	<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
		<div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
			<button
				onClick={onClose}
				className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl">
				&times;
			</button>
			{children}
		</div>
	</div>
);

const BookForm = ({ book, onSave, onCancel }) => {
	const [formData, setFormData] = useState(
		book || {
			title: "",
			author: "",
			isbn: "",
			available: true,
		},
	);
	const handleChange = (e) => {
		const { name, value, type, checked } =
			e.target;
		setFormData((prev) => ({
			...prev,
			[name]:
				type === "checkbox" ? checked : value,
		}));
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		onSave(formData);
	};
	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-4">
			<h2 className="text-2xl font-bold text-gray-800">
				{book ? "Edit Book" : "Add New Book"}
			</h2>
			<div>
				<label className="block text-sm font-medium">
					Title
				</label>
				<input
					type="text"
					name="title"
					value={formData.title}
					onChange={handleChange}
					required
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
				/>
			</div>
			<div>
				<label className="block text-sm font-medium">
					Author
				</label>
				<input
					type="text"
					name="author"
					value={formData.author}
					onChange={handleChange}
					required
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
				/>
			</div>
			<div>
				<label className="block text-sm font-medium">
					ISBN
				</label>
				<input
					type="text"
					name="isbn"
					value={formData.isbn}
					onChange={handleChange}
					required
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
				/>
			</div>
			<div className="flex items-center">
				<input
					id="available"
					name="available"
					type="checkbox"
					checked={formData.available}
					onChange={handleChange}
					className="h-4 w-4 rounded border-gray-300"
				/>
				<label
					htmlFor="available"
					className="ml-2 block text-sm">
					Available
				</label>
			</div>
			<div className="flex justify-end space-x-2">
				<button
					type="button"
					onClick={onCancel}
					className="px-4 py-2 bg-gray-200 rounded-md">
					Cancel
				</button>
				<button
					type="submit"
					className="px-4 py-2 bg-indigo-600 text-white rounded-md">
					Save
				</button>
			</div>
		</form>
	);
};

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

const UserDashboard = ({
	user,
	token,
	onLogout,
}) => {
	const [books, setBooks] = useState([]);
	const [history, setHistory] = useState([]);
	const fetchAllData = useCallback(async () => {
		setBooks(await apiService.getBooks());
		setHistory(
			await apiService.getBorrowingHistory(
				user.id,
				token,
			),
		);
	}, [user.id, token]);

	useEffect(() => {
		fetchAllData();
	}, [fetchAllData]);

	const borrowedBookIds = useMemo(
		() =>
			history
				.filter((r) => !r.returnDate)
				.map((r) => r.book._id),
		[history],
	);
	const handleBorrow = async (bookId) => {
		await apiService.borrowBook(
			user.id,
			bookId,
			token,
		);
		fetchAllData();
	};
	const handleReturn = async (bookId) => {
		await apiService.returnBook(
			user.id,
			bookId,
			token,
		);
		fetchAllData();
	};

	return (
		<div className="bg-gray-100 min-h-screen">
			<header className="bg-white shadow-md">
				<nav className="container mx-auto px-6 py-3 flex justify-between items-center">
					<h1 className="text-xl font-bold">
						Library Portal
					</h1>
					<div>
						<span className="mr-4">
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
				<section>
					<h2 className="text-2xl font-bold mb-4">
						Available Books
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{books.map((book) => (
							<div
								key={book._id}
								className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between hover:scale-105 transition-transform">
								<div>
									<h3 className="font-bold text-lg">
										{book.title}
									</h3>
									<p className="text-sm text-gray-600">
										by {book.author}
									</p>
								</div>
								<div className="mt-4">
									{borrowedBookIds.includes(
										book._id,
									) ? (
										<button
											onClick={() =>
												handleReturn(book._id)
											}
											className="w-full py-2 bg-green-500 text-white rounded-md">
											Return
										</button>
									) : book.available ? (
										<button
											onClick={() =>
												handleBorrow(book._id)
											}
											className="w-full py-2 bg-blue-500 text-white rounded-md">
											Borrow
										</button>
									) : (
										<p className="text-center font-semibold text-red-500">
											Unavailable
										</p>
									)}
								</div>
							</div>
						))}
					</div>
				</section>
				{/* --- BORROWING HISTORY TABLE --- */}
				<section className="mt-10">
					<h2 className="text-2xl font-bold mb-4">
						Your Borrowing History
					</h2>
					<div className="bg-white rounded-lg shadow-md overflow-x-auto">
						<table className="min-w-full">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Book Title
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Borrow Date
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Return Date
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{history.length > 0 ? (
									history.map((rec) => (
										<tr key={rec._id}>
											<td className="px-6 py-4 whitespace-nowrap">
												{rec.book?.title ||
													"Book removed"}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												{new Date(
													rec.borrowDate,
												).toLocaleDateString()}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												{rec.returnDate
													? new Date(
															rec.returnDate,
													  ).toLocaleDateString()
													: "Not Returned"}
											</td>
										</tr>
									))
								) : (
									<tr>
										<td
											colSpan="3"
											className="text-center py-4">
											No borrowing history found.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</section>
			</main>
		</div>
	);
};

const AdminDashboard = ({
	user,
	token,
	onLogout,
}) => {
	const [books, setBooks] = useState([]);
	const [users, setUsers] = useState([]);
	const [isModalOpen, setIsModalOpen] =
		useState(false);
	const [editingBook, setEditingBook] =
		useState(null);
	const [activeTab, setActiveTab] =
		useState("books");

	const fetchData = useCallback(async () => {
		setBooks(await apiService.getBooks());
		setUsers(await apiService.getUsers(token));
	}, [token]);
	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleEditClick = (book) => {
		setEditingBook(book);
		setIsModalOpen(true);
	};
	const handleAddClick = () => {
		setEditingBook(null);
		setIsModalOpen(true);
	};
	const handleCloseModal = () =>
		setIsModalOpen(false);

	const handleSaveBook = async (bookData) => {
		if (editingBook) {
			await apiService.updateBook(
				editingBook._id,
				bookData,
				token,
			);
		} else {
			await apiService.addBook(bookData, token);
		}
		fetchData();
		handleCloseModal();
	};

	const handleDeleteBook = async (bookId) => {
		if (
			window.confirm(
				"Are you sure you want to delete this book?",
			)
		) {
			await apiService.deleteBook(bookId, token);
			fetchData();
		}
	};

	const handleDeleteUser = async (userId) => {
		if (userId === user.id) {
			alert(
				"You cannot delete your own admin account.",
			);
			return;
		}
		if (
			window.confirm(
				"Are you sure you want to delete this user?",
			)
		) {
			await apiService.deleteUser(userId, token);
			fetchData();
		}
	};

	return (
		<div className="bg-gray-100 min-h-screen">
			<header className="bg-white shadow-md">
				<nav className="container mx-auto px-6 py-3 flex justify-between items-center">
					<h1 className="text-xl font-bold">
						Admin Dashboard
					</h1>
					<div>
						<span className="mr-4">
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
				{/* --- ADMIN TABS --- */}
				<div className="border-b border-gray-200 mb-6">
					<nav className="-mb-px flex space-x-8">
						<button
							onClick={() =>
								setActiveTab("books")
							}
							className={`${
								activeTab === "books"
									? "border-indigo-500 text-indigo-600"
									: "border-transparent text-gray-500"
							} py-4 px-1 border-b-2 font-medium`}>
							Manage Books
						</button>
						<button
							onClick={() =>
								setActiveTab("users")
							}
							className={`${
								activeTab === "users"
									? "border-indigo-500 text-indigo-600"
									: "border-transparent text-gray-500"
							} py-4 px-1 border-b-2 font-medium`}>
							Manage Users
						</button>
					</nav>
				</div>

				{activeTab === "books" && (
					<div>
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-2xl font-bold">
								Book Collection
							</h2>
							<button
								onClick={handleAddClick}
								className="bg-indigo-600 text-white font-bold py-2 px-4 rounded">
								Add Book
							</button>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{books.map((book) => (
								<div
									key={book._id}
									className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between">
									<div>
										<h3 className="font-bold">
											{book.title}
										</h3>
										<p className="text-sm text-gray-600">
											{book.author}
										</p>
										<p
											className={`text-sm font-bold ${
												book.available
													? "text-green-600"
													: "text-red-600"
											}`}>
											{book.available
												? "Available"
												: "Borrowed"}
										</p>
									</div>
									<div className="mt-4 flex space-x-2">
										<button
											onClick={() =>
												handleEditClick(book)
											}
											className="w-full py-2 text-sm bg-yellow-500 text-white rounded-md">
											Edit
										</button>
										<button
											onClick={() =>
												handleDeleteBook(book._id)
											}
											className="w-full py-2 text-sm bg-red-500 text-white rounded-md">
											Delete
										</button>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* --- MANAGE USERS TABLE --- */}
				{activeTab === "users" && (
					<div>
						<h2 className="text-2xl font-bold mb-4">
							User Accounts
						</h2>
						<div className="bg-white rounded-lg shadow-md overflow-x-auto">
							<table className="min-w-full">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
											Username
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
											Role
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{users.map((u) => (
										<tr key={u._id}>
											<td className="px-6 py-4 whitespace-nowrap">
												{u.username}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												{u.role}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<button
													onClick={() =>
														handleDeleteUser(
															u._id,
														)
													}
													className="text-red-600 hover:text-red-900"
													disabled={
														u._id === user.id
													}>
													Delete
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</main>
			{isModalOpen && (
				<Modal onClose={handleCloseModal}>
					<BookForm
						book={editingBook}
						onSave={handleSaveBook}
						onCancel={handleCloseModal}
					/>
				</Modal>
			)}
		</div>
	);
};

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
