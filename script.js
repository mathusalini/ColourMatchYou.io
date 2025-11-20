// ---------------------------
// CONFIG
// ---------------------------

// 12 T-shirt colours
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

let skinColor = [200, 160, 120]; // default
const userImgInput = document.getElementById("userPhoto");
const previewImg = document.getElementById("photoPreview");
const skinToneBox = document.getElementById("skinToneBox");
const outputGrid = document.getElementById("outputGrid");
const baseSilhouette = document.getElementById("baseSilhouette");

// ---------------------------
// Extract Skin Tone
// ---------------------------
userImgInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  previewImg.src = url;
  previewImg.classList.remove("d-none");

  previewImg.onload = () => {
    try {
      const thief = new ColorThief();
      skinColor = thief.getColor(previewImg);

      // show detected tone
      skinToneBox.style.backgroundColor =
        `rgb(${skinColor[0]}, ${skinColor[1]}, ${skinColor[2]})`;

    } catch (err) {
      console.error(err);
    }
  };
});

// ---------------------------
// Generate 12 Outputs
// ---------------------------
document.getElementById("generateBtn").addEventListener("click", () => {
  if (!userImgInput.files[0]) {
    alert("Please upload a photo first!");
    return;
  }

  if (!baseSilhouette.complete) {
    alert("Silhouette not ready yet!");
    return;
  }

  outputGrid.innerHTML = ""; // clear old

  SHIRT_COLORS.forEach((col, i) => {
    const w = baseSilhouette.naturalWidth;
    const h = baseSilhouette.naturalHeight;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = w;
    canvas.height = h;

    // Draw base silhouette to temp
    const temp = document.createElement("canvas");
    temp.width = w;
    temp.height = h;
    const tctx = temp.getContext("2d");
    tctx.drawImage(baseSilhouette, 0, 0, w, h);

    const imgData = tctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    const faceLimitY = Math.floor(h * 0.45); // neckline

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        // Transparent area = face or shirt
        if (a === 0) {
          // Face region
          if (y < faceLimitY) {
            data[idx] = skinColor[0];
            data[idx + 1] = skinColor[1];
            data[idx + 2] = skinColor[2];
            data[idx + 3] = 255;
