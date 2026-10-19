const { Pool } = require("pg");
const crypto = require("crypto");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const safeEqual = (a,b) => { const x=Buffer.from(String(a||"")), y=Buffer.from(String(b||"")); return x.length===y.length && crypto.timingSafeEqual(x,y); };
module.exports = async (req,res) => {
  res.setHeader("Cache-Control","no-store");
  if (req.headers["x-admin-token"] == null || !process.env.ADMIN_TOKEN || !safeEqual(req.headers["x-admin-token"],process.env.ADMIN_TOKEN)) return res.status(401).json({error:"Acesso administrativo não autorizado."});
  try {
    if(req.method==="GET") {
      const q=await pool.query("SELECT f.id,f.family_name,f.invite_code,g.id AS guest_id,g.full_name,r.attending,r.updated_at FROM families f LEFT JOIN guests g ON g.family_id=f.id LEFT JOIN rsvps r ON r.guest_id=g.id ORDER BY f.family_name,g.sort_order,g.full_name");
      const families={}; for(const row of q.rows){if(!families[row.id])families[row.id]={id:row.id,name:row.family_name,code:row.invite_code,guests:[]};if(row.guest_id)families[row.id].guests.push({id:row.guest_id,name:row.full_name,attending:row.attending,updatedAt:row.updated_at});}
      return res.status(200).json({families:Object.values(families)});
    }
    if(req.method==="POST") {
      const name=String(req.body?.familyName||"").trim();
      const guests=req.body?.guests;
      if(name.length<2||name.length>120||!Array.isArray(guests)||guests.length<1||guests.length>30||guests.some(x=>typeof x!=="string"||x.trim().length<2||x.trim().length>120)) return res.status(400).json({error:"Informe o nome da família e de 1 a 30 convidados válidos."});
      const client=await pool.connect(); try {await client.query("BEGIN"); let code; for(let i=0;i<8;i++){code="CEC-"+crypto.randomBytes(3).toString("hex").toUpperCase();const exists=await client.query("SELECT 1 FROM families WHERE invite_code=$1",[code]);if(!exists.rowCount)break;}
        const family=await client.query("INSERT INTO families(family_name,invite_code) VALUES($1,$2) RETURNING id,family_name,invite_code",[name,code]);
        for(let i=0;i<guests.length;i++)await client.query("INSERT INTO guests(family_id,full_name,sort_order) VALUES($1,$2,$3)",[family.rows[0].id,guests[i].trim(),i]);
        await client.query("COMMIT");return res.status(201).json({family:{id:family.rows[0].id,name:family.rows[0].family_name,code:family.rows[0].invite_code}});
      }catch(e){await client.query("ROLLBACK");throw e;}finally{client.release();}
    }
    return res.status(405).json({error:"Método não permitido."});
  } catch(e){console.error(e);return res.status(500).json({error:"Erro ao consultar o painel."});}
};