import * as vscode from 'vscode';
import {handleFullDocumentSave, clearFullDocumentSyncTimer} from "./test/handler/fullDocumentSyncHandler";
import { handleSelectedCodeSave } from './test/handler/selectedCodeSyncHandler';
import { handleExportFullDocumentSave, testEditBuilder } from './test/handler/importFullDocumentSyncHandler';
import { syncToRoom, GetSecretKey } from './test/handler/syncToRoom';
import { SecureGlobalState } from './test/handler/SecureGlobalState';

export function activate(context: vscode.ExtensionContext) {
	// welcome user
	console.log('Congratulations, your extension "me-you-code-together" is now active!');
	// initialize secret storage
    SecureGlobalState.init(context);	

	const postFullDocument = vscode.commands.registerCommand("me-you-code-together.postFullDocument", handleFullDocumentSave);
	const postSelectedCode = vscode.commands.registerCommand("me-you-code-together.postSelectedCode", handleSelectedCodeSave);
	const getFullDocument = vscode.commands.registerCommand("me-you-code-together.getFullDocument", handleExportFullDocumentSave);
	const testPopulateEditBuilder = vscode.commands.registerCommand("me-you-code-together.testPopulateEditBuilder", testEditBuilder);
	const connectToRoom = vscode.commands.registerCommand("me-you-code-together.connectToRoom", syncToRoom);
	const checkSecretKey = vscode.commands.registerCommand("me-you-code-together.checkSecretKey", GetSecretKey);

	context.subscriptions.push(postFullDocument, getFullDocument, testPopulateEditBuilder, connectToRoom, checkSecretKey);
}

export function deactivate() {
    clearFullDocumentSyncTimer();
}