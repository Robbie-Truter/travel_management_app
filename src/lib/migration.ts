import { supabase } from "./supabase";
import { uploadFile } from "./storage";

export async function migrateBase64ToStorage() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  console.log("Starting migration of base64 data to Supabase Storage...");

  // 1. Trips
  const { data: trips } = await supabase.from("trips").select("id, cover_image").not("cover_image", "is", null);
  for (const trip of trips || []) {
    if (trip.cover_image?.startsWith("data:")) {
      console.log(`Migrating trip ${trip.id} cover image...`);
      const fileName = `${Date.now()}_cover.jpg`;
      const path = await uploadFile("trip-covers", `${user.id}/${fileName}`, trip.cover_image);
      await supabase.from("trips").update({ cover_image: path }).eq("id", trip.id);
    }
  }

  // 2. Destinations
  const { data: dests } = await supabase.from("destinations").select("id, image").not("image", "is", null);
  for (const dest of dests || []) {
    if (dest.image?.startsWith("data:")) {
      console.log(`Migrating destination ${dest.id} image...`);
      const fileName = `${Date.now()}_dest.jpg`;
      const path = await uploadFile("destination-images", `${user.id}/${fileName}`, dest.image);
      await supabase.from("destinations").update({ image: path }).eq("id", dest.id);
    }
  }

  // 3. Accommodations
  const { data: accs } = await supabase.from("accommodations").select("id, image").not("image", "is", null);
  for (const acc of accs || []) {
    if (acc.image?.startsWith("data:")) {
      console.log(`Migrating accommodation ${acc.id} image...`);
      const fileName = `${Date.now()}_acc.jpg`;
      const path = await uploadFile("accommodation-images", `${user.id}/${fileName}`, acc.image);
      await supabase.from("accommodations").update({ image: path }).eq("id", acc.id);
    }
  }

  // 4. Activities
  const { data: acts } = await supabase.from("activities").select("id, image").not("image", "is", null);
  for (const act of acts || []) {
    if (act.image?.startsWith("data:")) {
      console.log(`Migrating activity ${act.id} image...`);
      const fileName = `${Date.now()}_act.jpg`;
      const path = await uploadFile("activity-images", `${user.id}/${fileName}`, act.image);
      await supabase.from("activities").update({ image: path }).eq("id", act.id);
    }
  }

  // 5. Documents
  const { data: docs } = await supabase.from("documents").select("id, file, type");
  for (const doc of docs || []) {
    if (doc.file?.startsWith("data:")) {
      console.log(`Migrating document ${doc.id}...`);
      const extension = doc.type === 'application/pdf' ? 'pdf' : 'file';
      const fileName = `${Date.now()}_doc.${extension}`;
      const path = await uploadFile("user-documents", `${user.id}/${fileName}`, doc.file);
      await supabase.from("documents").update({ file: path }).eq("id", doc.id);
    }
  }

  console.log("Migration complete!");
}
