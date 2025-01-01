// Import your HuffmanEncoder
import { HuffmanEncoder } from './encoder.js';

const encoder = new HuffmanEncoder();

// Get UI elements
const inputText = document.getElementById('input-text');
const encodeBtn = document.getElementById('encode-btn');
const decodeBtn = document.getElementById('decode-btn');
const originalSize = document.getElementById('original-size');
const compressedSize = document.getElementById('compressed-size');
const compressionRatio = document.getElementById('compression-ratio');

// Function to update the byte display with cool animation
function updateByteDisplay(bytes) {
    const byteDisplay = document.getElementById('byte-display');
    byteDisplay.innerHTML = '';
    
    bytes.forEach((byte, index) => {
        const byteElement = document.createElement('div');
        byteElement.className = 'byte';
        byteElement.style.opacity = '0';
        byteElement.style.transform = 'translateY(20px)';
        byteElement.textContent = byte.toString(2).padStart(8, '0');
        byteDisplay.appendChild(byteElement);

        // Animate each byte appearing
        setTimeout(() => {
            byteElement.style.transition = 'all 0.3s ease';
            byteElement.style.opacity = '1';
            byteElement.style.transform = 'translateY(0)';
        }, index * 30);
    });
}

// Function to update encoding map with animation
function updateEncodingMap(map) {
    const mapDisplay = document.getElementById('encoding-map');
    mapDisplay.innerHTML = '';
    
    Object.entries(map).forEach(([char, code], index) => {
        const p = document.createElement('p');
        p.style.opacity = '0';
        p.style.transform = 'translateX(-20px)';
        p.textContent = `'${char === '\n' ? '\\n' : char}': ${code}`;
        mapDisplay.appendChild(p);

        // Animate each entry appearing
        setTimeout(() => {
            p.style.transition = 'all 0.3s ease';
            p.style.opacity = '1';
            p.style.transform = 'translateX(0)';
        }, index * 50);
    });
}

// Handle encoding
encodeBtn.addEventListener('click', async () => {
    const text = inputText.value;
    if (!text) return;

    try {
        // Create a pseudo-file in memory with the input text
        const textEncoder = new TextEncoder();
        const content = textEncoder.encode(text);
        
        // Calculate frequencies
        const freqArray = [];
        const freqMap = {};
        for (let char of text) {
            freqMap[char] = (freqMap[char] || 0) + 1;
        }
        Object.entries(freqMap).forEach(([char, freq]) => {
            freqArray.push({ char, freq });
        });

        // Build Huffman tree and generate encoding
        const huffmanTree = encoder.buildHuffmanTree(freqArray);
        const encodingMap = encoder.generateEncodingMap();
        
        // Encode the content
        const encoded = await encoder.encodeFile(text);

        // Update UI
        updateByteDisplay(encoded);
        updateEncodingMap(encodingMap);

        // Update statistics
        const origSize = text.length;
        const compSize = encoded.length;
        const ratio = ((origSize - compSize) / origSize * 100).toFixed(2);

        originalSize.textContent = origSize;
        compressedSize.textContent = compSize;
        compressionRatio.textContent = ratio;

    } catch (error) {
        console.error('Encoding error:', error);
    }
});

// Handle decoding
decodeBtn.addEventListener('click', async () => {
    try {
        const decoded = encoder.decode(/* your encoded content */);
        inputText.value = decoded;
    } catch (error) {
        console.error('Decoding error:', error);
    }
});