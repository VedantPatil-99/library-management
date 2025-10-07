import React from "react";

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

export default Modal;
