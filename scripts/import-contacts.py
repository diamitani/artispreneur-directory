#!/usr/bin/env python3
"""
import-contacts.py — Parse ALL real contact files in contacts/ and upload to DynamoDB.

Handles 8 distinct schemas:
  1. Music Blogs         (9 cols)  → type=blog
  2. Magazines/Outlets   (34 cols) → type=magazine
  3. Podcasts directory  (29 cols) → type=podcast   (CSV + corrupt .xls via calamine)
  4. Playlists           (14 cols, no header) → type=playlist
  5. Reviewers           (6 cols)  → type=press
  6. Newspapers          (50 cols) → type=newspaper
  7. Major US Newspapers (2 cols)  → type=newspaper
  8. Press Contacts      (4 cols)  → type=press

Usage:
  python3 import-contacts.py --dry-run          # preview counts only
  python3 import-contacts.py                    # parse + upload to DynamoDB
  python3 import-contacts.py --no-delete        # skip deleting fake data first
"""
import argparse
import glob
import json
import os
import re
import sys
import uuid
from collections import OrderedDict

import pandas as pd
from python_calamine import CalamineWorkbook

CONTACTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "contacts")
OUT_JSON = os.path.join(os.path.dirname(os.path.abspath(__file__)), "contacts-import.json")

US_STATES = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID",
    "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS",
    "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK",
    "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV",
    "WI", "WY", "DC",
}


def clean(v):
    """Clean a cell value to a string or empty."""
    if v is None:
        return ""
    if isinstance(v, float):
        if v != v:  # NaN
            return ""
        if v == int(v):
            return str(int(v))
        return str(v)
    s = str(v).strip()
    if s.lower() in ("n/a", "na", "null", "none", "nan", "#name?", ""):
        return ""
    return s


def read_df(f, **kwargs):
    """Read a CSV/XLSX with encoding fallback."""
    for enc in ("utf-8-sig", "cp1252", "latin-1"):
        try:
            return pd.read_csv(f, encoding=enc, **kwargs)
        except UnicodeDecodeError:
            continue
    raise ValueError(f"Could not decode {f}")


def make_id():
    return str(uuid.uuid4())


def parse_location(raw):
    """Best-effort split of a location string into city/state/country."""
    raw = clean(raw)
    if not raw:
        return "", "", ""
    parts = [p.strip() for p in raw.split(",")]
    parts = [p for p in parts if p]

    # Look for a US state code anywhere in the parts
    state = ""
    for p in parts:
        if p.upper() in US_STATES:
            state = p.upper()
            break

    # Country: last part if it's a known country word, else infer
    country_words = {"usa", "us", "u.s.a", "united states", "uk", "canada", "australia",
                     "germany", "france", "spain", "italy", "netherlands", "sweden",
                     "norway", "denmark", "finland", "belgium", "switzerland", "austria",
                     "portugal", "poland", "czech republic", "hungary", "romania", "greece",
                     "ireland", "japan", "south korea", "china", "india", "brazil",
                     "argentina", "colombia", "mexico", "chile", "peru", "nigeria", "kenya",
                     "south africa", "egypt", "uae", "israel", "singapore", "thailand",
                     "malaysia", "indonesia", "philippines", "hong kong", "taiwan", "new zealand"}

    country = ""
    if parts:
        last = parts[-1].lower().strip()
        if last in country_words:
            country = parts[-1].strip()
        elif state:
            country = "USA"

    # City: first part (or the part before state)
    city = parts[0] if parts else ""

    return city, state, country


# ═══════════════════════════════════════════════════════════════════════════════
# PARSERS
# ═══════════════════════════════════════════════════════════════════════════════

