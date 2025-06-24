// Temporary script to fix authentication in browser
localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiZGVsb2R1bm9hQGdtYWlsLmNvbSIsInJvbGUiOiJvcmdhbml6ZXIiLCJpYXQiOjE3NTA4MDE5NDUsImV4cCI6MTc1MTQwNjc0NX0.6L8TSkmDmpqI4wiwbEXyNb-n5cJ1pd9G0H6ZKP95D4A");
localStorage.setItem("user", JSON.stringify({
  "id": 1,
  "email": "delodunoa@gmail.com",
  "firstName": "Adelodun",
  "lastName": "Olusola",
  "role": "organizer",
  "profileImageUrl": null,
  "isEmailVerified": false
}));
console.log("Authentication fixed - please refresh the page");