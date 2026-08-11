# Slack Integration Guide

## Overview

The Slack integration enables seamless communication between Spreadsheet Moment and your Slack workspace. Send messages, receive notifications, handle slash commands, and upload files directly from your spreadsheet cells.

## Features

- Send messages to channels and DMs
- Post rich formatted messages with blocks
- Handle slash commands
- Upload files and images
- Add reactions to messages
- Create and update messages
- Interactive components (buttons, menus)
- Webhook event handling

## Setup

### 1. Create Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App"
3. Choose "From scratch"
4. Enter app name and workspace
5. Note your **Client ID** and **Client Secret**

### 2. Configure OAuth Scopes

**Bot Token Scopes:**
```
chat:write         - Send messages
chat:write.public  - Send to public channels
channels:read      - View channels
files:write        - Upload files
reactions:write    - Add reactions
commands           - Handle slash commands
```

**User Scopes (optional):**
```
chat:write         - Send as user
search:read        - Search messages
```

### 3. Install App to Workspace

1. Navigate to "Install App" in your Slack app settings
2. Click "Install to Workspace"
3. Copy the **Bot User OAuth Token** (starts with `xoxb-`)
4. Copy the **Signing Secret** from "Basic Information"

### 4. Configure Integration

```typescript
import { IntegrationManager, createSlackConnector } from '@polln/integrations';

const manager = new IntegrationManager();

const slack = createSlackConnector({
  id: 'slack-production',
  name: 'Production Slack',
  apiToken: 'xoxb-your-bot-token',
  signingSecret: 'your-signing-secret',
  defaultChannel: '#general',
  rateLimit: {
    maxRequests: 200,
    windowMs: 60000 // 1 minute
  }
});

await manager.registerIntegration(slack);
await manager.connectIntegration('slack-production');
```

## Usage Examples

### Send Simple Message

```typescript
await manager.send('slack-production', 'message', {
  channel: '#general',
  text: 'Hello from Spreadsheet Moment!'
});
```

### Send Rich Message with Blocks

```typescript
await manager.send('slack-production', 'message', {
  channel: '#notifications',
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Spreadsheet Update*\nYour data has been synced successfully.'
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Data'
          },
          url: 'https://your-spreadsheet.com'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Refresh'
          },
          action_id: 'refresh_action',
          value: 'refresh'
        }
      ]
    }
  ]
});
```

### Send to Multiple Channels

```typescript
const channels = ['#general', '#updates', '@username'];

for (const channel of channels) {
  await manager.send('slack-production', 'message', {
    channel: channel,
    text: 'Important announcement!'
  });
}
```

### Upload File

```typescript
await manager.send('slack-production', 'upload', {
  channels: ['#reports'],
  file: Buffer.from('Report data here'),
  filename: 'monthly-report.csv',
  filetype: 'csv',
  initialComment: 'Here is your monthly report'
});
```

### Update Message

```typescript
// First, send a message
const result = await manager.send('slack-production', 'message', {
  channel: '#updates',
  text: 'Processing...'
});

// Later, update it
await manager.send('slack-production', 'update', {
  channel: '#updates',
  ts: result.data.ts, // Timestamp from original message
  text: 'Complete! Processed 100 records.'
});
```

### Add Reaction

```typescript
await manager.send('slack-production', 'reaction', {
  channel: '#general',
  timestamp: '1234567890.123456',
  name: 'white_check_mark'
});
```

## Slash Commands

### Create Slash Command

1. Go to "Slash Commands" in Slack app settings
2. Click "Create New Command"
3. Configure:
   - Command: `/polln`
   - Request URL: `https://your-api.com/slack/commands`
   - Description: "Query Spreadsheet Moment data"
   - Usage Hint: "[query]"

### Handle Command

```typescript
import { SlackConnector } from '@polln/integrations';

slack.on('slashCommand', async (command) => {
  const { command, text, userId, channel } = command;

  switch (command) {
    case '/polln':
      // Parse command text
      const [action, ...args] = text.split(' ');

      // Execute action
      const result = await executePollnAction(action, args);

      // Send response
      await manager.send('slack-production', 'message', {
        channel: channel,
        text: result
      });
      break;

    case '/data':
      // Handle data query
      const data = await querySpreadsheetData(text);
      await manager.send('slack-production', 'message', {
        channel: channel,
        blocks: formatDataAsBlocks(data)
      });
      break;
  }
});
```

### Example Commands

