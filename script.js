const { createClient } = supabase;

const supabaseUrl = "https://jaxnufmqpegezmovpaur.supabase.co";
const supabaseKey = "sb_publishable_ie_p8CqCoGbO7gqkB7oenw_Hzs1vPem";
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
    .insert([{ list_name: listName }])
    .select(); // return inserted row(s)

  if (error) {
    console.error("❌ Error creating list:", error.message);
    alert("Failed to create list.");
  } else {
    console.log("✅ List created successfully:", data);
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

  // For now, use the first list created
  const { data: lists, error: listError } = await supabaseClient
    .from("item_group")
    .select("list_id")
    .limit(1);

  if (listError) {
    console.error("❌ Error fetching list:", listError.message);
    return;
  }
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
    }])
    .select(); // return inserted row(s)

  if (error) {
    console.error("❌ Error adding item:", error.message);
    alert("Failed to add item.");
  } else {
    console.log("✅ Item added successfully:", data);
    alert("Item added successfully!");
  }
}

// --- Bind buttons ---
document.getElementById("createListBtn").addEventListener("click", createListGroup);
document.getElementById("addItemBtn").addEventListener("click", addItem);
