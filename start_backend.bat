@echo off
echo Starting backend server...

cd /d D:\Page-User

call myenv\Scripts\activate

set PYTHONPATH=.

echo Environment activated. Launching server...
start http://127.0.0.1:8000
uvicorn Backend.app.main:app --reload --port 8000

echo Server stopped.
pause
