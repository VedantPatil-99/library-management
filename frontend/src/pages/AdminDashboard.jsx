import React, {
	useState,
	useEffect,
	useCallback,
} from "react";
import { apiService } from "../api/apiService";
import Modal from "../components/Modal";
import BookForm from "../components/BookForm";

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

export default AdminDashboard;
