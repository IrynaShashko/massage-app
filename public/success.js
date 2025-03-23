const closeButton = document.getElementById("close-modal");

closeButton.addEventListener("click", function () {
  window.location.href = "/";
});

const translations = {
  ua: {
    title: "Дякуємо за довіру!",
    text: "Ми скоро вам зателефонуєм.",
    close: "Закрити",
  },
  en: {
    title: "Thank you for your trust!",
    text: "We will call you soon.",
    close: "Close",
  },
};

const lang = localStorage.getItem("language") || "ua";

const translation = translations[lang] || translations["ua"];

document.querySelector(".modal-title").textContent = translation.title;
document.querySelector(".modal-text").textContent = translation.text;
document.querySelector(".modal-btn").textContent = translation.close;
