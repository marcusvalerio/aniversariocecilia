const { Pool } = require("pg");
const crypto = require("crypto");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const safeEqual=(a,b)=>{const x=Buffer.from(String(a||"")),y=Buffer.from(String(b||""));return x.length===y.length&&crypto.timingSafeEqual(x,y)};
const ABC="ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const makeCode=()=>"CEC-"+Array.from(crypto.randomBytes(5),b=>ABC[b%ABC.length]).join("");
module.exports=async(req,res)=>{
 res.setHeader("Cache-Control","no-store");
 if(!process.env.ADMIN_TOKEN||!safeEqual(req.headers["x-admin-token"],process.env.ADMIN_TOKEN))return res.status(401).json({error:"Acesso administrativo não autorizado."});
 try{
  if(req.method==="GET"){
   const q=await pool.query("SELECT f.id,f.family_name,f.invite_code,f.created_at,g.id AS guest_id,g.full_name,g.sort_order,r.attending,r.updated_at FROM families f LEFT JOIN guests g ON g.family_id=f.id LEFT JOIN rsvps r ON r.guest_id=g.id ORDER BY f.created_at DESC,g.sort_order,g.full_name");
   const map={};for(const x of q.rows){if(!map[x.id])map[x.id]={id:x.id,name:x.family_name,code:x.invite_code,createdAt:x.created_at,guests:[]};if(x.guest_id)map[x.id].guests.push({id:x.guest_id,name:x.full_name,sortOrder:x.sort_order,attending:x.attending,updatedAt:x.updated_at});}
   const families=Object.values(map);const guests=families.flatMap(f=>f.guests);
   return res.status(200).json({families,stats:{families:families.length,guests:guests.length,confirmed:guests.filter(g=>g.attending===true).length,declined:guests.filter(g=>g.attending===false).length,pending:guests.filter(g=>g.attending===null).length}});
  }
  if(req.method==="POST"){
   const name=String(req.body?.familyName||"").trim(),guests=req.body?.guests;
   if(name.length<2||name.length>120||!Array.isArray(guests)||guests.length<1||guests.length>30||guests.some(x=>typeof x!=="string"||x.trim().length<2||x.trim().length>120))return res.status(400).json({error:"Informe a família e de 1 a 30 convidados válidos."});
   const client=await pool.connect();try{await client.query("BEGIN");let code;for(let i=0;i<10;i++){code=makeCode();if(!(await client.query("SELECT 1 FROM families WHERE invite_code=$1",[code])).rowCount)break;}
    const f=await client.query("INSERT INTO families(family_name,invite_code) VALUES($1,$2) RETURNING id,family_name,invite_code",[name,code]);for(let i=0;i<guests.length;i++)await client.query("INSERT INTO guests(family_id,full_name,sort_order) VALUES($1,$2,$3)",[f.rows[0].id,guests[i].trim(),i]);await client.query("COMMIT");return res.status(201).json({family:{id:f.rows[0].id,name:f.rows[0].family_name,code:f.rows[0].invite_code}});
   }catch(e){await client.query("ROLLBACK");throw e}finally{client.release()}
  }
  if(req.method==="PATCH"){
   const action=req.body?.action,id=String(req.body?.familyId||"");
   if(action==="rename"){
    const name=String(req.body?.familyName||"").trim();if(!id||name.length<2||name.length>120)return res.status(400).json({error:"Nome da família inválido."});
    const r=await pool.query("UPDATE families SET family_name=$2 WHERE id=$1 RETURNING id",[id,name]);if(!r.rowCount)return res.status(404).json({error:"Família não encontrada."});return res.status(200).json({ok:true});
   }
   if(action==="regenerate-code"){
    if(!id)return res.status(400).json({error:"Família inválida."});let code;for(let i=0;i<10;i++){code=makeCode();if(!(await pool.query("SELECT 1 FROM families WHERE invite_code=$1",[code])).rowCount)break;}
    const r=await pool.query("UPDATE families SET invite_code=$2 WHERE id=$1 RETURNING invite_code",[id,code]);if(!r.rowCount)return res.status(404).json({error:"Família não encontrada."});return res.status(200).json({code:r.rows[0].invite_code});
   }
   if(action==="add-guests"){
    const guests=req.body?.guests;if(!id||!Array.isArray(guests)||!guests.length||guests.length>30||guests.some(x=>typeof x!=="string"||x.trim().length<2||x.trim().length>120))return res.status(400).json({error:"Informe de 1 a 30 nomes válidos."});
    const f=await pool.query("SELECT id FROM families WHERE id=$1",[id]);if(!f.rowCount)return res.status(404).json({error:"Família não encontrada."});
    const max=await pool.query("SELECT COALESCE(MAX(sort_order),-1)+1 AS n FROM guests WHERE family_id=$1",[id]);for(let i=0;i<guests.length;i++)await pool.query("INSERT INTO guests(family_id,full_name,sort_order) VALUES($1,$2,$3)",[id,guests[i].trim(),Number(max.rows[0].n)+i]);return res.status(200).json({ok:true});
   }
   if(action==="rename-guest"){
    const guestId=String(req.body?.guestId||""),name=String(req.body?.name||"").trim();if(!id||!guestId||name.length<2||name.length>120)return res.status(400).json({error:"Dados do convidado inválidos."});
    const r=await pool.query("UPDATE guests SET full_name=$3 WHERE id=$1 AND family_id=$2 RETURNING id",[guestId,id,name]);if(!r.rowCount)return res.status(404).json({error:"Convidado não encontrado."});return res.status(200).json({ok:true});
   }
   if(action==="delete-guest"){
    const guestId=String(req.body?.guestId||"");const r=await pool.query("DELETE FROM guests WHERE id=$1 AND family_id=$2 RETURNING id",[guestId,id]);if(!r.rowCount)return res.status(404).json({error:"Convidado não encontrado."});return res.status(200).json({ok:true});
   }
   if(action==="delete-family"){
    const r=await pool.query("DELETE FROM families WHERE id=$1 RETURNING id",[id]);if(!r.rowCount)return res.status(404).json({error:"Família não encontrada."});return res.status(200).json({ok:true});
   }
   return res.status(400).json({error:"Ação administrativa inválida."});
  }
  return res.status(405).json({error:"Método não permitido."});
 }catch(e){console.error(e);return res.status(500).json({error:"Não foi possível concluir a operação administrativa."})}
};