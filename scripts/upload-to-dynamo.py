#!/usr/bin/env python3
"""
Upload 78,000 contacts to DynamoDB artispreneur-directory table.
Uses batch_write_item (25 items per request, max throughput).
Runs 4 parallel threads to saturate the 50 WCU provisioned.
"""
import json, sys, os, time, threading, math
import boto3
from botocore.exceptions import ClientError

TABLE = "artispreneur-directory"
REGION = "us-east-1"
BATCH_SIZE = 25
THREADS = 4

def dynamo_item(c):
    """Convert contact dict to DynamoDB item format."""
    item = {}
    for k, v in c.items():
        if v is None or v == "":
            continue
        item[k] = {"S": str(v)}
    return item

def upload_batch(dynamodb, items, retries=5):
    for attempt in range(retries):
        try:
            resp = dynamodb.batch_write_item(
                RequestItems={
                    TABLE: [{"PutRequest": {"Item": dynamo_item(item)}} for item in items]
                }
            )
            unprocessed = resp.get("UnprocessedItems", {}).get(TABLE, [])
            if unprocessed:
                time.sleep(0.5 * (attempt + 1))
                # retry unprocessed
                resp2 = dynamodb.batch_write_item(RequestItems={TABLE: unprocessed})
            return True
        except ClientError as e:
            code = e.response["Error"]["Code"]
            if code in ("ProvisionedThroughputExceededException", "ThrottlingException"):
                wait = 2 ** attempt
                print(f"  Throttled, waiting {wait}s...")
                time.sleep(wait)
            else:
                print(f"  Error: {e}")
                return False
    return False

def worker(thread_id, chunks, dynamodb, counter, counter_lock, total):
    for chunk in chunks:
        success = upload_batch(dynamodb, chunk)
        with counter_lock:
            counter[0] += len(chunk)
            pct = counter[0] / total * 100
            sys.stdout.write(f"\r  Progress: {counter[0]:,}/{total:,} ({pct:.1f}%) [{threading.active_count()} threads]   ")
            sys.stdout.flush()
        if not success:
            print(f"\n  Thread {thread_id} batch failed, continuing...")
        # Small throttle between batches per thread
        time.sleep(0.05)

def main():
    data_file = os.path.join(os.path.dirname(__file__), "contacts.json")
    print(f"Loading contacts from {data_file}...")
    with open(data_file) as f:
        contacts = json.load(f)
    
    total = len(contacts)
    print(f"Total contacts to upload: {total:,}")
    
    # Wait for table to be active
    dynamodb = boto3.client("dynamodb", region_name=REGION)
    print("Waiting for table to be ACTIVE...")
    waiter = dynamodb.get_waiter("table_exists")
    waiter.wait(TableName=TABLE, WaiterConfig={"Delay": 5, "MaxAttempts": 30})
    print("Table is ACTIVE.")
    
    # Split into batches of 25
    batches = [contacts[i:i+BATCH_SIZE] for i in range(0, total, BATCH_SIZE)]
    print(f"Total batches: {len(batches):,}")
    
    # Split batches across threads
    chunk_size = math.ceil(len(batches) / THREADS)
    thread_chunks = [batches[i:i+chunk_size] for i in range(0, len(batches), chunk_size)]
    
    counter = [0]
    counter_lock = threading.Lock()
    threads = []
    
    start = time.time()
    print(f"Starting upload with {THREADS} threads...")
    
    for i, chunks in enumerate(thread_chunks):
        t = threading.Thread(
            target=worker,
            args=(i, chunks, dynamodb, counter, counter_lock, total),
            daemon=True
        )
        threads.append(t)
        t.start()
    
    for t in threads:
        t.join()
    
    elapsed = time.time() - start
    print(f"\n\nUpload complete!")
    print(f"  Uploaded: {counter[0]:,} contacts")
    print(f"  Time: {elapsed:.1f}s ({counter[0]/elapsed:.0f} items/sec)")
    
    # Verify count
    resp = dynamodb.describe_table(TableName=TABLE)
    item_count = resp["Table"]["ItemCount"]
    print(f"  DynamoDB item count (may lag): {item_count:,}")
    print("Done.")

if __name__ == "__main__":
    main()
