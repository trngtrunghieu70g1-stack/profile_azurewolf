# AzureWolf paw cursor — GitHub patch

Applies to https://github.com/trngtrunghieu70g1-stack/profile_azurewolf

The repository currently has a paw **trail**, not the paw **cursor**. This patch adds
`assets/azurewolf-paw-cursor.png` (48x48, four paw toes), enables the real browser
cursor when the existing cursor toggle is enabled on desktop pointer devices,
keeps the existing paw trail, and changes skin-studio cache versions from 15 to 16.

## Windows PowerShell

1. Extract this ZIP outside the website folder, for example to Downloads.
2. Open PowerShell and run:

```powershell
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Downloads\AzureWolf-Paw-Cursor-GitHub-Patch\install_paw_cursor.ps1" -Repo "$env:USERPROFILE\Documents\profile_azurewolf-git"
```

3. Then open the repository folder and push:

```powershell
cd "$env:USERPROFILE\Documents\profile_azurewolf-git"
git status
git add skin-studio.js skin-studio.css index.html assets/azurewolf-paw-cursor.png
git commit -m "Use AzureWolf furry paw as mouse cursor"
git push origin main
```

4. Open https://azurewolf.io.vn/ and press Ctrl+F5. Use the bottom-left paw
effects toggle if needed. The site cursor should now be a paw, in addition to
existing moving paw prints. Some browsers or devices ignore custom cursors.

Backups of modified source files are written to the Windows TEMP directory.
The script is safe to rerun. It DOES NOT itself push to GitHub.
