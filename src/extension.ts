import * as vscode from 'vscode';
import { StrudelEditorProvider } from './strudelEditor';

export function activate(context: vscode.ExtensionContext) {
	// Register our custom editor provider
	context.subscriptions.push(StrudelEditorProvider.register(context));
}
