#!/usr/bin/env node
/**
 * Spuro Agent - Interactive CLI for Spuro API
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import os from 'os';
import axios from 'axios';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount, nonceManager } from 'viem/accounts';
import { wrapFetchWithPayment } from 'x402-fetch';
import { baseSepolia } from 'viem/chains';
import { dot } from "@polkadot-api/descriptors";
import { createClient } from "polkadot-api";
import { getSmProvider } from "polkadot-api/sm-provider";
import { start } from "polkadot-api/smoldot";
import { polkadot, polkadot_asset_hub } from "polkadot-api/chains";
import { createStakingSdk } from "@polkadot-api/sdk-staking";
import { getStashInfo } from "./staking-utils.js"
import OpenAI from 'openai';

dotenv.config();

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

interface TrackedEntity {
  key: string;
  type?: string;
  created_at: number;
  attributes?: Record<string, any>;
  description?: string;
}

class SpuroAgentShell {
  private baseUrl: string;
  private lastEntityKey: string | null = null;
  private sessionEntities: string[] = [];
  private responsesDir: string;
  private entitiesFile: string;
  private trackedEntities: TrackedEntity[] = [];
  private rl: readline.Interface;
  private fetchWithPay: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private currentStashEntityKey: string | null = null;
  private openai: OpenAI | null = null;

  constructor(baseUrl: string = process.env.API_BASE_URL || 'http://localhost:8000') {
    this.baseUrl = baseUrl;
    this.responsesDir = path.join(os.homedir(), '.spuro-agent', 'responses');
    this.entitiesFile = path.join(os.homedir(), '.spuro-agent', 'entities.json');
    this.ensureResponsesDir();
    this.loadTrackedEntities();

    // Setup x402-fetch client
    let privateKey = process.env.CLIENT_PRIVATE_KEY || process.env.PRIVATE_KEY || '';
    if (!privateKey.startsWith('0x')) {
      privateKey = `0x${privateKey}`;
    }

    if (!privateKey || privateKey === '0x') {
      console.log(chalk.yellow('Warning: CLIENT_PRIVATE_KEY not set. x402 payments will not work.'));
      this.fetchWithPay = fetch; // fallback to regular fetch
    } else {
      const rpcUrl = process.env.RPC_URL || 'https://sepolia.base.org';
      const account = privateKeyToAccount(privateKey as `0x${string}`, { nonceManager });
      const walletClient = createWalletClient({
        account,
        transport: http(rpcUrl),
        chain: baseSepolia,
      });
      this.fetchWithPay = wrapFetchWithPayment(fetch, walletClient) as (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
    }

    // Setup OpenAI client
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
    }

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.cyan('spuro> ')
    });
  }

  private ensureResponsesDir(): void {
    if (!fs.existsSync(this.responsesDir)) {
      fs.mkdirSync(this.responsesDir, { recursive: true });
    }
  }

  private loadTrackedEntities(): void {
    try {
      if (fs.existsSync(this.entitiesFile)) {
        const data = fs.readFileSync(this.entitiesFile, 'utf-8');
        this.trackedEntities = JSON.parse(data);
      }
    } catch (error) {
      console.log(chalk.yellow('Warning: Could not load tracked entities'));
      this.trackedEntities = [];
    }
  }

  private saveTrackedEntities(): void {
    try {
      const dir = path.dirname(this.entitiesFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.entitiesFile, JSON.stringify(this.trackedEntities, null, 2));
    } catch (error) {
      console.log(chalk.yellow('Warning: Could not save tracked entities'));
    }
  }

  private trackEntity(entity: TrackedEntity): void {
    // Remove if already exists (update)
    this.trackedEntities = this.trackedEntities.filter(e => e.key !== entity.key);
    // Add to beginning
    this.trackedEntities.unshift(entity);
    this.saveTrackedEntities();
  }

  private untrackEntity(key: string): void {
    this.trackedEntities = this.trackedEntities.filter(e => e.key !== key);
    this.saveTrackedEntities();
  }

  private async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await this.fetchWithPay(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${JSON.stringify(data)}`);
    }

    return data;
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
    console.log(chalk.dim('  Tracked: ') + chalk.cyan(this.trackedEntities.length.toString()));
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
    console.log(chalk.bold.cyan('Spuro Agent') + chalk.dim(' Interactive Spuro API Shell - Type \'help\' or \'exit\''));
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
      console.log(chalk.dim('\nExiting Spuro Agent...'));
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
        case 'monitor-stash':
          await this.monitorStash(args);
          break;
        case 'list':
          this.listEntities(args);
          break;
        case 'explain':
          await this.explainEntity(args);
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
    console.log(chalk.cyan('  monitor-stash') + ' <stash_address> [--interval <seconds>]');
    console.log(chalk.dim('    Monitor a Polkadot stash and store snapshots in Arkiv'));
    console.log(chalk.cyan('  list') + ' [--type <type>] [--limit <n>] [--full]');
    console.log(chalk.dim('    List tracked entities (use --full for complete keys)'));
    console.log(chalk.cyan('  explain') + ' <entity_key|last>');
    console.log(chalk.dim('    Use AI to explain/summarize an entity'));
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
    const data = await this.apiRequest('/entities', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    this.lastEntityKey = data.entity_key;
    this.sessionEntities.push(data.entity_key);
    this.saveResponse(data, 'create');

    // Track the entity
    this.trackEntity({
      key: data.entity_key,
      type: attributes?.type || 'manual',
      created_at: Date.now(),
      attributes,
      description: payload.substring(0, 50),
    });

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
    const data = await this.apiRequest(`/entities/${entityKey}`, {
      method: 'GET',
    });

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
    const data = await this.apiRequest(`/entities/${entityKey}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });

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
    const data = await this.apiRequest(`/entities/${entityKey}`, {
      method: 'DELETE',
    });

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

    // Untrack the entity
    this.untrackEntity(entityKey);
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
    const queryParams = new URLSearchParams({
      query,
      limit: limit.toString(),
      include_payload: includePayload.toString(),
    });
    const data = await this.apiRequest(`/entities/query?${queryParams}`, {
      method: 'GET',
    });

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
    const data = await this.apiRequest('/entities/transfer', {
      method: 'POST',
      body: JSON.stringify({
        entity_key: entityKey,
        new_owner: newOwner,
      }),
    });

    this.saveResponse(data, 'transfer');

    console.log(chalk.green('✓ Ownership transferred successfully!'));
    console.log('Old Owner: ' + chalk.dim(data.old_owner));
    console.log('New Owner: ' + chalk.cyan(data.new_owner));
    console.log('TX Hash: ' + chalk.dim(data.tx_hash));
  }

  private async monitorStash(args: string[]): Promise<void> {
    if (args.length === 0) {
      console.log(chalk.red('Error: Stash address required'));
      console.log(chalk.dim('Usage: monitor-stash <stash_address> [--interval <seconds>]'));
      return;
    }

    const stashAddress = args[0];
    let interval = 300; // default 5 minutes

    for (let i = 1; i < args.length; i++) {
      if (args[i] === '--interval' && i + 1 < args.length) {
        interval = parseInt(args[i + 1]);
        i++;
      }
    }

    // Stop any existing monitoring
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      console.log(chalk.yellow('Stopped previous monitoring'));
    }

    console.log(chalk.cyan(`\n=== Starting Stash Monitor ===`));
    console.log(chalk.dim(`Stash: ${stashAddress}`));
    console.log(chalk.dim(`Interval: ${interval} seconds\n`));

    try {
      // Initialize Polkadot client (using same pattern as test - chain asset hub too)
      console.log(chalk.dim('Connecting to Polkadot...'));
      const smoldot = start();
      const chain = await smoldot.addChain({ chainSpec: polkadot }).then((relay) =>
        smoldot.addChain({
          chainSpec: polkadot_asset_hub,
          potentialRelayChains: [relay],
        }),
      );
      const client = createClient(getSmProvider(chain));
      const api = client.getTypedApi(dot);
      const stakingSdk = createStakingSdk(client);

      console.log(chalk.green('✓ Connected to Polkadot\n'));

      // Function to fetch and store stash info
      const fetchAndStore = async () => {
        try {
          console.log(chalk.dim(`[${new Date().toLocaleTimeString()}] Fetching stash info...`));

          const stashInfo = await getStashInfo(stakingSdk, api, stashAddress);

          console.log(chalk.cyan('Balance:'));
          console.log(chalk.dim('  Total: ') + stashInfo.balance.total);
          console.log(chalk.dim('  Spendable: ') + stashInfo.balance.spendable);
          console.log(chalk.dim('  Locked: ') + stashInfo.balance.locked);
          console.log(chalk.dim('  Untouchable: ') + stashInfo.balance.untouchable);
          console.log(chalk.cyan('Active Era:'));
          console.log(chalk.dim('  Index: ') + stashInfo.activeEra.index);
          console.log(chalk.dim('  Start: ') + stashInfo.activeEra.start);

          const payload = JSON.stringify(stashInfo);
          const attributes = {
            type: 'polkadot-stash',
            stash_address: stashAddress,
            era: stashInfo.activeEra.index,
            timestamp: Date.now(),
          };

          if (!this.currentStashEntityKey) {
            // Create new entity
            console.log(chalk.dim('\nCreating entity in Arkiv...'));
            const createData = await this.apiRequest('/entities', {
              method: 'POST',
              body: JSON.stringify({
                payload: Buffer.from(payload).toString('hex'),
                content_type: 'application/json',
                attributes,
                ttl: 86400, // 1 day
              }),
            });

            this.currentStashEntityKey = createData.entity_key;
            this.lastEntityKey = createData.entity_key;
            this.sessionEntities.push(createData.entity_key);

            // Track the entity
            this.trackEntity({
              key: createData.entity_key,
              type: 'polkadot-stash',
              created_at: Date.now(),
              attributes,
              description: `Stash ${stashAddress.substring(0, 16)}...`,
            });

            console.log(chalk.green('✓ Entity created!'));
            console.log(chalk.dim('Entity Key: ') + chalk.cyan(createData.entity_key));
            console.log(chalk.dim('TX Hash: ') + createData.tx_hash);
          } else {
            // Update existing entity
            console.log(chalk.dim('\nUpdating entity in Arkiv...'));
            const updateData = await this.apiRequest(`/entities/${this.currentStashEntityKey}`, {
              method: 'PUT',
              body: JSON.stringify({
                payload: Buffer.from(payload).toString('hex'),
                attributes,
              }),
            });

            console.log(chalk.green('✓ Entity updated!'));
            console.log(chalk.dim('TX Hash: ') + updateData.tx_hash);
          }

          console.log(chalk.dim(`\nNext update in ${interval} seconds...\n`));
        } catch (error: any) {
          console.log(chalk.red('✗ Error fetching/storing stash info: ') + error.message);
        }
      };

      // Initial fetch
      await fetchAndStore();

      // Set up interval for subsequent fetches
      this.monitoringInterval = setInterval(fetchAndStore, interval * 1000);

      console.log(chalk.yellow('\nMonitoring started. Type any command to continue using the CLI.'));
      console.log(chalk.yellow('The monitor will continue in the background.'));
      console.log(chalk.yellow('To stop monitoring, restart the CLI or run another monitor-stash command.\n'));

    } catch (error: any) {
      console.log(chalk.red('✗ Error: ') + error.message);
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = null;
      }
    }
  }

  private listEntities(args: string[]): void {
    let typeFilter: string | null = null;
    let limit = 20;
    let fullKeys = false;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--type' && i + 1 < args.length) {
        typeFilter = args[i + 1];
        i++;
      } else if (args[i] === '--limit' && i + 1 < args.length) {
        limit = parseInt(args[i + 1]);
        i++;
      } else if (args[i] === '--full') {
        fullKeys = true;
      }
    }

    let entities = this.trackedEntities;

    // Filter by type if specified
    if (typeFilter) {
      entities = entities.filter(e => e.type === typeFilter);
    }

    // Limit results
    entities = entities.slice(0, limit);

    if (entities.length === 0) {
      console.log(chalk.dim('No tracked entities found'));
      if (typeFilter) {
        console.log(chalk.dim(`Try without --type filter or create entities with type "${typeFilter}"`));
      }
      return;
    }

    console.log(chalk.bold(`\nTracked Entities (${entities.length}):\n`));

    if (fullKeys) {
      // Full view - show complete keys and descriptions
      const headers = ['#', 'Key', 'Type', 'Created'];
      const rows = entities.map((entity, i) => {
        const timeAgo = this.getTimeAgo(entity.created_at);
        return [
          (i + 1).toString(),
          entity.key,
          entity.type || 'unknown',
          timeAgo,
        ];
      });

      this.printTable(headers, rows);

      // Show descriptions separately for full view
      console.log();
      entities.forEach((entity, i) => {
        if (entity.description) {
          console.log(chalk.dim(`${i + 1}. ${entity.description}`));
        }
      });
    } else {
      // Compact view - truncate keys and descriptions
      const headers = ['#', 'Key', 'Type', 'Created', 'Description'];
      const rows = entities.map((entity, i) => {
        const timeAgo = this.getTimeAgo(entity.created_at);
        return [
          (i + 1).toString(),
          entity.key.substring(0, 22) + '...',
          entity.type || 'unknown',
          timeAgo,
          (entity.description || '').substring(0, 30),
        ];
      });

      this.printTable(headers, rows);
    }

    console.log();
    console.log(chalk.dim(`Total tracked: ${this.trackedEntities.length}`));
    console.log(chalk.dim(`Use --full to see complete entity keys`));
    console.log(chalk.dim(`Entities file: ${this.entitiesFile}`));
  }

  private getTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return new Date(timestamp).toLocaleDateString();
  }

  private async explainEntity(args: string[]): Promise<void> {
    if (!this.openai) {
      console.log(chalk.red('Error: OpenAI API key not configured'));
      console.log(chalk.dim('Set OPENAI_API_KEY in your .env file to use this feature'));
      return;
    }

    if (args.length === 0) {
      console.log(chalk.red('Error: Entity key required'));
      console.log(chalk.dim('Usage: explain <entity_key> or explain last'));
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

    try {
      console.log(chalk.dim('Fetching entity...'));
      const data = await this.apiRequest(`/entities/${entityKey}`, {
        method: 'GET',
      });

      // Decode the hex payload
      const hexPayload = data.entity.payload || data.data;
      let decodedPayload: string;

      try {
        // Try to decode from hex
        const buffer = Buffer.from(hexPayload, 'hex');
        decodedPayload = buffer.toString('utf-8');
      } catch (e) {
        // If hex decoding fails, use as-is
        decodedPayload = hexPayload;
      }

      console.log(chalk.dim('Analyzing with AI...\n'));

      // Prepare context for the LLM
      const context = {
        key: data.entity.key,
        owner: data.entity.owner,
        content_type: data.entity.content_type,
        attributes: data.entity.attributes,
        payload: decodedPayload,
      };

      // Call OpenAI to explain
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that explains blockchain entity data stored in Arkiv (a decentralized storage system). Provide clear, concise summaries of the data.'
          },
          {
            role: 'user',
            content: `Please explain this entity:\n\n${JSON.stringify(context, null, 2)}\n\nProvide a summary of what this entity contains, its purpose, and any notable information.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const explanation = completion.choices[0].message.content;

      console.log(chalk.bold.cyan('AI Explanation:\n'));
      console.log(explanation);
      console.log();
      console.log(chalk.dim('─'.repeat(70)));
      console.log(chalk.dim(`Entity: ${entityKey.substring(0, 32)}...`));
      console.log(chalk.dim(`Type: ${data.entity.content_type}`));

    } catch (error: any) {
      console.log(chalk.red('✗ Error: ') + error.message);
    }
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
    console.log(chalk.bold('\nSpuro Agent - Interactive CLI for Spuro API\n'));
    console.log('Usage: spuro [--url <api_url>]');
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

  const shell = new SpuroAgentShell(baseUrl);
  await shell.start();
}

// Run main - this is a CLI tool
main().catch(console.error);

export { SpuroAgentShell };
