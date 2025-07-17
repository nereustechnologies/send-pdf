const express = require('express');
const router = express.Router();
const cors = require('cors');
const { IncomingForm } = require('formidable');
const fs = require('fs');

// CORS middleware
router.use(cors({ origin: '*' }));

router.post('/send-pdf', (req, res) => {
  const form = new IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).send('Form parse error');

    const { name, email, id } = fields;
    const pdf = files.pdf;

    if (!pdf || !pdf.filepath) return res.status(400).send('Missing PDF');

    try {
      const pdfBuffer = fs.readFileSync(pdf.filepath);
      const base64Pdf = pdfBuffer.toString('base64');

      const n8nRes = await fetch('http://129.154.255.167:5678/webhook/80fcad87-092c-4916-9978-af6b7e9ed626', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, email, base64Pdf }),
      });

      if (!n8nRes.ok) return res.status(500).send('Failed to forward to n8n');

      res.json({ success: true });
    } catch (error) {
      console.error('🔥 Error sending to n8n:', error);
      res.status(500).send('Server error');
    }
  });
});

module.exports = router;
