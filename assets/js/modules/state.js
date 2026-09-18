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
            compress: { title: 'Compress IMAGE', desc: 'Compress JPG, PNG, SVG or GIF with the best quality and compression.', icon: '↓', actionText: 'Compress IMAGES' },
            resize: { title: 'Resize IMAGE', desc: 'Define your dimensions, by percent or pixel, and resize your images.', icon: '↗', actionText: 'Resize IMAGES' },
            crop: { title: 'Crop IMAGE', desc: 'Crop JPG, PNG or GIFs by defining an area in pixels.', icon: '⌗', actionText: 'Crop IMAGE' },
            convert: { title: 'Convert to JPG', desc: 'Turn PNG, GIF, WEBP or SVG images easily to JPG format.', icon: '⇄', actionText: 'Convert to JPG' },
            editor: { title: 'Photo Editor', desc: 'Adjust brightness, contrast, saturation, and apply filters.', icon: '☷', actionText: 'Save edited IMAGE' },
            removebg: { title: 'Remove Background', desc: 'Automatically erase background colors with instant transparent output.', icon: '✦', actionText: 'Remove Background' },
            upscale: { title: 'Upscale IMAGE', desc: 'Enlarge image resolution with detail enhancement.', icon: '↑', actionText: 'Upscale IMAGES' },
            watermark: { title: 'Watermark IMAGE', desc: 'Stamp an image or text over your images in seconds.', icon: '◆', actionText: 'Watermark IMAGES' },
            meme: { title: 'Meme Generator', desc: 'Caption memes or upload your own images to make custom memes.', icon: '☺', actionText: 'Generate Meme' },
            rotate: { title: 'Rotate IMAGE', desc: 'Rotate many images at once. Choose landscape or portrait.', icon: '↻', actionText: 'Rotate IMAGES' }
        };

export { state, toolsMeta };
