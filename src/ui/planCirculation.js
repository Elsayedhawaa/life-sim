// Door placement follows real shared boundaries. No random exterior gaps.
const eps=.1;
export function sharedPlanEdge(a,b){
 const y1=Math.max(a.y,b.y),y2=Math.min(a.y+a.h,b.y+b.h),x1=Math.max(a.x,b.x),x2=Math.min(a.x+a.w,b.x+b.w);
 if(y2-y1>=30){if(Math.abs(a.x+a.w-b.x)<eps)return {x:b.x,y:(y1+y2)/2,axis:'v',span:y2-y1};if(Math.abs(b.x+b.w-a.x)<eps)return {x:a.x,y:(y1+y2)/2,axis:'v',span:y2-y1};}
 if(x2-x1>=30){if(Math.abs(a.y+a.h-b.y)<eps)return {x:(x1+x2)/2,y:b.y,axis:'h',span:x2-x1};if(Math.abs(b.y+b.h-a.y)<eps)return {x:(x1+x2)/2,y:a.y,axis:'h',span:x2-x1};}
 return null;
}
export function planCirculation(f,idx=0){
 const nodes=[...f.rooms,...(f.courtyard?[{...f.courtyard,key:'courtyard',no:'court'}]:[])];const root=nodes.findIndex(r=>r.key===(idx===0?'foyer':'corridor'));const connected=new Set([root<0?0:root]);let doors=[];
 const publicSpace=r=>['foyer','corridor','living','courtyard'].includes(r.key);
 while(connected.size<nodes.length){let choices=[];for(const a of connected)for(let b=0;b<nodes.length;b++)if(!connected.has(b)){const e=sharedPlanEdge(nodes[a],nodes[b]);if(e)choices.push({...e,a,b,cost:(publicSpace(nodes[a])?0:8)+(publicSpace(nodes[b])?0:2)+(['bedroom','kids','bathroom','wc'].includes(nodes[a].key)?20:0)});}choices.sort((a,b)=>a.cost-b.cost||b.span-a.span);if(!choices.length)break;const d=choices[0];doors.push(d);connected.add(d.b);}
 const sh=f.shell;const entry=nodes.find(r=>r.key==='foyer')||nodes.find(r=>r.y+r.h===sh.y+sh.h)||nodes[0];let outside=[];
 if(idx===0&&entry){if(Math.abs(entry.y+entry.h-sh.y-sh.h)<eps)outside.push({x:entry.x+entry.w*.5,y:sh.y+sh.h,axis:'h',entry:true});else if(Math.abs(entry.x-sh.x)<eps)outside.push({x:sh.x,y:entry.y+entry.h*.5,axis:'v',entry:true});}
 return {nodes,doors,outside,connected:connected.size===nodes.length,unreachable:nodes.filter((r,i)=>!connected.has(i)).map(r=>r.no)};
}
