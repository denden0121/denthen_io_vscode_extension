import * as vscode from 'vscode';
import axios, { AxiosResponse } from "axios";
import * as path from 'path';
import { SecureGlobalState } from './SecureGlobalState'; 

type TVscodePayload = {
    code: string;
    type: 'document' | 'snippet';
    fileExtension: 'html' | 'css' | 'js';
};

export async function handleFullDocumentExport(): Promise<void> {

	try {
			
		const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			return;
		}
		const document = activeEditor.document;
		// Check if document is active
		if (document.uri.scheme !== 'file') {
			return; 
		}
		const filePath = activeEditor.document.fileName;
		const fileExtension = path.extname(filePath).slice(1) as "html" | "css" | "js";
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
		const fileUri = document.uri;
		const fileStat = await vscode.workspace.fs.stat(fileUri);
		if (fileStat.size > (1048576 * 10)) {
			vscode.window.showWarningMessage(`File's over 10MB`);
			return;
		}
		const payload: TVscodePayload = {
			code: document.getText(),
			type: "document",
			fileExtension: fileExtension,
		};
		const response = await client.post(`/export`, payload);
		if (response) {
			console.log('Server response:', response.data);
			vscode.window.showInformationMessage('Full Code export successfully!');
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
};


