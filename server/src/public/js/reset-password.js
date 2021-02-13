/* eslint-disable no-undef */
document.querySelector("form").action += new URLSearchParams(window.location.search).get("hash");