```typescript
// /polln query sales --range=Sheet1!A1:Z100
const queryData = async (sheet, range) => {
  const data = await spreadsheet.getData(sheet, range);
  return data;
};

// /polln update Sheet1 A1 "New Value"
const updateCell = async (sheet, cell, value) => {
  await spreadsheet.updateCell(sheet, cell, value);
  return `Updated ${sheet}!${cell} to "${value}"`;
};
```

## Interactive Components

### Handle Button Clicks

```typescript
slack.on('interaction', async (interaction) => {
  const { type, user, channel, actions } = interaction.payload;

  if (type === 'block_actions') {
    for (const action of actions) {
      switch (action.action_id) {
        case 'refresh_action':
          // Refresh data
          await refreshSpreadsheetData();

          // Update message
          await manager.send('slack-production', 'update', {
            channel: channel,
            ts: interaction.message.ts,
            text: 'Data refreshed successfully!'
          });
          break;

        case 'approve_action':
          // Handle approval
          await approveRequest(action.value);
          break;
      }
    }
  }
});
```

### Handle Modal Submissions

```typescript
slack.on('modal_submission', async (view) => {
  const { state } = view;

  // Extract form data
  const name = state.values.name_block.name_input.value;
  const email = state.values.email_block.email_input.value;

  // Create record
  await spreadsheet.createRecord({ name, email });

  // Send confirmation
  await manager.send('slack-production', 'message', {
    channel: view.user.id,
    text: `Record created for ${name}`
  });
});
```

## Webhook Events

### Configure Events

1. Enable "Event Subscriptions" in Slack app
2. Set Request URL: `https://your-api.com/slack/events`
3. Subscribe to workspace events:
   - `message.channels` - New messages
   - `reaction.added` - Reactions added
   - `file.shared` - Files shared
   - `app_mention` - Bot mentions

### Handle Events

```typescript
// New message in channel
slack.on('event:message', async (event) => {
  const { channel, text, user, ts } = event;

  // Log to spreadsheet
  await spreadsheet.appendRow('Messages', {
    channel,
    user,
    text,
    timestamp: new Date(parseFloat(ts) * 1000)
  });
});

// Reaction added
slack.on('event:reaction_added', async (event) => {
  const { reaction, user, item } = event;

  if (reaction === 'white_check_mark') {
    // Update spreadsheet status
    await spreadsheet.updateStatus(item.channel, 'approved');
  }
});

// File shared
slack.on('event:file_shared', async (event) => {
  const { file_id } = event;

  // Get file info
  const file = await slack.send('fileInfo', { fileId: file_id });

  // Download and process
  await processSpreadsheetFile(file.url_private);
});
```

## Cell Mapping

### Map Events to Cells

```typescript
const slack = createSlackConnector({
  // ... config
  cellMapping: {
    eventToCell: {
      'message': 'slack-messages-cell',
      'slashCommand': 'slack-commands-cell',
      'reaction': 'slack-reactions-cell'
    },
    cellToOperation: {
      'notifications-cell': 'message',
      'reports-cell': 'upload'
    }
  }
});
```

### Transform Data

```typescript
const slack = createSlackConnector({
  // ... config
  cellMapping: {
    transforms: {
      'message': (data) => ({
        timestamp: new Date(),
        channel: data.channel,
        user: data.user,
        text: data.text,
        // Extract @mentions
        mentions: data.text.match(/<@[^>]+>/g) || []
      })
    }
  }
});
```

## Rate Limiting

### Understanding Rate Limits

Slack implements rate limits to prevent spam:

- **Tier 1:** 1 request per second
- **Tier 2:** 200 requests per minute
- **Tier 3:** 600 requests per minute
- **Tier 4:** 3200 requests per minute

### Handle Rate Limits

```typescript
// Automatic retry with backoff
try {
  await manager.send('slack-production', 'message', {
    channel: '#general',
    text: 'Hello!'
  });
} catch (error) {
  if (error.code === 'RATE_LIMITED') {
    console.log('Rate limited. Retry after:', error.retryDelay);
    // IntegrationManager will automatically retry
  }
}

// Check rate limit status
const metrics = slack.getMetrics();
console.log('Remaining:', metrics.rateLimitRemaining);
console.log('Reset time:', new Date(metrics.rateLimitReset));
```

### Optimize for Rate Limits

```typescript
// Batch messages
const messages = [
  { channel: '#general', text: 'Message 1' },
  { channel: '#general', text: 'Message 2' },
  { channel: '#general', text: 'Message 3' }
];

// Use queue to avoid rate limits
await manager.send('slack-production', 'batch', {
  messages: messages,
  delayMs: 1000 // 1 second between messages
});

// Use chat.postMessage instead of chat.postEphemeral for fewer rate limits
await manager.send('slack-production', 'message', {
  channel: '#general',
  text: 'Visible to all'
  // NOT: ephemeral messages have stricter limits
});
```

