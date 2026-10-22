// Defensive positioning prompts for PE learning.
// This is a simplified position-based coaching aid, not a physics or rules engine.
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const basePoints=n=>n===2?{home:{x:50,y:91},first:{x:50,y:43}}:n===3?{home:{x:50,y:91},first:{x:75,y:53},second:{x:25,y:53}}:{home:{x:50,y:91},first:{x:75,y:67},second:{x:50,y:43},third:{x:25,y:67}};
const names={home:'Home',first:'Base 1',second:'Base 2',third:'Base 3'};
const has=(a,x)=>a.includes(x);
export const runnerOptions=[{value:'empty',label:'Bases empty'},{value:'first',label:'Runner on first'},{value:'second',label:'Runner on second'},{value:'first-third',label:'Runners on first and third'},{value:'first-second',label:'Runners on first and second'},{value:'loaded',label:'Bases loaded'}];
function closest(players,point,excluded=[]){return [...players].filter(p=>!has(excluded,p.id)).sort((a,b)=>distance(a,point)-distance(b,point))[0]}
function linePosition(p,a,b){const vx=b.x-a.x,vy=b.y-a.y,len=vx*vx+vy*vy||1,t=((p.x-a.x)*vx+(p.y-a.y)*vy)/len;return{t,gap:distance(p,{x:a.x+Math.max(0,Math.min(1,t))*vx,y:a.y+Math.max(0,Math.min(1,t))*vy})}}
export function analyseDefence({players,ball,bases=4,hit='Ground ball',runners='empty',starting=[]}){
 const layout=basePoints(bases),allKeys=Object.keys(layout),full=bases===4;
 const zone=ball.x<40?'left':ball.x>60?'right':'centre';
 const isBunt=hit==='Bunt',isFly=hit==='Fly ball',deep=ball.y<42;
 const targetKey=isBunt?'first':(has(['second','first-second','loaded'],runners)?'home':runners==='first'||runners==='first-third'?'third':'second');
 const baseKey=layout[targetKey]?targetKey:(layout.first?'first':'home');
 const ballFielder=closest(players,ball);
 const nearby=players.filter(p=>p.id!==ballFielder?.id&&distance(p,ball)<24);
 const coverage=allKeys.map(key=>({key,cover:closest(players,layout[key]),distance:distance(closest(players,layout[key]),layout[key])}));
 const open=coverage.filter(c=>c.distance>12);
 const target=layout[baseKey];
 const relay=players.filter(p=>p.id!==ballFielder.id).map(p=>({...linePosition(p,ball,target),id:p.id})).filter(p=>p.t>.18&&p.t<.82).sort((a,b)=>a.gap-b.gap)[0];
 const notes=[];
 notes.push('SCENARIO — '+hit+', hit towards '+zone+' field; '+(runners==='empty'?'bases empty':runnerOptions.find(x=>x.value===runners)?.label.toLowerCase())+'.');
 if(starting.length){const planned=closest(starting,ball);notes.push('FIELD THE BALL — Player '+ballFielder.id+' finishes nearest the ball. Player '+planned.id+' began nearest the landing point.'+(planned.id===ballFielder.id?' Good anticipation.':' Discuss whether the change makes sense for the ball path and player speed.'))}
 else notes.push('FIELD THE BALL — Player '+ballFielder.id+' is closest to the ball. Call clearly and move early; distance alone does not prove this player can make the play.');
 if(open.length)notes.push('COVER BASES — '+open.map(c=>names[c.key]).join(', ')+' '+(open.length===1?'is':'are')+' not covered closely. Decide who should move to provide cover.');
 else notes.push('COVER BASES — All displayed bases have someone nearby. Check that players are ready to support one another.');
 if(isBunt){
   notes.push('BUNT — Charge the short ball, but do not leave first base empty. One player should be ready to cover first while others move towards the bunt.');
   if(full&&runners==='first-second')notes.push('WITH RUNNERS ON FIRST AND SECOND — Make sure moving towards the bunt does not leave important bases open. Communicate who covers each base.');
 }else if(isFly){
   notes.push('FLY BALL — Call for the catch early. One fielder takes charge; nearby fielders give way and get ready to back up a missed catch.');
   notes.push('After the catch, stay alert to runners moving and maintain base coverage.');
 }else{
   notes.push('CUT-OFF — '+(deep?'For a deep hit, use a cut-off fielder between the ball and the base. ':'')+(relay&&relay.gap<11?'Player '+relay.id+' is near the line to '+names[baseKey]+'. Check whether they can receive a relay.':'No fielder is clearly positioned between the ball and '+names[baseKey]+'. Consider a cut-off or relay.'));
 }
 notes.push('BACK UP — '+(nearby.length?'Player '+nearby[0].id+' is near the ball and may support the catch or pickup.':'No other fielder is close to the ball. Assign someone to back up a missed field or throw.')+'');
 notes.push('COMMUNICATE — Who calls “mine”, who calls the base, and who provides backup? Make these roles clear.');
 if(players.length<9||!full)notes.push('MODIFIED GAME — Full-field softball normally has nine defensive players. With '+players.length+' fielders and '+bases+' bases, share the main jobs: ball, base, cut-off and backup.');
 notes.push('CHECK IN REAL PLAY — Timing, runner speed, catching skill and throw accuracy are not measured here. Use these notes to discuss choices, not to claim an out.');
 return{notes,ballFielderId:ballFielder.id,uncovered:open.map(c=>c.key),suggestedBase:baseKey,zone};
}
