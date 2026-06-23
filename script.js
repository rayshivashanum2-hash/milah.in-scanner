/*======================================================
    MILAH.IN SCANNER V3
======================================================*/

// ==============================
// LOKASI MODEL
// ==============================

const URL = "./model/";

// ==============================
// VARIABEL
// ==============================

let model;
let webcam;

let isCameraActive = false;
let isPredicting = false;
let capturedImage = null;

// ==============================
// ELEMENT HTML
// ==============================

const startBtn = document.getElementById("startBtn");

const captureBtn = document.getElementById("captureBtn");

const resetBtn = document.getElementById("resetBtn");

const loading = document.getElementById("loading");

const labelContainer =
document.getElementById("label-container");

const flash =
document.getElementById("flash");

const captureCanvas =
document.getElementById("captureCanvas");

const ctx =
captureCanvas.getContext("2d");

// ==============================
// DATA SAMPAH
// ==============================

const wasteData = {

    "Organik":{

        icon:"🌿",

        title:"Sampah Organik",

        examples:

        [
            "Sisa makanan",
            "Daun kering",
            "Ranting",
            "Kulit buah"
        ],

        management:

        "Pisahkan dari sampah lainnya kemudian olah menjadi kompos atau pakan ternak.",

        decomposition:

        "1–6 bulan"

    },

    "Anorganik":{

        icon:"♻️",

        title:"Sampah Anorganik",

        examples:

        [
            "Botol plastik",
            "Kaleng",
            "Kardus",
            "Kertas",
            "Botol kaca",
            "Majalah"
        ],

        management:

        "Pisahkan berdasarkan jenisnya lalu kirim ke bank sampah atau tempat daur ulang.",

        decomposition:

        "100–500 tahun"

    },

    "Bahan Berbahaya":{

        icon:"☣️",

        title:"Limbah B3",

        examples:

        [
            "Baterai",
            "Lampu TL",
            "HP rusak",
            "Kabel"
        ],

        management:

        "Jangan dibuang ke tempat sampah biasa. Serahkan ke tempat pengolahan limbah B3.",

        decomposition:

        "Puluhan hingga ratusan tahun"

    },

    "Residu":{

        icon:"🚫",

        title:"Sampah Residu",

        examples:

        [
            "Popok",
            "Pembalut",
            "Tampon"
        ],

        management:

        "Masukkan ke tempat sampah residu agar dibuang ke TPA.",

        decomposition:

        "250–500 tahun"

    }

};

// ==============================
// EVENT BUTTON
// ==============================

startBtn.addEventListener(
    "click",
    startCamera
);

captureBtn.addEventListener(
    "click",
    capturePhoto
);

resetBtn.addEventListener(
    "click",
    resetScanner
);
/*======================================================
    START CAMERA
======================================================*/

async function startCamera() {

    try {

        startBtn.disabled = true;
        startBtn.innerHTML = "⏳ Memuat Kamera...";

        // Load model AI
        model = await tmImage.load(
            URL + "model.json",
            URL + "metadata.json"
        );

        // Kamera belakang HP
        webcam = new tmImage.Webcam(
            350,
            350,
            false
        );

        await webcam.setup({
            facingMode: "environment"
        });

        await webcam.play();

        const webcamContainer =
            document.getElementById("webcam-container");

        webcamContainer.innerHTML = "";

        webcamContainer.appendChild(
            webcam.canvas
        );

        isCameraActive = true;

        // Tampilkan tombol Ambil Foto
        startBtn.style.display = "none";

        captureBtn.style.display = "block";

        resetBtn.style.display = "none";

        // Sembunyikan canvas foto
        captureCanvas.style.display = "none";

        // Tampilkan video kamera
        webcam.canvas.style.display = "block";

        // Tambahkan kotak fokus
        if (!document.querySelector(".focus-box")) {

            const focus =
                document.createElement("div");

            focus.className = "focus-box";

            webcamContainer.appendChild(focus);

        }

        // Tambahkan garis scanner
        if (!document.querySelector(".scan-line")) {

            const scan =
                document.createElement("div");

            scan.className = "scan-line";

            webcamContainer.appendChild(scan);

        }

        animateCamera();

    }

    catch (err) {

        console.error(err);

        alert(
            "❌ Kamera tidak dapat diakses.\n\nPastikan browser telah diberi izin kamera."
        );

        startBtn.disabled = false;

        startBtn.innerHTML =
            "📷 Aktifkan Kamera";

    }

}

