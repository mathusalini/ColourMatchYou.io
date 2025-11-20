let skinColor = [200, 160, 120];

const userPhoto = document.getElementById("userPhoto");
const preview = document.getElementById("photoPreview");
const skinBox = document.getElementById("skinToneBox");
const facesGrid = document.getElementById("facesGrid");
const outputCanvas = document.getElementById("outputCanvas");

// ------------------ Extract Skin Tone ------------------
userPhoto.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  preview.src = url;
  preview.classList.remove("d-none");

  preview.onload = () => {
    const thief = new ColorThief();
    skinColor = thief.getColor(preview);  // [R,G,B]

    // Show skin tone box
    skinBox.style.backgroundColor =
      `rgb(${skinColor[0]}, ${skinColor[1]}, ${skinColor[2]})`;
  };
});

// ------------------ Recolour ALL faces in ONE image ------------------
document.getElementById("generateBtn").onclick = () => {

  const w = facesGrid.naturalWidth;
  const h = facesGrid.naturalHeight;

  outputCanvas.width = w;
  outputCanvas.height = h;

  const ctx = outputCanvas.getContext("2d");

  // temp canvas to inspect pixels
  const temp = document.createElement("canvas");
  temp.width = w;
  temp.height = h;
  const tctx = temp.getContext("2d");

  tctx.drawImage(facesGrid, 0, 0, w, h);
  const imgData = tctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Loop through every pixel in the image
  for (let i = 0; i < data.length; i += 4) {

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Detect the face area (light / white region)
    // Adjust thresholds if your image has slightly darker faces
    if (r > 200 && g > 180 && b > 160) {
      data[i]     = skinColor[0];
      data[i + 1] = skinColor[1];
      data[i + 2] = skinColor[2];
      data[i + 3] = 255;
    }

    // Shirts / outlines / hair remain unchanged
  }

  ctx.putImageData(imgData, 0, 0);
};
