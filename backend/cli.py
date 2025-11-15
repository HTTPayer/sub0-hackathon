#!/usr/bin/env python3
"""
CLI tool to interact with Arkiv API endpoints
"""

import click
import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")


@click.group()
@click.option('--url', default=API_BASE_URL, help='API base URL')
@click.pass_context
def cli(ctx, url):
    """Arkiv API CLI - Interact with Arkiv entities via API"""
    ctx.ensure_object(dict)
    ctx.obj['BASE_URL'] = url


@cli.command()
@click.option('--payload', required=True, help='Entity payload (text)')
@click.option('--content-type', default='text/plain', help='Content type')
@click.option('--attributes', type=str, help='JSON string of attributes')
@click.option('--ttl', default=86400, type=int, help='Time to live in seconds')
@click.pass_context
def create(ctx, payload, content_type, attributes, ttl):
    """Create a new entity"""
    base_url = ctx.obj['BASE_URL']

    # Parse attributes if provided
    attrs = None
    if attributes:
        try:
            attrs = json.loads(attributes)
        except json.JSONDecodeError:
            click.echo("Error: attributes must be valid JSON", err=True)
            return

    # Prepare request body
    body = {
        "payload": payload.encode().hex(),  # Send as hex
        "content_type": content_type,
        "ttl": ttl
    }

    if attrs:
        body["attributes"] = attrs

    try:
        response = requests.post(
            f"{base_url}/entities",
            json=body,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()

        data = response.json()
        click.echo(click.style("✓ Entity created successfully!", fg='green'))
        click.echo(f"Entity Key: {data.get('entity_key')}")
        click.echo(f"TX Hash: {data.get('tx_hash')}")

    except requests.exceptions.RequestException as e:
        click.echo(click.style(f"✗ Error: {e}", fg='red'), err=True)
        if hasattr(e.response, 'text'):
            click.echo(e.response.text, err=True)


@cli.command()
@click.argument('entity_key')
@click.pass_context
def read(ctx, entity_key):
    """Read an entity by key"""
    base_url = ctx.obj['BASE_URL']

    try:
        response = requests.get(f"{base_url}/entities/{entity_key}")
        response.raise_for_status()

        data = response.json()
        click.echo(click.style("✓ Entity retrieved successfully!", fg='green'))
        click.echo(f"\nData: {data.get('data')}")

        entity = data.get('entity', {})
        click.echo(f"\nEntity Details:")
        click.echo(f"  Key: {entity.get('key')}")
        click.echo(f"  Owner: {entity.get('owner')}")
        click.echo(f"  Content Type: {entity.get('content_type')}")
        click.echo(f"  Attributes: {json.dumps(entity.get('attributes', {}), indent=2)}")

    except requests.exceptions.RequestException as e:
        click.echo(click.style(f"✗ Error: {e}", fg='red'), err=True)
        if hasattr(e.response, 'text'):
            click.echo(e.response.text, err=True)


@cli.command()
@click.argument('entity_key')
@click.option('--payload', help='New payload (text)')
@click.option('--content-type', help='New content type')
@click.option('--attributes', type=str, help='JSON string of new attributes')
@click.option('--ttl', type=int, help='New time to live in seconds')
@click.pass_context
def update(ctx, entity_key, payload, content_type, attributes, ttl):
    """Update an entity"""
    base_url = ctx.obj['BASE_URL']

    # Build request body with only provided fields
    body = {}

    if payload:
        body["payload"] = payload.encode().hex()

    if content_type:
        body["content_type"] = content_type

    if attributes:
        try:
            body["attributes"] = json.loads(attributes)
        except json.JSONDecodeError:
            click.echo("Error: attributes must be valid JSON", err=True)
            return

    if ttl:
        body["ttl"] = ttl

    if not body:
        click.echo("Error: At least one field must be provided to update", err=True)
        return

    try:
        response = requests.put(
            f"{base_url}/entities/{entity_key}",
            json=body,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()

        data = response.json()
        click.echo(click.style("✓ Entity updated successfully!", fg='green'))
        click.echo(f"Entity Key: {data.get('entity_key')}")
        click.echo(f"TX Hash: {data.get('tx_hash')}")

    except requests.exceptions.RequestException as e:
        click.echo(click.style(f"✗ Error: {e}", fg='red'), err=True)
        if hasattr(e.response, 'text'):
            click.echo(e.response.text, err=True)


@cli.command()
@click.argument('entity_key')
@click.pass_context
def delete(ctx, entity_key):
    """Delete an entity"""
    base_url = ctx.obj['BASE_URL']

    # Confirm deletion
    if not click.confirm(f'Are you sure you want to delete entity {entity_key}?'):
        click.echo("Deletion cancelled")
        return

    try:
        response = requests.delete(f"{base_url}/entities/{entity_key}")
        response.raise_for_status()

        data = response.json()
        click.echo(click.style("✓ Entity deleted successfully!", fg='green'))
        click.echo(f"Entity Key: {data.get('entity_key')}")
        click.echo(f"TX Hash: {data.get('tx_hash')}")

    except requests.exceptions.RequestException as e:
        click.echo(click.style(f"✗ Error: {e}", fg='red'), err=True)
        if hasattr(e.response, 'text'):
            click.echo(e.response.text, err=True)


@cli.command()
@click.option('--query', required=True, help='Query string (e.g., type = "user")')
@click.option('--limit', default=20, type=int, help='Maximum results')
@click.option('--include-payload', is_flag=True, help='Include payload in results')
@click.pass_context
def query(ctx, query, limit, include_payload):
    """Query entities"""
    base_url = ctx.obj['BASE_URL']

    try:
        params = {
            'query': query,
            'limit': limit,
            'include_payload': include_payload
        }

        response = requests.get(
            f"{base_url}/entities/query",
            params=params
        )
        response.raise_for_status()

        data = response.json()
        click.echo(click.style(f"✓ Query completed successfully!", fg='green'))
        click.echo(f"Query: {data.get('query')}")
        click.echo(f"Count: {data.get('count')}")

        results = data.get('results', [])
        if results:
            click.echo("\nResults:")
            for i, result in enumerate(results, 1):
                click.echo(f"\n{i}. Key: {result.get('key')}")
                click.echo(f"   Attributes: {json.dumps(result.get('attributes', {}), indent=2)}")
                if include_payload and 'payload' in result:
                    click.echo(f"   Payload: {result.get('payload')}")
        else:
            click.echo("\nNo results found")

    except requests.exceptions.RequestException as e:
        click.echo(click.style(f"✗ Error: {e}", fg='red'), err=True)
        if hasattr(e.response, 'text'):
            click.echo(e.response.text, err=True)


@cli.command()
@click.argument('entity_key')
@click.option('--new-owner', required=True, help='New owner wallet address')
@click.pass_context
def transfer(ctx, entity_key, new_owner):
    """Transfer entity ownership"""
    base_url = ctx.obj['BASE_URL']

    # Confirm transfer
    if not click.confirm(f'Transfer ownership of {entity_key} to {new_owner}?'):
        click.echo("Transfer cancelled")
        return

    try:
        body = {
            "entity_key": entity_key,
            "new_owner": new_owner
        }

        response = requests.post(
            f"{base_url}/entities/transfer",
            json=body,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()

        data = response.json()
        click.echo(click.style("✓ Ownership transferred successfully!", fg='green'))
        click.echo(f"Entity Key: {data.get('entity_key')}")
        click.echo(f"Old Owner: {data.get('old_owner')}")
        click.echo(f"New Owner: {data.get('new_owner')}")
        click.echo(f"TX Hash: {data.get('tx_hash')}")

    except requests.exceptions.RequestException as e:
        click.echo(click.style(f"✗ Error: {e}", fg='red'), err=True)
        if hasattr(e.response, 'text'):
            click.echo(e.response.text, err=True)


@cli.command()
@click.pass_context
def health(ctx):
    """Check API health"""
    base_url = ctx.obj['BASE_URL']

    try:
        response = requests.get(f"{base_url}/")
        response.raise_for_status()

        data = response.json()
        click.echo(click.style("✓ API is healthy!", fg='green'))
        click.echo(f"Message: {data.get('message')}")
        click.echo(f"Status: {data.get('status')}")

    except requests.exceptions.RequestException as e:
        click.echo(click.style(f"✗ API is not responding: {e}", fg='red'), err=True)


if __name__ == '__main__':
    cli(obj={})
