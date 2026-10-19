const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });
  const code = String(req.body?.code || "").trim().toUpperCase();
  const responses = req.body?.responses;
  if (!/^[A-Z0-9-]{5,24}$/.test(code) || !Array.isArray(responses) || !responses.length || responses.length > 30 || responses.some(x=>typeof x.id!=="string" || typeof x.attending!=="boolean")) return res.status(400).json({ error: "Dados da confirmação inválidos." });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const family = await client.query("SELECT id FROM families WHERE upper(invite_code)=upper($1)",[code]);
    if (!family.rowCount) { await client.query("ROLLBACK"); return res.status(404).json({error:"Código não encontrado."}); }
    for (const item of responses) {
      const valid = await client.query("SELECT id FROM guests WHERE id=$1 AND family_id=$2",[item.id,family.rows[0].id]);
      if (!valid.rowCount) { await client.query("ROLLBACK"); return res.status(400).json({error:"O convite contém uma pessoa inválida."}); }
      await client.query("INSERT INTO rsvps(guest_id,attending,updated_at) VALUES($1,$2,now()) ON CONFLICT(guest_id) DO UPDATE SET attending=EXCLUDED.attending,updated_at=now()",[item.id,item.attending]);
    }
    await client.query("COMMIT");
    return res.status(200).json({ok:true,message:"Presença registrada com sucesso. Obrigado! 🌼"});
  } catch(e) { await client.query("ROLLBACK"); console.error(e); return res.status(500).json({error:"Não foi possível salvar a confirmação."}); }
  finally { client.release(); }
};