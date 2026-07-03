import * as vscode from 'vscode';
import { ApiService } from '../../service/api.service';
import { VsCodeHelper } from '../../util/helper.util';

export async function handleSnippetExport() {
    try {
        
        // Check if editor is active
         const activeEditor = VsCodeHelper.getActiveEditor();
		if (!activeEditor) { return; }
    	const document = activeEditor.document;

        const selection = activeEditor.selection;
        const selectedText = activeEditor.document.getText(selection).trim();
        
        if (!selectedText) {
            vscode.window.showWarningMessage('Sync failed: Please Highlight/Select text first!');
            return; 
        }

         // 2. Data formatting
        const fileExtension = VsCodeHelper.getFileExtension(document.fileName);
        const payload = {
            code: selectedText,
            type: "snippet" as const,
            fileExtension
        };

        // 3. Simple API delegation
        const data = await ApiService.exportCode(payload);
        console.log('Server response:', data);
		vscode.window.showInformationMessage('Code snippet exported successfully!');
        
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
