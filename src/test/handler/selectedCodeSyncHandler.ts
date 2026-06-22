import * as vscode from 'vscode';
import axios, { AxiosResponse } from "axios";
import { SecureGlobalState } from './SecureGlobalState';

// declaration
type fileData = {
	fileText: string,
	key: string,
	roomKey: string | undefined
}
const client = axios.create({
	baseURL: 'http://localhost:3000'
});

export async function handleSelectedCodeSave() {
		try {
			// Check if editor is active and prevent extension crash
			const editor =  vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showWarningMessage('Sync failed: No active text editor open!');
				return;
			}
			const token = await SecureGlobalState.instance.getSecret('room_key');
				
			if (!token) {
				throw new Error("User is not authenticated.");
			}

			// Validate selection and check if there's selected text, block empty space from sending blank payloads
			const selection = editor.selection;
			const selectedText = editor.document.getText(selection).trim();
			if (!selectedText) {
				vscode.window.showWarningMessage('Synce failed: Please Highlight/Select text first!');
			}

			const config = vscode.workspace.getConfiguration('meYouCodeTogether');
			const userKey = config.get<string>('apiKey') || 'secret_key';
			if (!userKey) {
				vscode.window.showErrorMessage('Sync failed: No API Key found in settings.');
				return;
			}

			const payload: fileData = {
				fileText: selectedText,
				key: userKey,
				roomKey: token,
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
}