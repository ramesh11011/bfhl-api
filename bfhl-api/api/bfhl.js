// Vercel serverless function
export default function handler(req, res) {
  // Optional CORS for browser testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(200).json({
      is_success: false,
      error: 'Only POST is allowed on /bfhl'
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const data = body?.data;

    if (!Array.isArray(data)) {
      return res.status(200).json({
        is_success: false,
        error: 'Body must be JSON with an array field "data".'
      });
    }

    const FULL_NAME = process.env.FULL_NAME || 'john doe';
    const DOB_DDMMYYYY = process.env.DOB_DDMMYYYY || '17091999'; // ddmmyyyy
    const EMAIL = process.env.EMAIL || 'john@xyz.com';
    const ROLL_NUMBER = process.env.ROLL_NUMBER || 'ABCD123';

    const user_id = `${FULL_NAME.trim().toLowerCase().replace(/\s+/g, '_')}_${DOB_DDMMYYYY}`;

    const isNumeric = (s) => typeof s === 'string' && /^-?\d+$/.test(s.trim());
    const isAlpha = (s) => typeof s === 'string' && /^[A-Za-z]+$/.test(s.trim());

    const even_numbers = [];
    const odd_numbers = [];
    const alphabets = [];
    const special_characters = [];

    let sum = 0n;
    let letterStream = [];

    for (const raw of data) {
      const s = String(raw);

      if (isNumeric(s)) {
        const big = BigInt(s);
        sum += big;
        (big % 2n === 0n ? even_numbers : odd_numbers).push(s);
      } else if (isAlpha(s)) {
        const upper = s.toUpperCase();
        alphabets.push(upper);
        letterStream.push(...upper.split(''));
      } else {
        special_characters.push(s);
      }
    }

    // Build concat_string: reverse letters, alternating caps starting Upper
    const reversed = letterStream.reverse();
    const concat_string = reversed
      .map((ch, idx) => (idx % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()))
      .join('');

    return res.status(200).json({
      is_success: true,
      user_id,
      email: EMAIL,
      roll_number: ROLL_NUMBER,
      odd_numbers,
      even_numbers,
      alphabets,
      special_characters,
      sum: sum.toString(),
      concat_string
    });
  } catch {
    return res.status(200).json({
      is_success: false,
      error: 'Malformed JSON or internal error.'
    });
  }
}
