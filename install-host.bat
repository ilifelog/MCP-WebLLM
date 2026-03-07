@echo off
REM install-host.bat — Register Native Messaging Host for MCP Multi Bridge
REM Run this script once to enable stdio transport in Chrome/Edge.

setlocal

set HOST_NAME=com.mcp.bridge
set MANIFEST_PATH=%~dp0com.mcp.bridge.json

REM Detect extension ID from command line or use placeholder
set EXT_ID=%1
if "%EXT_ID%"=="" (
    echo.
    echo ============================================================
    echo   MCP Multi Bridge - Native Messaging Host Installer
    echo ============================================================
    echo.
    echo Usage: install-host.bat [EXTENSION_ID]
    echo.
    echo To find your extension ID:
    echo   1. Open chrome://extensions  or  edge://extensions
    echo   2. Enable "Developer mode"
    echo   3. Find "MCP Multi Bridge" and copy its ID
    echo.
    echo Example:
    echo   install-host.bat abcdefghijklmnopqrstuvwxyz123456
    echo.
    echo ============================================================
    pause
    exit /b 1
)

REM Generate the native messaging host manifest JSON
set NATIVE_HOST_PATH=%~dp0native-host.js
REM Replace backslashes with forward slashes for JSON
set NATIVE_HOST_PATH=%NATIVE_HOST_PATH:\=/%

echo {> "%~dp0com.mcp.bridge.json"
echo   "name": "com.mcp.bridge",>> "%~dp0com.mcp.bridge.json"
echo   "description": "MCP Multi Bridge Native Messaging Host",>> "%~dp0com.mcp.bridge.json"
echo   "path": "node",>> "%~dp0com.mcp.bridge.json"
echo   "type": "stdio",>> "%~dp0com.mcp.bridge.json"
echo   "allowed_origins": [>> "%~dp0com.mcp.bridge.json"
echo     "chrome-extension://%EXT_ID%/">> "%~dp0com.mcp.bridge.json"
echo   ]>> "%~dp0com.mcp.bridge.json"
echo }>> "%~dp0com.mcp.bridge.json"

REM Actually, Chrome requires the "path" to be a full path to an executable.
REM We need a wrapper batch file for Windows.

REM Create wrapper batch script
echo @echo off > "%~dp0native-host-wrapper.bat"
echo node "%~dp0native-host.js" >> "%~dp0native-host-wrapper.bat"

REM Regenerate manifest with correct wrapper path
set WRAPPER_PATH=%~dp0native-host-wrapper.bat
set WRAPPER_PATH_ESCAPED=%WRAPPER_PATH:\=\\%

echo {> "%~dp0com.mcp.bridge.json"
echo   "name": "com.mcp.bridge",>> "%~dp0com.mcp.bridge.json"
echo   "description": "MCP Multi Bridge Native Messaging Host",>> "%~dp0com.mcp.bridge.json"
echo   "path": "%WRAPPER_PATH_ESCAPED%",>> "%~dp0com.mcp.bridge.json"
echo   "type": "stdio",>> "%~dp0com.mcp.bridge.json"
echo   "allowed_origins": [>> "%~dp0com.mcp.bridge.json"
echo     "chrome-extension://%EXT_ID%/">> "%~dp0com.mcp.bridge.json"
echo   ]>> "%~dp0com.mcp.bridge.json"
echo }>> "%~dp0com.mcp.bridge.json"

REM Register for Chrome
reg add "HKCU\Software\Google\Chrome\NativeMessagingHosts\%HOST_NAME%" /ve /t REG_SZ /d "%~dp0com.mcp.bridge.json" /f >nul 2>&1

REM Register for Edge
reg add "HKCU\Software\Microsoft\Edge\NativeMessagingHosts\%HOST_NAME%" /ve /t REG_SZ /d "%~dp0com.mcp.bridge.json" /f >nul 2>&1

echo.
echo ============================================================
echo   Installation complete!
echo ============================================================
echo.
echo   Host Name:    %HOST_NAME%
echo   Extension ID: %EXT_ID%
echo   Manifest:     %~dp0com.mcp.bridge.json
echo   Wrapper:      %~dp0native-host-wrapper.bat
echo.
echo   Registered for both Chrome and Edge.
echo   Please restart your browser to activate.
echo.
echo ============================================================
pause
