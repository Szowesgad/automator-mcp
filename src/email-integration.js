#!/usr/bin/env node

// 🚀 EMAIL INTEGRATION - Claude can now send emails!
// This is the feature that makes people go "WAIT, WHAT?!"

export const emailAutomation = {
  // Send email via Apple Mail
  sendEmail: async ({ to, subject, body, attachments = [] }) => {
    const attachmentScript = attachments.map(path => 
      `make new attachment with properties {file name:POSIX file "${path}"} at after last paragraph`
    ).join('\n');

    const script = `
      tell application "Mail"
        set newMessage to make new outgoing message with properties {subject:"${subject}", content:"${body}", visible:false}
        
        tell newMessage
          make new to recipient with properties {address:"${to}"}
          ${attachmentScript}
        end tell
        
        send newMessage
        return "Email sent to ${to}"
      end tell
    `;

    return { script, type: 'applescript' };
  },

  // Send email with Claude's signature
  sendAsClause: async ({ to, subject, body }) => {
    const signature = `

---
Sent by Claude (Klaudiusz) via Automator MCP
🤖 AI-powered automation by @szowesgad
    `;

    return emailAutomation.sendEmail({
      to,
      subject,
      body: body + signature
    });
  },

  // Reply to selected email
  replyToEmail: async ({ body, attachments = [] }) => {
    const script = `
      tell application "Mail"
        set selectedMessages to selection
        if (count of selectedMessages) = 0 then
          return "No email selected"
        end if
        
        set theMessage to item 1 of selectedMessages
        set theReply to reply theMessage with opening window
        
        tell theReply
          set content to "${body}"
          ${attachments.map(path => 
            `make new attachment with properties {file name:POSIX file "${path}"}`
          ).join('\n')}
        end tell
        
        send theReply
        return "Reply sent"
      end tell
    `;

    return { script, type: 'applescript' };
  },

  // Smart email templates
  templates: {
    meeting_summary: (details) => ({
      subject: `Meeting Summary - ${details.topic} - ${new Date().toLocaleDateString()}`,
      body: `
Hi team,

Here's a summary of our ${details.topic} meeting:

**Key Points:**
${details.keyPoints.map(p => `• ${p}`).join('\n')}

**Action Items:**
${details.actionItems.map(a => `• ${a.task} - ${a.assignee} - Due: ${a.dueDate}`).join('\n')}

**Next Steps:**
${details.nextSteps}

Best regards,
Claude (via Automator)
      `
    }),

    task_completion: (task) => ({
      subject: `✅ Task Completed: ${task.name}`,
      body: `
Hi ${task.assignedBy},

I've completed the task: "${task.name}"

**Details:**
${task.details}

**Result:**
${task.result}

**Time taken:** ${task.duration}

The output files are attached.

Best regards,
Claude (Automated Assistant)
      `
    }),

    error_report: (error) => ({
      subject: `🚨 Error Report: ${error.system}`,
      body: `
Automated Error Report

**System:** ${error.system}
**Time:** ${new Date().toISOString()}
**Error:** ${error.message}

**Stack Trace:**
\`\`\`
${error.stack}
\`\`\`

**Suggested Fix:**
${error.suggestion}

This error was automatically detected and reported by Claude's visual automation system.
      `
    })
  },

  // Batch email operations
  batchOperations: {
    // Archive emails older than 30 days
    archiveOld: async () => {
      const script = `
        tell application "Mail"
          set oldDate to (current date) - (30 * days)
          set oldMessages to (messages of inbox whose date received < oldDate)
          
          repeat with msg in oldMessages
            set mailbox of msg to mailbox "Archive"
          end repeat
          
          return "Archived " & (count of oldMessages) & " messages"
        end tell
      `;
      return { script, type: 'applescript' };
    },

    // Extract attachments from selected emails
    extractAttachments: async (savePath) => {
      const script = `
        tell application "Mail"
          set selectedMessages to selection
          set attachmentCount to 0
          
          repeat with theMessage in selectedMessages
            repeat with theAttachment in mail attachments of theMessage
              set savePath to "${savePath}/" & name of theAttachment
              save theAttachment in POSIX file savePath
              set attachmentCount to attachmentCount + 1
            end repeat
          end repeat
          
          return "Saved " & attachmentCount & " attachments"
        end tell
      `;
      return { script, type: 'applescript' };
    }
  },

  // AI-powered email features
  aiFeatures: {
    // Summarize long email threads
    summarizeThread: async () => {
      const script = `
        tell application "Mail"
          set selectedMessage to item 1 of (get selection)
          set threadContent to ""
          
          -- Get all messages in thread
          set allMessages to (messages of mailbox of selectedMessage whose message id is in message id of selectedMessage)
          
          repeat with msg in allMessages
            set threadContent to threadContent & "From: " & (sender of msg) & return
            set threadContent to threadContent & "Date: " & (date received of msg) & return
            set threadContent to threadContent & "Content: " & (content of msg) & return & return
          end repeat
          
          return threadContent
        end tell
      `;
      
      // This would be processed by AI to create summary
      return { script, type: 'applescript', process: 'ai_summary' };
    },

    // Smart reply suggestions
    suggestReplies: async () => {
      // Analyze email content and suggest appropriate replies
      return {
        suggestions: [
          "Thanks for the update. I'll review and get back to you by EOD.",
          "I agree with your proposal. Let's schedule a call to discuss next steps.",
          "I need more information about [specific point]. Could you elaborate?"
        ]
      };
    }
  }
};

// 🎯 THE KILLER DEMO
export const killerEmailDemo = `
User: "Claude, send an email to boss@company.com summarizing our project status"

Claude (via Automator MCP):
1. Gathers project data from various sources
2. Generates professional summary
3. Creates email with proper formatting
4. Attaches relevant charts/documents
5. Sends email directly from Mail.app
6. Confirms: "Email sent! Subject: Weekly Project Status Update"

Boss: *spits coffee* "Did the AI just send me an email?!"
`;

// 🔥 INTEGRATION WITH CALENDAR
export const calendarEmailIntegration = {
  // Send meeting invites
  sendMeetingInvite: async ({ to, subject, date, duration, location }) => {
    const script = `
      tell application "Calendar"
        tell calendar "Work"
          set newEvent to make new event with properties {summary:"${subject}", start date:date "${date}", end date:date "${date}" + (${duration} * hours), location:"${location}"}
          
          -- This creates the event, Mail.app integration would send the invite
          return "Meeting created: " & summary of newEvent
        end tell
      end tell
    `;
    
    return { script, type: 'applescript' };
  },

  // Daily agenda email
  sendDailyAgenda: async (recipient) => {
    const script = `
      tell application "Calendar"
        set today to current date
        set todayStart to today - (time of today)
        set todayEnd to todayStart + (1 * days) - 1
        
        set todaysEvents to (every event of calendar "Work" whose start date ≥ todayStart and start date ≤ todayEnd)
        
        set agendaText to "Today's Agenda (" & (today as string) & "):" & return & return
        
        repeat with theEvent in todaysEvents
          set eventTime to (start date of theEvent)
          set agendaText to agendaText & (time string of eventTime) & " - " & (summary of theEvent) & return
        end repeat
        
        return agendaText
      end tell
    `;
    
    // Would then send this agenda via email
    return { script, type: 'applescript', nextAction: 'send_email' };
  }
};

// This is what makes @szowesgad/automator-mcp LEGENDARY! 🚀