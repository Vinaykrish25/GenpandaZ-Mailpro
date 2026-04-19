import { NextRequest } from "next/server"
import fs from "fs"
import path from "path"

// JSON file stored in project root /data/contacts.json
const DATA_DIR  = path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "contacts.json")

type Contact = {
  id: string
  name: string
  company: string
  email: string
  position: string
  tag: string
  createdAt: string
}

// Read contacts from JSON file
function readContacts(): Contact[] {
  try {
    if (!fs.existsSync(DATA_DIR))  fs.mkdirSync(DATA_DIR, { recursive: true })
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]")
    const raw = fs.readFileSync(DATA_FILE, "utf-8")
    return JSON.parse(raw)
  } catch {
    return []
  }
}

// Write contacts to JSON file
function writeContacts(contacts: Contact[]) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(contacts, null, 2))
}

// ── GET /api/contacts — fetch all contacts
export async function GET() {
  try {
    const contacts = readContacts()
    return Response.json({ contacts })
  } catch (error) {
    console.error("GET contacts error:", error)
    return Response.json({ error: "Failed to fetch contacts" }, { status: 500 })
  }
}

// ── POST /api/contacts — add new contact
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, company, email, position, tag } = body

    if (!name || !email) {
      return Response.json({ error: "Name and email are required" }, { status: 400 })
    }

    const contacts = readContacts()

    // Check duplicate email
    const exists = contacts.find(c => c.email === email)
    if (exists) {
      return Response.json({ error: "Contact with this email already exists" }, { status: 409 })
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      name,
      company: company || "",
      email,
      position: position || "",
      tag: tag || "General",
      createdAt: new Date().toISOString()
    }

    contacts.push(newContact)
    writeContacts(contacts)

    return Response.json({ contact: newContact, message: "Contact added" }, { status: 201 })
  } catch (error) {
    console.error("POST contacts error:", error)
    return Response.json({ error: "Failed to add contact" }, { status: 500 })
  }
}

// ── PUT /api/contacts — update existing contact
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, name, company, email, position, tag } = body

    if (!id) {
      return Response.json({ error: "Contact ID is required" }, { status: 400 })
    }

    const contacts = readContacts()
    const index = contacts.findIndex(c => c.id === id)

    if (index === -1) {
      return Response.json({ error: "Contact not found" }, { status: 404 })
    }

    contacts[index] = {
      ...contacts[index],
      name:     name     ?? contacts[index].name,
      company:  company  ?? contacts[index].company,
      email:    email    ?? contacts[index].email,
      position: position ?? contacts[index].position,
      tag:      tag      ?? contacts[index].tag,
    }

    writeContacts(contacts)
    return Response.json({ contact: contacts[index], message: "Contact updated" })
  } catch (error) {
    console.error("PUT contacts error:", error)
    return Response.json({ error: "Failed to update contact" }, { status: 500 })
  }
}

// ── DELETE /api/contacts?id=xxx — delete a contact
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return Response.json({ error: "Contact ID is required" }, { status: 400 })
    }

    const contacts = readContacts()
    const filtered = contacts.filter(c => c.id !== id)

    if (filtered.length === contacts.length) {
      return Response.json({ error: "Contact not found" }, { status: 404 })
    }

    writeContacts(filtered)
    return Response.json({ message: "Contact deleted" })
  } catch (error) {
    console.error("DELETE contacts error:", error)
    return Response.json({ error: "Failed to delete contact" }, { status: 500 })
  }
}