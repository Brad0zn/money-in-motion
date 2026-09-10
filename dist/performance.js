// Class A MDDs linked by Sygnia, checked 10 September 2026.
// Returns are fund NAV returns with income reinvested, after TER and transaction costs.
export const PERFORMANCE_DATE='31 July 2026';
export const PERFORMANCE={
 cash:{returns:[7.1,8.1,7.4],source:'https://www.sygnia.co.za/wp-content/uploads/2025/03/2026-JUL-SYMCA-Sygnia-Money-Market-Fund-Class-A-Fund-Fact-Sheet.pdf'},
 b40:{returns:[12.0,12.8,10.8],source:'https://www.sygnia.co.za/wp-content/uploads/2025/03/2026-JUL-SBFCA-Sygnia-Skeleton-Balanced-40-FFS_2016_SKEL.pdf'},
 b60:{returns:[12.9,13.6,11.5],source:'https://www.sygnia.co.za/wp-content/uploads/2025/03/2026-JUL-SSBSA-Sygnia-Skeleton-Balanced-60-FFS_2016_SKEL.pdf'},
 b70:{returns:[13.5,14.3,12.0],source:'https://www.sygnia.co.za/wp-content/uploads/2025/03/2026-JUL-SSBCA-Sygnia-Skeleton-Balanced-70-FFS_2016_SKEL.pdf'},
 world:{returns:[9.4,13.0,14.3],source:'https://www.sygnia.co.za/wp-content/uploads/2025/03/2026-JUL-SSWFA-Sygnia-Skeleton-Worldwide-Flexible-Fund-Class-A-Fund-Fact-Sheet.pdf'}
};
export function performanceCard(f){
 const p=PERFORMANCE[f.id];if(!p)return '';
 return `<section class="past-performance" aria-label="${f.name} past performance"><div class="performance-heading"><b>Past fund returns</b><span>To ${PERFORMANCE_DATE} · Class A</span></div><div class="performance-bars" role="list" aria-label="Published returns by period">${p.returns.map((v,i)=>`<div class="performance-column ${v<0?'performance-negative':''}" role="listitem"><strong>${v.toFixed(1)}%</strong><i style="height:${Math.abs(v)/20*65}px" aria-hidden="true"></i><span>${[1,3,5][i]} year${i?'s':''}${i?'<br>per year':'<br>total return'}</span></div>`).join('')}</div><p class="performance-note">3- and 5-year figures are average yearly growth, compounded. Returns include reinvested income and are after fund costs, before platform, provider and personal tax charges.</p><p class="performance-note"><b>Past returns don’t guarantee future growth.</b> Your match is based on your risk profile, not the highest past return.</p><p class="performance-source"><a href="${p.source}" target="_blank" rel="noopener">Sygnia fact sheet · July 2026 ↗</a></p></section>`;
}
