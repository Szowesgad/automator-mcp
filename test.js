import { spawn } from 'child_process';

console.log('🧪 Testing Automator MCP...\n');

// Test basic AppleScript
const testScript = `
osascript -e 'return "Automator MCP is working!"'
`;

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runTests() {
  try {
    // Test 1: Basic AppleScript
    console.log('✓ Testing AppleScript execution...');
    const { stdout } = await execAsync(testScript);
    console.log(`  Result: ${stdout.trim()}`);
    
    // Test 2: Check if osascript is available
    console.log('\n✓ Checking osascript availability...');
    await execAsync('which osascript');
    console.log('  osascript found!');
    
    // Test 3: JXA test
    console.log('\n✓ Testing JXA execution...');
    const jxaResult = await execAsync(`osascript -l JavaScript -e 'Application.currentApplication().includeStandardAdditions = true; "JXA works!"'`);
    console.log(`  Result: ${jxaResult.stdout.trim()}`);
    
    console.log('\n✅ All tests passed! Automator MCP is ready to use.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();