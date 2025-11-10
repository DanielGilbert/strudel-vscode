import * as vscode from 'vscode';
//import {UpdateArgs} from './updateArgs';


export class StrudelEditorProvider implements vscode.CustomTextEditorProvider {

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new StrudelEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(StrudelEditorProvider.viewType, provider);
		return providerRegistration;
	}

	private static readonly viewType = 'strudel.strudelEditor';

	constructor(private readonly context: vscode.ExtensionContext) { }

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


		/*const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				updateWebview();
			}
		});*/

		// Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			//changeDocumentSubscription.dispose();
		});

		updateWebview();

		webviewPanel.webview.onDidReceiveMessage(e => {
			switch (e.type) {
				case 'update':
					if (/** @type {UpdateArgs} */ e.args.updateFromEditor){
						this.saveDocument(document, e.args.state.code);
					}
					return;
			}
		});
	}

	private saveDocument(document: vscode.TextDocument, text: string) {
		const edit = new vscode.WorkspaceEdit();
		edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), text);
		vscode.workspace.applyEdit(edit);
	}

	/**
	 * Get the static html used for the editor webviews.
	 */
	private getHtmlForWebview(webview: vscode.Webview): string {
		// Local path to script and css for the webview
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'out', 'strudel.js'));

		// Use a nonce to whitelist which scripts can be run
		return /* html */`
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="UTF-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
				</head>
				<script src="${scriptUri}"></script>
				<strudel-editor id="strudelRepl"></strudel-editor>
			</html>`;
	}
}