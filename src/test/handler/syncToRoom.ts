import * as vscode from 'vscode';
import { SecureGlobalState } from './SecureGlobalState';
import axios, { AxiosResponse } from "axios";

// declaration
type fileData = {
	denthen_code: string,
}

let userInput: string | undefined;

const client = axios.create({
	baseURL: 'http://localhost:3000'
});

export async function syncToRoom(context: vscode.ExtensionContext) {


	try {
		
		const editor =  vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('Sync failed: No active text editor open!');
			return;
		}

		
		userInput = await vscode.window.showInputBox({
			prompt: 'Paste room key and press enter to connect!',
			placeHolder: 'e.g admin_a6f454fe-33c1-47e1-bfad-271a714eaba5_adfec931-869b-4043-91e5-9dd12ef691cd',
			ignoreFocusOut: true,
		});

		if (userInput === undefined) {
			vscode.window.showWarningMessage('Operation cancelled.');
			return; 
		}

 		if (userInput) {
            await SecureGlobalState.instance.setSecret('room_key', userInput);
			
			try {
				const config = vscode.workspace.getConfiguration('meYouCodeTogether');
				const userKey = config.get<string>('apiKey') || 'secret_key';
				if (!userKey) {
					vscode.window.showErrorMessage('Sync failed: No API Key found in settings.');
					return;
				}
	
				const payload: fileData = {
					denthen_code: userInput,
				};
					
				const response = await client.post(`/room/join`, payload);
				await vscode.window.showInformationMessage(String(response.data.message));

				// ADD HERE A FUNCTION WHERE IT SAVES THE JWT TOKEN TO SECUREGLOBALSTATE
								
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

		  const token = await SecureGlobalState.instance.getSecret('room_key');
    
		if (!token) {
			throw new Error("User is not authenticated.");
		}

		vscode.window.showInformationMessage(token);
	} catch (error: any) {
		if (error.code === 'ECONNREFUSED') {
			vscode.window.showWarningMessage('Invalid key, Please Check if copy or create new if needed!');
			return;
		} else {
			console.error('Extension Sync Error:', error.message);
		}
	}
}


