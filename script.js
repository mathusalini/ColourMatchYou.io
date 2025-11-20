let skinColor = [200, 160, 120];

const userPhoto = document.getElementById("userPhoto");
const preview = document.getElementById("photoPreview");
const skinBox = document.getElementById("skinToneBox");
const faces16 = document.getElementById("faces16");
const outputCanvas = document.getElementById("outputCanvas");

// Detect skin tone
userPhoto.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  preview.src = url;
  preview.style.display = "block";

  preview.onload = () => {
    const thief = new ColorThief();
    skinColor = thief.getColor(preview);

    skinBox.style.backgroundColor =
      `rgb(${skinColor[0]},${skinColor[1]},${skinColor[2]})`;
  };
});

// Generate ONE image
document.getElementById("generateBtn").onclick = () => {

  const w = faces16.naturalWidth;
  const h = faces16.naturalHeight;

  outputCanvas.width = w;
  outputCanvas.height = h;

  const ctx = outputCanvas.getContext("2d");

  const temp = document.createElement("canvas");
  temp.width = w;
  temp.height = h;
  const tctx = temp.getContext("2d");

  tctx.drawImage(faces16, 0, 0, w, h);
  const imgData = tctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Loop through all pixels
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i+1];
    const b = data[i+2];

    // Replace ONLY face regions (light colors)
    if (r > 200 && g > 180 && b > 160) {
      data[i] = skinColor[0];
      data[i+1] = skinColor[1];
      data[i+2] = skinColor[2];
      data[i+3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
};
