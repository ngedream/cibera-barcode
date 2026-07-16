let qrCodeInstance = null;
let html5QrCode = null;
let isScanning = false;

// ================ TAB SWITCHING ================
function openTab(tabName) {
    // Sembunyikan semua konten tab
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    // Tampilkan tab yang dipilih
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // Tandai tombol yang aktif
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        if (btn.textContent.includes('Buat') && tabName === 'generate') {
            btn.classList.add('active');
        } else if (btn.textContent.includes('Scan') && tabName === 'scan') {
            btn.classList.add('active');
        }
    });
}

// ================ QR GENERATOR (TAB 1) ================
document.getElementById('generate-btn').addEventListener('click', function() {
    const text = document.getElementById('qr-text').value.trim();
    if (!text) {
        alert('Masukkan teks atau URL dulu!');
        return;
    }

    const container = document.getElementById('qrcode-container');
    container.innerHTML = ''; // Bersihkan QR lama

    // Buat QR baru
    qrCodeInstance = new QRCode(container, {
        text: text,
        width: 200,
        height: 200,
        colorDark: "#1a202c",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    // Tampilkan tombol download & simpan riwayat
    document.getElementById('download-btn').style.display = 'inline-block';
    saveHistory(text);
});

// ================ DOWNLOAD PNG ================
document.getElementById('download-btn').addEventListener('click', function() {
    const canvas = document.querySelector('#qrcode-container canvas');
    if (!canvas) {
        alert('Generate QR dulu ya!');
        return;
    }
    
    const link = document.createElement('a');
    link.download = `qrcode_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// ================ LOCAL STORAGE (Riwayat) ================
function saveHistory(text) {
    let history = JSON.parse(localStorage.getItem('qrHistory')) || [];
    history.push({ text: text, date: new Date().toLocaleString() });
    localStorage.setItem('qrHistory', JSON.stringify(history));
    updateHistoryCount();
}

function updateHistoryCount() {
    const history = JSON.parse(localStorage.getItem('qrHistory')) || [];
    document.getElementById('history-count').textContent = history.length;
}

// Jalankan saat halaman dimuat
updateHistoryCount();

// ================ QR SCANNER (TAB 2) ================
document.getElementById('scan-btn').addEventListener('click', function() {
    if (isScanning) {
        alert('Scanner sedang berjalan!');
        return;
    }

    // Cek apakah browser support kamera
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Browser kamu tidak mendukung akses kamera. Pakai Chrome/Edge di HP atau PC.');
        return;
    }

    const readerElement = document.getElementById('reader');
    
    // Konfigurasi Scanner
    html5QrCode = new Html5Qrcode("reader");
    
    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    };

    html5QrCode.start(
        { facingMode: "environment" }, // Kamera belakang (HP)
        config,
        // Callback SUKSES scan
        (decodedText, decodedResult) => {
            document.getElementById('decoded-text').textContent = decodedText;
            document.getElementById('decoded-text').style.borderColor = '#48bb78';
            document.getElementById('decoded-text').style.borderStyle = 'solid';
            // Stop scan otomatis biar irit baterai
            stopScanner();
            alert('✅ Scan berhasil! Lihat hasil di bawah.');
        },
        // Callback ERROR (gagal baca)
        (errorMessage) => {
            // Biarkan saja, ini normal kalau belum ada QR di depan kamera
        }
    ).then(() => {
        isScanning = true;
        document.getElementById('scan-btn').style.display = 'none';
        document.getElementById('stop-scan-btn').style.display = 'inline-block';
        document.getElementById('decoded-text').textContent = '🔍 Mencari QR Code di depan kamera...';
        document.getElementById('decoded-text').style.borderColor = '#ed8936';
        document.getElementById('decoded-text').style.borderStyle = 'solid';
    }).catch(err => {
        console.error(err);
        alert('Gagal mengakses kamera: ' + err.message);
    });
});

// ================ STOP SCANNER ================
document.getElementById('stop-scan-btn').addEventListener('click', function() {
    stopScanner();
});

function stopScanner() {
    if (html5QrCode && isScanning) {
        html5QrCode.stop().then(() => {
            isScanning = false;
            document.getElementById('scan-btn').style.display = 'inline-block';
            document.getElementById('stop-scan-btn').style.display = 'none';
            document.getElementById('decoded-text').textContent = 'Scanner dihentikan.';
            document.getElementById('decoded-text').style.borderColor = '#e2e8f0';
            document.getElementById('decoded-text').style.borderStyle = 'dashed';
        }).catch(err => console.warn('Error stop scan:', err));
    }
}
