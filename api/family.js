const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });
  const code = String(req.body?.code || "").trim().toUpperCase();
  if (!/^[A-Z0-9-]{5,24}$/.test(code)) return res.status(400).json({ error: "Digite um código válido." });
  try {
    const result = await pool.query("SELECT f.id, f.family_name, g.id AS guest_id, g.full_name, r.attending FROM families f LEFT JOIN guests g ON g.family_id=f.id LEFT JOIN rsvps r ON r.guest_id=g.id WHERE upper(f.invite_code)=upper($1) ORDER BY g.sort_order, g.full_name", [code]);
    if (!result.rowCount) return res.status(404).json({ error: "Não encontramos esse convite. Confira o código com a família que enviou." });
    return res.status(200).json({ family: result.rows[0].family_name, guests: result.rows.filter(x=>x.guest_id).map(x=>({id:x.guest_id,name:x.full_name,attending:x.attending})) });
  } catch (e) { console.error(e); return res.status(500).json({ error: "Não foi possível consultar o convite agora." }); }
};