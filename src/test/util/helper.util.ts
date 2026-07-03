import * as vscode from 'vscode';
import axios, { AxiosResponse } from "axios";
import * as path from 'path';

export const VsCodeHelper = {
    getActiveEditor() {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.uri.scheme !== 'file') {
            return null;
        }
        return editor;
    },

    getFileExtension(filePath: string): 'html' | 'css' | 'js' {
        return path.extname(filePath).slice(1) as 'html' | 'css' | 'js';
    },

    async isTooLarge(uri: vscode.Uri, maxMegaBytes: number = 10): Promise<boolean> {
        const fileStat = await vscode.workspace.fs.stat(uri);
        const limitInBytes = 1048576 * maxMegaBytes;
        return fileStat.size > limitInBytes;
    }
};

