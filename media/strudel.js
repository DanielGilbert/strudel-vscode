// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
	const app = () => {
		console.log("test234");
	}

	document.addEventListener('DOMContentLoaded', app);
}());
