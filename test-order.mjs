const API = "https://kuliner-backend-production-38c5.up.railway.app";
async function main() {
  const loginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@dapurkita.id", password: "admin123" }),
  });
  const token = (await loginRes.json()).access_token;
  
  const r = await fetch(`${API}/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ 
      items: [{ menuId: 1, quantity: 2 }],
      paymentMethod: "QRIS",
      address: "Test Address",
      phone: "0812345678",
      note: "Extra spicy"
    })
  });
  console.log("POST /order status:", r.status);
  console.log("Response:", await r.text());
}
main().catch(console.error);
