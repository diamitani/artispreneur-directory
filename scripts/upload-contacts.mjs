#!/usr/bin/env node
/**
 * upload-contacts.mjs
 * 
 * Uploads 78,000 contacts to Supabase in batches.
 * 
 * Usage:
 *   SUPABASE_URL=https://... SUPABASE_SERVICE_KEY=... node upload-contacts.mjs ./contacts.csv
 * 
 * CSV format expected:
 *   name,type,location,description,website,email,genre,country,state,city
 * 
 * Or JSON array format (contacts.json):
 *   [{ name, type, location, description, website, email, ... }, ...]
 */

import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY  // Use service role key for inserts

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables")
  process.exit(1)
}

const inputFile = process.argv[2] || path.join(__dirname, "contacts.json")

if (!fs.existsSync(inputFile)) {
  console.error(`ERROR: Input file not found: ${inputFile}`)
  console.error("Provide a JSON array or CSV file of contacts.")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const BATCH_SIZE = 500

async function uploadContacts() {
  console.log(`Reading contacts from: ${inputFile}`)
  
  let contacts = []
  const ext = path.extname(inputFile).toLowerCase()
  
  if (ext === ".json") {
    contacts = JSON.parse(fs.readFileSync(inputFile, "utf-8"))
  } else if (ext === ".csv") {
    const lines = fs.readFileSync(inputFile, "utf-8").split("\n")
    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""))
    contacts = lines.slice(1).filter(Boolean).map(line => {
      const values = line.match(/("(?:[^"]|"")*"|[^,]*)/g)?.map(v => v.replace(/^"|"$/g, "").replace(/""/g, '"')) || []
      return Object.fromEntries(headers.map((h, i) => [h, values[i] || ""]))
    })
  } else {
    console.error("Unsupported file format. Use .json or .csv")
    process.exit(1)
  }

  console.log(`Total contacts to upload: ${contacts.length.toLocaleString()}`)

  let uploaded = 0
  let errors = 0
  const total = contacts.length

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = contacts.slice(i, i + BATCH_SIZE).map(c => ({
      name:        c.name?.trim(),
      type:        c.type?.trim()?.toLowerCase(),
      location:    c.location?.trim() || null,
      description: c.description?.trim() || null,
      website:     c.website?.trim() || null,
      email:       c.email?.trim() || null,
      genre:       c.genre?.trim() || null,
      country:     c.country?.trim() || null,
      state:       c.state?.trim() || null,
      city:        c.city?.trim() || null,
      phone:       c.phone?.trim() || null,
      social_ig:   c.instagram?.trim() || c.social_ig?.trim() || null,
      social_tw:   c.twitter?.trim() || c.social_tw?.trim() || null,
      verified:    true,
    })).filter(c => c.name && c.type)

    const { error } = await supabase.from("contacts").insert(batch)

    if (error) {
      console.error(`Batch ${Math.floor(i/BATCH_SIZE)+1} error:`, error.message)
      errors += batch.length
    } else {
      uploaded += batch.length
    }

    const pct = Math.min(100, Math.round(((i + BATCH_SIZE) / total) * 100))
    process.stdout.write(`\rProgress: ${pct}% (${uploaded.toLocaleString()} uploaded, ${errors} errors)  `)

    // Rate limit: 10 batches/sec max
    if (i % (BATCH_SIZE * 10) === 0 && i > 0) {
      await new Promise(r => setTimeout(r, 1000))
    }
  }

  console.log(`\n\nDone!`)
  console.log(`  Uploaded: ${uploaded.toLocaleString()}`)
  console.log(`  Errors:   ${errors.toLocaleString()}`)
  console.log(`  Total:    ${total.toLocaleString()}`)
}

uploadContacts().catch(console.error)
