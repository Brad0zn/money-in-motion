export const PLATFORM_FEE = 0.2875;
export const VERIFIED_ON = '9 September 2026';
export const FUNDS = [
 {id:'cash',name:'Money Market',full:'Sygnia Money Market Fund Class A',risk:'Low',equity:0,years:0,ter:.30,tc:.01,reg28:true,url:'sygnia-money-market-fund-class-a',summary:'Earn interest with very little exposure to market ups and downs.',good:'Focuses on preserving capital and earning interest.',bad:'Growth may fall behind rising prices. It’s an investment, not a guaranteed bank deposit.'},
 {id:'b40',name:'Skeleton Balanced 40',full:'Sygnia Skeleton Balanced 40 Fund',risk:'Low to medium',equity:40,years:2,ter:.42,tc:.03,reg28:true,url:'sygnia-skeleton-balanced-40-fund',summary:'A cautious mix, with less invested in company shares.',good:'Spreads money across shares, bonds and cash, with lower share exposure.',bad:'Can still lose value. Lower share exposure can limit long-term growth.'},
 {id:'b60',name:'Skeleton Balanced 60',full:'Sygnia Skeleton Balanced 60 Fund',risk:'Medium',equity:60,years:5,ter:.44,tc:.04,reg28:true,url:'sygnia-skeleton-balanced-60-fund',summary:'A mix of growth investments and more stable assets.',good:'Balances exposure to company shares with bonds and cash.',bad:'Meaningful falls are possible. You need time to ride out weaker markets.'},
 {id:'b70',name:'Skeleton Balanced 70',full:'Sygnia Skeleton Balanced 70 Fund',risk:'Medium to high',equity:70,years:5,ter:.45,tc:.05,reg28:true,url:'sygnia-skeleton-balanced-70-fund',summary:'More company shares for greater long-term growth potential.',good:'Broad exposure to South African and international growth assets.',bad:'Bigger ups and downs. You could get back less than you invest.'},
 {id:'world',name:'Skeleton Worldwide Flexible',full:'Sygnia Skeleton Worldwide Flexible Fund',risk:'Medium to high',equity:null,years:5,ter:.68,tc:.11,reg28:false,url:'sygnia-skeleton-worldwide-flexible-fund',summary:'A flexible mix of local and global investments.',good:'The manager can change the mix as opportunities change.',bad:'Currency and market movements add uncertainty. Not Regulation 28 compliant.'}
];
export const ACCOUNTS = [
 {id:'tfsa',name:'Tax-free savings',short:'TFSA',tag:'Tax-free investment growth',desc:'Keep your investment returns free of South African income, dividends and capital gains tax.',good:'No South African tax on investment returns.',bad:'Every contribution uses your allowance. Withdrawals don’t restore it.',access:'Withdraw when needed; processing and fund clearance periods apply.',rule:'R46,000 a tax year and R500,000 over your lifetime, across all your tax-free accounts. Excess contributions attract a 40% tax penalty.',url:'sygnia-tax-free-savings-account'},
 {id:'ra',name:'Retirement annuity',short:'RA',tag:'Save for your retirement',desc:'Build retirement savings with a potential tax deduction on your contributions.',good:'Potential tax relief now, with no tax on growth inside the fund.',bad:'Most money is reserved for retirement. Withdrawals can be taxed.',access:'Normally from age 55. Limited access to the savings component is allowed under the two-pot rules.',rule:'Retirement-fund contributions can qualify for a deduction, subject to the 27.5% calculation and R430,000 annual cap for 2026/27. Regulation 28 investment limits apply.',url:'sygnia-retirement-annuity'},
 {id:'discretionary',name:'Discretionary investment',short:'Flexible',tag:'Flexible access to your money',desc:'Invest without an annual contribution limit or a fixed investment term.',good:'Add money or request a withdrawal when you need to.',bad:'Interest, dividends and capital gains may be taxable.',access:'Sygnia generally processes withdrawals in 5–7 working days. Recent debit orders may need to clear first.',rule:'No TFSA-style contribution allowance. Personal tax rules and exemptions apply.',url:'sygnia-direct-investment'},
 {id:'endowment',name:'Endowment',short:'Policy',tag:'Tax handled inside a policy',desc:'An investment policy with its own tax rates and a five-year restriction period.',good:'The insurer handles tax inside the policy.',bad:'Its tax treatment may cost more if your own tax rate is low. Access and extra contributions are restricted.',access:'Limited access in the first five years. Withdrawal limits and the 120% contribution rule apply.',rule:'Provider terms and permitted funds need confirmation for Money in Motion. The preview does not automatically match an endowment to a fund.',url:'sygnia-investment-policy'}
];
export const money = (v,decimals=0) => new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR',maximumFractionDigits:decimals,minimumFractionDigits:decimals}).format(v);
export const percent = (v,d=2)=>v.toFixed(d)+'%';
export function adminAnnual(value){return Math.min(Math.max(value,0),2000000)*.004025 + Math.max(Math.min(value,10000000)-2000000,0)*.001725}
export function fundCost(f){return Math.round((f.ter+f.tc)*100)/100}
export function totalCost(f,balance=100000){return fundCost(f)+PLATFORM_FEE+(balance>0?adminAnnual(balance)/balance*100:.4025)}
export function profile(a){
 const score=Number(a.loss)+Number(a.capacity)+Number(a.experience);
 const willingness=score<=1?0:score<=3?1:score<=5?2:score<=7?3:4;
 const timeCap=Number(a.horizon)<2?0:Number(a.horizon)<5?1:Number(a.horizon)<7?3:4;
 const capacityCap=a.capacity==='0'?0:a.capacity==='1'?2:4;
 const level=Math.min(willingness,timeCap,capacityCap);
 const warnings=[];
 if(a.capacity==='0')warnings.push('Your match focuses on lower risk. Money market funds can still lose value and are not guaranteed bank deposits.');
 if(Number(a.age)<18)warnings.push('An adult or legal guardian will need to complete the provider’s application for an investor under 18.');
 return {level,willingness,timeCap,capacityCap,label:['Cautious','Conservative','Moderate','Moderately aggressive','Growth-focused'][level],warnings,limited:level<willingness,eligible:FUNDS.filter((f,i)=>i<=level&&f.years<=Number(a.horizon)),blocked:Number(a.age)<18};
}
export function matchInvestments(a){
 const p=profile(a),options=[],excluded=[];
 const years=Number(a.horizon),age=Number(a.age),monthly=Number(a.monthly),lump=Number(a.lump);
 const matched=(id,reason,score)=>{
  const f=id==='endowment'?null:FUNDS[Math.min(p.level,id==='ra'?3:4)];
  const whyFund=p.level===0?'A money market focus keeps market exposure low for your timeframe and comfort with risk.':`${p.label} risk, a ${years}-year timeframe and your ability to stay invested shape this fund match.`;
  return {account:ACCOUNTS.find(x=>x.id===id),fund:f,reason,whyFund,score,providerPending:id==='endowment'};
 };
 options.push(matched('discretionary',a.access==='flexible'?'You want access to your money, with no fixed investment term.':'You can contribute without an annual allowance and keep access to your money.',a.access==='flexible'||years<5?100:65));
 const tfsaFits=a.tfsa!=='full'&&monthly*12+lump<=46000;
 if(tfsaFits&&years>=5)options.push(matched('tfsa',`Your ${years}-year timeframe gives tax-free growth time to build. ${a.tfsa==='none'?'You haven’t used a tax-free account yet.':'We’ll check your remaining allowance before the application continues.'}`,a.goal!=='retirement'?110:85));
 else excluded.push({id:'tfsa',reason:a.tfsa==='full'?'You’ve indicated your tax-free allowance is used.':monthly*12+lump>46000?'Your planned contributions are above the annual tax-free allowance.':'Your shorter timeframe makes flexible access a more useful starting point.'});
 if(years+age>=55&&a.access!=='flexible'&&years>=5)options.push(matched('ra',a.goal==='retirement'?'Your goal is retirement, and your timeframe reaches age 55 or later. Contributions may qualify for tax relief.':'You can leave this money until retirement, and contributions may qualify for tax relief.',a.goal==='retirement'?120:70));
 else excluded.push({id:'ra',reason:'Most RA money is reserved for retirement. Your access preference or timeframe points to a more flexible account.'});
 // A risk match is not enough to establish eligibility inside an insurance policy.
 if(years>=5&&a.access==='locked'&&a.tax==='high')options.push(matched('endowment','You can commit for at least five years and have a tax rate above 30%. A policy may offer tax benefits; its funds and charges need provider confirmation.',60));
 else excluded.push({id:'endowment',reason:'Endowments involve a five-year restriction period and a separate tax comparison. They are not prioritised by these answers.'});
 options.sort((x,y)=>y.score-x.score);
 return {profile:p,options,excluded};
}
export function allowedFund(account,fund){return account==='endowment'?false:account==='ra'?fund.reg28:true}
export function tfsaCheck({annual=0,lifetime=0,lump=0,monthly=0,months=12}){
 const values=[annual,lifetime,lump,monthly,months];
 if(values.some(v=>!Number.isFinite(v)||v<0)||months>12||!Number.isInteger(months)||annual>lifetime)return {ok:false,reason:'Check your contribution figures. Lifetime contributions must include this year’s contributions.'};
 const added=lump+monthly*months;
 if(annual+added>46000)return {ok:false,reason:'This plan exceeds your remaining annual TFSA allowance. Reduce the contribution or compare a discretionary account.'};
 if(lifetime+added>500000)return {ok:false,reason:'This plan exceeds your remaining lifetime TFSA allowance. Reduce the contribution or compare a discretionary account.'};
 return {ok:true,added,annualLeft:46000-annual-added,lifetimeLeft:500000-lifetime-added};
}
export function project({monthly,lump,years,gross,fund,inc=0,afterFees=false,annualLimit=Infinity,contributionLimit=Infinity}){
 if([monthly,lump,years,gross,inc].some(v=>!Number.isFinite(v))||monthly<0||lump<0||years<1||years>60||gross<=-100||inc<0||inc>20)throw new Error('Invalid projection inputs');
 if(contributionLimit<lump||Number.isNaN(contributionLimit))throw new Error('Invalid contribution limit');
 let value=lump,withoutFees=lump,paid=lump,annualPaid=lump;const points=[{year:0,value,paid}];
 const rate=Math.pow(1+gross/100,1/12)-1;
 for(let i=1;i<=years*12;i++){
 if(i>1&&(i-1)%12===0)annualPaid=0;
 const contribution=Math.min(monthly*(1+inc/100)**Math.floor((i-1)/12),Math.max(0,contributionLimit-paid),Math.max(0,annualLimit-annualPaid));annualPaid+=contribution;
 // After-fee planning uses start-of-month payments, matching the journey planners.
 if(afterFees){value=(value+contribution)*(1+rate);withoutFees=(withoutFees+contribution)*(1+rate)}
 else{value*=1+rate;withoutFees*=1+rate;value=Math.max(0,value-(value*(fundCost(fund)+PLATFORM_FEE)/100+adminAnnual(value))/12)+contribution;withoutFees+=contribution}
 paid+=contribution;
 if(i%12===0)points.push({year:i/12,value,paid});
 }
 return {value,paid,feeImpact:withoutFees-value,points};
}
