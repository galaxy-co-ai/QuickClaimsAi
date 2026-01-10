import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Get the webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  // Create a new Svix instance with your secret
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const primaryEmail = email_addresses?.[0]?.email_address;

    if (!primaryEmail) {
      return new Response("No email address", { status: 400 });
    }

    try {
      await db.user.create({
        data: {
          clerkId: id,
          email: primaryEmail,
          firstName: first_name ?? "",
          lastName: last_name ?? "",
          role: "estimator", // Default role
        },
      });
      console.log(`User created: ${id}`);
    } catch (error) {
      console.error("Error creating user:", error);
      return new Response("Error creating user", { status: 500 });
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const primaryEmail = email_addresses?.[0]?.email_address;

    try {
      await db.user.update({
        where: { clerkId: id },
        data: {
          email: primaryEmail,
          firstName: first_name ?? "",
          lastName: last_name ?? "",
        },
      });
      console.log(`User updated: ${id}`);
    } catch (error) {
      console.error("Error updating user:", error);
      // User might not exist yet, that's okay
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    if (!id) {
      return new Response("No user ID", { status: 400 });
    }

    try {
      await db.user.update({
        where: { clerkId: id },
        data: { isActive: false },
      });
      console.log(`User deactivated: ${id}`);
    } catch (error) {
      console.error("Error deactivating user:", error);
    }
  }

  return new Response("Webhook processed", { status: 200 });
}
