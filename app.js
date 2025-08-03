window.addEventListener("DOMContentLoaded", () => {
  const inputField = document.getElementById("image");
  const image = new Image();
  const colorPalette = document.getElementById("color-palette");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  canvas.width = 500;
  canvas.height = 500;
  const cWidth = canvas.width;
  const cHeight = canvas.height;

  inputField.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
      image.onload = getColors;
      image.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });

  function getColors() {
    ctx.drawImage(image, 0, 0, cWidth, cHeight);
    const imageData = ctx.getImageData(0, 0, cWidth, cHeight, {
      colorSpace: "srgb",
    });
    const RGB = [];
    const allColors = new Map();

    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const a = imageData.data[i + 3];
      if (a === 0) continue;
      RGB.push([r, g, b]);
    }
    function addColor(color) {
      allColors.set(color, (allColors.get(color) || 0) + 1);
    }
    function rgbToHex(r, g, b) {
      return "#" + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1);
    }
    function f(n) {
      return parseInt(n, 10);
    }

    RGB.forEach(([r, g, b]) => {
      addColor(rgbToHex(f(r), f(g), f(b)));
    });
    const relevantColors = [];
    allColors.forEach((value, key) => {
      if (value > 500) {
        relevantColors.push(key);
      }
    });
    async function fetchColors() {
      for (const color of relevantColors) {
        const hexWithoutHash = color.replace("#", "");
        const url = `https://www.thecolorapi.com/id?hex=${hexWithoutHash}`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          const div = document.createElement("div");
          const box = document.createElement("div");
          box.style.width = "100px";
          box.style.height = "100px";
          box.style.backgroundColor = `${color}`;
          box.style.border = "1px solid black";
          div.setAttribute("color", color);
          div.setAttribute("name", data.name.value);
          div.setAttribute("style", `color=${color}`);
          div.innerText = data.name.value;
          div.style.fontFamily = '"Comic Sans MS", cursive, sans-serif';
          div.style.textShadow = "1px 1px 1px black";
          div.style.color = color;
          div.append(box);
          colorPalette.append(div);
          console.log(`Color: ${color}`, data.name.value);
        } catch (err) {
          console.error("Error fetching color:", color, err);
        }
      }
    }
    fetchColors();
  }
});
