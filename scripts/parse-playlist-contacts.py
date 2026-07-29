#!/usr/bin/env python3
"""
parse-playlist-contacts.py — Parse Google Sheet TSV/CSV playlist data
into DynamoDB-compatible JSON format for the artispreneur-directory.

Input: TSV file with 26 columns:
  playlist_name, curator_contact, email, normalized_email,
  verification_verdict, verification_confidence, smtp_status,
  smtp_host, mx_hosts, verification_detail, location, genres,
  followers, song_count, description, playlist_link, website,
  facebook, twitter, instagram, youtube, source_folder,
  source_file, source_path, source_type, source_url, source_notes

Output: contacts.json — array of DynamoDB-compatible objects
  merges into the existing artispreneur-directory Contact schema
  with type='playlist' and extended fields.
"""
import csv
import json
import sys
import os
import uuid
from pathlib import Path

# Column mapping from TSV header to Contact schema
# TSV column -> Contact field (None = skip/minor field, store as-is)
COLUMN_MAP = {
    "playlist_name": "name",
    "curator_contact": "curator_contact",
    "email": "email",
    "normalized_email": None,  # skip, use main email
    "verification_verdict": "verification_verdict",
    "verification_confidence": "verification_confidence",
    "smtp_status": None,  # skip
    "smtp_host": None,  # skip
    "mx_hosts": None,  # skip
    "verification_detail": "verification_detail",
    "location": "location",
    "genres": "genre",  # rename to match Contact schema
    "followers": "followers",
    "song_count": "song_count",
    "description": "description",
    "playlist_link": "playlist_link",
    "website": "website",
    "facebook": "facebook",
    "twitter": "twitter",
    "instagram": "instagram",
    "youtube": "youtube",
    "source_folder": None,
    "source_file": None,
    "source_path": None,
    "source_type": "source_type",
    "source_url": "source_url",
    "source_notes": "source_notes",
}


def parse_tsv(filepath: str) -> list[dict]:
    """Parse TSV/CSV file into list of contact dicts."""
    contacts = []
    
    with open(filepath, "r", encoding="utf-8-sig") as f:
        # Detect delimiter
        first_line = f.readline()
        f.seek(0)
        
        if "\t" in first_line:
            delimiter = "\t"
        else:
            delimiter = ","
        
        reader = csv.DictReader(f, delimiter=delimiter)
        headers = reader.fieldnames or []
        
        # Try to match headers (case-insensitive, whitespace-trimmed)
        header_mapping = {}
        for h in headers:
            cleaned = h.strip().lower().replace(" ", "_")
            for expected in COLUMN_MAP:
                if expected.lower().replace(" ", "_") == cleaned:
                    header_mapping[h] = expected
                    break
        
        for row in reader:
            contact = {
                "id": str(uuid.uuid4()),
                "type": "playlist",
                "verified": True,
            }
            
            for raw_header, value in row.items():
                value = value.strip() if value else ""
                if not value or value in ("#NAME?", "N/A", "null", "None"):
                    continue
                
                expected = header_mapping.get(raw_header)
                if expected is None:
                    continue
                
                target_field = COLUMN_MAP.get(expected)
                if target_field is None:
                    continue
                
                contact[target_field] = value
            
            # Skip rows without a name
            if not contact.get("name"):
                continue
            
            # Build composite location if we have city/state info
            location = contact.get("location", "")
            
            # Normalize followers to number string
            followers = contact.get("followers", "")
            if followers:
                try:
                    followers = str(int(float(followers.replace(",", ""))))
                except ValueError:
                    pass
                contact["followers"] = followers
            
            contacts.append(contact)
    
    return contacts


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 parse-playlist-contacts.py <input.tsv|csv> [output.json]")
        print("  Default output: contacts-playlists.json")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else "contacts-playlists.json"
    
    if not os.path.exists(input_file):
        print(f"ERROR: Input file not found: {input_file}")
        sys.exit(1)
    
    print(f"Parsing: {input_file}")
    contacts = parse_tsv(input_file)
    print(f"Parsed {len(contacts):,} playlist contacts")
    
    # Write output
    with open(output_file, "w") as f:
        json.dump(contacts, f, indent=2)
    
    print(f"Wrote: {output_file} ({os.path.getsize(output_file):,} bytes)")
    
    # Print summary stats
    genres = set()
    verified = 0
    with_followers = 0
    for c in contacts:
        if c.get("genre"):
            for g in c["genre"].split(","):
                genres.add(g.strip())
        if c.get("verification_verdict") == "mx_valid":
            verified += 1
        if c.get("followers"):
            with_followers += 1
    
    print(f"\nSummary:")
    print(f"  Total contacts: {len(contacts):,}")
    print(f"  MX verified: {verified:,}")
    print(f"  With followers count: {with_followers:,}")
    print(f"  Unique genres: {len(genres)}")
    print(f"  Top genres: {', '.join(sorted(genres)[:20])}")


if __name__ == "__main__":
    main()
