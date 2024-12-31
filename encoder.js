const fs = require('fs').promises;


class MinHeap {
    constructor() {
        this.heap = [];
    }

    construct(array) {
        array.forEach((element) => {
            this.insert(element);
        });
    }

    insert(n) {
        this.heap.push(n);
        let currentIndex = this.heap.length - 1;

        while (currentIndex > 0) {
            const parentIndex = Math.floor((currentIndex - 1) / 2);
            if (this.heap[parentIndex].freq > this.heap[currentIndex].freq) {
                [this.heap[parentIndex], this.heap[currentIndex]] = [
                    this.heap[currentIndex],
                    this.heap[parentIndex],
                ];
                currentIndex = parentIndex;
            } else {
                break;
            }
        }
    }

    extractMin() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.sinkDown(0);

        return min;
    }

    sinkDown(index) {
        const length = this.heap.length;
        const element = this.heap[index];

        while (true) {
            const leftChildIndex = 2 * index + 1;
            const rightChildIndex = 2 * index + 2;
            let smallestChildIndex = null;

            if (leftChildIndex < length && this.heap[leftChildIndex].freq < element.freq) {
                smallestChildIndex = leftChildIndex;
            }

            if (
                rightChildIndex < length &&
                this.heap[rightChildIndex].freq < element.freq &&
                this.heap[rightChildIndex].freq < this.heap[leftChildIndex].freq
            ) {
                smallestChildIndex = rightChildIndex;
            }

            if (smallestChildIndex === null) break;

            [this.heap[index], this.heap[smallestChildIndex]] = [
                this.heap[smallestChildIndex],
                this.heap[index],
            ];

            index = smallestChildIndex;
        }
    }
}

class HuffmanEncoder {
    constructor() {
        this.freqMap = {};
        this.encodingMap = {};
        this.minHeap = new MinHeap();
        this.rootNode = null;
    }

    // Read file and build frequency map
    async buildFrequencyMap(filename) {
        try {
            const content = await fs.readFile(filename, { encoding: 'utf8' });
            
            // Build frequency map
            for (let char of content) {
                this.freqMap[char] = (this.freqMap[char] || 0) + 1;
            }

            // Convert to array format for MinHeap
            const freqArray = Object.entries(this.freqMap).map(([char, freq]) => ({
                char,
                freq
            }));

            return freqArray;
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    }

    // Build Huffman Tree
    buildHuffmanTree(freqArray) {
        this.minHeap.construct(freqArray);

        while (this.minHeap.heap.length > 1) {
            const firstSmallestNode = this.minHeap.extractMin();
            const secondSmallestNode = this.minHeap.extractMin();

            const combinedFreq = firstSmallestNode.freq + secondSmallestNode.freq;
            const newCombinedNode = {
                freq: combinedFreq,
                char: null,
                leftNode: firstSmallestNode,
                rightNode: secondSmallestNode
            };

            this.minHeap.insert(newCombinedNode);
        }

        this.rootNode = this.minHeap.extractMin();
        return this.rootNode;
    }

    // Generate encoding map by traversing tree
    generateEncodingMap() {
        const bitPattern = [];
        
        const traverse = (node, bitPattern) => {
            if (node.char) {
                this.encodingMap[node.char] = bitPattern.join('');
                return;
            }

            if (node.leftNode) {
                bitPattern.push('0');
                traverse(node.leftNode, bitPattern);
                bitPattern.pop();
            }

            if (node.rightNode) {
                bitPattern.push('1');
                traverse(node.rightNode, bitPattern);
                bitPattern.pop();
            }
        };

        traverse(this.rootNode, bitPattern);
        return this.encodingMap;
    }

    decode(encodedContent) {
        let decodedContent = []
        let currentPath = this.rootNode
        
        for(let i = 0; i < encodedContent.length; i++) {
            if(encodedContent[i] === '0') {
                currentPath = currentPath.leftNode
            } else {
                currentPath = currentPath.rightNode
            }
            
            if(currentPath.char) {
                decodedContent.push(currentPath.char)
                currentPath = this.rootNode
            }
        }
    
        return decodedContent.join('')
    }

    // Encode the entire file
    async encodeFile(filename) {
        try {
            // Read the file
            const content = await fs.readFile(filename, { encoding: 'utf8' });
            
            // Build encoded string
            let encodedContent = '';
            for (let char of content) {
                encodedContent += this.encodingMap[char];
            }

            return encodedContent;
        } catch (error) {
            console.error('Error encoding file:', error);
            throw error;
        }
    }

    // Complete process
    async compress(filename) {
        // Read original content for size comparison
        const originalContent = await fs.readFile(filename, { encoding: 'utf8' });
        console.log('\nOriginal content:');
        console.log('Length:', originalContent.length);
        console.log('Size:', Buffer.from(originalContent).length, 'bytes');
    
        const freqArray = await this.buildFrequencyMap(filename);
        const huffmanTree = this.buildHuffmanTree(freqArray);
        const encodingMap = this.generateEncodingMap();
        const encodedContent = await this.encodeFile(filename);
        
        console.log('\nEncoded content:');
        console.log('Length:', encodedContent.length);
        console.log('Size:', Buffer.from(encodedContent).length, 'bytes');
    
        const decodedContent = this.decode(encodedContent);
        console.log('\nDecoded content:');
        console.log('Length:', decodedContent.length);
        console.log('Size:', Buffer.from(decodedContent).length, 'bytes');
    
        return {
            encodedContent,
            encodingMap,
            huffmanTree,
            decodedContent
        };
    }
}




const encoder = new HuffmanEncoder();
encoder.compress('./test.txt')
    .then(result => {
        console.log('Encoded content:', result.encodedContent);
        console.log('Encoding map:', result.encodingMap);
        const decodedContent = encoder.decode(result.encodedContent)
        console.log("decoded content is", decodedContent)
    })
    .catch(console.error);