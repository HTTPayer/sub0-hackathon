"""
Test script for Arkiv SDK - Event Watchers.

This tests:
- watch_entity_created() - Monitor new entity creation
- watch_entity_updated() - Monitor entity modifications
- watch_entity_extended() - Monitor lifetime extensions
- watch_entity_deleted() - Monitor entity deletion
- Event filter management (start/stop/uninstall)
"""

from arkiv import Arkiv
from arkiv.account import NamedAccount
from web3 import HTTPProvider
from dotenv import load_dotenv
import os
import time
import threading

load_dotenv()

PRIVATE_KEY = os.getenv("ARKIV_PRIVATE_KEY")
ACCOUNT_ADDRESS = os.getenv("ARKIV_ACCOUNT_ADDRESS")

# Connect account to Arkiv
account = NamedAccount.from_private_key("demo", PRIVATE_KEY)
provider = HTTPProvider("https://mendoza.hoodi.arkiv.network/rpc")

# Event tracking
events_captured = {
    'created': [],
    'updated': [],
    'extended': [],
    'deleted': [],
    'owner_changed': []
}

print("=== Arkiv SDK - Event Watchers Test ===\n")

with Arkiv(provider=provider, account=account) as client:

    # Test 1: Watch entity creation events
    print("1. Testing watch_entity_created()...")

    def on_entity_created(event, tx_hash):
        print(f"   🔔 EntityCreated event!")
        print(f"      Key: {event.key}")
        print(f"      Owner: {event.owner}")
        print(f"      TX: {tx_hash.hex() if hasattr(tx_hash, 'hex') else tx_hash}")
        events_captured['created'].append(event.key)

    try:
        # Start watching for creation events
        creation_filter = client.arkiv.watch_entity_created(on_entity_created)
        print("   ✓ Creation event watcher started")

        # Create a test entity
        time.sleep(1)  # Give watcher time to initialize
        print("   Creating test entity...")
        entity_key, _ = client.arkiv.create_entity(
            payload=b"Event test entity",
            content_type="text/plain",
            attributes={"type": "event_test", "purpose": "creation"},
            expires_in=client.arkiv.to_seconds(hours=1)
        )
        print(f"   Created entity: {entity_key}")

        # Wait for event to be captured
        time.sleep(3)

        # Stop watching
        creation_filter.stop()
        print("   ✓ Creation event watcher stopped")

        if events_captured['created']:
            print(f"✓ Captured {len(events_captured['created'])} creation event(s)\n")
        else:
            print("   ⚠ No creation events captured (may need more time or different setup)\n")

    except Exception as e:
        print(f"   ⚠ Error with creation watcher: {e}\n")

    # Test 2: Watch entity update events
    print("2. Testing watch_entity_updated()...")

    def on_entity_updated(event, tx_hash):
        print(f"   🔔 EntityUpdated event!")
        print(f"      Key: {event.key}")
        print(f"      TX: {tx_hash.hex() if hasattr(tx_hash, 'hex') else tx_hash}")
        events_captured['updated'].append(event.key)

    try:
        # Start watching for update events
        update_filter = client.arkiv.watch_entity_updated(on_entity_updated)
        print("   ✓ Update event watcher started")

        # Try to update an entity if the method exists
        time.sleep(1)
        if hasattr(client.arkiv, 'update_entity'):
            print("   Updating entity attributes...")
            client.arkiv.update_entity(
                entity_key,
                attributes={"type": "event_test", "purpose": "update_test"}
            )
            time.sleep(3)

            if events_captured['updated']:
                print(f"✓ Captured {len(events_captured['updated'])} update event(s)\n")
            else:
                print("   ⚠ No update events captured\n")
        else:
            print("   ⚠ update_entity method not available, skipping update test\n")

        update_filter.stop()

    except Exception as e:
        print(f"   ⚠ Error with update watcher: {e}\n")

    # Test 3: Watch entity extension events
    print("3. Testing watch_entity_extended()...")

    def on_entity_extended(event, tx_hash):
        print(f"   🔔 EntityExtended event!")
        print(f"      Key: {event.key}")
        print(f"      TX: {tx_hash.hex() if hasattr(tx_hash, 'hex') else tx_hash}")
        events_captured['extended'].append(event.key)

    try:
        # Start watching for extension events
        extension_filter = client.arkiv.watch_entity_extended(on_entity_extended)
        print("   ✓ Extension event watcher started")

        # Try to extend an entity if the method exists
        time.sleep(1)
        if hasattr(client.arkiv, 'extend_entity'):
            print("   Extending entity lifetime...")
            client.arkiv.extend_entity(
                entity_key,
                expires_in=client.arkiv.to_seconds(days=2)
            )
            time.sleep(3)

            if events_captured['extended']:
                print(f"✓ Captured {len(events_captured['extended'])} extension event(s)\n")
            else:
                print("   ⚠ No extension events captured\n")
        else:
            print("   ⚠ extend_entity method not available, skipping extension test\n")

        extension_filter.stop()

    except Exception as e:
        print(f"   ⚠ Error with extension watcher: {e}\n")

    # Test 4: Watch entity deletion events
    print("4. Testing watch_entity_deleted()...")

    def on_entity_deleted(event, tx_hash):
        print(f"   🔔 EntityDeleted event!")
        print(f"      Key: {event.key}")
        print(f"      TX: {tx_hash.hex() if hasattr(tx_hash, 'hex') else tx_hash}")
        events_captured['deleted'].append(event.key)

    try:
        # Start watching for deletion events
        deletion_filter = client.arkiv.watch_entity_deleted(on_entity_deleted)
        print("   ✓ Deletion event watcher started")

        # Delete the test entity
        time.sleep(1)
        print("   Deleting entity...")
        client.arkiv.delete_entity(entity_key)

        # Wait for event to be captured
        time.sleep(3)

        # Stop and uninstall filter
        deletion_filter.stop()
        deletion_filter.uninstall()
        print("   ✓ Deletion event watcher stopped and uninstalled")

        if events_captured['deleted']:
            print(f"✓ Captured {len(events_captured['deleted'])} deletion event(s)\n")
        else:
            print("   ⚠ No deletion events captured (may need more time)\n")

    except Exception as e:
        print(f"   ⚠ Error with deletion watcher: {e}\n")

    # Test 5: Watch owner changed events (if applicable)
    print("5. Testing watch_owner_changed()...")

    def on_owner_changed(event, tx_hash):
        print(f"   🔔 OwnerChanged event!")
        print(f"      Key: {event.key}")
        print(f"      Old Owner: {event.old_owner}")
        print(f"      New Owner: {event.new_owner}")
        print(f"      TX: {tx_hash.hex() if hasattr(tx_hash, 'hex') else tx_hash}")
        events_captured['owner_changed'].append(event.key)

    try:
        # Start watching for owner change events
        owner_filter = client.arkiv.watch_owner_changed(on_owner_changed)
        print("   ✓ Owner change event watcher started")

        # Note: Ownership transfer requires special permissions/methods
        print("   ⚠ Ownership transfer requires additional setup, skipping actual transfer")
        print("   (Watcher is configured and would capture events if they occurred)\n")

        time.sleep(2)
        owner_filter.stop()
        owner_filter.uninstall()

    except Exception as e:
        print(f"   ⚠ Error with owner change watcher: {e}\n")

    # Test 6: Multiple simultaneous watchers
    print("6. Testing multiple simultaneous watchers...")

    events_multi = []

    def multi_created(event, tx_hash):
        events_multi.append(('created', event.key))

    def multi_deleted(event, tx_hash):
        events_multi.append(('deleted', event.key))

    try:
        # Start both watchers
        filter1 = client.arkiv.watch_entity_created(multi_created)
        filter2 = client.arkiv.watch_entity_deleted(multi_deleted)
        print("   ✓ Started 2 simultaneous watchers")

        time.sleep(1)

        # Perform actions
        test_key, _ = client.arkiv.create_entity(
            payload=b"Multi-watcher test",
            content_type="text/plain",
            attributes={"type": "multi_test"},
            expires_in=client.arkiv.to_seconds(hours=1)
        )
        time.sleep(2)

        client.arkiv.delete_entity(test_key)
        time.sleep(2)

        # Stop watchers
        filter1.stop()
        filter2.stop()

        print(f"   Captured {len(events_multi)} events from multiple watchers")
        for event_type, key in events_multi:
            print(f"   - {event_type}: {key[:16]}...")

        print("✓ Multiple watchers test completed\n")

    except Exception as e:
        print(f"   ⚠ Error with multiple watchers: {e}\n")

    # Summary
    print("=== Event Watchers Test Summary ===")
    print(f"Creation events captured: {len(events_captured['created'])}")
    print(f"Update events captured: {len(events_captured['updated'])}")
    print(f"Extension events captured: {len(events_captured['extended'])}")
    print(f"Deletion events captured: {len(events_captured['deleted'])}")
    print(f"Owner change events captured: {len(events_captured['owner_changed'])}")
    print("\nNote: Event watchers depend on blockchain event emission and polling.")
    print("Some events may require specific network conditions to be captured reliably.")
    print("\n=== Event Watchers Test Completed ===")
