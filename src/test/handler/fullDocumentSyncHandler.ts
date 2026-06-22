import * as vscode from 'vscode';
import axios, { AxiosResponse } from "axios";

//declaration
type fileData = {
	fileText: string,
	fileName: string,
	key: string,
}
const client = axios.create({
	baseURL: 'http://localhost:3000'
});
let saveTimeout: NodeJS.Timeout | null = null;
const DEBOUNCE_DELAY = 1000;

// Command
export async function handleFullDocumentSave(): Promise<void> {
	const activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		return;
	}
	const document = activeEditor.document;
	// Check if document is active
	if (document.uri.scheme !== 'file') {
		return; 
	}
	// Prevents posting frequently
	if (saveTimeout) {
		clearTimeout(saveTimeout);
	}

	saveTimeout = setTimeout(async () => {
		try {
			const fileUri = document.uri;
			const fileStat = await vscode.workspace.fs.stat(fileUri);
			// Check if size is too large 
			if (fileStat.size > (1048576 * 10)) {
				vscode.window.showWarningMessage(`File's over 10MB`);
				return;
			}

			const config = vscode.workspace.getConfiguration('meYouCodeTogether');
			const userKey = config.get<string>('apiKey') || 'secret_key';
			if (!userKey) {
				vscode.window.showErrorMessage('Sync failed: No API Key found in settings.');
				return;
			}

			const payload: fileData = {
				fileText: document.getText(),
				fileName: document.fileName,
				key: userKey 
			};

			await client.post(`/data`, payload);
			vscode.window.showInformationMessage('Code synced successfully!');
			
		} catch (error: any) {
			if (error.code === 'ECONNREFUSED') {
				vscode.window.showWarningMessage('Express server is offline. Run your backend node app!');
				return;
			} else {
				console.error('Extension Sync Error:', error.message);
			}
		}
	}, DEBOUNCE_DELAY);

};

export function clearFullDocumentSyncTimer(): void {
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }
}

