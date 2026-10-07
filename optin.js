// Formuläret skickar till vårt eget CRM (underkonton "bocker" och "bocker-sv"), single opt-in:
// paketet mejlas direkt och tacksidan har även en direktlänk. Live på båda språken sedan 2026-10-07.
var PREVIEW = false;
var API = "https://portal.ducomaison.fr/api/list/subscribe";
document.getElementById("optin").addEventListener("submit", function (e) {
  e.preventDefault();
  var f = e.target, msg = document.getElementById("msg");
  var sv = document.documentElement.lang === "sv";
  var pdf = f.dataset.pdf || ((document.body.dataset.root || "") + "files/Pennys-Money-Adventure-Pack.pdf");
  if (PREVIEW) { msg.innerHTML = sv ? "Förhandsvisning: anmälan öppnar vid lanseringen. <a href=\"" + pdf + "\">Ladda ner paketet här</a>." : "Preview: sign-up opens at launch. <a href=\"" + pdf + "\">Download the pack here</a>."; return; }
  var email = f.email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = sv ? "Skriv en giltig e-postadress." : "Please enter a valid email address."; return; }
  if (!document.getElementById("samtycke").checked) { msg.textContent = sv ? "Kryssa i rutan så att vi får mejla dig." : "Please tick the box so we're allowed to email you."; return; }
  var btn = f.querySelector("button"); btn.disabled = true; btn.textContent = sv ? "Skickar..." : "Sending...";
  var kalla = new URLSearchParams(location.search).get("src") || "website";
  fetch(API, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email, namn: f.namn.value.trim() || undefined, konto: f.dataset.konto || "bocker", magnet: f.dataset.magnet || "money-adventure-pack", samtycke: true, kalla: kalla, webbplats: f.webbplats.value || undefined })
  }).then(function (r) {
    if (!r.ok) throw new Error();
    location.href = f.dataset.thanks || ((document.body.dataset.root || "") + "thanks/");
  }).catch(function () {
    msg.textContent = sv ? "Något gick fel. Försök igen om en stund." : "Something went wrong. Please try again in a minute.";
    btn.disabled = false; btn.textContent = sv ? "Skicka gratispaketet" : "Send me the free pack";
  });
});

// Mobil: dölj den fasta knappen när formuläret syns.
(function(){
  var cta = document.querySelector(".mobile-cta"), free = document.getElementById("free") || document.getElementById("gratis");
  if (!cta || !free || !("IntersectionObserver" in window)) return;
  var hero = document.querySelector(".hero");
  if (hero) new IntersectionObserver(function(es){ cta.classList.toggle("show", !es[0].isIntersecting); }, {threshold:0}).observe(hero);
  new IntersectionObserver(function(es){ cta.classList.toggle("hidden", es[0].isIntersecting); }, {threshold:0.15}).observe(free);
})();
