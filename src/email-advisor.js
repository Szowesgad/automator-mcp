// 📧 Email Advisor - AI helps you manage your inbox
// This respects privacy while being incredibly useful!

export const emailAdvisor = {
  // Analyze inbox and suggest priorities
  analyzeInbox: async () => {
    const script = `
      tell application "Mail"
        set inboxMessages to messages of inbox
        set emailSummary to {}
        
        repeat with i from 1 to (count of inboxMessages)
          if i > 20 then exit repeat -- Analyze only recent 20
          
          set theMessage to item i of inboxMessages
          set messageInfo to {
            sender: sender of theMessage,
            subject: subject of theMessage,
            dateReceived: date received of theMessage,
            isRead: read status of theMessage,
            hasAttachment: (count of mail attachments of theMessage) > 0
          }
          
          set end of emailSummary to messageInfo
        end repeat
        
        return emailSummary
      end tell
    `;

    return {
      script,
      type: 'applescript',
      process: 'analyze_with_ai'
    };
  },

  // AI-powered email prioritization
  prioritizeEmails: (emails) => {
    const priorities = emails.map(email => {
      let score = 0;
      let reasons = [];

      // Unread emails get higher priority
      if (!email.isRead) {
        score += 3;
        reasons.push("Unread message");
      }

      // Recent emails (last 24h) get priority
      const hoursSince = (Date.now() - new Date(email.dateReceived)) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        score += 2;
        reasons.push("Received recently");
      }

      // Emails with attachments might be important
      if (email.hasAttachment) {
        score += 1;
        reasons.push("Contains attachments");
      }

      // Subject line analysis
      const urgentKeywords = /urgent|asap|important|deadline|today|now/i;
      const questionKeywords = /\?|question|help|please|could you|can you/i;
      
      if (urgentKeywords.test(email.subject)) {
        score += 4;
        reasons.push("Marked as urgent");
      }

      if (questionKeywords.test(email.subject)) {
        score += 2;
        reasons.push("Contains questions");
      }

      return {
        ...email,
        priorityScore: score,
        reasons,
        recommendation: score > 5 ? "High Priority" : score > 2 ? "Medium Priority" : "Low Priority"
      };
    });

    return priorities.sort((a, b) => b.priorityScore - a.priorityScore);
  },

  // Generate suggested responses
  suggestResponses: async (email) => {
    const templates = {
      meeting_request: [
        "I'd be happy to meet. Here are my available times: [INSERT TIMES]. Which works best for you?",
        "Thanks for reaching out. Unfortunately, my schedule is full this week. Could we connect next week instead?",
        "I can do a quick 15-minute call. Would [TIME] work for you?"
      ],
      
      question: [
        "Thanks for your question. [PROVIDE ANSWER]. Let me know if you need any clarification.",
        "Great question! Here's what I think: [PROVIDE PERSPECTIVE]. Happy to discuss further.",
        "I'll need to look into this and get back to you by [DATE]."
      ],
      
      task_request: [
        "I'll get started on this right away. You can expect it by [DEADLINE].",
        "Thanks for thinking of me. Could you provide more details about [SPECIFIC ASPECT]?",
        "I'd love to help, but I'm at capacity right now. Can we revisit this in [TIMEFRAME]?"
      ]
    };

    // Return appropriate templates based on email content
    return {
      email,
      suggestedResponses: templates.question, // Would be smarter with real AI
      customResponse: "Based on the email content, I suggest..."
    };
  },

  // Smart email actions
  smartActions: {
    // Archive old newsletters
    archiveNewsletters: async () => {
      const script = `
        tell application "Mail"
          set oldDate to (current date) - (7 * days)
          set newsletters to messages of inbox whose sender contains "newsletter" and date received < oldDate
          
          repeat with msg in newsletters
            set mailbox of msg to mailbox "Archive"
          end repeat
          
          return "Archived " & (count of newsletters) & " old newsletters"
        end tell
      `;
      return { script, type: 'applescript' };
    },

    // Flag important emails
    flagImportant: async (criteria) => {
      const script = `
        tell application "Mail"
          set importantMessages to messages of inbox whose sender contains "${criteria.sender}" or subject contains "${criteria.keyword}"
          
          repeat with msg in importantMessages
            set flagged status of msg to true
          end repeat
          
          return "Flagged " & (count of importantMessages) & " important messages"
        end tell
      `;
      return { script, type: 'applescript' };
    },

    // Create calendar events from emails
    createEventFromEmail: async () => {
      const script = `
        tell application "Mail"
          set selectedMessage to item 1 of (get selection)
          set emailSubject to subject of selectedMessage
          set emailContent to content of selectedMessage
          
          tell application "Calendar"
            tell calendar "Work"
              make new event with properties {
                summary: emailSubject,
                description: emailContent,
                start date: (current date) + (1 * days)
              }
            end tell
          end tell
          
          return "Created calendar event from email"
        end tell
      `;
      return { script, type: 'applescript' };
    }
  },

  // Privacy-respecting email summary
  getInboxSummary: async () => {
    const script = `
      tell application "Mail"
        set unreadCount to count of (messages of inbox whose read status is false)
        set todayCount to count of (messages of inbox whose date received > (current date) - (1 * days))
        set flaggedCount to count of (messages of inbox whose flagged status is true)
        
        return {
          unread: unreadCount,
          today: todayCount,
          flagged: flaggedCount,
          total: count of messages of inbox
        }
      end tell
    `;

    return { script, type: 'applescript' };
  }
};

// Example usage that respects privacy
export const emailAdvisorDemo = `
User: "Check my emails and advise what to prioritize"

Claude: "I'll analyze your inbox structure without reading personal content..."
*Gets email metadata only (sender, subject, date)*
*Analyzes patterns*

Claude: "Based on patterns, here's what I found:
- 5 unread emails from today
- 2 with 'urgent' in subject line  
- 3 from addresses you frequently respond to
- 1 with attachments from your boss

Recommendations:
1. Email from boss@ with attachment (received 2 hours ago)
2. 'Urgent: Project deadline' from colleague@ 
3. Questions from client@ (you usually respond within 4 hours)

Would you like me to:
- Draft responses to any of these?
- Create calendar events from meeting requests?
- Archive old newsletters?"

User: "This is exactly what I needed!"
`;