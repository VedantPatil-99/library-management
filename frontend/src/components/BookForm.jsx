import React, { useState } from "react";

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

export default BookForm;