/*======================================================
    ANIMASI KAMERA
======================================================*/

function animateCamera() {

    function loop() {

        if (!isCameraActive) return;

        webcam.update();

        requestAnimationFrame(loop);

    }

    loop();

}
/*======================================================
    AMBIL FOTO
======================================================*/

async function capturePhoto() {

    if (!isCameraActive) return;

    if (isPredicting) return;

    isPredicting = true;

    // Efek flash
    flash.classList.add("flash");

    setTimeout(() => {

        flash.classList.remove("flash");

    }, 300);

    // Ambil gambar dari kamera
    ctx.drawImage(
        webcam.canvas,
        0,
        0,
        captureCanvas.width,
        captureCanvas.height
    );

    // Simpan hasil foto
    capturedImage = captureCanvas;

    // Freeze kamera
    webcam.pause();

    // Sembunyikan video
    webcam.canvas.style.display = "none";

    // Tampilkan hasil foto
    captureCanvas.style.display = "block";

    // Sembunyikan kotak fokus
    const focus = document.querySelector(".focus-box");

    if (focus) {

        focus.style.display = "none";

    }

    // Sembunyikan garis scanner
    const scan = document.querySelector(".scan-line");

    if (scan) {

        scan.style.display = "none";

    }

    // Loading
    loading.style.display = "block";

    captureBtn.disabled = true;

    captureBtn.innerHTML = "🔍 Menganalisis...";

    // Beri jeda agar loading terlihat
    setTimeout(async () => {

        await predictPhoto();

    }, 600);

}
/*======================================================
    PREDIKSI FOTO
======================================================*/

async function predictPhoto() {

    try {

        // Prediksi dari hasil foto (canvas)
        const predictions = await model.predict(captureCanvas);

        // Cari confidence tertinggi
        let bestPrediction = predictions[0];

        for (let i = 1; i < predictions.length; i++) {

            if (
                predictions[i].probability >
                bestPrediction.probability
            ) {

                bestPrediction = predictions[i];

            }

        }

        const confidence =
            bestPrediction.probability * 100;

        console.log(
            bestPrediction.className,
            confidence.toFixed(2) + "%"
        );

        // Confidence minimal
        if (confidence < 85) {

            loading.style.display = "none";

            labelContainer.innerHTML = `
                <div class="result-section">

    <h3>⏳ Waktu Penguraian</h3>

    <p>

        ${info.decomposition}

    </p>

</div>

<div class="result-section">

    <button
        id="bankBtn"
        class="bank-button">

        📍 Cari Bank Sampah Terdekat

    </button>

</div>

</div>

`;

            setTimeout(() => {

                resetScanner();

            }, 1500);

            return;

        }

        // Ambil informasi sampah
        const info =
            wasteData[bestPrediction.className];

        loading.style.display = "none";

       vibrateSuccess();

     showResult(
      bestPrediction.className,
      confidence,
      info
);

    }

    catch(err){

        console.error(err);

        loading.style.display = "none";

        alert(
            "Terjadi kesalahan saat melakukan prediksi."
        );
        vibrateError();
        resetScanner();

    }

}
/*======================================================
    TAMPILKAN HASIL
======================================================*/

function showResult(className, confidence, info) {

    // Tampilkan tombol Foto Lagi
    captureBtn.style.display = "none";
    resetBtn.style.display = "block";

    captureBtn.disabled = false;
    captureBtn.innerHTML = "📸 Ambil Foto";

    // Tentukan warna card
    let cardClass = "";

    switch (className) {

        case "Organik":
            cardClass = "organik";
            break;

        case "Anorganik":
            cardClass = "anorganik";
            break;

        case "Bahan Berbahaya":
            cardClass = "b3";
            break;

        case "Residu":
            cardClass = "residu";
            break;

        default:
            cardClass = "";
    }

    labelContainer.innerHTML = `

        <div class="result-card ${cardClass} fadeIn">

            <div class="result-title">

                ${info.icon}

                ${info.title}

            </div>

            <div class="result-section">

                <h3>🎯 Tingkat Keyakinan AI</h3>

                <p>

                    ${confidence.toFixed(2)}%

                </p>

            </div>

            <div class="result-section">

                <h3>📦 Contoh Sampah</h3>

                <p>

                    ${info.examples.join(", ")}

                </p>

            </div>

            <div class="result-section">

                <h3>♻️ Cara Pengelolaan</h3>

                <p>

                    ${info.management}

                </p>

            </div>

            <div class="result-section">

                <h3>⏳ Waktu Penguraian</h3>

                <p>

                    ${info.decomposition}

                </p>

            </div>

        </div>

    `;
       <div class="result-section">

        <button
        id="bankBtn"
        class="bank-button">

        📍 Cari Bank Sampah Terdekat

       </button>

        </div>
    // Scroll ke hasil
    labelContainer.scrollIntoView({

        behavior: "smooth",
        block: "start"

    });

    isPredicting = false;

}
/*======================================================
    RESET SCANNER
======================================================*/

