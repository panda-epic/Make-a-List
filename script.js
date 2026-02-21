// Import the Supabase client from the global script we added in index.html
const { createClient } = supabase;

// Replace these with your actual Supabase project credentials
const supabaseUrl = "https://jaxnufmqpegezmovpaur.supabase.co";
const supabaseKey = "sb_publishable_ie_p8CqCoGbO7gqkB7oenw_Hzs1vPem";

// Create a Supabase client instance
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// --- Test the connection ---
// This will just log something to the console so you know it’s working
async function testConnection() {
  const { data, error } = await supabaseClient.from("item_group").select("*").limit(1);
  if (error) {
    console.error("Supabase connection error:", error.message);
  } else {
    console.log("Supabase connection successful. Sample data:", data);
  }
}

// Run the test when the page loads
window.onload = testConnection;
