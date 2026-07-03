import * as vscode from 'vscode';
import { handleFullDocumentExport} from "./test/handler/export/fullDocumentSyncHandler";
import { handleSnippetExport } from './test/handler/export/selectedCodeSyncHandler';
import { handleExportFullDocumentSave, testEditBuilder } from './test/handler/importFullDocumentSyncHandler';
import { syncToRoom, GetSecretKey } from './test/handler/syncToRoom';
import { SecureGlobalState } from './test/handler/SecureGlobalState';
import  io  from "socket.io-client";
import { VsCodeHelper } from './test/util/helper.util';
import { socket } from './test/service/socket.service';

export function activate(context: vscode.ExtensionContext) {
	// welcome user
	console.log('Congratulations, your extension "denthenIO" is now active!');
	// initialize secret storage
    SecureGlobalState.init(context);
	// let socket: any = null;
	// // admin_251a137a_yow
	// async function initializeSocketConnection() {
    //     try {
	// 		const isConnectedOnce = await SecureGlobalState.instance.getSecret('isLiveStream');
	// 		if (isConnectedOnce === "true") {
	// 			await SecureGlobalState.instance.setSecret('isLiveStream', "false");
	// 			await SecureGlobalState.instance.setSecret('connectedOnce', "false");
	// 			const actualRoomCode = await SecureGlobalState.instance.getSecret('roomCode');
	// 			const MY_ACCESS_TOKEN = await SecureGlobalState.instance.getSecret('accessToken');
				
	// 			if (!actualRoomCode || !MY_ACCESS_TOKEN) {
	// 				console.log("No room data found stored in settings yet.");
	// 				return;
	// 			}
	// 			if (socket?.connected) {return;} 
	// 			// Connect using the configurations
	// 			socket = io("http://localhost:3000", {
	// 				transports: ['websocket'],
	// 				auth: {
	// 					MY_ACCESS_TOKEN: MY_ACCESS_TOKEN
	// 				}
	// 			});
	// 			socket.on("connect", () => {
	// 				console.log(`Connected to server! Joining room: ${actualRoomCode}`);
	// 				socket.emit("room:join", actualRoomCode);
	// 				vscode.window.showInformationMessage(`VSCode synced to room ${actualRoomCode}!`);
	// 			});
	// 		}
    //     } catch (error) {
    //         console.error("Failed to initialize socket:", error);
    //     }
    // }

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
			console.log("Stopped Realtime LiveStream");
			vscode.window.showInformationMessage("Stopped Realtime LiveStream");
			return;
		}
		if ( isLiveStream === "false" ) {
			await SecureGlobalState.instance.setSecret('isLiveStream', "true");
			console.log("Started Realtime LiveStream");
			vscode.window.showInformationMessage("Started Realtime LiveStream");
			return;
		}
	});
	// websocket
	const typingListener = vscode.workspace.onDidChangeTextDocument(async (event) => {
		const isLiveStream = await SecureGlobalState.instance.getSecret('isLiveStream');
		if (isLiveStream === "false") {return;}
		const document = event.document;
		if (document.uri.scheme !== 'file') { return; }
		// const filePath = vscode.workspace.asRelativePath(document.uri);

		const fileName = event.document.fileName;
		if (!fileName.endsWith('index.html') && !fileName.endsWith('style.css') && !fileName.endsWith('script.js')) {
			return;
		}
		
		const fileExtension = VsCodeHelper.getFileExtension(document.fileName);
		const actualRoomCode = await SecureGlobalState.instance.getSecret('roomCode');
		const userRole = await SecureGlobalState.instance.getSecret('role');
		const updatedCodeText = document.getText();
		// if (actualRoomCode) {
		// 	socket.emit("code:stream",  {
		// 		roomCode: actualRoomCode,
		// 		code: updatedCodeText, 
		// 		fileExtension: fileExtension 
		// 	});
		// }
		
		event.contentChanges.forEach((change) => {
			const payload = {
				roomCode: actualRoomCode,
				fileType: fileName.endsWith('html') ? 'html' : fileName.endsWith('css') ? 'css' : 'js',
				text: change.text,
				offset: change.rangeOffset,
				length: change.rangeLength
			}; 
			console.log(payload);
			if (userRole === "admin") {
				socket.emit("code:delta", payload);
			}
			if (userRole === "participant") {
				socket.emit("code:participant:delta", payload);
			}
			

			
		});
	});
	// const typingListener = vscode.workspace.onDidChangeTextDocument(async (event) => {
	// 	const isLiveStream = await SecureGlobalState.instance.getSecret('isLiveStream');
	// 	if (isLiveStream === "false") {return;}
	// 	const document = event.document;
	// 	if (document.uri.scheme !== 'file') { return; }
	// 	// const filePath = vscode.workspace.asRelativePath(document.uri);
	// 	const fileExtension = VsCodeHelper.getFileExtension(document.fileName);
	// 	const actualRoomCode = await SecureGlobalState.instance.getSecret('roomCode');
	// 	const updatedCodeText = document.getText();
	// 	if (actualRoomCode) {
	// 		socket.emit("code:stream",  {
	// 			roomCode: actualRoomCode,
	// 			code: updatedCodeText, 
	// 			fileExtension: fileExtension 
	// 		});
	// 	}
    // });


	// context
	context.subscriptions.push(postFullDocument, getFullDocument, testPopulateEditBuilder, connectToRoom, checkSecretKey, postSelectedCode, typingListener, toggleLiveStream);
}

export function deactivate() {}
