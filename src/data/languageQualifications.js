/* Spoken fluency is durable; dated test certificates expire for new applications. */
export function hasCurrentLanguage(S,re){
 const certs=S.credentials?.languageCerts||[];
 if(certs.some(c=>re.test(String(c.lang||''))&&c.expiresYear>S.year))return true;
 return (S.education?.languages||[]).some(l=>re.test(String(l))&&(/Fluent|Native/i.test(l)||!certs.some(c=>c.lang===l)));
}
