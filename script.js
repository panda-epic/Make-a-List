// Import the Supabase client from the global script we added in index.html
const { createClient } = supabase;

// Replace these with your actual Supabase project credentials
const supabaseUrl = "https://YOUR_PROJECT_URL.supabase.co";
const supabaseKey = "YOUR_PUBLIC_ANON_KEY";

// Create a Supabase client instance
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// --- Create a new list group ---
async function createListGroup() {
  const listName = document.getElementById("listNameInput").value.trim();
  if (!listName) {
    alert("Please enter a list name.");
    return;
  }

  const { data, error } = await supabaseClient
    .from("item_group")
    .insert([{ list_name: listName }]);

  if (error) {
    console.error("Error creating list:", error.message);
    alert("Failed to create list.");
  } else {
    console.log("List created:", data);
    alert("List created successfully!");
  }
}

// --- Add a new item to the list ---
async function addItem() {
  const itemName = document.getElementById("itemInput").value.trim();
  const category = document.getElementById("categoryInput").value;
  const count = parseInt(document.getElementById("countInput").value) || 1;
  const price = parseFloat(document.getElementById("priceInput").value) || null;

  if (!itemName) {
    alert("Please enter an item name.");
    return;
  }

  // For now, we’ll just insert into the first list created (later we’ll select list_id dynamically)
  const { data: lists } = await supabaseClient.from("item_group").select("list_id").limit(1);
  if (!lists || lists.length === 0) {
    alert("No list found. Please create a list first.");
    return;
  }
  const listId = lists[0].list_id;

  const { data, error } = await supabaseClient
    .from("items_list")
    .insert([{
      list_id: listId,
      item_name: itemName,
      item_category: category,
      item_count: count,
      item_price: price
    }]);

  if (error) {
    console.error("Error adding item:", error.message);
    alert("Failed to add item.");
  } else {
    console.log("Item added:", data);
    alert("Item added successfully!");
  }
}

// --- Bind buttons ---
document.getElementById("createListBtn").addEventListener("click", createListGroup);
document.getElementById("addItemBtn").addEventListener("click", addItem);
