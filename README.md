# n8n-nodes-quick-jira

[![npm version](https://badge.fury.io/js/n8n-nodes-quick-jira.svg)](https://badge.fury.io/js/n8n-nodes-quick-jira)

This is an n8n community node that provides a **simplified interface** to Jira with smart defaults and common operations.

**Quick Jira** makes it easy to work with Jira by focusing on the most common use cases with pre-configured settings, reducing the complexity of the standard Jira node.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

## Table of Contents

- [Installation](#installation)
- [Operations](#operations)
- [Credentials](#credentials)
- [Features](#features)
- [Usage Examples](#usage-examples)
- [Compatibility](#compatibility)
- [Comparison with Standard Jira Node](#comparison-with-standard-jira-node)
- [Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Quick Install

In your n8n instance:

1. Go to **Settings** > **Community Nodes**
2. Click **Install**
3. Enter `n8n-nodes-quick-jira`
4. Agree to the risks and click **Install**

Alternatively, install via npm in your n8n installation directory:

```bash
npm install n8n-nodes-quick-jira
```

## Operations

Quick Jira supports five simplified operations:

### 1. Create Ticket
Create a new Jira ticket with smart defaults and minimal configuration.

**Required Fields:**
- Project (dropdown or ID)
- Issue Type (dropdown or ID)
- Summary

**Optional Fields:**
- Description
- Priority (dropdown with smart defaults)
- Assignee (searchable user list)

**Returns:** Issue key, ID, and direct URL to the ticket

### 2. Update Status
Change the status of a ticket with a simple transition selector.

**Fields:**
- Issue Key (e.g., PROJ-123)
- New Status (dropdown shows only available transitions)

**Returns:** Success confirmation with issue key

### 3. Add Comment
Add a comment to a ticket with plain text input.

**Fields:**
- Issue Key
- Comment (supports multi-line text)

**Returns:** Success confirmation with comment ID

### 4. Get Ticket
Retrieve ticket details with simplified, flattened JSON output.

**Fields:**
- Issue Key

**Returns Simplified Data:**
```json
{
  "id": "10001",
  "key": "PROJ-123",
  "summary": "Ticket summary",
  "description": "Ticket description",
  "status": "In Progress",
  "priority": "High",
  "assignee": "John Doe",
  "assigneeEmail": "john@example.com",
  "reporter": "Jane Smith",
  "reporterEmail": "jane@example.com",
  "created": "2025-10-21T10:00:00.000Z",
  "updated": "2025-10-21T15:30:00.000Z",
  "issueType": "Task",
  "project": "My Project",
  "projectKey": "PROJ",
  "url": "https://yourcompany.atlassian.net/browse/PROJ-123"
}
```

### 5. Search Tickets
Search for tickets using pre-built queries or custom JQL.

**Search Types:**
- **My Open Issues** - All your assigned tickets that aren't done
- **Recent Issues** - Issues updated in the last 7 days
- **By Project** - All issues in a specific project
- **Custom JQL** - Write your own JQL query

**Fields:**
- Search Type (dropdown)
- Project (for "By Project" search)
- JQL Query (for "Custom JQL" search)
- Limit (max results, default: 50)

**Returns:** Array of simplified ticket objects

## Credentials

### Prerequisites
1. A Jira Cloud account (https://www.atlassian.com/software/jira)
2. An API token from your Atlassian account

### Getting Your API Token

1. Log in to [Atlassian Account Security](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click **Create API token**
3. Give it a label (e.g., "n8n Integration")
4. Click **Create**
5. Copy the token immediately (you won't be able to see it again)

### Setting Up Credentials in n8n

1. In your n8n workflow, add a Quick Jira node
2. Click on **Credential to connect with** > **Create New**
3. Fill in the required fields:
   - **Jira Domain**: Your Jira Cloud URL (e.g., `https://yourcompany.atlassian.net`)
   - **Email**: The email address for your Atlassian account
   - **API Token**: The token you created above

4. Click **Save**

The credentials will be automatically tested to ensure they work.

## Features

### Why Choose Quick Jira?

✅ **Simplified Interface** - Only the fields you need, with smart defaults
✅ **Searchable Dropdowns** - Find projects, users, and issue types easily
✅ **Clean Output** - Flattened JSON responses (no deep nesting)
✅ **Pre-built Queries** - Common searches ready to use
✅ **Smart Defaults** - Minimal configuration required
✅ **Better Error Messages** - Clear, actionable error descriptions
✅ **Direct URLs** - Get clickable links to tickets automatically

## Usage Examples

### Example 1: Create a Ticket from a Form Submission

```
Webhook Trigger → Quick Jira (Create Ticket)
```

**Quick Jira Configuration:**
- Operation: Create Ticket
- Project: Select from dropdown
- Issue Type: Task
- Summary: `{{$json["form_subject"]}}`
- Description: `{{$json["form_message"]}}`
- Assignee: Select from dropdown

### Example 2: Update Ticket Status Based on Email

```
Email Trigger → Extract Issue Key → Quick Jira (Update Status)
```

**Quick Jira Configuration:**
- Operation: Update Status
- Issue Key: `{{$json["issueKey"]}}`
- New Status: Done

### Example 3: Add Comments to Tickets

```
Slack Trigger → Quick Jira (Add Comment)
```

**Quick Jira Configuration:**
- Operation: Add Comment
- Issue Key: `PROJ-123`
- Comment: `{{$json["slack_message"]}}`

### Example 4: Search and Process Open Tickets

```
Schedule Trigger → Quick Jira (Search) → Process Tickets
```

**Quick Jira Configuration:**
- Operation: Search Tickets
- Search Type: My Open Issues
- Limit: 50

Returns an array of tickets you can loop through with a Split In Batches node.

### Example 5: Get Ticket Details for Reporting

```
HTTP Request → Quick Jira (Get Ticket) → Send to Slack
```

**Quick Jira Configuration:**
- Operation: Get Ticket
- Issue Key: `{{$json["ticketId"]}}`

Returns clean data perfect for formatting into messages.

## Compatibility

- **Minimum n8n version:** 1.0.0
- **Tested with:** n8n v1.0.0 - v1.117.0
- **Jira Version:** Jira Cloud only (not compatible with Jira Server/Data Center)

### Known Limitations

- Only supports Jira Cloud (API v2/v3)
- Does not support OAuth2 authentication (API token only)
- Custom fields are not exposed (use standard Jira node for advanced field management)
- Does not support Jira Service Management-specific features

## Comparison with Standard Jira Node

| Feature | Quick Jira | Standard Jira |
|---------|-----------|---------------|
| **Operations** | 5 simplified operations | 15+ detailed operations |
| **Output Format** | Clean, flattened JSON | Full API response (nested) |
| **Field Configuration** | Smart defaults, minimal setup | Full control, complex setup |
| **Search** | Pre-built queries | JQL only |
| **Best For** | Common workflows, quick setup | Advanced use cases, custom fields |
| **Learning Curve** | Low | Medium-High |

**Use Quick Jira when:**
- You need basic Jira operations
- You want fast setup with minimal configuration
- You prefer clean, simple JSON outputs
- You don't need custom fields

**Use Standard Jira when:**
- You need advanced operations (issue linking, watchers, etc.)
- You work with custom fields extensively
- You need Jira Service Management features
- You need full control over all API options

## Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Jira Cloud REST API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v2/)
- [Atlassian API Tokens](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/)
- [JQL Query Guide](https://support.atlassian.com/jira-software-cloud/docs/use-advanced-search-with-jira-query-language-jql/)

## Support

- **Issues:** [GitHub Issues](https://github.com/tonyjames/n8n-nodes-quick-jira/issues)
- **Community:** [n8n Community Forum](https://community.n8n.io)

## License

[MIT](LICENSE.md)

## Version History

### 0.1.0 (Initial Release)
- ✨ Create Ticket with smart defaults
- ✨ Update Status with transition selector
- ✨ Add Comment with plain text
- ✨ Get Ticket with simplified output
- ✨ Search Tickets with pre-built queries
- ✨ Searchable dropdowns for projects, users, priorities
- ✨ Clean, flattened JSON responses
- ✨ Direct URLs to tickets
