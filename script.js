// -------------- CONFIG --------------

// 12 T-shirt colours (you can change)
const SHIRT_COLOURS = [
  { name: "Red",      rgb: [220, 60, 60] },
  { name: "Green",    rgb: [70, 170, 80] },
  { name: "Blue",     rgb: [60, 90, 220] },
  { name: "Yellow",   rgb: [240, 210, 60] },
  { name: "Orange",   rgb: [240, 140, 50] },
  { name: "Pink",     rgb: [235, 120, 190] },
  { name: "Purple",   rgb: [150, 90, 210] },
  { name: "Brown",    rgb: [120, 70, 40] },
  { name: "Black",    rgb: [20, 20, 20] },
  { name: "White",    rgb: [240, 240, 240] },
  { name: "Teal",     rgb: [40, 160, 160] },
  { name: "Olive",    rgb: [110, 130, 50] }
];

let skinColour = [210, 180, 160]; // default backup

// DOM references
const userPhotoInput = document.getElementById("userPhoto");
const photoPreview   = document.getElementById("photoPreview");
const baseSilImg     = document.getElementById("baseSilhouette");
const outputGrid     = document.getElementById("outputGrid");
const generateBtn    = document.getElementById("generateBtn");

// -------------- IMAGE UPLOAD & SKIN COLOUR EXTRACTION --------------

userPhotoInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  photoPreview.src = url;
  photoPreview.classList.remove("d-none");

  photoPreview.onload = () => {
    try {
      const colorThief = new ColorThief();
      // dominant colour of the whole image (you can later crop face area if needed)
      const main = colorThief.getColor(photoPreview);
      skinColour = main;
      console.log("Detected skin-ish colour:", skinColour);
    } catch (err) {
      console.error(err);
      alert("Could not extract colour. Using default tone.");
    }
  };
});

// -------------- MAIN GENERATION --------------

generateBtn.addEventListener("click", () => {
  if (!baseSilImg.complete) {
    alert("Base silhouette not loaded yet. Please wait a moment and try again.");
    return;
  }
  if (!userPhotoInput.files[0]) {
    alert("Please upload your image first.");
    return;
  }

  outputGrid.innerHTML = ""; // clear old results
  SHIRT_COLOURS.forEach((colour, index) => {
    const canvas = document.createElement("canvas");
    const label = document.createElement("div");
    const wrapper = document.createElement("div");
    wrapper.className = "output-item";

    wrapper.appendChild(canvas);
    label.textContent = `${index + 1}. ${colour.name}`;
    wrapper.appendChild(label);
    outputGrid.appendChild(wrapper);

    drawVariant(canvas, skinColour, colour.rgb);
  });
});

/**
 * Draws one variant on the given canvas.
 * - hair stays black
 * - face = skinColour
 * - shirt = shirtColour
 */
function drawVariant(canvas, skinColour, shirtColour) {
  const w = baseSilImg.naturalWidth;
  const h = baseSilImg.naturalHeight;

  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");

  // Draw base silhouette to temp canvas to inspect pixels
  const temp = document.createElement("canvas");
  temp.width = w;
  temp.height = h;
  const tctx = temp.getContext("2d");
  tctx.drawImage(baseSilImg, 0, 0, w, h);

  const imgData = tctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // vertical threshold to separate face and shirt
  const faceBottomY = Math.floor(h * 0.45); // tweak if needed

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a === 0) continue; // fully transparent, skip

      const brightness = (r + g + b) / 3;

      // Assume: hair & outline are dark, face/shirt are light
      if (brightness < 60) {
        // Hair or outline -> draw solid black
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 255;
      } else {
        // Light regions: decide face vs shirt by y position
        if (y < faceBottomY) {
          // Face region
          data[i] = skinColour[0];
          data[i + 1] = skinColour[1];
          data[i + 2] = skinColour[2];
          data[i + 3] = 255;
        } else {
          // Shirt region
          data[i] = shirtColour[0];
          data[i + 1] = shirtColour[1];
          data[i + 2] = shirtColour[2];
          data[i + 3] = 255;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}
