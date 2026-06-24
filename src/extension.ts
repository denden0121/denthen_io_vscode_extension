import * as vscode from 'vscode';
import { handleFullDocumentExport} from "./test/handler/export/fullDocumentSyncHandler";
import { handleSnippetExport } from './test/handler/export/selectedCodeSyncHandler';
import { handleExportFullDocumentSave, testEditBuilder } from './test/handler/importFullDocumentSyncHandler';
import { syncToRoom, GetSecretKey } from './test/handler/syncToRoom';
import { SecureGlobalState } from './test/handler/SecureGlobalState';

export function activate(context: vscode.ExtensionContext) {
	// welcome user
	console.log('Congratulations, your extension "me-you-code-together" is now active!');
	// initialize secret storage
    SecureGlobalState.init(context);	
	// post -- done
	const postFullDocument = vscode.commands.registerCommand("me-you-code-together.postFullDocument", handleFullDocumentExport);
	const postSelectedCode = vscode.commands.registerCommand("me-you-code-together.postSelectedCode", handleSnippetExport);
	// get
	const getFullDocument = vscode.commands.registerCommand("me-you-code-together.getFullDocument", handleExportFullDocumentSave);
	const testPopulateEditBuilder = vscode.commands.registerCommand("me-you-code-together.testPopulateEditBuilder", testEditBuilder);
	// connect sync -- done
    const connectToRoom = vscode.commands.registerCommand("me-you-code-together.connectToRoom", () => syncToRoom(context));
    const checkSecretKey = vscode.commands.registerCommand("me-you-code-together.checkSecretKey", () => GetSecretKey(context));
	// context
	context.subscriptions.push(postFullDocument, getFullDocument, testPopulateEditBuilder, connectToRoom, checkSecretKey, postSelectedCode);
}

export function deactivate() {}

// import * as vscode from 'vscode';
// import { handleFullDocumentExport} from "./test/handler/fullDocumentSyncHandler";
// import { handleSnippetExport } from './test/handler/selectedCodeSyncHandler';
// import { handleExportFullDocumentSave, testEditBuilder } from './test/handler/importFullDocumentSyncHandler';
// import { syncToRoom, GetSecretKey } from './test/handler/syncToRoom';
// import { SecureGlobalState } from './test/handler/SecureGlobalState';

// export function activate(context: vscode.ExtensionContext) {
// 	// welcome user
// 	console.log('Congratulations, your extension "me-you-code-together" is now active!');
// 	// initialize secret storage
//     SecureGlobalState.init(context);	
// 	// post -- done
// 	const postFullDocument = vscode.commands.registerCommand("me-you-code-together.postFullDocument", handleFullDocumentExport);
// 	const postSelectedCode = vscode.commands.registerCommand("me-you-code-together.postSelectedCode", handleSnippetExport);
// 	// get
// 	const getFullDocument = vscode.commands.registerCommand("me-you-code-together.getFullDocument", handleExportFullDocumentSave);
// 	const testPopulateEditBuilder = vscode.commands.registerCommand("me-you-code-together.testPopulateEditBuilder", testEditBuilder);
// 	// connect sync -- done
//     const connectToRoom = vscode.commands.registerCommand("me-you-code-together.connectToRoom", () => syncToRoom(context));
//     const checkSecretKey = vscode.commands.registerCommand("me-you-code-together.checkSecretKey", () => GetSecretKey(context));
// 	// context
// 	context.subscriptions.push(postFullDocument, getFullDocument, testPopulateEditBuilder, connectToRoom, checkSecretKey, postSelectedCode);
// }

// export function deactivate() {}