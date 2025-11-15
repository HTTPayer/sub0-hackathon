#!/usr/bin/env node
/**
 * ArkiVendor - Interactive CLI for Arkiv API
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import os from 'os';
import axios from 'axios';
import chalk from 'chalk';

interface EntityResponse {
  entity_key: string;
  tx_hash: string;
}

interface Entity {
  key: string;
  owner: string;
  content_type: string;
  payload?: string;
  attributes?: Record<string, any>;
}

interface ReadResponse {
  data: string;
  entity: Entity;
}

interface QueryResult {
  key: string;
  attributes?: Record<string, any>;
  payload?: string;
}

interface QueryResponse {
  query: string;
  count: number;
  results: QueryResult[];
}

interface TransferResponse {
  status: string;
  entity_key: string;
  old_owner: string;
  new_owner: string;
  tx_hash: string;
}

interface UpdateDeleteResponse {
  status: string;
  entity_key: string;
  tx_hash: string;
}

class ArkiVendorShell {
  private baseUrl: string;
  private lastEntityKey: string | null = null;
  private sessionEntities: string[] = [];
  private responsesDir: string;
  private rl: readline.Interface;

  constructor(baseUrl: string = process.env.API_BASE_URL || 'http://localhost:8000') {
    this.baseUrl = baseUrl;
    this.responsesDir = path.join(os.homedir(), '.arkivendor', 'responses');
    this.ensureResponsesDir();

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.cyan('arkivendor> ')
    });
  }

  private ensureResponsesDir(): void {
    if (!fs.existsSync(this.responsesDir)) {
      fs.mkdirSync(this.responsesDir, { recursive: true });
    }
  }

  private saveResponse(data: any, prefix: string = 'response'): string {
    const timestamp = Date.now();
    const filename = `${prefix}_${timestamp}.json`;
    const filepath = path.join(this.responsesDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    return filepath;
  }

  private getLatestResponses(limit: number = 5): string[] {
    if (!fs.existsSync(this.responsesDir)) return [];

    const files = fs.readdirSync(this.responsesDir)
      .filter(f => f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(this.responsesDir, f),
        mtime: fs.statSync(path.join(this.responsesDir, f)).mtime.getTime()
      }))
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, limit);

    return files.map(f => f.path);
  }

  private async checkApiHealth(): Promise<string> {
    try {
      const resp = await axios.get(`${this.baseUrl}/`, { timeout: 2000 });
      return resp.status === 200 ? 'Healthy' : 'Error';
    } catch {
      return 'Offline';
    }
  }

  private async renderStatusPanel(): Promise<void> {
    const apiStatus = await this.checkApiHealth();
    const recent = this.getLatestResponses(10);

    const statusColor = apiStatus === 'Healthy' ? chalk.green :
                       apiStatus === 'Offline' ? chalk.red : chalk.yellow;

    console.log();
    console.log(chalk.bold.white('API Status'));
    console.log(chalk.dim('  URL: ') + chalk.cyan(this.baseUrl));
    console.log(chalk.dim('  Status: ') + statusColor(apiStatus));
    console.log();
    console.log(chalk.bold.white('Session'));
    console.log(chalk.dim('  Entities: ') + chalk.cyan(this.sessionEntities.length.toString()));
    console.log(chalk.dim('  Responses: ') + chalk.cyan(recent.length.toString()));
    if (this.lastEntityKey) {
      console.log(chalk.dim('  Last Key: ') + chalk.cyan(this.lastEntityKey.substring(0, 16) + '...'));
    }
    console.log();
  }

  private parseArgs(input: string): string[] {
    const args: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if ((char === '"' || char === "'") && (!inQuotes || char === quoteChar)) {
        if (inQuotes) {
          inQuotes = false;
          quoteChar = '';
        } else {
          inQuotes = true;
          quoteChar = char;
        }
      } else if (char === ' ' && !inQuotes) {
        if (current) {
          args.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current) {
      args.push(current);
    }

    return args;
  }

  private printTable(headers: string[], rows: string[][]): void {
    const colWidths = headers.map((h, i) => {
      const maxWidth = Math.max(h.length, ...rows.map(r => (r[i] || '').length));
      return maxWidth;
    });

    // Print header
    const headerRow = headers.map((h, i) => h.padEnd(colWidths[i])).join('  ');
    console.log(chalk.cyan.bold(headerRow));
    console.log(chalk.dim('─'.repeat(headerRow.length)));

    // Print rows
    rows.forEach(row => {
      const formattedRow = row.map((cell, i) => cell.padEnd(colWidths[i])).join('  ');
      console.log(formattedRow);
    });
  }

  async start(): Promise<void> {
    console.log(chalk.bold.cyan('\nArkiVendor CLI') + chalk.dim(' Interactive Arkiv API Shell - Type \'help\' or \'exit\'\n'));
    await this.renderStatusPanel();

    this.rl.on('line', async (line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        this.rl.prompt();
        return;
      }

      await this.handleCommand(trimmed);
      console.log();
      this.rl.prompt();
    });

    this.rl.on('close', () => {
      console.log(chalk.dim('\nExiting ArkiVendor...'));
      process.exit(0);
    });

    this.rl.prompt();
  }

  private async handleCommand(line: string): Promise<void> {
    const parts = this.parseArgs(line);
    const cmd = parts[0];
    const args = parts.slice(1);

    try {
      switch (cmd) {
        case 'help':
          this.showHelp();
          break;
        case 'status':
          await this.renderStatusPanel();
          break;
        case 'create':
          await this.createEntity(args);
          break;
        case 'read':
          await this.readEntity(args);
          break;
        case 'update':
          await this.updateEntity(args);
          break;
        case 'delete':
          await this.deleteEntity(args);
          break;
        case 'query':
          await this.queryEntities(args);
          break;
        case 'transfer':
          await this.transferEntity(args);
          break;
        case 'history':
          this.showHistory();
          break;
        case 'clear':
          console.clear();
          await this.renderStatusPanel();
          break;
        case 'exit':
        case 'quit':
          this.rl.close();
          break;
        default:
          console.log(chalk.red(`Unknown command: ${cmd}`));
          console.log(chalk.dim("Type 'help' for available commands"));
      }
    } catch (error: any) {
      console.log(chalk.red('✗ Error: ') + error.message);
      if (error.response?.data) {
        console.log(chalk.dim(JSON.stringify(error.response.data, null, 2)));
      }
    }
  }

  private showHelp(): void {
    console.log(chalk.bold('\nAvailable Commands:\n'));
    console.log(chalk.cyan('  create') + ' <payload> [--attributes <json>] [--ttl <seconds>]');
    console.log(chalk.dim('    Create a new entity'));
    console.log(chalk.cyan('  read') + ' <entity_key|last>');
    console.log(chalk.dim('    Read an entity by key'));
    console.log(chalk.cyan('  update') + ' <entity_key|last> [--payload <text>] [--attributes <json>]');
    console.log(chalk.dim('    Update an entity'));
    console.log(chalk.cyan('  delete') + ' <entity_key|last>');
    console.log(chalk.dim('    Delete an entity'));
    console.log(chalk.cyan('  query') + ' <query_string> [--limit <n>] [--payload]');
    console.log(chalk.dim('    Query entities'));
    console.log(chalk.cyan('  transfer') + ' <entity_key|last> <new_owner>');
    console.log(chalk.dim('    Transfer entity ownership'));
    console.log(chalk.cyan('  status') + chalk.dim('    Show API and session status'));
    console.log(chalk.cyan('  history') + chalk.dim('   Show recent responses'));
    console.log(chalk.cyan('  clear') + chalk.dim('     Clear the screen'));
    console.log(chalk.cyan('  help') + chalk.dim('      Show this help'));
    console.log(chalk.cyan('  exit') + chalk.dim('      Exit the shell'));
    console.log();
  }

  private async createEntity(args: string[]): Promise<void> {
    if (args.length === 0) {
      console.log(chalk.red('Error: Payload required'));
      console.log(chalk.dim('Usage: create <payload> [--attributes <json>] [--ttl <seconds>]'));
      return;
    }

    const payload = args[0];
    let attributes: Record<string, any> | undefined;
    let ttl = 86400;
    let contentType = 'text/plain';

    for (let i = 1; i < args.length; i++) {
      if (args[i] === '--attributes' && i + 1 < args.length) {
        try {
          attributes = JSON.parse(args[i + 1]);
          i++;
        } catch {
          console.log(chalk.red('Error: Invalid JSON for attributes'));
          return;
        }
      } else if (args[i] === '--ttl' && i + 1 < args.length) {
        ttl = parseInt(args[i + 1]);
        i++;
      } else if (args[i] === '--content-type' && i + 1 < args.length) {
        contentType = args[i + 1];
        i++;
      }
    }

    const body: any = {
      payload: Buffer.from(payload).toString('hex'),
      content_type: contentType,
      ttl
    };

    if (attributes) {
      body.attributes = attributes;
    }

    console.log(chalk.dim('Creating entity...'));
    const resp = await axios.post<EntityResponse>(`${this.baseUrl}/entities`, body);
    const data = resp.data;

    this.lastEntityKey = data.entity_key;
    this.sessionEntities.push(data.entity_key);
    this.saveResponse(data, 'create');

    console.log(chalk.green('✓ Entity created successfully!'));
    console.log('Entity Key: ' + chalk.cyan(data.entity_key));
    console.log('TX Hash: ' + chalk.dim(data.tx_hash));
  }

  private async readEntity(args: string[]): Promise<void> {
    if (args.length === 0) {
      console.log(chalk.red('Error: Entity key required'));
      console.log(chalk.dim('Usage: read <entity_key> or read last'));
      return;
    }

    let entityKey = args[0];
    if (entityKey === 'last') {
      if (!this.lastEntityKey) {
        console.log(chalk.red('Error: No entity key in session'));
        return;
      }
      entityKey = this.lastEntityKey;
    }

    console.log(chalk.dim('Reading entity...'));
    const resp = await axios.get<ReadResponse>(`${this.baseUrl}/entities/${entityKey}`);
    const data = resp.data;

    this.saveResponse(data, 'read');

    console.log(chalk.green('✓ Entity retrieved successfully!'));
    console.log('\nData: ' + chalk.cyan(data.data));

    const entity = data.entity;
    console.log('\n' + chalk.bold('Entity Details:'));
    console.log(chalk.dim('  Key: ') + entity.key);
    console.log(chalk.dim('  Owner: ') + entity.owner);
    console.log(chalk.dim('  Content Type: ') + entity.content_type);

    if (entity.attributes) {
      console.log(chalk.dim('  Attributes: ') + JSON.stringify(entity.attributes, null, 2));
    }
  }

  private async updateEntity(args: string[]): Promise<void> {
    if (args.length === 0) {
      console.log(chalk.red('Error: Entity key required'));
      return;
    }

    let entityKey = args[0];
    if (entityKey === 'last') {
      if (!this.lastEntityKey) {
        console.log(chalk.red('Error: No entity key in session'));
        return;
      }
      entityKey = this.lastEntityKey;
    }

    const body: any = {};

    for (let i = 1; i < args.length; i++) {
      if (args[i] === '--payload' && i + 1 < args.length) {
        body.payload = Buffer.from(args[i + 1]).toString('hex');
        i++;
      } else if (args[i] === '--attributes' && i + 1 < args.length) {
        try {
          body.attributes = JSON.parse(args[i + 1]);
          i++;
        } catch {
          console.log(chalk.red('Error: Invalid JSON for attributes'));
          return;
        }
      } else if (args[i] === '--ttl' && i + 1 < args.length) {
        body.ttl = parseInt(args[i + 1]);
        i++;
      } else if (args[i] === '--content-type' && i + 1 < args.length) {
        body.content_type = args[i + 1];
        i++;
      }
    }

    if (Object.keys(body).length === 0) {
      console.log(chalk.red('Error: At least one field must be provided'));
      return;
    }

    console.log(chalk.dim('Updating entity...'));
    const resp = await axios.put<UpdateDeleteResponse>(`${this.baseUrl}/entities/${entityKey}`, body);
    const data = resp.data;

    this.saveResponse(data, 'update');

    console.log(chalk.green('✓ Entity updated successfully!'));
    console.log('Entity Key: ' + chalk.cyan(data.entity_key));
    console.log('TX Hash: ' + chalk.dim(data.tx_hash));
  }

  private async deleteEntity(args: string[]): Promise<void> {
    if (args.length === 0) {
      console.log(chalk.red('Error: Entity key required'));
      return;
    }

    let entityKey = args[0];
    if (entityKey === 'last') {
      if (!this.lastEntityKey) {
        console.log(chalk.red('Error: No entity key in session'));
        return;
      }
      entityKey = this.lastEntityKey;
    }

    // Prompt for confirmation
    const confirm = await this.promptConfirm(`Delete entity ${entityKey.substring(0, 16)}...?`);
    if (!confirm) {
      console.log('Deletion cancelled');
      return;
    }

    console.log(chalk.dim('Deleting entity...'));
    const resp = await axios.delete<UpdateDeleteResponse>(`${this.baseUrl}/entities/${entityKey}`);
    const data = resp.data;

    this.saveResponse(data, 'delete');

    console.log(chalk.green('✓ Entity deleted successfully!'));
    console.log('TX Hash: ' + chalk.dim(data.tx_hash));

    const idx = this.sessionEntities.indexOf(entityKey);
    if (idx !== -1) {
      this.sessionEntities.splice(idx, 1);
    }
    if (entityKey === this.lastEntityKey) {
      this.lastEntityKey = null;
    }
  }

  private async queryEntities(args: string[]): Promise<void> {
    if (args.length === 0) {
      console.log(chalk.red('Error: Query string required'));
      console.log(chalk.dim('Usage: query <query_string> [--limit <n>] [--payload]'));
      return;
    }

    const query = args[0];
    let limit = 20;
    let includePayload = false;

    for (let i = 1; i < args.length; i++) {
      if (args[i] === '--limit' && i + 1 < args.length) {
        limit = parseInt(args[i + 1]);
        i++;
      } else if (args[i] === '--payload') {
        includePayload = true;
      }
    }

    console.log(chalk.dim('Querying entities...'));
    const resp = await axios.get<QueryResponse>(`${this.baseUrl}/entities/query`, {
      params: { query, limit, include_payload: includePayload }
    });
    const data = resp.data;

    this.saveResponse(data, 'query');

    console.log(chalk.green('✓ Query completed!'));
    console.log('Query: ' + chalk.cyan(data.query));
    console.log('Results: ' + chalk.cyan(data.count.toString()));

    if (data.results.length > 0) {
      const headers = ['#', 'Key', 'Attributes'];
      if (includePayload) headers.push('Payload');

      const rows = data.results.map((result, i) => {
        const row = [
          (i + 1).toString(),
          result.key.substring(0, 16) + '...',
          JSON.stringify(result.attributes || {}).substring(0, 50)
        ];
        if (includePayload) {
          row.push((result.payload || '').substring(0, 50));
        }
        return row;
      });

      console.log();
      this.printTable(headers, rows);
    } else {
      console.log(chalk.dim('No results found'));
    }
  }

  private async transferEntity(args: string[]): Promise<void> {
    if (args.length < 2) {
      console.log(chalk.red('Error: Entity key and new owner required'));
      console.log(chalk.dim('Usage: transfer <entity_key> <new_owner>'));
      return;
    }

    let entityKey = args[0];
    if (entityKey === 'last') {
      if (!this.lastEntityKey) {
        console.log(chalk.red('Error: No entity key in session'));
        return;
      }
      entityKey = this.lastEntityKey;
    }

    const newOwner = args[1];

    const confirm = await this.promptConfirm(
      `Transfer ${entityKey.substring(0, 16)}... to ${newOwner.substring(0, 16)}...?`
    );
    if (!confirm) {
      console.log('Transfer cancelled');
      return;
    }

    console.log(chalk.dim('Transferring ownership...'));
    const resp = await axios.post<TransferResponse>(`${this.baseUrl}/entities/transfer`, {
      entity_key: entityKey,
      new_owner: newOwner
    });
    const data = resp.data;

    this.saveResponse(data, 'transfer');

    console.log(chalk.green('✓ Ownership transferred successfully!'));
    console.log('Old Owner: ' + chalk.dim(data.old_owner));
    console.log('New Owner: ' + chalk.cyan(data.new_owner));
    console.log('TX Hash: ' + chalk.dim(data.tx_hash));
  }

  private showHistory(): void {
    const recent = this.getLatestResponses(10);

    if (recent.length === 0) {
      console.log(chalk.dim('No response history'));
      return;
    }

    const headers = ['#', 'File', 'Time'];
    const rows = recent.map((filepath, i) => {
      const stats = fs.statSync(filepath);
      const mtime = new Date(stats.mtime).toLocaleString();
      return [(i + 1).toString(), path.basename(filepath), mtime];
    });

    console.log(chalk.bold('\nRecent Responses:\n'));
    this.printTable(headers, rows);
  }

  private promptConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const rlConfirm = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rlConfirm.question(chalk.yellow(message) + " Type 'yes' to confirm: ", (answer) => {
        rlConfirm.close();
        resolve(answer.toLowerCase() === 'yes');
      });
    });
  }
}

// Main entry point
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(chalk.bold('\nArkiVendor - Interactive CLI for Arkiv API\n'));
    console.log('Usage: arkivendor [--url <api_url>]');
    console.log('\nOptions:');
    console.log('  --url <url>    Set API base URL (default: http://localhost:8000)');
    console.log('  --help, -h     Show this help');
    console.log('\nOnce in the shell, type "help" for available commands.');
    process.exit(0);
  }

  let baseUrl = process.env.API_BASE_URL || 'http://localhost:8000';
  const urlIndex = args.indexOf('--url');
  if (urlIndex !== -1 && args[urlIndex + 1]) {
    baseUrl = args[urlIndex + 1];
  }

  const shell = new ArkiVendorShell(baseUrl);
  await shell.start();
}

if (require.main === module) {
  main().catch(console.error);
}

export { ArkiVendorShell };
