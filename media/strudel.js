// @ts-ignore
import * as repl from '@strudel/repl'
import {EditorState} from '@codemirror/state';
import {UpdateArgs} from './../src/updateArgs';

const app = () => {
// Get a reference to the VS Code webview api.
	// We use this API to post messages back to our extension.

	repl.prebake();

	// @ts-ignore
	const vscode = acquireVsCodeApi();

	/**
	 * Render the document in the webview.
	 */
	function updateContent(/** @type {string} */ text) {

		//@ts-ignore
		/** @type {HTMLElement} */ (document.getElementById('strudelRepl')).editor.setCode(text);
	}
				//@ts-ignore
	/** @type {HTMLElement} */ (document.getElementById('strudelRepl')).addEventListener("update", function (/** @type {CustomEvent} **/ e) {
			vscode.postMessage({ type: 'update', args: new UpdateArgs(e.detail, true) });
			console.log(e);
	});

	// Handle messages sent from the extension to the webview
	window.addEventListener('message', event => {
		const message = event.data; // The json data that the extension sent
		switch (message.type) {
			case 'update':
				const text = message.text;

				// Update our webview's content
				updateContent(text);

				// Then persist state information.
				// This state is returned in the call to `vscode.getState` below when a webview is reloaded.
				vscode.setState({ text });

				return;
		}
	});

	// Webviews are normally torn down when not visible and re-created when they become visible again.
	// State lets us save information across these re-loads
	const state = vscode.getState();
	if (state) {
		// @ts-ignore
		updateContent(state.text);
	}

}

document.addEventListener('DOMContentLoaded', app);
