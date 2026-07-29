import json
import os
import boto3
import base64
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError

dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
TABLE_NAME = os.environ.get("TABLE_NAME", "artispreneur-directory")
table = dynamodb.Table(TABLE_NAME)

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Content-Type": "application/json",
}

PAGE_SIZE = 24

STATIC_STATS = {
    "totalContacts": 79000,
    "radioStations": 50000,
    "venues": 6900,
    "playlists": 4500,
    "byType": {
        "radio": 50000,
        "venue": 6900,
        "playlist": 4500,
        "record_label": 4100,
        "blog": 3200,
        "podcast": 2800,
        "press": 2400,
        "magazine": 1800,
        "newspaper": 1200,
        "distributor": 600,
        "publisher": 400,
        "licensing_library": 100,
        "resource": 1000,
    }
}


def make_response(status, body):
    return {
        "statusCode": status,
        "headers": CORS,
        "body": json.dumps(body, default=str),
    }


def scan_contacts(type_filter=None, genre_filter=None, query=None, last_key=None, limit=PAGE_SIZE):
    kwargs = {}
    if last_key:
        kwargs["ExclusiveStartKey"] = last_key

    filter_parts = []
    expr_names = {}
    expr_values = {}

    if type_filter and type_filter != "all":
        filter_parts.append("#tp = :type")
        expr_names["#tp"] = "type"
        expr_values[":type"] = type_filter

    if genre_filter and genre_filter.strip():
        filter_parts.append("contains(#genre, :genre)")
        expr_names["#genre"] = "genre"
        expr_values[":genre"] = genre_filter.strip()

    if query and query.strip():
        q = query.strip()
        filter_parts.append(
            "(contains(#nm, :q) OR contains(#loc, :q) OR contains(#desc, :q)"
            " OR contains(#genre, :q) OR contains(#curator, :q))"
        )
        expr_names["#nm"] = "name"
        expr_names["#loc"] = "location"
        expr_names["#desc"] = "description"
        if "#genre" not in expr_names:
            expr_names["#genre"] = "genre"
        expr_names["#curator"] = "curator_contact"
        expr_values[":q"] = q

    if filter_parts:
        kwargs["FilterExpression"] = " AND ".join(filter_parts)
    if expr_names:
        kwargs["ExpressionAttributeNames"] = expr_names
    if expr_values:
        kwargs["ExpressionAttributeValues"] = expr_values

    items = []
    last_evaluated = None
    max_rounds = 15

    for _ in range(max_rounds):
        try:
            result = table.scan(**kwargs)
        except ClientError as e:
            print(f"DynamoDB scan error: {e}")
            break

        items.extend(result.get("Items", []))
        last_evaluated = result.get("LastEvaluatedKey")

        if len(items) >= limit or not last_evaluated:
            break

        kwargs["ExclusiveStartKey"] = last_evaluated

    return items[:limit], last_evaluated


def lambda_handler(event, context):
    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    params = event.get("queryStringParameters") or {}

    if method == "OPTIONS":
        return make_response(200, {})

    # GET /stats
    if path.endswith("/stats"):
        return make_response(200, STATIC_STATS)

    # GET /contacts or /directory
    if "/contacts" in path or "/directory" in path or "/playlists" in path:
        type_filter = params.get("type", "all")
        genre_filter = params.get("genre")
        query = params.get("q", "")
        cursor = params.get("cursor")

        # /playlists defaults to type=playlist
        if "/playlists" in path and type_filter == "all":
            type_filter = "playlist"

        last_key = None
        if cursor:
            try:
                last_key = json.loads(base64.b64decode(cursor).decode())
            except Exception:
                last_key = None

        items, next_key = scan_contacts(
            type_filter=type_filter,
            genre_filter=genre_filter,
            query=query,
            last_key=last_key,
            limit=PAGE_SIZE,
        )

        next_cursor = None
        if next_key:
            next_cursor = base64.b64encode(
                json.dumps(next_key, default=str).encode()
            ).decode()

        return make_response(200, {
            "items": items,
            "count": len(items),
            "nextCursor": next_cursor,
            "hasMore": next_cursor is not None,
        })

    # GET /contact/{id}
    if "/contact/" in path:
        contact_id = path.split("/contact/")[-1].strip("/")
        try:
            result = table.get_item(Key={"id": contact_id})
            item = result.get("Item")
            if item:
                return make_response(200, item)
            return make_response(404, {"error": "Not found"})
        except ClientError as e:
            return make_response(500, {"error": str(e)})

    return make_response(404, {"error": "Route not found"})