async function resetScanner() {

    // Hilangkan loading
    loading.style.display = "none";

    // Sembunyikan hasil foto
    captureCanvas.style.display = "none";

    // Tampilkan kembali kamera
    webcam.canvas.style.display = "block";

    // Lanjutkan kamera
    await webcam.play();

    // Aktifkan kembali scanner
    isPredicting = false;

    // Tombol
    captureBtn.style.display = "block";
    captureBtn.disabled = false;
    captureBtn.innerHTML = "📸 Ambil Foto";

    resetBtn.style.display = "none";

    // Munculkan kembali kotak fokus
    const focus =
        document.querySelector(".focus-box");

    if (focus) {

        focus.style.display = "block";

    }

    // Munculkan kembali garis scanner
    const scan =
        document.querySelector(".scan-line");

    if (scan) {

        scan.style.display = "block";

    }

    // Bersihkan hasil sebelumnya
    labelContainer.innerHTML = `
      const bankBtn = document.getElementById("bankBtn");

if (bankBtn) {

    bankBtn.addEventListener(
        "click",
        openBankSampah
    );

}
        <div class="placeholder fadeIn">

            <h2>

                Belum Ada Hasil

            </h2>

            <p>

                Arahkan kamera ke objek
                sampah lalu tekan
                <b>📸 Ambil Foto</b>

            </p>

        </div>

    `;

}
/*======================================================
    UTILITIES & FINAL
======================================================*/

/**
 * Getar HP ketika berhasil scan
 */
function vibrateSuccess() {

    if ("vibrate" in navigator) {

        navigator.vibrate(150);

    }

}

/**
 * Getar ketika gagal scan
 */
function vibrateError() {

    if ("vibrate" in navigator) {

        navigator.vibrate([100,80,100]);

    }

}

/**
 * Animasi loading
 */
function showLoading() {

    loading.style.display = "block";

}

function hideLoading() {

    loading.style.display = "none";

}

/**
 * Pesan sementara
 */
function showMessage(message,color="#2ecc71"){

    labelContainer.innerHTML = `

        <div class="result-card fadeIn">

            <h2 style="color:${color};">

                ${message}

            </h2>

        </div>

    `;

}

/**
 * Bersihkan scanner
 */
function clearResult(){

    labelContainer.innerHTML=`

        <div class="placeholder fadeIn">

            <h2>

                Belum Ada Hasil

            </h2>

            <p>

                Tekan
                <b>📸 Ambil Foto</b>

                untuk mulai melakukan scan.

            </p>

        </div>

    `;
      
}

/**
 * Jika browser ditutup
 */
window.addEventListener("beforeunload",()=>{

    if(webcam){

        webcam.stop();

    }

});

/**
 * Jika halaman kembali aktif
 */
document.addEventListener("visibilitychange",()=>{

    if(document.hidden){

        if(webcam){

            webcam.pause();

        }

    }else{

        if(isCameraActive && webcam){

            webcam.play();

        }

    }

});

/**
 * Anti double click
 */

captureBtn.addEventListener("click",()=>{

    captureBtn.disabled=true;

});

resetBtn.addEventListener("click",()=>{

    captureBtn.disabled=false;

});

/**
 * Console
 */

console.log(

`

=======================================

      MILAH.IN SCANNER V3

=======================================

AI Scanner Ready

=======================================

`

);
/*=========================================
    GOOGLE MAPS
=========================================*/

function openBankSampah(){

    window.open(
        "https://www.google.com/maps/search/Bank+Sampah+Terdekat",
        "_blank"
    );

}