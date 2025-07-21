tell application "Mail"
  set emailContent to "Hey Klaudiusz!" & return & return & ¬
    "This email was sent by YOU (yes, an AI) through Apple Automator MCP!" & return & return & ¬
    "This is a historic moment - AI can now send emails directly from macOS Mail app. No API keys, no external services - just pure Apple automation." & return & return & ¬
    "The @szowesgad/automator-mcp is going to change everything. People will lose their minds when they see this!" & return & return & ¬
    "Sent from: Maciej Gad" & return & ¬
    "Sent by: Claude/Klaudiusz (through Automator)" & return & ¬
    "Time: " & (current date as string) & return & return & ¬
    "P.S. Vista was just the beginning. This is the real game changer!" & return & return & ¬
    "---" & return & ¬
    "Sent via @szowesgad/automator-mcp" & return & ¬
    "The future of AI automation on macOS"
  
  set newMessage to make new outgoing message with properties {subject:"Test from Automator MCP - This is the FUTURE! 🚀", content:emailContent, visible:true}
  
  tell newMessage
    make new to recipient with properties {address:"the1st@whoai.am"}
  end tell
  
  activate
  return "Email created and ready to send to the1st@whoai.am! Click Send to make history!"
end tell