const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const fs = require('fs');

router.post('/send-pdf', (req, res) => {
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).send('Form parse error');

    const { name, email, id } = fields;
    const pdf = files.pdf;

    if (!pdf || !pdf.filepath) return res.status(400).send('Missing PDF');

    const pdfBuffer = fs.readFileSync(pdf.filepath);
    const base64Pdf = pdfBuffer.toString('base64');

    // Send to n8n
    const n8nRes = await fetch('http://<n8n-url>', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        name,
        email,
        base64Pdf,
      }),
    });

    if (!n8nRes.ok) return res.status(500).send('Failed to forward to n8n');

    res.json({ success: true });
  });
});

module.exports = router;
