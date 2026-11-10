// XConvert Pro — application state and tool metadata
// Application Global State
        const state = {
            currentPage: 'home',
            activeTool: 'compress',
            originalImage: null,
            loadedImageName: 'image.jpg',
            originalFileSize: 0,
            
            compress: { quality: 0.70 },
            resize: { width: 1200, height: 800, lockAspect: true, percentage: 80, mode: 'pixels' },
            crop: { x: 10, y: 10, width: 80, height: 80 },
            convert: { format: 'jpeg', quality: 0.9 },
            editor: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, hue: 0 },
            removebg: { tolerance: 30 },
            upscale: { scale: 2 },
            watermark: { text: '© XConvert Pro', fontSize: 36, opacity: 0.7, color: '#ffffff', position: 'bottom-right' },
            meme: { topText: 'WHEN YOU USE', bottomText: 'XCONVERT PRO FOR YOUR PHOTOS', fontSize: 42, textColor: '#ffffff' },
            rotate: { angle: 0, flipH: false, flipV: false }
        };

        const toolsMeta = {
            compress: { title: 'Compress Images', desc: 'Adjust JPEG quality to reduce image file size and download an optimized JPG.', icon: '↓', actionText: 'Compress Image' },
            convert: { title: 'Convert Images', desc: 'Convert supported images to JPG, PNG or WebP formats in your browser.', icon: '⇄', actionText: 'Convert Image' },
            resize: { title: 'Resize Images', desc: 'Set exact pixel dimensions or resize images by percentage while keeping proportions.', icon: '↗', actionText: 'Resize Image' },
            crop: { title: 'Crop Images', desc: 'Crop an image with adjustable position and area controls before exporting.', icon: '⌗', actionText: 'Crop Image' },
            editor: { title: 'Photo Editor', desc: 'Adjust brightness, contrast, saturation, blur and color effects on your image.', icon: '✦', actionText: 'Save Edited Image' },
            removebg: { title: 'Remove Background', desc: 'Remove connected background colors around the image edges and export a transparent PNG.', icon: '✧', actionText: 'Remove Background' },
            upscale: { title: 'Upscale Images', desc: 'Enlarge image dimensions with browser-based canvas scaling.', icon: '↑', actionText: 'Upscale Image' },
            watermark: { title: 'Watermark Images', desc: 'Add a customizable text watermark with adjustable size, color, opacity and position.', icon: '◆', actionText: 'Add Watermark' },
            meme: { title: 'Meme Generator', desc: 'Add top and bottom captions to an image and export your meme.', icon: '☺', actionText: 'Generate Meme' },
            rotate: { title: 'Rotate Images', desc: 'Rotate and flip images, then export the adjusted result.', icon: '↻', actionText: 'Export Rotated Image' }
        };

export { state, toolsMeta };
