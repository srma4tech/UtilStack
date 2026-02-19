export const tools = [
  {
    id: 'ocr',
    name: 'Screenshot to Text (OCR)',
    description: 'Extract text from images using Tesseract.js in your browser.',
    modulePath: '../modules/ocr.js',
    seoPath: 'tools/ocr.html'
  },
  {
    id: 'text-case',
    name: 'Text Case Converter',
    description: 'Convert text to uppercase, lowercase, title, sentence, and more.',
    modulePath: '../modules/text-case.js',
    seoPath: 'tools/text-case.html'
  },
  {
    id: 'word-counter',
    name: 'Word & Character Counter',
    description: 'Track words, characters, reading time, and text structure instantly.',
    modulePath: '../modules/word-counter.js',
    seoPath: 'tools/word-counter.html'
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF Converter',
    description: 'Convert one or more images into a downloadable PDF client-side.',
    modulePath: '../modules/image-to-pdf.js',
    seoPath: 'tools/image-to-pdf.html'
  },
  {
    id: 'compressor',
    name: 'Image Compressor',
    description: 'Compress image files with a quality slider before downloading.',
    modulePath: '../modules/compressor.js',
    seoPath: 'tools/compressor.html'
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter & Validator',
    description: 'Validate, prettify, and minify JSON in real time.',
    modulePath: '../modules/json-formatter.js',
    seoPath: 'tools/json-formatter.html'
  },
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    description: 'Calculate exact age and time to next birthday from date of birth.',
    modulePath: '../modules/age-calculator.js',
    seoPath: 'tools/age-calculator.html'
  }
];

export const toolMap = Object.fromEntries(tools.map((tool) => [tool.id, tool]));
