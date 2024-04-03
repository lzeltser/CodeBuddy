import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';

export class CustomSidebarViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "vscodeSidebar.openview";

    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext<unknown>,
        _token: vscode.CancellationToken
    ): void | Thenable<void> {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        this.getHtmlContent(webviewView.webview);
    }

    private async getHtmlContent(webview: vscode.Webview): Promise<void> {
        try {
            // Get the local path to main script run in the webview,
            // then convert it to a uri we can use in the webview.
            const scriptUri = webview.asWebviewUri(
                vscode.Uri.file(path.join(this._extensionUri.fsPath, "assets", "main.js"))
            );

            const styleResetUri = webview.asWebviewUri(
                vscode.Uri.file(path.join(this._extensionUri.fsPath, "assets", "reset.css"))
            );
            const styleVSCodeUri = webview.asWebviewUri(
                vscode.Uri.file(path.join(this._extensionUri.fsPath, "assets", "vscode.css"))
            );

            // Same for stylesheet
            const stylesheetUri = webview.asWebviewUri(
                vscode.Uri.file(path.join(this._extensionUri.fsPath, "assets", "main.css"))
            );

            // inserted new images
            const background = webview.asWebviewUri(
                vscode.Uri.file(path.join(this._extensionUri.fsPath, "assets", "background.png"))
            );
            const dog_front = webview.asWebviewUri(
                vscode.Uri.file(path.join(this._extensionUri.fsPath, "assets", "dog_front.png"))
            );

            // Use a nonce to only allow a specific script to be run.
            const nonce = getNonce();

            // Get the tips from the tip file
            const tips = this.parseTipFile();
            console.log('Loaded tips:', tips);

            // Generate HTML content with sprite and tips container
            let htmlContent = `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <link href="${styleResetUri}" rel="stylesheet">
                    <link href="${styleVSCodeUri}" rel="stylesheet">
                    <link href="${stylesheetUri}" rel="stylesheet">
                    <style>
                        .bg {
                            position: relative;
                        }
                        .sprite-container {
                            position: relative;
                        }
                        .sprite {
                            position: relative;
                            left: 40%; 
                            bottom: 100px;
                           /* z-index: 1;  Ensure the sprite is above the tips */
                        }
                        .tip-container {
                            position: absolute;
                            left: 10px; /* Adjust as needed */
                            top: 10px; /* Adjust as needed */
                            z-index: 2;
                        }
                        .tip {
                            font-size: 14px;
                            color: white;
                            background-color: rgba(0, 0, 0, 0.5);
                            padding: 8px;
                            border-radius: 4px;
                            margin-bottom: 8px;
                        }
                    </style>
                </head>
                <body>
                    <div>
                        <img src="${background}" alt="bg here" class="bg">
                        <img src="${dog_front}" alt="dog sprite" class="sprite" width="40" height="80">
                        <div class="tip-container"> 
                            ${tips.map(tip => `<div class="tip">${tip}</div>`).join('')}
                        </div>
                    </div>
                    <script nonce="${nonce}" src="${scriptUri}"></script>
                </body>
                </html>`;

                console.log('Generated HTML content:', htmlContent);

                if (this._view) {
                    this._view.webview.html = htmlContent;
                } else {
                    console.error("Failed to update webview: _view is null or undefined.");
                }

                if (tips.length > 0) {
                    vscode.window.showInformationMessage(`Loaded ${tips.length} tips.`);
                    await this.displayTipsWithDelay(webview, tips, nonce);
                } else {
                    vscode.window.showInformationMessage('No tips found.');
                }
        } catch (error) {
            console.error('Error generating HTML content:', error);
        }
    }

    private async displayTipsWithDelay(webview: vscode.Webview, tips: string[], nonce: string): Promise<void> {
        for (let i = 0; i < tips.length; i++) {
            // Show the current tip
            await this.showTip(webview, tips[i], nonce);
    
            // Wait for a delay
            await new Promise(resolve => setTimeout(resolve, 5000)); // Adjust delay time (in milliseconds) as needed
    
            // Hide the current tip
            await this.hideTip(webview);
        }
    }

    private async showTip(webview: vscode.Webview, tip: string, nonce: string): Promise<void> {
        const jsCode = `
            (function() {
                const tipContainer = document.querySelector('.tip-container');
                const tipElement = document.createElement('div');
                tipElement.classList.add('tip');
                tipElement.innerText = "${tip}";
                tipContainer.appendChild(tipElement);
            })();
        `;

        await webview.postMessage({
            command: 'executeScript',
            script: jsCode,
            nonce: nonce
        });
    }

    private async hideTip(webview: vscode.Webview): Promise<void> {
        const jsCode = `
            (function() {
                const tipContainer = document.querySelector('.tip-container');
                const tipElement = tipContainer.querySelector('.tip');
                if (tipElement) {
                    tipElement.remove();
                }
            })();
        `;

        await webview.postMessage({
            command: 'executeScript',
            script: jsCode
        });
    }

    private parseTipFile(): string[] {
        try {
            // Get the path to the tip file
            const tipFilePath = path.join(this._extensionUri.fsPath, 'assets', 'tips.txt'); // Adjust the filename and extension as needed

            // Read the contents of the tip file
            const tipsContent = fs.readFileSync(tipFilePath, 'utf-8');

            // Split the content into individual tips (assuming each tip is on a separate line)
            const tips = tipsContent.split('\n').map(tip => tip.trim()).filter(tip => tip !== '');

            return tips;
        } catch (error) {
            console.error('Error reading tip file:', error);
            return [];
        }
    }
}

function getNonce() {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
