import * as vscode from "vscode";

export class CustomSidebarViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "vscodeSidebar.openview";

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext<unknown>,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };
    webviewView.webview.html = this.getHtmlContent(webviewView.webview);
  }

  private getHtmlContent(webview: vscode.Webview): string {
    // Get the local path to main script run in the webview,
    // then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "main.js")
    );

    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "vscode.css")
    );

    // Same for stylesheet
    const stylesheetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "main.css")
    );
    const tipsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "tips.txt")
    );
    // inserted new images
    const background = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "background.png")
    );
   
    const dogFrontUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "dog_front.png")
    );
    const dogWalk1Uri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "dog_walk1.png")
    );
    const dogWalk2Uri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "dog_walk2.png")
    );
    const dogWalkUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "dog_walk3.png")
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <link href="${styleResetUri}" rel="stylesheet">
      <link href="${styleVSCodeUri}" rel="stylesheet">
      <link href="${stylesheetUri}" rel="stylesheet">
    </head>
    <style>
    .bg {
      position: relative;
    }
    .sprite1 {
      position: absolute;
      left: 100px; 
      top: 90px;
    }
  </style>
    <body>
      <div class="bg-container">
        <img src="${background}" alt="Background" class="bg">
        <img id="dog" src="${dogFrontUri}" alt="Animated dog" class="sprite1" width="40" height="80">
      </div>
      <div id="tip" class="pixel-text">
        <p>Tip of the minute:</p>
        <p id="tip-content"></p>
      </div>
      <script nonce="${nonce}" src="${scriptUri}"></script>
      <script nonce="${nonce}">
        let currentFrame = 0;
        const dogImage = document.getElementById('dog');
        const dogFrames = ["${dogFrontUri}", "${dogWalk1Uri}", "${dogWalk2Uri}", "${dogWalkUri}"];

        function updateFrame() {
            dogImage.src = dogFrames[currentFrame];
            currentFrame = (currentFrame + 1) % dogFrames.length;
            setTimeout(updateFrame, 500); // Change frame every 500 ms
        }

        updateFrame();

        fetch("${tipsUri}")
            .then(response => response.text())
            .then(text => {
                const tips = text.split("\\n");
                let index = 0;
                const tipElement = document.getElementById('tip-content');
                function displayNextTip() {
                    if(tips[index].trim() !== "") {
                        tipElement.textContent = tips[index];
                    }
                    index = (index + 1) % tips.length;
                    setTimeout(displayNextTip, 60000); // Change tips every minute
                }
                displayNextTip();
            });
      </script>
    </body>
    </html>`;
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
