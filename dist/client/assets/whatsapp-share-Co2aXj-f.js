import{c as _}from"./createLucideIcon-BajQtZhx.js";import{$}from"./index-LH3EOLrM.js";const h=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],D=_("chevron-left",h),g=["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];function y(t){const[n,e,o]=t.split("-").map(Number);return new Date(n,(e??1)-1,o??1)}function d(t){const n=y(t),e=g[n.getDay()],o=String(n.getDate()).padStart(2,"0"),a=String(n.getMonth()+1).padStart(2,"0");return`${e}, ${o}/${a}`}function p(t){return t?t.slice(0,5):""}function m(t){const n=p(t.start_time),e=t.end_time?` – ${p(t.end_time)}`:"",o=t.show_type!==!1&&t.type_name?` • ${t.type_name}`:"",a=t.is_live?" 🔴 AO VIVO":"",i=t.is_live&&t.live_url?`
   ${t.live_url}`:"";return`🕒 ${n}${e} – ${t.location_name}${o}${a}${i}`}function S(t,n,e){const o=e?.trim()||"Agenda";if(n.length===0)return`*${o}*
${d(t)}

Nenhuma programação para este dia.`;const i=[...n].sort((c,r)=>(c.start_time??"").localeCompare(r.start_time??"")).map(m).join(`
`);return`*${o}*
📅 ${d(t)}

${i}`}function b(t,n,e){const o=n?.trim()||"Agenda";if(t.length===0)return`*${o}*${e?`
${e}`:""}

Nenhuma programação no período.`;const a=new Map;for(const r of t){const s=a.get(r.event_date)??[];s.push(r),a.set(r.event_date,s)}const c=[...a.keys()].sort().map(r=>{const s=(a.get(r)??[]).sort((f,l)=>(f.start_time??"").localeCompare(l.start_time??""));return`📅 ${d(r)}
${s.map(m).join(`
`)}`});return`*${o}*${e?`
${e}`:""}

${c.join(`

`)}`}function A(t){const n=typeof navigator<"u"?navigator:null;if(n?.share){n.share({text:t}).catch(()=>{u(t)});return}u(t)}function u(t){try{if(typeof navigator<"u"&&navigator.clipboard){navigator.clipboard.writeText(t),$(async()=>{const{toast:n}=await import("./index-LH3EOLrM.js").then(e=>e.aA);return{toast:n}},[]).then(({toast:n})=>n.success("Mensagem copiada! Cole no WhatsApp para compartilhar."));return}}catch{}typeof window<"u"&&window.open(`https://wa.me/?text=${encodeURIComponent(t)}`,"_blank","noopener,noreferrer")}export{D as C,S as a,b,A as o};