def parse_blogs():
    """Schema 1: BLOG NAME,WEBSITE,EMAIL,FIRST NAME,LAST NAME,GENRE,COUNTRY / LOCATION,TWITTER,DESCRIPTION"""
    out = []
    for f in sorted(glob.glob(os.path.join(CONTACTS_DIR, "MUSIC BLOGS _ *.csv"))):
        try:
            df = read_df(f, on_bad_lines="skip")
        except Exception:
            continue
        if "BLOG NAME" not in df.columns:
            continue
        for _, r in df.iterrows():
            name = clean(r.get("BLOG NAME"))
            if not name:
                continue
            loc = clean(r.get("COUNTRY / LOCATION"))
            city, state, country = parse_location(loc)
            c = {
                "id": make_id(),
                "name": name,
                "type": "blog",
                "location": loc,
                "city": city, "state": state, "country": country,
                "website": clean(r.get("WEBSITE")),
                "email": clean(r.get("EMAIL")),
                "genre": clean(r.get("GENRE")),
                "twitter": clean(r.get("TWITTER")),
                "description": clean(r.get("DESCRIPTION / AUTHORS WORDS")),
                "source_type": "music_blogs",
                "source_file": os.path.basename(f),
            }
            out.append(c)
    return out


def parse_media_outlets():
    """Schema 2: Member Type,Media Outlet,...,Email Address,Twitter handle,...,Website URL"""
    out = []
    seen = set()
    files = ["MUSIC MAGAZINES _ 500 ENTERTAINMENT MAGS.csv",
             "MUSIC BLOGS _ ENTERTAINMENT OUTLETS.csv"]
    for fn in files:
        f = os.path.join(CONTACTS_DIR, fn)
        if not os.path.exists(f):
            continue
        try:
            df = read_df(f, on_bad_lines="skip")
        except Exception:
            continue
        if "Media Outlet" not in df.columns:
            continue
        for _, r in df.iterrows():
            name = clean(r.get("Media Outlet"))
            email = clean(r.get("Email Address"))
            if not name:
                continue
            key = (name.lower(), email.lower())
            if key in seen:
                continue
            seen.add(key)
            loc = ", ".join(x for x in [clean(r.get("City")), clean(r.get("State")), clean(r.get("Country"))] if x)
            c = {
                "id": make_id(),
                "name": name,
                "type": "magazine",
                "location": loc or clean(r.get("Address Line 1")),
                "city": clean(r.get("City")),
                "state": clean(r.get("State")),
                "country": clean(r.get("Country")),
                "website": clean(r.get("Website URL")),
                "email": email,
                "phone": clean(r.get("Telephone")),
                "twitter": clean(r.get("Twitter handle")),
                "genre": clean(r.get("Sectors")),
                "description": clean(r.get("Media outlet note")) or clean(r.get("short note")),
                "source_type": "music_magazines",
                "source_file": os.path.basename(f),
            }
            out.append(c)
    return out


def parse_podcasts_directory():
    """Schema 3: directory_id,company,contact,type,email,...,website,genre,resource,notes,..."""
    out = []
    seen = set()
    files = glob.glob(os.path.join(CONTACTS_DIR, "MUSIC PODCASTS _ *.csv"))
    files += glob.glob(os.path.join(CONTACTS_DIR, "MUSIC PODCASTS _ *.xls"))
    for f in sorted(files):
        try:
            ext = os.path.splitext(f)[1].lower()
            if ext == ".csv":
                df = read_df(f, on_bad_lines="skip")
                if "company" not in df.columns:
                    continue  # playlist schema, not directory
                rows = df.to_dict("records")
            else:  # .xls via calamine
                wb = CalamineWorkbook.from_path(f)
                sheet = wb.get_sheet_by_name(wb.sheet_names[0])
                data = sheet.to_python()
                if not data:
                    continue
                header = [clean(h).lower() for h in data[0]]
                if "company" not in header:
                    continue
                rows = [dict(zip(header, [clean(x) for x in row])) for row in data[1:]]
            for r in rows:
                name = clean(r.get("company"))
                email = clean(r.get("email"))
                if not name:
                    continue
                key = (name.lower(), email.lower())
                if key in seen:
                    continue
                seen.add(key)
                loc = ", ".join(x for x in [clean(r.get("city")), clean(r.get("state")), clean(r.get("country"))] if x)
                c = {
                    "id": make_id(),
                    "name": name,
                    "type": "podcast",
                    "location": loc,
                    "city": clean(r.get("city")),
                    "state": clean(r.get("state")),
                    "country": clean(r.get("country")),
                    "website": clean(r.get("website")),
                    "email": email,
                    "phone": clean(r.get("phone")),
                    "genre": clean(r.get("genre")),
                    "description": clean(r.get("notes")),
                    "source_type": "music_podcasts",
                    "source_file": os.path.basename(f),
                }
                out.append(c)
        except Exception as e:
            print(f"  WARN {os.path.basename(f)}: {e}", file=sys.stderr)
    return out


