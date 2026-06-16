const URL = "./";

let model;
let webcam;
let labelContainer;
let maxPredictions;

document
    .getElementById("startBtn")
    .addEventListener("click", init);

async function init() {
    try {

        document.getElementById("startBtn").disabled = true;
        document.getElementById("startBtn").innerText =
            "Memuat Model...";

        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        model = await tmImage.load(
            modelURL,
            metadataURL
        );

        maxPredictions = model.getTotalClasses();

        webcam = new tmImage.Webcam(
            350,
            350,
            true
        );

        await webcam.setup();
        await webcam.play();

        window.requestAnimationFrame(loop);

        const webcamContainer =
            document.getElementById("webcam-container");

        webcamContainer.innerHTML = "";
        webcamContainer.appendChild(webcam.canvas);

        labelContainer =
            document.getElementById("label-container");

        document.getElementById("startBtn").style.display =
            "none";

    } catch (error) {
        console.error(error);

        document.getElementById("label-container").innerHTML =
            "❌ Gagal membuka kamera atau memuat model.";
    }
}

async function loop() {
    webcam.update();

    await predict();

    window.requestAnimationFrame(loop);
}

async function predict() {

    const prediction =
        await model.predict(webcam.canvas);

    let highest = prediction[0];

    for (let i = 1; i < prediction.length; i++) {
        if (
            prediction[i].probability >
            highest.probability
        ) {
            highest = prediction[i];
        }
    }

    const persen =
        (highest.probability * 100).toFixed(2);

    labelContainer.innerHTML = `
        <div class="hasil">
            <h2>${highest.className}</h2>
            <p>Akurasi: ${persen}%</p>
        </div>
    `;
}