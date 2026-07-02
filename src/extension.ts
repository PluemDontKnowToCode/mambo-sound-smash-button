import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const provider = new SmashButtonViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SmashButtonViewProvider.viewType,
      provider
    )
  );

  console.log('Extension activated!');
}

export function deactivate() { }

class SmashButtonViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'mamboSoundSmashButton.view';

  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.extensionUri, 'media'),
        vscode.Uri.joinPath(this.extensionUri, 'resources')
      ]
    };

    webviewView.webview.html = this.getHtml(webviewView.webview);

    // Listen for messages coming back from the webview (e.g. button clicks)
    webviewView.webview.onDidReceiveMessage((message) => {
      if (message.command === 'smash') {
        // Show a little status bar feedback whenever the button is smashed
        vscode.window.setStatusBarMessage('$(flame) Smashed!', 1500);
      }
    });
  }

  private getHtml(webview: vscode.Webview): string {
    const imageUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'resources', 'image-button.jpg')
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'main.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'style.css')
    );
    const soundUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'resources', 'sound.mp3')
    ).with({ query: `v=${Date.now()}` });
    const nonce = getNonce();

    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none';
             img-src ${webview.cspSource} https: data:;
             media-src ${webview.cspSource};
             style-src ${webview.cspSource} 'unsafe-inline';
             script-src 'nonce-${nonce}';" />
  <link rel="stylesheet" href="${styleUri}" />
  <title>Smash Button</title>
</head>
<body data-sound-src="${soundUri}">
  <div class="wrapper">
    <img id="smash-image" class="smash-image" src="${imageUri}" alt="Smash button" />
  </div>

  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce() {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}