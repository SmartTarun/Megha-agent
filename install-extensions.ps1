# Megha Agent - VS Code Extensions Setup Script
# This script installs GitHub Copilot Pro extensions and dependencies
# Run: .\install-extensions.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Megha Agent - Extension Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if VS Code is installed
Write-Host "Checking for VS Code installation..." -ForegroundColor Yellow

try {
    $codeVersion = & code --version 2>$null
    if ($codeVersion) {
        Write-Host "✓ VS Code found: $codeVersion" -ForegroundColor Green
    }
}
catch {
    Write-Host "✗ VS Code not found or not in PATH" -ForegroundColor Red
    Write-Host "Please install VS Code from https://code.visualstudio.com/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Installing extensions..." -ForegroundColor Yellow
Write-Host ""

# Define extensions to install
$extensions = @(
    "GitHub.copilot",
    "GitHub.copilot-chat",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "microsoft.vscode-typescript-tslint-plugin",
    "streetsidesoftware.code-spell-checker"
)

$failed = @()
$installed = @()

foreach ($extension in $extensions) {
    Write-Host "Installing $extension..." -ForegroundColor Cyan

    try {
        & code --install-extension $extension 2>&1 | Out-Null
        if ($?) {
            Write-Host "  ✓ $extension installed successfully" -ForegroundColor Green
            $installed += $extension
        } else {
            Write-Host "  ✗ Failed to install $extension" -ForegroundColor Red
            $failed += $extension
        }
    }
    catch {
        Write-Host "  ✗ Error installing $extension: $_" -ForegroundColor Red
        $failed += $extension
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Installation Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Successfully Installed ($($installed.Count)):" -ForegroundColor Green
foreach ($ext in $installed) {
    Write-Host "  ✓ $ext" -ForegroundColor Green
}

if ($failed.Count -gt 0) {
    Write-Host ""
    Write-Host "Failed to Install ($($failed.Count)):" -ForegroundColor Red
    foreach ($ext in $failed) {
        Write-Host "  ✗ $ext" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Try installing manually from VS Code marketplace" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Subscribe to GitHub Copilot Pro:" -ForegroundColor Yellow
Write-Host "   https://github.com/copilot/pro" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Open VS Code and authenticate:" -ForegroundColor Yellow
Write-Host "   - VS Code will prompt for GitHub login" -ForegroundColor Cyan
Write-Host "   - Or press Ctrl+Shift+P → GitHub: Authorize" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Start using Copilot:" -ForegroundColor Yellow
Write-Host "   - Open Copilot Chat: Ctrl+Alt+I" -ForegroundColor Cyan
Write-Host "   - Inline suggestions: Start typing (use Tab to accept)" -ForegroundColor Cyan
Write-Host "   - Code completion: Ctrl+I" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Use custom instructions:" -ForegroundColor Yellow
Write-Host "   - Located at: .vscode/copilot-instructions.md" -ForegroundColor Cyan
Write-Host "   - Copilot will follow these when helping with code" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Get started:" -ForegroundColor Yellow
Write-Host "   - Open Megha Agent project in VS Code" -ForegroundColor Cyan
Write-Host "   - Press Ctrl+Alt+I to open Copilot Chat" -ForegroundColor Cyan
Write-Host "   - Ask: 'Explain the Megha Agent architecture'" -ForegroundColor Cyan
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Happy coding! 🚀" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
