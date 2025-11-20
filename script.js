// 15 T-shirt colours
const OUTFIT_COLORS = [
  [220, 50, 50], 
  [60, 170, 60],
  [70, 110, 220],
  [240, 210, 60],
  [245, 140, 50],
  [230, 100, 180],
  [150, 70, 200],
  [120, 70, 40],
  [20, 20, 20],
  [240, 240, 240],
  [40, 160, 160],
  [110, 130, 50],
  [200, 50, 100],
  [100, 200, 250],
  [255, 120, 0]
];

let skinColor = [200, 160, 120]; 

const userPhoto = document.getElementById("userPhoto");
const preview = document.getElementById("photoPreview");
const skinBox = document.getElementById("skinToneBox");
const silhouette = document.getElementById("baseSilhouette");
const outputGrid = document.getElementById("outputGrid");

// -------- Extract Skin Tone ----------
userPhoto.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  preview.src = url;
  preview.classList.remove("d-none");

  preview.onload = () => {
    try {
      const thief = new ColorThief();
      skinColor = thief.getColor(preview);

      skinBox.style.backgroundColor =
        `rgb(${skinColor[0]},${skinColor[1]},${skinColor[2]})`;

    } catch (e) {
      console.log(e);
    }
  };
});

// ------------ Generate 15 Looks -----------
document.getElementById("generateBtn").onclick = () => {

  if (!userPhoto.files[0]) {
    alert("Upload an image first!");
    return;
  }

  outputGrid.innerHTML = "";

  OUTFIT_COLORS.forEach((col, i) => {
    createLook(col, i + 1);
  });
};

function createLook(shirtColor, number) {

  const w = silhouette.naturalWidth;
  const h = silhouette.naturalHeight;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  // temp canvas to read pixels
  const temp = document.createElement("canvas");
  temp.width = w;
  temp.height = h;
  const tctx = temp.getContext("2d");

  tctx.drawImage(silhouette, 0, 0, w, h);
  const imgData = tctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  const faceLimit = Math.floor(h * 0.45); // neckline

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Transparent = fillable
      if (a === 0) {
        if (y < faceLimit) {
          // FACE
          data[i] = skinColor[0];
          data[i + 1] = skinColor[1];
          data[i + 2] = skinColor[2];
        } else {
          // SHIRT
          data[i] = shirtColor[0];
          data[i + 1] = shirtColor[1];
          data[i + 2] = shirtColor[2];
        }
        data[i + 3] = 255;
      }
      // Outline & hair (black) stay unchanged
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const wrap = document.createElement("div");
  wrap.className = "output-item";
  wrap.appendChild(canvas);

  const label = document.createElement("div");
  label.textContent = number;
  wrap.appendChild(label);

  outputGrid.appendChild(wrap);
}
