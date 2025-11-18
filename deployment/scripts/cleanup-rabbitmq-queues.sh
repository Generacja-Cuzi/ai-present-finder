#!/bin/bash
# Cleanup script for orphaned RabbitMQ queues
# This script deletes all auto-generated queues (amq.gen-*) that have no consumers

set -e

RABBITMQ_CONTAINER="${1:-rabbitmq}"

echo "🧹 Cleaning up orphaned RabbitMQ queues..."
echo "Container: $RABBITMQ_CONTAINER"
echo ""

# Get list of all queues matching amq.gen-* pattern
ORPHANED_QUEUES=$(docker exec "$RABBITMQ_CONTAINER" rabbitmqctl list_queues -q name consumers | \
  grep "^amq.gen-" | \
  awk '$2 == 0 {print $1}')

if [ -z "$ORPHANED_QUEUES" ]; then
  echo "✅ No orphaned queues found!"
  exit 0
fi

QUEUE_COUNT=$(echo "$ORPHANED_QUEUES" | wc -l | tr -d ' ')
echo "Found $QUEUE_COUNT orphaned queues with 0 consumers"
echo ""

# Confirm deletion
read -p "Delete these queues? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Aborted"
  exit 1
fi

# Delete each queue
DELETED=0
FAILED=0

while IFS= read -r queue; do
  echo -n "Deleting $queue... "
  if docker exec "$RABBITMQ_CONTAINER" rabbitmqctl delete_queue "$queue" > /dev/null 2>&1; then
    echo "✓"
    ((DELETED++))
  else
    echo "✗"
    ((FAILED++))
  fi
done <<< "$ORPHANED_QUEUES"

echo ""
echo "📊 Summary:"
echo "  ✅ Deleted: $DELETED queues"
echo "  ❌ Failed:  $FAILED queues"
echo ""

# Show current memory usage
echo "💾 Current RabbitMQ memory usage:"
docker exec "$RABBITMQ_CONTAINER" rabbitmqctl status | grep -A 3 "Total memory used"