def parse_playlists():
    """Schema 4: (no header) name,curator,email,location,genre,followers,song_count,desc,spotify,web,fb,ig,yt"""
    out = []
    seen = set()
    files = ["MUSIC PODCASTS _ AMERICANA, ALT COUNTRY.csv",
             "MUSIC PODCASTS _ CLASSICAL MUSIC.csv",
             "MUSIC PODCASTS _ WORLD MUSIC.csv"]
    for fn in files:
        f = os.path.join(CONTACTS_DIR, fn)
        if not os.path.exists(f):
            continue
        try:
            df = read_df(f, header=None, on_bad_lines="skip")
        except Exception:
            continue
        for _, r in df.iterrows():
            name = clean(r[0] if len(r) > 0 else "")
            if not name:
                continue
            playlist_link = clean(r[8] if len(r) > 8 else "")
            key = (name.lower(), playlist_link)
            if key in seen:
                continue
            seen.add(key)
            c = {
                "id": make_id(),
                "name": name,
                "type": "playlist",
                "curator_contact": clean(r[1] if len(r) > 1 else ""),
                "email": clean(r[2] if len(r) > 2 else ""),
                "location": clean(r[3] if len(r) > 3 else ""),
                "genre": clean(r[4] if len(r) > 4 else ""),
                "followers": clean(r[5] if len(r) > 5 else ""),
                "song_count": clean(r[6] if len(r) > 6 else ""),
                "description": clean(r[7] if len(r) > 7 else ""),
                "playlist_link": playlist_link,
                "website": clean(r[9] if len(r) > 9 else ""),
                "facebook": clean(r[10] if len(r) > 10 else ""),
                "instagram": clean(r[11] if len(r) > 11 else ""),
                "source_type": "spotify_playlists",
                "source_file": os.path.basename(f),
            }
            out.append(c)
    return out


def parse_reviewers():
    """Schema 5: Outlet name,Contact name,PotentialAudience,Contact Email,Job title,Contact phone number"""
    out = []
    files = glob.glob(os.path.join(CONTACTS_DIR, "MUSIC REVIEWERS _ *.csv"))
    files += glob.glob(os.path.join(CONTACTS_DIR, "MUSIC REVIEWERS _ *.xls"))
    for f in sorted(files):
        try:
            ext = os.path.splitext(f)[1].lower()
            if ext == ".csv":
                df = read_df(f, on_bad_lines="skip")
                if "Outlet name" not in df.columns:
                    continue
                rows = df.to_dict("records")
            else:
                wb = CalamineWorkbook.from_path(f)
                sheet = wb.get_sheet_by_name(wb.sheet_names[0])
                data = sheet.to_python()
                if not data:
                    continue
                header = [clean(h) for h in data[0]]
                rows = [dict(zip(header, [clean(x) for x in row])) for row in data[1:]]
            for r in rows:
                name = clean(r.get("Outlet name"))
                email = clean(r.get("Contact Email"))
                if not name:
                    continue
                c = {
                    "id": make_id(),
                    "name": name,
                    "type": "press",
                    "curator_contact": clean(r.get("Contact name")),
                    "email": email,
                    "phone": clean(r.get("Contact phone number")),
                    "genre": clean(r.get("Job title")),
                    "description": clean(r.get("PotentialAudience")),
                    "source_type": "music_reviewers",
                    "source_file": os.path.basename(f),
                }
                out.append(c)
        except Exception as e:
            print(f"  WARN {os.path.basename(f)}: {e}", file=sys.stderr)
    return out


