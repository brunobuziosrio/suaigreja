import{x as e,j as a}from"./index-LH3EOLrM.js";import{B as o}from"./button-C6dqytb5.js";import{M as n}from"./member-card-zVs6f4fJ.js";import{P as m}from"./printer-BzxmC7FA.js";import"./utils-DJjfXaBT.js";import"./browser-ByqywH9A.js";import"./createLucideIcon-BajQtZhx.js";function x(){const{member:r,church:t}=e.useLoaderData(),i=t?.primary_color||"#0c2340";return a.jsxs("div",{className:"print-card-page min-h-screen flex flex-col items-center justify-center p-4 print:p-0 print:bg-white",style:{background:`linear-gradient(135deg, ${i}18, ${i}04)`},children:[a.jsx("style",{children:`
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          body { display: block !important; }
          .print-card-wrap, .print-card-wrap * { box-shadow: none !important; }
          .print-card-page {
            min-height: auto !important;
            display: block !important;
            padding: 0 !important;
            background: #fff !important;
          }
          .print-card-wrap {
            width: 100mm !important;
            max-width: 100mm !important;
            margin: 0 !important;
          }
          .print-card-wrap .max-w-\\[720px\\] {
            width: 100mm !important;
            max-width: 100mm !important;
            margin: 0 !important;
          }
          .print-card-wrap [style*="aspect-ratio"] {
            width: 100mm !important;
            height: 70mm !important;
            border: 0.2mm solid #d4d4d4 !important;
            border-radius: 2mm !important;
          }
        }
      `}),a.jsx("div",{className:"print-card-wrap w-full max-w-[720px]",children:a.jsx(n,{member:{id:r.id,full_name:r.full_name,photo_url:r.photo_url,role:r.role,status:r.status,member_since:r.member_since,birth_date:r.birth_date,cpf:r.cpf,congregation:r.congregation},church:{brand_title:t?.brand_title??null,card_logo_url:t?.card_logo_url??t?.brand_logo_url??null,card_logo_height_px:t?.card_logo_height_px??72,primary_color:t?.primary_color??null,card_accent_color:t?.card_accent_color??null,card_footer_text:t?.card_footer_text??null,card_title_size_px:t?.card_title_size_px??null,card_footer_size_px:t?.card_footer_size_px??null,card_field_size_px:t?.card_field_size_px??null,card_label_size_px:t?.card_label_size_px??null}})}),a.jsx("div",{className:"mt-4 print:hidden",children:a.jsxs(o,{variant:"outline",onClick:()=>window.print(),children:[a.jsx(m,{className:"h-4 w-4 mr-2"}),"Imprimir"]})}),a.jsxs("p",{className:"mt-3 text-[10px] text-muted-foreground print:hidden",children:["ID ",r.id.slice(0,8)," • ",r.status==="ativo"?"Membro ativo":`Status: ${r.status}`]})]})}export{x as component};
