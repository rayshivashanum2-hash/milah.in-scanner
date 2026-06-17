// ===============================
// MILAH.IN SCANNER V2
// Bagian 1 & 2
// ===============================

// Lokasi model Teachable Machine
const URL = "./model/";

// Variabel utama
let model;
let webcam;
let labelContainer;
let maxPredictions;

// Menyimpan hasil terakhir agar tidak berkedip
let hasilTerakhir = "";
let waktuTerakhir = 0;

// Ambang minimal keyakinan model
const MIN_CONFIDENCE = 0.85;

// Interval minimal pergantian hasil (ms)
const UPDATE_INTERVAL = 1500;

// Tombol aktifkan kamera
document
    .getElementById("startBtn")
    .addEventListener("click", init);


// ===============================
// Inisialisasi
// ===============================

async function init() {

    try {

        const startBtn =
            document.getElementById("startBtn");

        const loading =
            document.getElementById("loading");

        startBtn.disabled = true;
        startBtn.innerHTML = "Memuat Model...";

        if (loading)
            loading.style.display = "block";


        // Load model

        const modelURL =
            URL + "model.json";

        const metadataURL =
            URL + "metadata.json";

        model =
            await tmImage.load(
                modelURL,
                metadataURL
            );

        maxPredictions =
            model.getTotalClasses();


        // Kamera

        webcam =
            new tmImage.Webcam(
                350,
                350,
                false
            );

        await webcam.setup({
            facingMode: "environment"
        });

        await webcam.play();

        window.requestAnimationFrame(loop);


        // Menampilkan kamera

        const webcamContainer =
            document.getElementById(
                "webcam-container"
            );

        webcamContainer.innerHTML = "";

        webcamContainer.appendChild(
            webcam.canvas
        );


        // Container hasil

        labelContainer =
            document.getElementById(
                "label-container"
            );


        // Sembunyikan loading

        if (loading)
            loading.style.display = "none";


        // Hilangkan tombol

        startBtn.style.display = "none";


    }

    catch (error) {

        console.error(error);

        document
            .getElementById(
                "label-container"
            ).innerHTML = `

            <div class="error-card">

                <h2>❌ Gagal</h2>

                <p>

                Kamera atau model
                tidak dapat dimuat.

                </p>

            </div>

        `;
    }

}


// ===============================
// Loop Kamera
// ===============================

async function loop() {

    webcam.update();

    await predict();

    window.requestAnimationFrame(loop);

}



// ===============================
// Prediksi
// ===============================

async function predict() {

    const prediction =
        await model.predict(
            webcam.canvas
        );


    // Cari prediksi tertinggi

    let highest =
        prediction[0];

    for (
        let i = 1;
        i < prediction.length;
        i++
    ) {

        if (
            prediction[i].probability >
            highest.probability
        ) {

            highest =
                prediction[i];

        }

    }


    // Jika keyakinan model terlalu rendah

    if (
        highest.probability <
        MIN_CONFIDENCE
    ) {

        tampilkanTidakDikenali();

        return;

    }


    // Agar hasil tidak berubah-ubah

    const sekarang =
        Date.now();

    if (

        hasilTerakhir ===
        highest.className &&

        sekarang -
        waktuTerakhir <

        UPDATE_INTERVAL

    ) {

        return;

    }


    hasilTerakhir =
        highest.className;

    waktuTerakhir =
        sekarang;


    // Ambil informasi berdasarkan
    // kategori sampah

    const data =
        getWasteInfo(
            highest.className
        );


    // Tampilkan hasil

    tampilkanHasil(
        data
    );

}



// ===============================
// BAGIAN 3
// Akan berisi:
//
// function getWasteInfo()
// ===============================



// ===============================
// BAGIAN 4
// Akan berisi:
//
// tampilkanHasil()
// tampilkanTidakDikenali()
//
// ===============================

function tampilkanHasil(data) {

    labelContainer.innerHTML = `

        <div class="hasil ${data.color}">

            <h2>${data.title}</h2>

            <div class="hasil-item">
                <h3>Contoh</h3>
                <p>${data.contoh}</p>
            </div>

            <div class="hasil-item">
                <h3>Cara Pengelolaan</h3>
                <p>${data.pengelolaan}</p>
            </div>

            <div class="hasil-item">
                <h3>Waktu Penguraian</h3>
                <p>${data.penguraian}</p>
            </div>

        </div>

    `;

}

function tampilkanTidakDikenali() {

    labelContainer.innerHTML = `

        <div class="hasil unknown">

            <h2>❓ Tidak Dikenali</h2>

            <div class="hasil-item">
                <p>
                    Model belum yakin dengan kategori ini.
                    Arahkan kamera ke sampah yang lebih jelas dan coba lagi.
                </p>
            </div>

        </div>

    `;

}

// ===============================
// DATABASE INFORMASI SAMPAH
// ===============================

function getWasteInfo(jenis) {

    switch (jenis) {

        case "Organik":
            return {

                title: "🌿 Sampah Organik",

                color: "organik",

                contoh:
                    "Sisa makanan, ranting kayu, daun kering.",

                pengelolaan:
                    "Pisahkan ke tempat sampah organik, kemudian olah menjadi kompos atau pupuk organik.",

                penguraian:
                    "± 1–6 bulan"

            };



        case "Anorganik":
            return {

                title: "♻️ Sampah Anorganik",

                color: "anorganik",

                contoh:
                    "Kertas, karton, kardus, bungkus makanan, plastik, botol minuman, botol kaca, kaca, kaleng minuman, kaleng biskuit, kardus paket, majalah, pecahan kaca.",

                pengelolaan:
                    "Pisahkan berdasarkan jenisnya, bersihkan jika diperlukan, kemudian daur ulang atau setor ke bank sampah.",

                penguraian:
                    "Kertas 2–6 bulan • Kaleng 80–200 tahun • Plastik 100–500 tahun • Kaca lebih dari 1 juta tahun"

            };



        case "Bahan Berbahaya":
            return {

                title: "☣️ Sampah B3",

                color: "b3",

                contoh:
                    "HP rusak, baterai bekas, kabel, lampu TL.",

                pengelolaan:
                    "Jangan dibuang ke tempat sampah biasa. Serahkan ke tempat pengumpulan limbah B3 atau pusat daur ulang elektronik.",

                penguraian:
                    "Puluhan hingga ratusan tahun dan dapat mencemari lingkungan."

            };



        case "Residu":
            return {

                title: "🚫 Sampah Residu",

                color: "residu",

                contoh:
                    "Popok, pembalut, tampon.",

                pengelolaan:
                    "Bungkus rapat sebelum dibuang ke tempat sampah residu. Jangan dicampur dengan sampah yang dapat didaur ulang.",

                penguraian:
                    "± 250–500 tahun"

            };



        default:

            return {

                title: "❓ Tidak Diketahui",

                color: "unknown",

                contoh: "-",

                pengelolaan: "-",

                penguraian: "-"

            };

    }

}