/**
 * upload.js
 * ---------------------------------------------------------------------------
 * Handles the drag-and-drop / click-to-upload photo flow.
 * Exposes UploadManager.getImageDataUrl() for generator.js to read.
 * ---------------------------------------------------------------------------
 */

const UploadManager = (() => {
  let currentImageDataUrl = null;

  function init() {
    const dropzone = document.getElementById("dropzone");
    const fileInput = document.getElementById("fileInput");
    const previewWrap = document.getElementById("previewWrap");
    const previewImg = document.getElementById("previewImg");
    const previewMeta = document.getElementById("previewMeta");
    const removeBtn = document.getElementById("previewRemove");

    ["dragenter", "dragover"].forEach(evt =>
      dropzone.addEventListener(evt, e => {
        e.preventDefault();
        dropzone.classList.add("dragover");
      })
    );
    ["dragleave", "drop"].forEach(evt =>
      dropzone.addEventListener(evt, e => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
      })
    );
    dropzone.addEventListener("drop", e => {
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    });
    fileInput.addEventListener("change", e => {
      const file = e.target.files[0];
      if (file) handleFile(file);
    });

    removeBtn.addEventListener("click", () => {
      currentImageDataUrl = null;
      fileInput.value = "";
      previewWrap.classList.remove("active");
      dropzone.style.display = "block";
    });

    function handleFile(file) {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        currentImageDataUrl = reader.result;
        previewImg.src = currentImageDataUrl;
        previewMeta.textContent = `${file.name} · ${(file.size / 1024).toFixed(0)} KB`;
        previewWrap.classList.add("active");
        dropzone.style.display = "none";
      };
      reader.readAsDataURL(file);
    }
  }

  function getImageDataUrl() {
    return currentImageDataUrl;
  }

  return { init, getImageDataUrl };
})();
