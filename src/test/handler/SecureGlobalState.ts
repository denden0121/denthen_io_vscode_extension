import { ExtensionContext, SecretStorage } from 'vscode';

export class SecureGlobalState {
    private static _instance: SecureGlobalState;
    private storage: SecretStorage;

    private constructor(context: ExtensionContext) {
        this.storage = context.secrets;
    }

    // Initialize once in your extension's activate() function
    public static init(context: ExtensionContext): void {
        if (!SecureGlobalState._instance) {
            SecureGlobalState._instance = new SecureGlobalState(context);
        }
    }

    public static get instance(): SecureGlobalState {
        if (!SecureGlobalState._instance) {
            throw new Error("SecureGlobalState not initialized. Call init(context) first.");
        }
        return SecureGlobalState._instance;
    }

    // Securely write a global variable
    public async setSecret(key: string, value: string): Promise<void> {
        await this.storage.store(key, value);
    }

    // Securely read a global variable
    public async getSecret(key: string): Promise<string | undefined> {
        return await this.storage.get(key);
    }

    // Remove a global variable
    public async deleteSecret(key: string): Promise<void> {
        await this.storage.delete(key);
    }
}
