# 🎯 Automator MCP Examples

## Quick Image Processing

### Compress Screenshots
```
"Compress all screenshots from today on my Desktop"
```

### Batch Resize
```
"Resize all JPGs in Downloads folder to 800x600"
```

### Convert to PDF
```
"Convert all PNG files in Documents to a single PDF"
```

## System Automation

### Dark Mode Schedule
```
"Toggle dark mode"
"Show me system info"
```

### Desktop Management
```
"Hide all apps and show desktop"
"Take a screenshot"
```

## Advanced Workflows

### Email Attachments
```applescript
tell application "Mail"
  set theMessage to make new outgoing message with properties {subject:"Automated Report", content:"Here's your daily report"}
  tell theMessage
    make new to recipient with properties {address:"boss@company.com"}
    make new attachment with properties {file name:"/Users/me/report.pdf"}
  end tell
  send theMessage
end tell
```

### Folder Watcher
```javascript
// JXA example - watch folder for changes
const app = Application.currentApplication();
app.includeStandardAdditions = true;

const folderPath = '/Users/me/WatchedFolder';
const files = app.doShellScript(`ls -la ${folderPath}`);
console.log('Files in folder:', files);
```

## Pro Tips

1. **Chain Actions**: Combine multiple quick_actions for complex workflows
2. **Error Handling**: Always wrap scripts in try-catch for production use
3. **Performance**: Use JXA for better performance with large datasets
4. **Security**: Be careful with scripts that access sensitive data

## Real-World Use Cases

### Photography Workflow
1. Import photos from camera
2. Resize to web-friendly dimensions
3. Add watermark
4. Upload to cloud storage

### Document Processing
1. Extract text from scanned PDFs
2. Convert to markdown
3. Create summary with AI
4. Email results

### Development Automation
1. Run tests when files change
2. Compress build artifacts
3. Deploy to staging
4. Send notification

## Integration Ideas

- **With Calendar**: Auto-create events from emails
- **With Finder**: Smart file organization
- **With Safari**: Web scraping and automation
- **With Terminal**: Advanced scripting workflows