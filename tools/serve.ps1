# Local test server for Undercut. Serves the repo folder at http://localhost:8000/
# Run from anywhere:  powershell -ExecutionPolicy Bypass -File tools\serve.ps1
# Stop it with Ctrl+C.

param([int]$Port = 8000)

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$types = @{
  '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'; '.json' = 'application/json'; '.md' = 'text/plain; charset=utf-8'
  '.svg' = 'image/svg+xml'; '.png' = 'image/png'; '.ico' = 'image/x-icon'
  '.woff2' = 'font/woff2'; '.woff' = 'font/woff'; '.ttf' = 'font/ttf'; '.mp3' = 'audio/mpeg'; '.webmanifest' = 'application/manifest+json'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Undercut is running at http://localhost:$Port/  (Ctrl+C to stop)"

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $response = $context.Response
    try {
      $path = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath)
      if ($path.EndsWith('/')) { $path += 'index.html' }
      $file = [IO.Path]::GetFullPath((Join-Path $root $path.TrimStart('/')))
      # No caching, so a normal refresh picks up changes while testing.
      $response.Headers.Add('Cache-Control', 'no-store')
      if ($file.StartsWith($root) -and (Test-Path $file -PathType Leaf)) {
        $ext = [IO.Path]::GetExtension($file).ToLower()
        $response.ContentType = if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' }
        [byte[]]$bytes = [IO.File]::ReadAllBytes($file)
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $response.StatusCode = 404
      }
    } catch {
      Write-Host "Error serving $($context.Request.Url): $_"
    } finally {
      $response.Close()
    }
  }
} finally {
  $listener.Stop()
}
