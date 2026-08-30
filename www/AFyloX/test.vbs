Set objShell = CreateObject(Shell.Application)
Set objFolder = objShell.BrowseForFolder(0, Seleccione una carpeta:, 0, 0)
If Not objFolder Is Nothing Then Wscript.Echo objFolder.Self.Path
