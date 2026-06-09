# Launch (or relaunch) headless Chrome with a CDP debug port for the web-preview harness.
# Usage: powershell -File scripts/vo-chrome.ps1
Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" |
  Where-Object { $_.CommandLine -like '*remote-debugging-port=9222*' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
Start-Sleep -Milliseconds 400

$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chrome)) { throw "Chrome not found at $chrome" }
$prof = "$env:TEMP\vo_chrome_cdp"

Start-Process -FilePath $chrome -WindowStyle Hidden -ArgumentList @(
  "--headless", "--disable-gpu", "--no-sandbox", "--no-first-run", "--hide-scrollbars",
  "--remote-debugging-port=9222", "--user-data-dir=$prof", "--window-size=412,915", "about:blank"
)
Start-Sleep -Seconds 2
try { "CDP UP: " + (Invoke-RestMethod "http://localhost:9222/json/version" -TimeoutSec 5).Browser }
catch { "CDP NOT REACHABLE: $_" }
