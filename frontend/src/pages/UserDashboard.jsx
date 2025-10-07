import React, {
	useState,
	useEffect,
	useCallback,
	useMemo,
} from "react";
import { apiService } from "../api/apiService";

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
export default UserDashboard;
