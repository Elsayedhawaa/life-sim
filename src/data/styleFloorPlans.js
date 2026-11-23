// Shared by drawing and furnishing lookup, so room identity cannot drift.
const room=(no,key,name,x,y,w,h)=>({no,key,name,x,y,w,h,m2:w*h/1200,flr:['bathroom','wc','kitchen'].includes(key)?'tile':'wood'});
const floor=(rooms,core=null,courtyard=null)=>({code:'A-101',title:'FICTIONAL STYLE PLAN',dimsMm:['schematic','schematic'],shell:{x:60,y:60,w:600,h:420},baysX:[],baysY:[],rooms,core,courtyard});
export const STYLE_FLOOR_PLANS={
 courtyard_single:[floor([
 room('101','foyer','Screened entrance',60,350,170,130),room('102','office','Guest reception',60,60,170,160),room('103','kitchen','Kitchen and pantry',490,350,170,130),room('104','living','Family living room',230,60,260,160),room('105','bedroom','Main bedroom',490,60,170,160),room('106','kids','Family bedroom',60,220,170,130),room('107','bathroom','Bathroom and washroom',490,220,170,130)
 ],null,{x:230,y:220,w:260,h:260})],
 courtyard_double:[floor([
 room('101','foyer','Screened entrance',60,350,170,130),room('102','office','Guest reception',60,60,170,160),room('103','kitchen','Separate kitchen',490,350,170,130),room('104','living','Family reception and dining',230,60,260,160),room('105','bathroom','Washroom and laundry',490,220,170,130),room('106','corridor','Stair hall',60,220,170,130),room('107','office','Family sitting room',490,60,170,160)
 ],{x:90,y:240,w:100,h:95},{x:230,y:220,w:260,h:260}),floor([
 room('201','bedroom','Main bedroom',230,60,260,160),room('202','kids','Family bedroom',60,60,170,160),room('203','office','Guest bedroom',490,60,170,160),room('204','bathroom','Family bathroom',490,220,170,130),room('205','corridor','Stair landing',60,220,170,130),room('206','corridor','Screened courtyard gallery',230,220,260,65)
 ],{x:90,y:240,w:100,h:95},{x:230,y:285,w:260,h:195})],
 modern_villa:[floor([
 room('101','foyer','Entrance',60,350,140,130),room('102','office','Guest reception',60,60,200,175),room('103','wc','Guest toilet',60,235,140,115),room('104','corridor','Stair hall',200,235,150,245),room('105','living','Family reception and dining',350,235,310,245),room('106','kitchen','Separate kitchen',260,60,240,175),room('107','bathroom','Laundry and washroom',500,60,160,175)
 ],{x:222,y:270,w:105,h:140}),floor([
 room('201','bedroom','Main bedroom',60,60,220,175),room('202','kids','Family bedroom',280,60,220,175),room('203','office','Guest bedroom',500,60,160,175),room('204','bathroom','Family bathroom',500,235,160,135),room('205','corridor','Upstairs landing',60,235,440,85),room('206','living','Family sitting room',280,320,220,160)
 ],{x:90,y:340,w:120,h:115})]
};
