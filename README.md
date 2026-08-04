# mcp-ocrspace

OCR.space MCP — wraps the OCR.space API (ocr.space) for image/PDF → text OCR.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `extract_text` | Extract text from an image or PDF via OCR — pass an image/PDF URL, get the recognized text. Useful for reading screenshots, scanned documents, receipts, signs. Engine 2 is best for most cases. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "ocrspace": {
      "url": "https://gateway.pipeworx.io/ocrspace/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Ocrspace data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
