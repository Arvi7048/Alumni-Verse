# Run from project root in PowerShell
Get-ChildItem -Path .\frontend -Recurse -Include *.js,*.ts,*.jsx,*.tsx,*.json,*.env | 
  Select-String -Pattern "localhost:5000" | 
  ForEach-Object { "$($_.Path):$($_.LineNumber): $($_.Line.Trim())" }
