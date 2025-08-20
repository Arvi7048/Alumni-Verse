# Start backend server
Start-Process powershell -ArgumentList "npm run server" -NoNewWindow

# Wait a few seconds for backend to start
Start-Sleep -Seconds 5

# Start ngrok and forward port 5000
ngrok http 5000 --host-header="localhost:5000" --inspect=false
