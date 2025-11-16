# Testing the List Command

## Build and Run
```bash
npm run build
spuro
```

## Commands to Try

### 1. View help for list command
```
spuro> help
```

Look for:
```
  list [--type <type>] [--limit <n>]
    List tracked entities
```

### 2. Create some test entities
```
spuro> create "Test entity 1" --attributes '{"type":"test","name":"first"}'
spuro> create "Test entity 2" --attributes '{"type":"test","name":"second"}'
spuro> create "Important data" --attributes '{"type":"important","priority":"high"}'
```

### 3. List all tracked entities
```
spuro> list
```

### 4. Filter by type
```
spuro> list --type test
spuro> list --type important
spuro> list --type polkadot-stash
```

### 5. Limit results
```
spuro> list --limit 1
spuro> list --limit 5
```

### 6. Check status to see tracked count
```
spuro> status
```

### 7. Update an entity
```
spuro> update last --payload "Updated test data"
spuro> update last --attributes '{"type":"test","updated":true}'
spuro> update <entity_key> --payload "New data" --attributes '{"version":2}'
```

### 8. Read an entity
```
spuro> read last
spuro> read <entity_key>
```

### 9. Transfer ownership
```
spuro> transfer last 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
spuro> transfer <entity_key> <new_owner_address>
```

### 10. Delete an entity
```
spuro> delete last
spuro> delete <entity_key>
```

### 11. Explain an entity with AI
```
spuro> explain last
spuro> explain <entity_key>
```

## What You'll See

The `list` command shows:
- **#** - Row number
- **Key** - First 16 characters of entity key
- **Type** - Entity type from attributes
- **Created** - Time ago (e.g., "5m ago", "2h ago")
- **Description** - First 30 characters of payload

## Entity Storage

Entities are tracked in:
```
~/.spuro/entities.json
```

You can view this file directly:
```bash
cat ~/.spuro/entities.json
```

Or on Windows:
```bash
type %USERPROFILE%\.spuro\entities.json
```

## Features

### Entity Management
✅ **Create** - Store new entities with custom attributes
✅ **Read** - Retrieve entity data and metadata
✅ **Update** - Modify entity payload and attributes
✅ **Delete** - Remove entities (with confirmation)
✅ **Transfer** - Change entity ownership
✅ **Query** - Search entities by attributes

### Tracking & Organization
✅ **Persists across sessions** - Entities saved to `~/.spuro-agent/entities.json`
✅ **Filter by type** - List entities by specific type
✅ **Limit results** - Control how many entities to show
✅ **Time tracking** - Shows when entities were created ("5m ago", "2h ago")
✅ **Auto-tracking** - Automatically tracks entities created via:
  - `create` command
  - `monitor-stash` command
✅ **Auto-cleanup** - Removes from tracking when deleted

### Advanced Features
✅ **AI Explanation** - Use OpenAI to summarize entity contents
✅ **Full keys mode** - `--full` flag to see complete entity keys
✅ **Polkadot Integration** - Monitor stash accounts automatically
✅ **x402 Payments** - All API calls use micropayment protocol

## Complete Workflow Example

Here's a typical session showing all features:

```bash
# Start the CLI
spuro

# Create a test entity
spuro> create "My first entity" --attributes '{"type":"test","priority":"high"}'
✓ Entity created successfully!
Entity Key: 0xb0b9c4be651ec9d8a4f2e3c1d7b5a8f9e2c6d4b1a9f8e7c5d3b2a0f1e9d...

# Read it back
spuro> read last
✓ Entity retrieved successfully!
Data: My first entity

# Update it
spuro> update last --payload "Updated entity" --attributes '{"type":"test","priority":"high","version":2}'
✓ Entity updated successfully!

# List all entities
spuro> list
Tracked Entities (1):
#  Key                       Type  Created  Description
1  0xb0b9c4be651ec9d8a4f...  test  1m ago   My first entity

# Get AI explanation
spuro> explain last
AI Explanation:
This entity is a test record with high priority...

# Create more entities for testing
spuro> create "Second entity" --attributes '{"type":"important"}'
spuro> create "Third entity" --attributes '{"type":"test"}'

# List with filters
spuro> list --type test
spuro> list --full  # See complete keys

# Transfer ownership (optional)
spuro> transfer last 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Are you sure? Type 'yes' to confirm: yes
✓ Ownership transferred successfully!

# Delete when done
spuro> delete <entity_key>
Delete entity 0xb0b9c4be651e...? Type 'yes' to confirm: yes
✓ Entity deleted successfully!

# Check final status
spuro> status
spuro> list
```

## Polkadot Stash Monitoring Example

```bash
spuro

# Start monitoring a Polkadot stash
spuro> monitor-stash 135rhF4kG1VxfrDf7a6c6TQzrPTyKNTqtXX5HDS8k4bDSeJy --interval 60
✓ Connected to Polkadot
[2:51:55 AM] Fetching stash info...
Balance:
  Total: 224001925200
  Spendable: 13591925200
  ...
✓ Entity created!

# List your stash entities
spuro> list --type polkadot-stash
Tracked Entities (1):
#  Key                       Type            Created  Description
1  0xb0b9c4be651ec9d8a4f...  polkadot-stash  1m ago   Stash 135rhF4kG1VxfrDf...

# Get AI explanation of the stash data
spuro> explain last
AI Explanation:
This entity tracks a Polkadot validator stash account...
- Total balance: 224 DOT
- Locked in staking: 210 DOT
- Active era: 1993
...

# The monitor continues updating in background every 60 seconds
# You can continue using other commands
```
