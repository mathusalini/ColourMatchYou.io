// -----------------------------------------
// CONFIG
// -----------------------------------------

// T-shirt colours you want
const SHIRT_COLORS = [
  { name: "Red", rgb: [220, 50, 50] },
  { name: "Green", rgb: [60, 170, 60] },
  { name: "Blue", rgb: [70, 110, 220] },
  { name: "Yellow", rgb: [240, 210, 60] },
  { name: "Orange", rgb: [245, 140, 50] },
  { name: "Pink", rgb: [230, 100, 180] },
  { name: "Purple", rgb: [150, 70, 200] },
  { name: "Brown", rgb: [120, 70, 40] },
  { name: "Black", rgb: [20, 20, 20] },
  { name: "White", rgb: [240, 240, 240] },
  { name: "Teal", rgb: [40, 160, 160] },
  { name: "Olive", rgb: [110, 130, 50] }
];

let skinColor = [200, 160, 120]; // fallback if colour extract fails

const userImgInput = document.getElementById("userPhoto");
const previewImg = document.getElementById("photoPreview");
const outputGrid = document.getElementById("outputGrid");
const baseSilhouette = document.getElementById("baseSilhouette");

// -----------------------------------------
// 1. Extract skin tone from user-uploaded image
// -----------------------------------------
userImgInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  previewImg.src = url;
  previewImg.classList.remove("d-none");

  previewImg.onload = () => {
    try {
      const thief = new ColorThief();
      // Dominant colour of whole image = skin-ish tone
      skinColor = thief.getColor(previewImg);
      console.log("Detected Skin Colour:", skinColor);
    } catch (err) {
      console.error("Colour extract failed:", err);
    }
  };
});

// -----------------------------------------
// 2. Generate 12 output images
// -----------------------------------------
document.getElementById("generateBtn").addEventListener("click", () => {
  if (!userImgInput.files[0]) {
    alert("Upload your photo first!");
    return;
  }

  if (!baseSilhouette.complete) {
    alert("Silhouette not loaded yet!");
    return;
  }

  outputGrid.innerHTML = ""; // Clear old results

  SHIRT_COLORS.forEach((col, index) => {
    // Canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const w = baseSilhouette.naturalWidth;
    const h = baseSilhouette.naturalHeight;
    canvas.width = w;
    canvas.height = h;

    // Draw base silhouette into temp canvas to read pixels
    const temp = document.createElement("canvas");
    temp.width = w;
    temp.height = h;
    const tctx = temp.getContext("2d");
    tctx.drawImage(baseSilhouette, 0, 0, w, h);

    const imgData = tctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Face area ends at neckline → approx 45%
    const faceEndY = Math.floor(h * 0.45);

    // Pixel recolouring loop
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) continue; // transparent → fillable region

        const brightness = (r + g + b) / 3;

        // 1. Hair & outline = dark pixels → keep black
        if (brightness < 40) {
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 255;
        }
        // 2. Face region (transparent originally)
        else if (y < faceEndY) {
          data[i] = skinColor[0];
          data[i + 1] = skinColor[1];
          data[i + 2] = skinColor[2];
          data[i + 3] = 255;
        }
        // 3. T-shirt region
        else {
          data[i] = col.rgb[0];
          data[i + 1] = col.rgb[1];
          data[i + 2] = col.rgb[2];
          data[i + 3] = 255;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Display output
    const wrapper = document.createElement("div");
    wrapper.className = "output-item";

    const label = document.createElement("div");
    label.textContent = `${index + 1}. ${col.name}`;

    wrapper.appendChild(canvas);
    wrapper.appendChild(label);
    outputGrid.appendChild(wrapper);
  });
});
