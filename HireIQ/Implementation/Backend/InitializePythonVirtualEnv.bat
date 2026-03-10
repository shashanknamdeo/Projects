@echo off
if exist PythonVirtualEnvironment\Scripts\activate.bat (
    call PythonVirtualEnvironment\Scripts\activate.bat
    echo   [OK] HireIQ Python virtual environment activated.
) else (
    echo   [ERROR] No PythonVirtualEnvironment found in current directory.
)
