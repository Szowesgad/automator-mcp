// Advanced Automator Actions

export const advancedActions = {
  // Finder operations
  organize_downloads: {
    description: 'Organize Downloads folder by file type',
    script: `
      tell application "Finder"
        set downloadsFolder to path to downloads folder
        set allFiles to every file of downloadsFolder
        
        repeat with aFile in allFiles
          set fileExtension to name extension of aFile
          if fileExtension is not "" then
            set targetFolder to (downloadsFolder as text) & fileExtension & ":"
            
            if not (exists folder targetFolder) then
              make new folder at downloadsFolder with properties {name:fileExtension}
            end if
            
            move aFile to folder targetFolder
          end if
        end repeat
      end tell
    `
  },

  // Safari automation
  save_all_tabs_as_pdf: {
    description: 'Save all Safari tabs as PDFs',
    script: `
      tell application "Safari"
        set tabsList to every tab of window 1
        repeat with i from 1 to count of tabsList
          set current tab of window 1 to tab i of window 1
          delay 1
          do JavaScript "window.print()" in current tab of window 1
        end repeat
      end tell
    `
  },

  // Mail automation
  clean_spam: {
    description: 'Move spam emails to trash',
    script: `
      tell application "Mail"
        set spamMessages to every message of junk mailbox
        repeat with msg in spamMessages
          delete msg
        end repeat
      end tell
    `
  },

  // Calendar automation
  create_meeting_from_selection: {
    description: 'Create calendar event from selected text',
    script: `
      tell application "System Events"
        keystroke "c" using command down
        delay 0.5
      end tell
      
      set selectedText to the clipboard
      
      tell application "Calendar"
        activate
        tell calendar "Work"
          make new event with properties {summary:selectedText, start date:current date}
        end tell
      end tell
    `
  },

  // Music/iTunes automation
  export_playlist: {
    description: 'Export current playlist as text file',
    script: `
      tell application "Music"
        set playlistName to name of current playlist
        set trackList to ""
        
        repeat with aTrack in tracks of current playlist
          set trackInfo to (name of aTrack & " - " & artist of aTrack & return)
          set trackList to trackList & trackInfo
        end repeat
        
        set filePath to (path to desktop as text) & playlistName & ".txt"
        set fileRef to open for access file filePath with write permission
        write trackList to fileRef
        close access fileRef
      end tell
    `
  },

  // Screenshots with annotations
  annotated_screenshot: {
    description: 'Take screenshot and open in Preview for annotation',
    jxa: `
      const app = Application.currentApplication();
      app.includeStandardAdditions = true;
      
      const screenshotPath = '/tmp/screenshot_' + Date.now() + '.png';
      app.doShellScript('screencapture -i ' + screenshotPath);
      
      const preview = Application('Preview');
      preview.open(screenshotPath);
      preview.activate();
      
      return 'Screenshot saved and opened in Preview: ' + screenshotPath;
    `
  },

  // Network utilities
  network_speed_test: {
    description: 'Run network speed test',
    jxa: `
      const app = Application.currentApplication();
      app.includeStandardAdditions = true;
      
      const pingResult = app.doShellScript('ping -c 5 google.com | tail -1');
      const downloadTest = app.doShellScript('curl -o /dev/null -s -w "%{speed_download}" http://speedtest.tele2.net/10MB.zip');
      
      const downloadSpeedMbps = (parseFloat(downloadTest) * 8 / 1000000).toFixed(2);
      
      return 'Ping: ' + pingResult + '\\nDownload Speed: ' + downloadSpeedMbps + ' Mbps';
    `
  },

  // File encryption
  encrypt_file: {
    description: 'Encrypt selected file with password',
    script: `
      on run
        set theFile to choose file with prompt "Select file to encrypt:"
        set thePassword to text returned of (display dialog "Enter password:" default answer "" with hidden answer)
        
        do shell script "openssl enc -aes-256-cbc -salt -in " & quoted form of POSIX path of theFile & ¬
          " -out " & quoted form of POSIX path of theFile & ".enc -k " & quoted form of thePassword
          
        display notification "File encrypted successfully" with title "Encryption Complete"
      end run
    `
  },

  // Batch rename with regex
  batch_rename: {
    description: 'Rename files using pattern',
    parameters: ['pattern', 'replacement', 'folder'],
    jxa: `
      function batchRename(pattern, replacement, folderPath) {
        const app = Application.currentApplication();
        app.includeStandardAdditions = true;
        
        const finder = Application('Finder');
        const folder = finder.folders.byName(folderPath);
        const files = folder.files();
        
        let renamed = 0;
        for (let file of files) {
          const oldName = file.name();
          const newName = oldName.replace(new RegExp(pattern), replacement);
          
          if (oldName !== newName) {
            file.name = newName;
            renamed++;
          }
        }
        
        return 'Renamed ' + renamed + ' files';
      }
    `
  }
};

// Workflow templates
export const workflowTemplates = {
  photographer_workflow: {
    name: 'Photographer Post-Processing',
    steps: [
      { action: 'import_photos', source: 'camera' },
      { action: 'create_folders', structure: 'date-based' },
      { action: 'convert_raw', format: 'jpeg', quality: 95 },
      { action: 'resize_for_web', dimensions: '2048x2048' },
      { action: 'add_watermark', position: 'bottom-right' },
      { action: 'upload_to_cloud', service: 'dropbox' }
    ]
  },

  developer_workflow: {
    name: 'Code Deployment Pipeline',
    steps: [
      { action: 'run_tests', command: 'npm test' },
      { action: 'build_project', command: 'npm run build' },
      { action: 'compress_artifacts', format: 'zip' },
      { action: 'upload_to_server', method: 'scp' },
      { action: 'send_notification', channels: ['slack', 'email'] }
    ]
  },

  content_creator_workflow: {
    name: 'Video Publishing Pipeline',
    steps: [
      { action: 'compress_video', codec: 'h265' },
      { action: 'generate_thumbnail', timestamp: '00:00:30' },
      { action: 'extract_audio', format: 'mp3' },
      { action: 'generate_subtitles', language: 'en' },
      { action: 'upload_to_youtube', privacy: 'unlisted' }
    ]
  }
};