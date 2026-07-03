import * as vscode from 'vscode';
import { SecureGlobalState } from "../handler/SecureGlobalState";
import  io  from "socket.io-client";

export let socket: any = null;

async function getAllTextForFile(fileName: 'index.html' | 'styles.css' | 'script.js'): Promise<string> {
    try {
        // 1. Search the workspace for a file matching the name (e.g., "**/index.html")
        const files = await vscode.workspace.findFiles(`**/${fileName}`, '**/node_modules/**', 1);
        
        if (files.length === 0) {
            console.warn(`[Sync] File ${fileName} not found in current workspace workspace workspace.`);
            return "";
        }

        // 2. Read the raw binary data buffer of the file using VS Code's FileSystem API
        const fileUri = files[0];
        const fileBuffer = await vscode.workspace.fs.readFile(fileUri);

        // 3. Decode the binary buffer array cleanly into a standard UTF-8 string literal
        const textContent = new TextDecoder('utf-8').decode(fileBuffer);
        
        return textContent;
    } catch (error) {
        console.error(`[Sync] Failed to read text payload for ${fileName}:`, error);
        return "";
    }
}


export async function initializeSocketConnection() {
	try {
		await SecureGlobalState.instance.setSecret('isLiveStream', "false");
		await SecureGlobalState.instance.setSecret('connectedOnce', "false");
		const actualRoomCode = await SecureGlobalState.instance.getSecret('roomCode');
		const MY_ACCESS_TOKEN = await SecureGlobalState.instance.getSecret('accessToken');
		
		if (!actualRoomCode || !MY_ACCESS_TOKEN) {
			console.log("No room data found stored in settings yet.");
			return;
		}
		if (socket?.connected) {return;} 
		// Connect using the configurations
		socket = io("http://localhost:3000", {
			transports: ['websocket'],
			auth: {
				MY_ACCESS_TOKEN: MY_ACCESS_TOKEN
			}
		});
		socket.on("connect", () => {
			console.log(`Connected to server! Joining room: ${actualRoomCode}`);
			socket.emit("room:join", { roomCode: actualRoomCode, clientType: "extension" });
			socket.emit('vscode:connected_sync', actualRoomCode);
			vscode.window.showInformationMessage(`Successfuly joined room ${actualRoomCode}!`);
		});
		socket.on("ide:request-full-sync", async () => {
    		console.log("⚡ Server requested full workspace sync. Scraping local files...");
			const [htmlText, cssText, jsText] = await Promise.all([
				getAllTextForFile("index.html"),
				getAllTextForFile("styles.css"),
				getAllTextForFile("script.js")
			]);

			socket.emit("ide:full-sync", {
				roomCode: actualRoomCode, 
				html: htmlText,
				css: cssText,
				js: jsText
			});
		});
	} catch (error) {
		console.error("Failed to initialize socket:", error);
	}
}
