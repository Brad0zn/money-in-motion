import {money} from './core.js';

export const feeDefaults={lump:1000000,monthly:5000,years:20,gross:10,inc:5,feeA:1.5,feeB:3.5};
// Fee comparison model: effective annual net return with monthly compounding.
// Same effective annual net return, beginning-of-month payments and annual escalation.
export function feeRun(fee,inp){
 const net=Math.max((inp.gross-fee)/100,-.99),mRate=Math.pow(1+net,1/12)-1;
 let bal=inp.lump,contrib=inp.lump,curM=inp.monthly;
 const points=[{year:0,value:bal,paid:contrib}];
 for(let y=1;y<=inp.years;y++){
  for(let m=1;m<=12;m++){bal+=curM;contrib+=curM;bal*=1+mRate;}
  points.push({year:y,value:bal,paid:contrib});curM*=1+inp.inc/100;
 }
 return {points,value:bal,paid:contrib};
}
export function compareFees(inp){
 const bounds={lump:[0,100000000],monthly:[0,1000000],years:[1,60],gross:[0,30],inc:[0,20],feeA:[0,10],feeB:[0,10]};
 for(const [key,[min,max]] of Object.entries(bounds))if(!Number.isFinite(inp[key])||inp[key]<min||inp[key]>max)throw new Error('Check the amounts and percentages before updating.');
 if(!Number.isInteger(inp.years))throw new Error('Use a whole number of years.');
 const lowFee=Math.min(inp.feeA,inp.feeB),highFee=Math.max(inp.feeA,inp.feeB),low=feeRun(lowFee,inp),high=feeRun(highFee,inp);
 return {low,high,lowFee,highFee,gap:highFee-lowFee,extra:low.value-high.value};
}
const pct=n=>Number(n.toFixed(2))+'%';
const compact=n=>n>=1000000?'R'+(n/1000000).toFixed(1)+'m':n>=1000?'R'+Math.round(n/1000)+'k':'R'+Math.round(n);
function feeGraph(c,years){
 const w=820,h=285,pad=7,max=Math.max(1,...c.low.points.map(p=>p.value),...c.high.points.map(p=>p.value)),step=10**Math.floor(Math.log10(max/4)),tick=Math.ceil(max/4/step)*step,ceiling=tick*4;
 const x=p=>pad+p.year/years*(w-pad*2),y=p=>h-pad-p.value/ceiling*(h-pad*2),coords=pts=>pts.map(p=>x(p)+','+y(p)).join(' ');
 return `<div class="fee-chart-axis"><div class="fee-y">${[4,3,2,1,0].map(i=>`<span>${compact(i*tick)}</span>`).join('')}</div><div class="fee-chart-surface"><svg viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="fee-graph-title fee-graph-desc"><title id="fee-graph-title">The difference lower fees could make over ${years} years</title><desc id="fee-graph-desc">${pct(c.lowFee)} total annual fees: ${money(c.low.value)}. ${pct(c.highFee)} total annual fees: ${money(c.high.value)}. Difference: ${money(c.extra)}. Both use the same contributions and return before fees.</desc>${[0,1,2,3,4].map(i=>`<line x1="0" x2="${w}" y1="${h-pad-i/4*(h-pad*2)}" y2="${h-pad-i/4*(h-pad*2)}" stroke="#ffffff22"/>`).join('')}<polygon points="${coords(c.low.points)} ${coords([...c.high.points].reverse())}" fill="#d6ff5230"/><polyline points="${coords(c.high.points)}" fill="none" stroke="#ffac99" stroke-width="4" stroke-dasharray="9 6"/><polyline points="${coords(c.low.points)}" fill="none" stroke="#d6ff52" stroke-width="5"/>${[c.high,c.low].map((s,i)=>`<circle cx="${x(s.points.at(-1))}" cy="${y(s.points.at(-1))}" r="6" fill="${i?'#d6ff52':'#ffac99'}"/>`).join('')}</svg><div class="fee-x"><span>Today</span><span>${years===1?'6 months':'Year '+years/2}</span><span>Year ${years}</span></div></div></div>`;
}
export function feeResults(inp){
 const c=compareFees(inp);
 return `<div class="fee-impact-win"><div><span>${c.gap?`${Number(c.gap.toFixed(2))} PERCENTAGE POINT${c.gap===1?'':'S'} LESS IN FEES`:'SAME ANNUAL FEES'}</span><strong>${money(c.extra)}</strong><p>${c.gap?'more in your investment':'difference'} after ${inp.years} years</p></div><p>Same money invested.<br>Same growth before fees.<br><b>${c.gap?'More stays yours.':'Same illustrated outcome.'}</b></p></div><div class="fee-graph-card"><div class="fee-line-key"><span><i></i>${pct(c.lowFee)} total annual fees <b>${money(c.low.value)}</b></span><span><i></i>${pct(c.highFee)} total annual fees <b>${money(c.high.value)}</b></span></div>${feeGraph(c,inp.years)}<p class="fee-chart-note">The shaded gap is the difference lower fees could make.</p></div><div class="fee-impact-foot"><span>You invest <b>${money(c.low.paid)}</b> in total</span><span>Example growth before fees <b>${pct(inp.gross)} a year</b></span></div><p class="fee-note">${money(inp.lump)} initial lump sum + ${money(inp.monthly)} a month${inp.inc?', increasing by '+pct(inp.inc)+' each year':', with no annual increase'}. Example total fees, not Money in Motion prices or a promised saving. Growth is assumed, not guaranteed.</p>${inp.lump===0&&inp.monthly===0?'<p class="fee-note">Add a starting amount or monthly contribution to see the impact.</p>':''}${c.highFee>=inp.gross?'<p class="fee-note">The higher fee equals or exceeds the assumed growth rate, so that option has no positive growth after fees.</p>':''}<details class="fee-details"><summary>How this is calculated · yearly figures</summary><div class="detail-body"><p>Total annual fees are subtracted from the assumed annual return. The remaining effective annual return is compounded monthly, with payments at the start of each month. Any contribution increase applies once a year.</p><p>Both options use the same investment amounts and growth before fees to show the fee impact alone. The difference includes lower charges and the growth on money that stays invested. Amounts are future rands, before tax, with no inflation adjustment. Real investments have different returns and risks. These example fees are held constant and should include fund, administration, platform and adviser charges, with VAT where applicable. No extra Money in Motion charges are added to them.</p><div class="table-scroll"><table><caption>Illustrated values after fees</caption><thead><tr><th>Year</th><th>Contributed</th><th>${pct(c.lowFee)} fees</th><th>${pct(c.highFee)} fees</th><th>Difference</th></tr></thead><tbody>${c.low.points.slice(1).map((p,i)=>`<tr><th scope="row">${p.year}</th><td>${money(p.paid)}</td><td>${money(p.value)}</td><td>${money(c.high.points[i+1].value)}</td><td>${money(p.value-c.high.points[i+1].value)}</td></tr>`).join('')}</tbody></table></div></div></details>`;
}
export function feeSection(inp=feeDefaults){
 const input=(key,label,min,max,step=1)=>`<label>${label}<input name="${key}" type="number" min="${min}" max="${max}" step="${step}" value="${inp[key]}" required inputmode="decimal"></label>`;
 return `<section class="fee-impact section" id="fee-impact"><div class="section-head"><div><p class="eyebrow">SMALL PERCENTAGE. BIG DIFFERENCE.</p><h2>Less in fees.<br>More for your future.</h2></div><p>Money you keep invested has more time to grow. Explore the impact of lower total annual fees. Start with a 2 percentage point reduction: from 3.5% to 1.5%.</p></div><div class="fee-impact-layout"><form id="fee-impact-form"><p class="fee-control-title">Make the example yours</p>${input('lump','Initial lump sum amount (R)',0,100000000)}${input('monthly','Add each month (R)',0,1000000)}<label>Time invested <output id="fee-years-label">${inp.years} years</output><input name="years" type="range" min="1" max="60" value="${inp.years}"></label><details><summary>Change growth & fees</summary><div class="fee-extra-inputs">${input('gross','Growth before fees (% a year)',0,30,.1)}${input('feeA','Option A total fee (% a year)',0,10,.01)}${input('feeB','Option B total fee (% a year)',0,10,.01)}${input('inc','Yearly contribution increase (%)',0,20,.1)}</div></details><button type="submit" class="button">Update comparison ↗</button><p id="fee-input-error" role="alert" class="error"></p><p class="fee-did-you-know"><b>Did you know?</b>You can save on fees and give that money the chance to earn growth of its own.</p><a href="#fees" class="fee-cost-link">See Money in Motion’s cost breakdown ↗</a></form><div id="fee-impact-output">${feeResults(inp)}</div></div><p id="fee-update-status" class="sr-only" aria-live="polite"></p></section>`;
}
export function bindFeeImpact(root,state){
 const form=root.querySelector('#fee-impact-form');if(!form)return;
 const years=form.querySelector('[name="years"]');
 const update=()=>{if(!form.reportValidity())return;try{const values=Object.fromEntries([...form.querySelectorAll('input')].map(el=>[el.name,Number(el.value)]));const html=feeResults(values);Object.assign(state,values);root.querySelector('#fee-impact-output').innerHTML=html;root.querySelector('#fee-input-error').textContent='';root.querySelector('#fee-update-status').textContent=`Comparison updated for ${state.years} years. Difference: ${money(compareFees(state).extra)}.`;}catch(e){root.querySelector('#fee-input-error').textContent=e.message;}};
 form.onsubmit=e=>{e.preventDefault();update()};
 years.oninput=()=>{root.querySelector('#fee-years-label').textContent=years.value+' years';update()};
}