def parse_newspapers():
    """Schema 6: id,outletname,contactitle,...,outletwebsite,... (50 cols)"""
    out = []
    seen = set()
    for fn in ["NEWSPAPERS _ EDITOR CONTACTS.csv"]:
        f = os.path.join(CONTACTS_DIR, fn)
        if not os.path.exists(f):
            continue
        try:
            df = read_df(f, on_bad_lines="skip")
        except Exception:
            continue
        if "outletname" not in df.columns:
            continue
        for _, r in df.iterrows():
            name = clean(r.get("outletname"))
            email = clean(r.get("contactemail"))
            if not name:
                continue
            key = (name.lower(), email.lower())
            if key in seen:
                continue
            seen.add(key)
            fn2 = f"{clean(r.get('contactfirstname'))} {clean(r.get('contactlastname'))}".strip()
            loc = ", ".join(x for x in [clean(r.get("outletcity")), clean(r.get("outletstate")), clean(r.get("outletcountry"))] if x)
            c = {
                "id": make_id(),
                "name": name,
                "type": "newspaper",
                "location": loc,
                "city": clean(r.get("outletcity")),
                "state": clean(r.get("outletstate")),
                "country": clean(r.get("outletcountry")),
                "website": clean(r.get("outletwebsite")),
                "email": email,
                "phone": clean(r.get("outletphonenumber")),
                "curator_contact": fn2,
                "genre": clean(r.get("contactitle")) or "All Genres",
                "description": clean(r.get("outletnewsfocus")) or clean(r.get("outletprofile")),
                "source_type": "newspapers",
                "source_file": os.path.basename(f),
            }
            out.append(c)
    # Major US newspapers (Schema 7: Company,Email)
    for fn in ["NEWSPAPERS _ MAJOR US NEWSPAPERS.csv"]:
        f = os.path.join(CONTACTS_DIR, fn)
        if not os.path.exists(f):
            continue
        try:
            df = read_df(f, on_bad_lines="skip")
        except Exception:
            continue
        for _, r in df.iterrows():
            name = clean(r.get("Company"))
            if not name:
                continue
            c = {
                "id": make_id(),
                "name": name,
                "type": "newspaper",
                "email": clean(r.get("Email")),
                "genre": "All Genres",
                "source_type": "major_newspapers",
                "source_file": os.path.basename(f),
            }
            out.append(c)
    return out


