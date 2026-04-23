import { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { auth } from "@clerk/nextjs/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── GET /api/contacts — fetch all contacts for the current user
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return Response.json({ error: "Unauthorised" }, { status: 401 })

    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return Response.json({ contacts: data })
  } catch (error) {
    console.error("GET contacts error:", error)
    return Response.json({ error: "Failed to fetch contacts" }, { status: 500 })
  }
}

// ── POST /api/contacts — add new contact
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return Response.json({ error: "Unauthorised" }, { status: 401 })

    const body = await req.json()
    const { name, company, email, position, tag } = body

    if (!name || !email) {
      return Response.json({ error: "Name and email are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("contacts")
      .insert({
        user_id: userId,
        name,
        company: company || "",
        email,
        position: position || "",
        tag: tag || "General"
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") { // Unique constraint violation
        return Response.json({ error: "Contact with this email already exists" }, { status: 409 })
      }
      throw error
    }

    return Response.json({ contact: data, message: "Contact added" }, { status: 201 })
  } catch (error) {
    console.error("POST contacts error:", error)
    return Response.json({ error: "Failed to add contact" }, { status: 500 })
  }
}

// ── PUT /api/contacts — update existing contact
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return Response.json({ error: "Unauthorised" }, { status: 401 })

    const body = await req.json()
    const { id, name, company, email, position, tag } = body

    if (!id) {
      return Response.json({ error: "Contact ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("contacts")
      .update({
        name,
        company,
        email,
        position,
        tag
      })
      .eq("id", id)
      .eq("user_id", userId) // Safety check: ensure user owns the contact
      .select()
      .single()

    if (error) throw error

    return Response.json({ contact: data, message: "Contact updated" })
  } catch (error) {
    console.error("PUT contacts error:", error)
    return Response.json({ error: "Failed to update contact" }, { status: 500 })
  }
}

// ── DELETE /api/contacts?id=xxx — delete a contact
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return Response.json({ error: "Unauthorised" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return Response.json({ error: "Contact ID is required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", id)
      .eq("user_id", userId) // Safety check

    if (error) throw error

    return Response.json({ message: "Contact deleted" })
  } catch (error) {
    console.error("DELETE contacts error:", error)
    return Response.json({ error: "Failed to delete contact" }, { status: 500 })
  }
}