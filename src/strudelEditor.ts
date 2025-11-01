import * as vscode from 'vscode';

export class StrudelEditorProvider implements vscode.CustomTextEditorProvider {

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new StrudelEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(StrudelEditorProvider.viewType, provider);
		return providerRegistration;
	}

	private static readonly viewType = 'strudel.strudelEditor';

	constructor(
		private readonly context: vscode.ExtensionContext
	) { }

	/**
	 * Called when our custom editor is opened.
	 * 
	 * 
	 */
	public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		// Setup initial content for the webview
		webviewPanel.webview.options = {
			enableScripts: true,
		};
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

		function updateWebview() {
			webviewPanel.webview.postMessage({
				type: 'update',
				text: document.getText(),
			});
		}

		// Hook up event handlers so that we can synchronize the webview with the text document.
		//
		// The text document acts as our model, so we have to sync change in the document to our
		// editor and sync changes in the editor back to the document.
		// 
		// Remember that a single text document can also be shared between multiple custom
		// editors (this happens for example when you split a custom editor)

		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				updateWebview();
			}
		});

		// Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
		});

		updateWebview();
	}

	/**
	 * Get the static html used for the editor webviews.
	 */
	private getHtmlForWebview(webview: vscode.Webview): string {
		// Local path to script and css for the webview
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'strudel.js'));

		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'reset.css'));

		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'vscode.css'));

		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'catScratch.css'));

		return /* html */`
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="UTF-8">

					<meta name="viewport" content="width=device-width, initial-scale=1.0">

					<link href="${styleResetUri}" rel="stylesheet" />
					<link href="${styleVSCodeUri}" rel="stylesheet" />
					<link href="${styleMainUri}" rel="stylesheet" />
				</head>
				<script src="https://unpkg.com/@strudel/repl@latest"></script>
				<script src="${scriptUri}"></script>
				<strudel-editor id="strudelRepl"></strudel-editor>
				<script>
				const strudelEditor = document.getElementById('strudelRepl');
				console.log(repl.editor);
				</script>
			</html>`;
	}
}