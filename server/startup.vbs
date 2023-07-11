Set oShell = CreateObject ("Wscript.Shell") 
Dim strArgs
strArgs = "cmd /c test.bat"
oShell.Run strArgs, 0, false