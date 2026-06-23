import * as vscode from 'vscode';
import axios from 'axios';
import * as path from 'path';
import { SecureGlobalState } from './SecureGlobalState'; 

type TVscodePayload = {
    code: string;
    type: 'document' | 'snippet';
    fileExtension: 'html' | 'css' | 'js';
};

export async function handleSnippetExport() {
    try {
        const client = axios.create({
            baseURL: 'http://localhost:3000/api/protected'
        });
        client.interceptors.request.use(
			async (config) => {
				const token = await SecureGlobalState.instance.getSecret('accessToken');
				if (token) {
					config.headers.Authorization = `Bearer ${token}`;
				} else {
					console.warn("Authorization missing: No accessToken found in storage!");
				}
				return config;
			},
			(error) => {
				return Promise.reject(error);
			}
		);	
        // Check if editor is active
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Sync failed: No active text editor open!');
            return;
        }

        const filePath = editor.document.fileName;
        const fileExtension = path.extname(filePath).slice(1) as "html" | "css" | "js";

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection).trim();
        
        if (!selectedText) {
            vscode.window.showWarningMessage('Sync failed: Please Highlight/Select text first!');
            return; 
        }

        const payload: TVscodePayload = {
            code: selectedText,
            type: "snippet",
            fileExtension: fileExtension,
        };

        const response = await client.post(`/export`, payload);
        if (response) {
            console.log('Server response:', response.data);
			vscode.window.showInformationMessage('Code Snippet export successfully!');
        }
        
    } catch (error: any) {
		if (error.response) {
			console.error('Backend rejected request:', error.response.data);
			vscode.window.showErrorMessage(`Sync Error (400): ${JSON.stringify(error.response.data)}`);
		} else if (error.code === 'ECONNREFUSED') {
			vscode.window.showWarningMessage('Express server is offline.');
		} else {
			console.error('Extension Sync Error:', error.message);
		}
    }
}


// export async function handleSelectedCodeSave(context: vscode.ExtensionContext) {
// 		try {
// 			const token = await SecureGlobalState.instance.getSecret('accessToken');
// 			type TVscodePayload = {
// 				code: string,
// 				type: 'document' | 'snippet',
// 				fileExtension: 'html' | 'css' | 'js',
// 			}
// 			const client = axios.create({
// 				baseURL: 'http://localhost:3000/api/protected'
// 			});
// 			client.interceptors.request.use(
// 				(config) => {
// 					if (token) {
// 						config.headers.Authorization = `Bearer ${token}`;
// 					}
// 					return config;
// 				},
// 				(error) => {
// 					return Promise.reject(error);
// 				}
// 			);
// 			// Check if editor is active and prevent extension crash
// 			const editor =  vscode.window.activeTextEditor;
// 			if (!editor) {
// 				vscode.window.showWarningMessage('Sync failed: No active text editor open!');
// 				return;
// 			}
// 			const filePath = editor.document.fileName;
// 			const fileExtension = path.extname(filePath).slice(1) as "html" | "css" | "js";

// 			// Validate selection and check if there's selected text, block empty space from sending blank payloads
// 			const selection = editor.selection;
// 			const selectedText = editor.document.getText(selection).trim();
// 			if (!selectedText) {
// 				vscode.window.showWarningMessage('Synce failed: Please Highlight/Select text first!');
// 			}

// 			const payload: TVscodePayload = {
// 				code: selectedText,
// 				type: "snippet",
// 				fileExtension: fileExtension,
// 			};

// 			const response = await client.post(`/export`, payload);
// 			if (response) {
// 				console.log(response.data);
// 			}
		
// 	} catch (error: any) {
// 		if (error.code === 'ECONNREFUSED') {
// 			vscode.window.showWarningMessage('Express server is offline. Run your backend node app!');
// 			return;
// 		} else {
// 			console.error('Extension Sync Error:', error.message);
// 		}
// 	}
// }