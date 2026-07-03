import * as vscode from 'vscode';
import { ApiService } from '../../service/api.service';
import { VsCodeHelper } from '../../util/helper.util';

export async function handleFullDocumentExport(): Promise<void> {
    const activeEditor = VsCodeHelper.getActiveEditor();
    if (!activeEditor) { return; }

    const document = activeEditor.document;

    try {
        // 1. Structural Validations
        if (await VsCodeHelper.isTooLarge(document.uri, 10)) {
            vscode.window.showWarningMessage("File's over 10MB");
            return;
        }

        // 2. Data formatting
        const fileExtension = VsCodeHelper.getFileExtension(document.fileName);
        const payload = {
            code: document.getText(),
            type: "document" as const,
            fileExtension
        };

        // 3. Simple API delegation
        const data = await ApiService.exportCode(payload);
        
        console.log('Server response:', data);
        vscode.window.showInformationMessage('Full Code exported successfully!');

    } catch (error: any) {
        // 4. Clean Unified Error Toasts
        vscode.window.showErrorMessage(error.message);
    }
}