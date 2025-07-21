#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import { execSync, spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AutomatorServer {
  constructor() {
    this.server = new Server(
      {
        name: 'automator-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'run_applescript',
          description: 'Execute AppleScript code on macOS',
          inputSchema: {
            type: 'object',
            properties: {
              script: {
                type: 'string',
                description: 'AppleScript code to execute',
              },
            },
            required: ['script'],
          },
        },
        {
          name: 'run_jxa',
          description: 'Execute JavaScript for Automation (JXA) code on macOS',
          inputSchema: {
            type: 'object',
            properties: {
              script: {
                type: 'string',
                description: 'JXA JavaScript code to execute',
              },
            },
            required: ['script'],
          },
        },
        {
          name: 'create_workflow',
          description: 'Create a new Automator workflow file',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the workflow',
              },
              type: {
                type: 'string',
                enum: ['workflow', 'application', 'service', 'quick-action'],
                description: 'Type of Automator document',
              },
              actions: {
                type: 'array',
                description: 'Array of action configurations',
                items: {
                  type: 'object',
                  properties: {
                    action: { type: 'string' },
                    parameters: { type: 'object' },
                  },
                },
              },
            },
            required: ['name', 'type'],
          },
        },
        {
          name: 'list_actions',
          description: 'List available Automator actions',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Filter by category (optional)',
              },
            },
          },
        },
        {
          name: 'quick_action',
          description: 'Run a predefined quick action',
          inputSchema: {
            type: 'object',
            properties: {
              action: {
                type: 'string',
                enum: [
                  'compress_images',
                  'convert_to_pdf',
                  'resize_images',
                  'extract_text_from_pdf',
                  'combine_pdfs',
                  'convert_video',
                ],
                description: 'Quick action to perform',
              },
              files: {
                type: 'array',
                items: { type: 'string' },
                description: 'File paths to process',
              },
              options: {
                type: 'object',
                description: 'Action-specific options',
              },
            },
            required: ['action', 'files'],
          },
        },
        {
          name: 'system_automation',
          description: 'Perform system-level automation tasks',
          inputSchema: {
            type: 'object',
            properties: {
              task: {
                type: 'string',
                enum: [
                  'empty_trash',
                  'show_desktop',
                  'hide_all_apps',
                  'sleep_display',
                  'take_screenshot',
                  'start_screensaver',
                  'toggle_dark_mode',
                  'get_system_info',
                ],
                description: 'System task to perform',
              },
              parameters: {
                type: 'object',
                description: 'Task-specific parameters',
              },
            },
            required: ['task'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'run_applescript':
            return await this.runAppleScript(args.script);
          
          case 'run_jxa':
            return await this.runJXA(args.script);
          
          case 'create_workflow':
            return await this.createWorkflow(args);
          
          case 'list_actions':
            return await this.listActions(args.category);
          
          case 'quick_action':
            return await this.runQuickAction(args);
          
          case 'system_automation':
            return await this.runSystemAutomation(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async runAppleScript(script) {
    try {
      const result = execSync(`osascript -e '${script.replace(/'/g, "'\"'\"'")}'`, {
        encoding: 'utf8',
      });
      
      return {
        content: [
          {
            type: 'text',
            text: result.trim() || 'Script executed successfully',
          },
        ],
      };
    } catch (error) {
      throw new Error(`AppleScript error: ${error.message}`);
    }
  }

  async runJXA(script) {
    try {
      const result = execSync(`osascript -l JavaScript -e '${script.replace(/'/g, "'\"'\"'")}'`, {
        encoding: 'utf8',
      });
      
      return {
        content: [
          {
            type: 'text',
            text: result.trim() || 'Script executed successfully',
          },
        ],
      };
    } catch (error) {
      throw new Error(`JXA error: ${error.message}`);
    }
  }

  async createWorkflow(args) {
    // Simplified workflow creation - in real implementation would use Automator's plist format
    const workflowScript = `
      tell application "Automator"
        make new workflow
        set name of result to "${args.name}"
        save result
      end tell
    `;
    
    await this.runAppleScript(workflowScript);
    
    return {
      content: [
        {
          type: 'text',
          text: `Created ${args.type} workflow: ${args.name}`,
        },
      ],
    };
  }

  async listActions(category) {
    const script = `
      tell application "Automator"
        get name of Automator actions
      end tell
    `;
    
    const result = await this.runAppleScript(script);
    const actions = result.content[0].text.split(', ');
    
    return {
      content: [
        {
          type: 'text',
          text: `Available actions${category ? ` in ${category}` : ''}:\n${actions.join('\n')}`,
        },
      ],
    };
  }

  async runQuickAction(args) {
    const { action, files, options = {} } = args;
    
    const quickActions = {
      compress_images: async () => {
        const script = `
          tell application "Finder"
            set theFiles to {${files.map(f => `POSIX file "${f}"`).join(', ')}}
          end tell
          
          repeat with theFile in theFiles
            do shell script "sips -Z 1024 " & quoted form of POSIX path of theFile
          end repeat
        `;
        return this.runAppleScript(script);
      },
      
      convert_to_pdf: async () => {
        const outputPath = options.outputPath || files[0].replace(/\.[^.]+$/, '.pdf');
        const script = `
          do shell script "convert ${files.map(f => `'${f}'`).join(' ')} '${outputPath}'"
        `;
        return this.runAppleScript(script);
      },
      
      resize_images: async () => {
        const size = options.size || '800x600';
        const script = `
          repeat with filePath in {${files.map(f => `"${f}"`).join(', ')}}
            do shell script "sips -z ${size.split('x')[1]} ${size.split('x')[0]} " & filePath
          end repeat
        `;
        return this.runAppleScript(script);
      },
    };
    
    if (quickActions[action]) {
      return await quickActions[action]();
    }
    
    throw new Error(`Unknown quick action: ${action}`);
  }

  async runSystemAutomation(args) {
    const { task, parameters = {} } = args;
    
    const systemTasks = {
      empty_trash: 'tell application "Finder" to empty trash',
      show_desktop: 'tell application "Finder" to reveal desktop',
      hide_all_apps: 'tell application "System Events" to set visible of every process to false',
      sleep_display: 'do shell script "pmset displaysleepnow"',
      take_screenshot: 'do shell script "screencapture -i ~/Desktop/screenshot.png"',
      start_screensaver: 'tell application "System Events" to start current screen saver',
      toggle_dark_mode: `
        tell application "System Events"
          tell appearance preferences
            set dark mode to not dark mode
          end tell
        end tell
      `,
      get_system_info: `
        set sysInfo to system info
        return (computer name of sysInfo) & " - " & (system version of sysInfo)
      `,
    };
    
    if (systemTasks[task]) {
      return await this.runAppleScript(systemTasks[task]);
    }
    
    throw new Error(`Unknown system task: ${task}`);
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Automator MCP server running...');
  }
}

const server = new AutomatorServer();
server.run().catch(console.error);