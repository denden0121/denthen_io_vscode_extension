import * as vscode from 'vscode';
import { SecureGlobalState } from './SecureGlobalState';
import axios, { AxiosResponse } from "axios";
import { ApiService } from '../service/api.service';
import { VsCodeHelper } from '../util/helper.util';


const client = axios.create({
	baseURL: 'http://localhost:3000/api/vscodes'
});

export async function syncToRoom(context: vscode.ExtensionContext) {
	try {
		const activeEditor = VsCodeHelper.getActiveEditor();
		if (!activeEditor) { return; }

		let userInput: string | undefined;
		userInput = await vscode.window.showInputBox({
			prompt: 'Paste special key and press enter to connect!',
			placeHolder: 'e.g participant_5b1902bf_denden',
			ignoreFocusOut: true,
		});
		if (userInput === undefined) {
			vscode.window.showWarningMessage('Operation cancelled.');
			return; 
		}
 		if (userInput) {
			try {
				const payload = {
					clientType: 'vscode',
					specialKey: userInput,
				};
				const response = await client.post(`/join`, payload);
				if (response) {
					// Now you are passing a genuine string!
					await SecureGlobalState.instance.setSecret('accessToken', response.data.accessToken);
					await SecureGlobalState.instance.setSecret('refreshToken', response.data.refreshToken);
					await SecureGlobalState.instance.setSecret('user', response.data.user.user.username);
					vscode.window.showInformationMessage(response.data.message);
				} else {
					console.error('Token could not be extracted from response object.');
				}
			} catch (error: any) {
				if (error.code === 'ECONNREFUSED') {
					vscode.window.showWarningMessage('Express server is offline!');
					return;
				} else {
					console.error('Extension Sync Error:', error.message);
				}
			}
        }
	} catch (error: any) {
		if (error.code === 'ECONNREFUSED') {
			vscode.window.showWarningMessage('Invalid key, Please Check if copy or create new if needed!');
			return;
		} else {
			console.error('Extension Sync Error:', error.message);
		}
	}
}

export async function GetSecretKey(context: vscode.ExtensionContext) {
	try {
		// Check if editor is active and prevent extension crash
		const editor =  vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('Sync failed: No active text editor open!');
			return;
		}

		  const savedData = await SecureGlobalState.instance.getSecret('user');
    
		if (!savedData) {
			throw new Error("User is not authenticated.");
		}

		vscode.window.showInformationMessage(savedData);
	} catch (error: any) {
		if (error.code === 'ECONNREFUSED') {
			vscode.window.showWarningMessage('Invalid key, Please Check if copy or create new if needed!');
			return;
		} else {
			console.error('Extension Sync Error:', error.message);
		}
	}
}


