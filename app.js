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
    const relevantColors = new Set();
    const slider = document.getElementById("slide-container");
    var threshHold = 0;
    const counter = document.getElementById("counter");

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

    function quantize(n) {
      return Math.round(n / 16) * 16;
    }

    function rgbToHex(r, g, b) {
      return "#" + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1);
    }

    function getPixelThreshold(event) {
      threshHold = event.currentTarget.children[0].value;
      counter.innerText = `${threshHold}/1000`;
      updateColors(threshHold);
    }

    function updateColors(threshold) {
      relevantColors.clear();
      allColors.forEach((value, key) => {
        let thresholdValue = threshold == 0 ? 500 : threshold;
        if (value > thresholdValue) {
          relevantColors.add(key);
        }
      });
      colorPalette.innerHTML = "";
      fetchColors();
    }

    async function fetchColors() {
      for (const color of relevantColors) {
        const hexWithoutHash = color.replace("#", "");
        const url = `https://www.thecolorapi.com/id?hex=${hexWithoutHash}`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          const container = document.createElement("div");
          const div = document.createElement("div");
          const box = document.createElement("div");
          container.className = "color-item";
          box.className = "color-box";
          div.className = "color-names";
          box.style.backgroundColor = color;
          div.style.color = color;
          div.setAttribute("data-color", color);
          div.setAttribute("data-name", data.name.value);
          div.innerText = `${data.name.value} - ${color}`;
          container.append(div);
          container.append(box);
          colorPalette.append(container);
          console.log(`Color: ${color}`, data.name.value);
        } catch (err) {
          console.error("Error fetching color:", color, err);
        }
      }
    }
    RGB.forEach(([r, g, b]) => {
      addColor(rgbToHex(quantize(r), quantize(g), quantize(b)));
    });
    slider.addEventListener("change", getPixelThreshold);
    updateColors(250);
  }
});
