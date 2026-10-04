// Formuläret skickar till vårt eget CRM (underkonto "bocker"), dubbel opt-in.
// Granskningsläge: inga anmälningar skickas förrän CRM-underkontot "bocker" är live.
var PREVIEW = true;
var API = "https://portal.ducomaison.fr/api/list/subscribe";
document.getElementById("optin").addEventListener("submit", function (e) {
  e.preventDefault();
  var f = e.target, msg = document.getElementById("msg");
  if (PREVIEW) { msg.innerHTML = "Preview: sign-up opens at launch. <a href=\"" + (document.body.dataset.root || "") + "files/Pennys-Money-Adventure-Pack.pdf\">Download the pack here</a>."; return; }
  var email = f.email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = "Please enter a valid email address."; return; }
  if (!document.getElementById("samtycke").checked) { msg.textContent = "Please tick the box so we're allowed to email you."; return; }
  var btn = f.querySelector("button"); btn.disabled = true; btn.textContent = "Sending...";
  var kalla = new URLSearchParams(location.search).get("src") || "website";
  fetch(API, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email, namn: f.namn.value.trim() || undefined, konto: "bocker", magnet: "money-adventure-pack", samtycke: true, kalla: kalla, webbplats: f.webbplats.value || undefined })
  }).then(function (r) {
    if (!r.ok) throw new Error();
    location.href = (document.body.dataset.root || "") + "thanks/";
  }).catch(function () {
    msg.textContent = "Something went wrong. Please try again in a minute.";
    btn.disabled = false; btn.textContent = "Send me the free pack";
  });
});

// Mobil: dölj den fasta knappen när formuläret syns.
(function(){
  var cta = document.querySelector(".mobile-cta"), free = document.getElementById("free");
  if (!cta || !free || !("IntersectionObserver" in window)) return;
  var hero = document.querySelector(".hero");
  if (hero) new IntersectionObserver(function(es){ cta.classList.toggle("show", !es[0].isIntersecting); }, {threshold:0}).observe(hero);
  new IntersectionObserver(function(es){ cta.classList.toggle("hidden", es[0].isIntersecting); }, {threshold:0.15}).observe(free);
})();