## Error Handling

### Common Errors

```typescript
try {
  await manager.send('slack-production', 'message', {
    channel: '#general',
    text: 'Hello!'
  });
} catch (error) {
  switch (error.code) {
    case 'CHANNEL_NOT_FOUND':
      console.error('Channel does not exist');
      break;

    case 'MESSAGE_TOO_LONG':
      console.error('Message exceeds 40000 characters');
      break;

    case 'RATE_LIMITED':
      console.error('Rate limited. Retry in', error.retryDelay, 'ms');
      break;

    case 'INVALID_AUTH':
      console.error('Invalid token. Check credentials.');
      break;
  }
}
```

### Retry Logic

```typescript
const config = {
  retry: {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 60000,
    backoffMultiplier: 2,
    retryableStatusCodes: [429, 500, 502, 503, 504]
  }
};
```

## Best Practices

### 1. Use Threads for Conversations

```typescript
// Start thread
await manager.send('slack-production', 'message', {
  channel: '#general',
  text: 'Discussion thread',
  thread_ts: 'parent_message_timestamp'
});
```

### 2. Format Messages with Markdown

```typescript
await manager.send('slack-production', 'message', {
  channel: '#general',
  text: `*Bold text* and _italic text_
Code: \`inline code\`
Links: <https://example.com|Link Text>
Mentions: <@USERID>`
});
```

### 3. Use Blocks for Rich Layouts

```typescript
await manager.send('slack-production', 'message', {
  channel: '#general',
  blocks: [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Report Summary'
      }
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: '*Total Sales*\n$50,000' },
        { type: 'mrkdwn', text: '*New Customers*\n150' }
      ]
    }
  ]
});
```

### 4. Handle Errors Gracefully

```typescript
try {
  await manager.send('slack-production', 'message', { /* ... */ });
} catch (error) {
  // Log error
  console.error('Slack error:', error);

  // Notify user
  await manager.send('slack-production', 'message', {
    channel: '#errors',
    text: `Error: ${error.message}`
  });

  // Fallback action
  await fallbackNotification(error);
}
```

## Testing

### Test Message Sending

```typescript
// Use test channel
await manager.send('slack-production', 'message', {
  channel: '#test',
  text: 'Test message'
});

// Verify message received
const history = await manager.send('slack-production', 'history', {
  channel: '#test',
  limit: 1
});
console.log('Latest message:', history.messages[0]);
```

### Test Slash Commands

```bash
# In Slack
/polln test

# Should respond with test message
```

### Test Webhooks

```typescript
// Simulate webhook event
const testEvent = {
  type: 'message',
  channel: '#test',
  text: 'Test message',
  user: 'U123456',
  ts: '1234567890.123456'
};

await slack.emit('event:message', testEvent);
```

## Troubleshooting

### Issue: Messages Not Sending

**Check:**
1. Bot token is correct
2. Bot is invited to channel
3. Scopes are correct
4. Rate limits not exceeded

### Issue: Slash Commands Not Working

**Check:**
1. Request URL is accessible
2. Command is installed to workspace
3. SSL certificate is valid
4. Response is sent within 3 seconds

### Issue: Webhooks Not Receiving

**Check:**
1. Events are enabled
2. Request URL is verified
3. Firewall allows requests
4. Response returns 200 OK

## Advanced Features

### Custom App Commands

```typescript
// Register custom command
slack.registerCommand('custom', async (args, context) => {
  // Custom logic
  return { text: 'Custom response' };
});
```

### Message Scheduling

```typescript
// Schedule message
await manager.send('slack-production', 'schedule', {
  channel: '#general',
  text: 'Scheduled message',
  postAt: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
});
```

### App Mentions

```typescript
slack.on('app_mention', async (event) => {
  // Respond to @app mention
  await manager.send('slack-production', 'message', {
    channel: event.channel,
    text: `Hello <@${event.user}>! How can I help?`
  });
});
```

## Resources

- [Slack API Documentation](https://api.slack.com/docs)
- [Slack Bolt SDK](https://slack.dev/bolt-js/)
- [Block Kit Builder](https://api.slack.com/block-kit/building)
- [Rate Limiting](https://api.slack.com/docs/rate-limits)

---

**Need Help?** Contact integrations@spreadsheetmoment.com or join our [Discord community](https://discord.gg/spreadsheetmoment).
