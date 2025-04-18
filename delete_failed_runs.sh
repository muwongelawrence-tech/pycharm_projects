#!/bin/bash

REPO="muwongelawrence-tech/pycharm_projects"

echo "Fetching failed workflow runs for repository: $REPO"
gh run list --repo "$REPO" --status cancelled --json databaseId | jq -r '.[].databaseId' | while read -r run_id; do
  if [[ -n "$run_id" ]]; then
    echo "Submitting deletion request for run ID: $run_id"
    gh run delete "$run_id" --repo "$REPO"
    sleep 2  # Add a small delay to avoid API rate limits
  else
    echo "⚠️ No failed workflow runs found."
  fi
done

echo "✅ Deletion requests have been sent for all failed workflow runs!"
