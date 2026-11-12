/* ==========================================================
   THE STAR CROFT — how the house behaves
   1. Doors fade to black before you pass through them.
   2. Hotspots glimmer once when you arrive in the Entry Hall.
   3. On touch screens: first tap shows the label, second tap enters.
   4. The guest book opens Substack's sign-up form.
   5. The "being prepared" page shows whichever room you chose.
   ========================================================== */

(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Fade to black when walking through a door ---------- */
  function walkThrough(href) {
    if (reduceMotion) { window.location.href = href; return; }
    document.body.classList.add("leaving");
    setTimeout(function () { window.location.href = href; }, 650);
  }
  document.querySelectorAll("[data-door]").forEach(function (door) {
    door.addEventListener("click", function (e) {
      e.preventDefault();
      walkThrough(door.getAttribute("href"));
    });
  });
  // If a visitor comes back with the browser's Back button, undo the fade
  window.addEventListener("pageshow", function () { document.body.classList.remove("leaving"); });

  /* ---------- 2 & 3. Hotspots in the hall ---------- */
  var spots = Array.prototype.slice.call(document.querySelectorAll(".spot"));
  if (spots.length) {
    // The glimmer: a soft glow, twice, shortly after arrival
    if (!reduceMotion) {
      setTimeout(function () {
        spots.forEach(function (s) { s.classList.add("glimmer"); });
        setTimeout(function () { spots.forEach(function (s) { s.classList.remove("glimmer"); }); }, 5200);
      }, 1500);
    }

    var lastPointer = "mouse";
    document.addEventListener("pointerdown", function (e) { lastPointer = e.pointerType; }, true);

    spots.forEach(function (spot) {
      spot.addEventListener("click", function (e) {
        // On touch screens, the first tap only reveals the label
        if (lastPointer === "touch" && !spot.classList.contains("active")) {
          e.preventDefault();
          e.stopImmediatePropagation(); // so the guest book doesn't open on the first tap
          spots.forEach(function (s) { s.classList.remove("active"); });
          spot.classList.add("active");
          return;
        }
        if (spot.hasAttribute("data-guestbook")) return; // handled below
        var href = spot.getAttribute("href");
        if (href && href.indexOf("http") !== 0) { e.preventDefault(); walkThrough(href); }
      });
    });
    // Tapping anywhere else hides an open label
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".spot")) spots.forEach(function (s) { s.classList.remove("active"); });
    });
  }

  /* ---------- 4. The guest book ---------- */
  var book = document.querySelector("dialog.guestbook");
  if (book) {
    var frame = book.querySelector("iframe");
    document.querySelectorAll("[data-guestbook]").forEach(function (opener) {
      opener.addEventListener("click", function () {
        if (!frame.src) frame.src = frame.getAttribute("data-src");
        if (typeof book.showModal === "function") { book.showModal(); }
        else { window.location.href = "https://theblacksword.substack.com"; }
      });
    });
    book.querySelector(".close").addEventListener("click", function () { book.close(); });
    book.addEventListener("click", function (e) { if (e.target === book) book.close(); });
  }

  /* ---------- 5. The room being prepared ---------- */
  var rooms = {
    "observatory":   { name: "The Observatory",       image: "room-observatory.webp",   about: "The BlackSword Observatory: the night sky, the citizen-science program, and the hunt for supernovae." },
    "naturalist":    { name: "The Naturalist’s Room", image: "room-naturalist.webp", about: "The cabinet of curiosities: butterflies and moths, bees, birds, and fungi, from the field to the notebook." },
    "library":       { name: "The Library",           image: "room-library.webp",       about: "The reading life: four to five hundred volumes, from Anthropology to Zoology, and notes from their margins." },
    "scriptorium":   { name: "The Scriptorium",       image: "room-scriptorium.webp",   about: "Where the essays are written. Until the room opens, the essays wait for you on Substack.", link: "https://theblacksword.substack.com" },
    "dragons-study": { name: "The Dragon’s Study", image: "room-dragons-study.webp", about: "The room where the fiction lives: The Laws of the Dragon, A Borrowed Season, and The Atavist." },
    "music":         { name: "The Music Room",        image: "room-music.webp",         about: "The playing life: the piano, the violin, and the music that keeps the house in tune." },
    "stoic-forum":   { name: "The Stoic Forum",       image: "room-stoic-forum.webp",   about: "The quiet room, for the philosophy that steadies the rest of the house." }
  };
  var nameEl = document.querySelector("[data-room-name]");
  if (nameEl) {
    var key = new URLSearchParams(window.location.search).get("room");
    var room = rooms[key];
    if (room) {
      document.title = room.name + " — The Star Croft";
      nameEl.textContent = room.name;
      document.querySelector("[data-room-about]").textContent = room.about;
      document.querySelector(".room-view").style.backgroundImage = "url('" + room.image + "')";
      if (room.link) {
        var a = document.createElement("a");
        a.className = "button-door"; a.href = room.link; a.textContent = "Read the essays on Substack";
        a.style.marginRight = "0.6rem";
        var back = document.querySelector(".preparing [data-door]");
        back.parentNode.insertBefore(a, back);
      }
    }
  }
})();
