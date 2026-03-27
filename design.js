async function sendData() {
  console.log("Function called");

  const data = {
    room: document.getElementById("room").value,
    color: document.getElementById("color").value,
    budget: document.getElementById("budget").value
  };

  console.log("Sending:", data);

  // Save to MongoDB
  await fetch("http://localhost:3000/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  // Get ML suggestion
  const res = await fetch("http://localhost:3000/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  document.getElementById("output").innerText =
    "Suggested Design: " + result.suggestion;
}