import * as vscode from 'vscode';
import { handleFullDocumentExport} from "./test/handler/export/fullDocumentSyncHandler";
import { handleSnippetExport } from './test/handler/export/selectedCodeSyncHandler';
import { handleExportFullDocumentSave, testEditBuilder } from './test/handler/importFullDocumentSyncHandler';
import { syncToRoom, GetSecretKey } from './test/handler/syncToRoom';
import { SecureGlobalState } from './test/handler/SecureGlobalState';
import  io  from "socket.io-client";
import { VsCodeHelper } from './test/util/helper.util';

export function activate(context: vscode.ExtensionContext) {
	// welcome user
	console.log('Congratulations, your extension "me-you-code-together" is now active!');
	// initialize secret storage
    SecureGlobalState.init(context);
	let socket: any = null;
	
	async function initializeSocketConnection() {
        try {
			await SecureGlobalState.instance.setSecret('isLiveStream', "false");
            const actualRoomCode = await SecureGlobalState.instance.getSecret('roomCode');
            
            if (!actualRoomCode) {
                console.log("No room code found stored in settings yet.");
                return;
            }
            if (socket?.connected) {return;} 
            // Connect using the configurations
            socket = io("http://localhost:3000", {
                transports: ['websocket']
            });
            socket.on("connect", () => {
                console.log(`Connected to server! Joining room: ${actualRoomCode}`);
                socket.emit("room:join", actualRoomCode);
                vscode.window.showInformationMessage(`Live text-stream synced to room ${actualRoomCode}!`);
            });
        } catch (error) {
            console.error("Failed to initialize socket:", error);
        }
    }

	initializeSocketConnection();

	// post -- done
	const postFullDocument = vscode.commands.registerCommand("me-you-code-together.postFullDocument", handleFullDocumentExport);
	const postSelectedCode = vscode.commands.registerCommand("me-you-code-together.postSelectedCode", handleSnippetExport);
	// get
	const getFullDocument = vscode.commands.registerCommand("me-you-code-together.getFullDocument", handleExportFullDocumentSave);
	const testPopulateEditBuilder = vscode.commands.registerCommand("me-you-code-together.testPopulateEditBuilder", testEditBuilder);
	// connect sync -- done
    const connectToRoom = vscode.commands.registerCommand("me-you-code-together.connectToRoom", () => syncToRoom(context));
    const checkSecretKey = vscode.commands.registerCommand("me-you-code-together.checkSecretKey", () => GetSecretKey(context));
	// toggle websocket
	const toggleLiveStream = vscode.commands.registerCommand("me-you-code-together.toggleLiveStream", async() => {
		const isLiveStream = await SecureGlobalState.instance.getSecret('isLiveStream');
		if ( isLiveStream === "true" ) {
			await SecureGlobalState.instance.setSecret('isLiveStream', "false");
			console.log("Started Realtime LiveStream");
			vscode.window.showInformationMessage("Started Realtime LiveStream");
		} else {
			await SecureGlobalState.instance.setSecret('isLiveStream', "true");
			console.log("Stopped Realtime LiveStream");
			vscode.window.showInformationMessage("Stopped Realtime LiveStream");
		}
	});
	// websocket
	const typingListener = vscode.workspace.onDidChangeTextDocument(async (event) => {
		const isLiveStream = await SecureGlobalState.instance.getSecret('isLiveStream');
		if (isLiveStream === "false") {return;}
		const document = event.document;
		if (document.uri.scheme !== 'file') { return; }
		// const filePath = vscode.workspace.asRelativePath(document.uri);
		const fileExtension = VsCodeHelper.getFileExtension(document.fileName);
		const actualRoomCode = await SecureGlobalState.instance.getSecret('roomCode');
		const updatedCodeText = document.getText();
		if (actualRoomCode) {
			socket.emit("code:stream",  {
				roomCode: actualRoomCode,
				code: updatedCodeText, 
				fileExtension: fileExtension 
			});
		}
    });
	// context
	context.subscriptions.push(postFullDocument, getFullDocument, testPopulateEditBuilder, connectToRoom, checkSecretKey, postSelectedCode, typingListener, toggleLiveStream);
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