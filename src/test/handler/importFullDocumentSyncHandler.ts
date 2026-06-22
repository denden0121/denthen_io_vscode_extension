import * as vscode from 'vscode';
import axios from 'axios';

export async function handleExportFullDocumentSave(context: vscode.ExtensionContext) {

	const selection = await vscode.window.showWarningMessage(
		'Warning: Importing live stream code will overwrite your current file. Do you want to continue?',
		'Yes, Overwrite', 
		'Cancel'	
	);

	if (selection === 'Cancel' || !selection) {
		return;
	}

	if (selection === 'Yes, Overwrite') {
		
		try {
			const response = await axios.get(`http://localhost:3000/data`);
			const incomingCodeText = response.data.data;

			const editor = vscode.window.activeTextEditor;

			if (editor) {
				editor.edit(editBuilder => {
					const fullRange = new vscode.Range(
						editor.document.positionAt(0),
						editor.document.positionAt(editor.document.getText().length)
					);
					editBuilder.replace(fullRange, incomingCodeText);
				});

				vscode.window.showInformationMessage('Code imported successfully!');
			}
			
		} catch (error) {
			vscode.window.showErrorMessage('Failed to fetch code from the server.');
		}
	}
};

export async function testEditBuilder(context: vscode.ExtensionContext) {
	try {
			const activeEditor = vscode.window.activeTextEditor;
			if (!activeEditor) {
				return;
			}

			const response = await axios.get(`http://localhost:3000/data`);
			const incomingCodeText = response.data.data;

			const targetPosition = activeEditor.selection.active;
			let multiText: string = `${incomingCodeText}`;
			
			activeEditor.edit(editBuilder => {
				editBuilder.insert(targetPosition, multiText.trim());
			});

				
		} catch (error) {
			vscode.window.showErrorMessage('Failed to fetch code from the server.');
		}
}