def parse_press_contacts():
    """Schema 8: PUBLICATION,Contact Name,Contact Number,Email (cp1252).
    NOTE: source has name/number swapped and a trailing space in 'PUBLICATION '."""
    out = []
    f = os.path.join(CONTACTS_DIR, "PRESS CONTACTS_ MASTER LIST.csv")
    if not os.path.exists(f):
        return out
    try:
        df = read_df(f, on_bad_lines="skip")
    except Exception:
        return out
    # Normalize column names (strip whitespace)
    df.columns = [str(c).strip() for c in df.columns]
    for _, r in df.iterrows():
        name = clean(r.get("PUBLICATION"))
        if not name:
            continue
        # Source has "Contact Name" = phone and "Contact Number" = name (swapped)
        contact_name = clean(r.get("Contact Number"))
        phone = clean(r.get("Contact Name"))
        c = {
            "id": make_id(),
            "name": name,
            "type": "press",
            "curator_contact": contact_name,
            "email": clean(r.get("Email")),
            "phone": phone,
            "genre": "All Genres",
            "source_type": "press_contacts",
            "source_file": os.path.basename(f),
        }
        out.append(c)
    return out


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Preview counts only")
    parser.add_argument("--no-delete", action="store_true", help="Skip deleting fake data")
    args = parser.parse_args()

    print("Parsing contact files...")
    parsers = OrderedDict([
        ("blogs", parse_blogs),
        ("magazines", parse_media_outlets),
        ("podcasts", parse_podcasts_directory),
        ("playlists", parse_playlists),
        ("reviewers", parse_reviewers),
        ("newspapers", parse_newspapers),
        ("press", parse_press_contacts),
    ])

    all_contacts = []
    for label, fn in parsers.items():
        try:
            rows = fn()
        except Exception as e:
            print(f"  ERROR {label}: {e}", file=sys.stderr)
            rows = []
        all_contacts.extend(rows)
        print(f"  {label}: {len(rows):,}")

    # Global dedupe by (name, email, type)
    deduped = []
    seen = set()
    for c in all_contacts:
        key = (c["name"].lower().strip(), c.get("email", "").lower().strip(), c["type"])
        if key in seen:
            continue
        seen.add(key)
        deduped.append(c)

    print(f"\nTotal parsed: {len(all_contacts):,}")
    print(f"After dedupe: {len(deduped):,}")

    # Type breakdown
    from collections import Counter
    by_type = Counter(c["type"] for c in deduped)
    print("\nType breakdown:")
    for t, n in by_type.most_common():
        print(f"  {t}: {n:,}")

    # Save JSON
    with open(OUT_JSON, "w") as f:
        json.dump(deduped, f)
    print(f"\nSaved {len(deduped):,} contacts to {OUT_JSON}")

    if args.dry_run:
        print("\n[DRY RUN] Not uploading. Run without --dry-run to upload.")
        return

    # Upload to DynamoDB
    import boto3
    dynamodb = boto3.client("dynamodb", region_name="us-east-1")
    TABLE = "artispreneur-directory"

    # Delete fake data for types we have real data for
    if not args.no_delete:
        fake_types = {"blog", "magazine", "podcast", "press", "newspaper", "playlist"}
        print(f"\nDeleting fake data for types: {sorted(fake_types)}...")
        resource = boto3.resource("dynamodb", region_name="us-east-1")
        table = resource.Table(TABLE)
        deleted = 0
        for t in fake_types:
            last = None
            while True:
                if last:
                    resp = table.scan(FilterExpression="#t = :t",
                                      ExpressionAttributeNames={"#t": "type"},
                                      ExpressionAttributeValues={":t": t},
                                      ExclusiveStartKey=last)
                else:
                    resp = table.scan(FilterExpression="#t = :t",
                                      ExpressionAttributeNames={"#t": "type"},
                                      ExpressionAttributeValues={":t": t})
                items = resp.get("Items", [])
                with table.batch_writer() as batch:
                    for item in items:
                        batch.delete_item(Key={"id": item["id"]})
                        deleted += 1
                last = resp.get("LastEvaluatedKey")
                if not last:
                    break
                if deleted % 1000 == 0:
                    print(f"  deleted {deleted:,}...")
        print(f"  Deleted {deleted:,} fake items")

    # Upload real data in batches of 25
    print(f"\nUploading {len(deduped):,} real contacts...")
    def ddb_item(c):
        item = {}
        for k, v in c.items():
            if v is None or v == "":
                continue
            item[k] = {"S": str(v)[:4000]}
        return item

    BATCH = 25
    uploaded = 0
    for i in range(0, len(deduped), BATCH):
        chunk = deduped[i:i+BATCH]
        dynamodb.batch_write_item(RequestItems={TABLE: [{"PutRequest": {"Item": ddb_item(c)}} for c in chunk]})
        uploaded += len(chunk)
        if uploaded % 5000 == 0 or uploaded == len(deduped):
            print(f"  uploaded {uploaded:,}/{len(deduped):,}")

    print(f"\nDone! Uploaded {uploaded:,} real contacts to DynamoDB.")


if __name__ == "__main__":
    main()
