# n8n-nodes-peak-ai

This is an n8n community node for [Peak AI](https://thepeakai.com) - a LinkedIn data enrichment service that helps you find contact information from LinkedIn profiles.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Features

Peak AI helps you enrich LinkedIn profiles with:

- **Phone Numbers** - Extract phone numbers from LinkedIn profiles
- **Personal Emails** - Find personal email addresses
- **Work Emails** - Discover business/work email addresses
- **Full Enrichment** - Get all contact information in one request
- **Credit Balance** - Check your remaining API credits

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### In n8n Cloud or Desktop

1. Go to **Settings** > **Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-peak-ai` and click **Install**

### In Self-hosted n8n

```bash
npm install n8n-nodes-peak-ai
```

## Credentials

To use this node, you need a Peak AI account:

1. Sign up at [Peak AI](https://thepeakai.com)
2. Get your account credentials (email and password)
3. In n8n, create new credentials of type **Peak AI API**
4. Enter your email and password

The node handles authentication automatically - you don't need to manage access tokens manually.

## Usage

### Operations

| Resource | Operation | Description |
|----------|-----------|-------------|
| **Contact** | Get Phone | Extract phone number from a LinkedIn profile |
| **Contact** | Get Email | Extract personal email from a LinkedIn profile |
| **Contact** | Get Work Email | Extract work/business email from a LinkedIn profile |
| **Contact** | Enrich | Get all contact information (phone, email, work email) in one request |
| **Account** | Get Credits | Check your remaining API credits |

### Example Workflow

1. Add the **Peak AI** node to your workflow
2. Select your Peak AI credentials
3. Choose a resource and operation (e.g., Contact > Get Phone)
4. Enter the LinkedIn profile URL (e.g., `https://www.linkedin.com/in/username`)
5. Execute the node

### Input Format

The LinkedIn URL field accepts:
- Full URL: `https://www.linkedin.com/in/username`
- Username only: `username` (will be converted to full URL automatically)

## Compatibility

- Requires n8n version 1.0.0 or later
- Tested with n8n versions 1.0.0+

## Resources

- [Peak AI Website](https://thepeakai.com)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Report Issues](https://github.com/Priyeshvg/PeakAi-n8n/issues)

## License

[MIT](LICENSE.md)
