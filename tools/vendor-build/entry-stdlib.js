// stdlib-js 统计子集（Apache-2.0）——B3 假设检验用
// Pearson/Spearman 相关用 simple-statistics（ISC）的 sampleCorrelation + 本包 ranks
import ttest2 from '@stdlib/stats-ttest2';
import ttest from '@stdlib/stats-ttest';
import chi2test from '@stdlib/stats-chi2test';
import bartlettTest from '@stdlib/stats-bartlett-test';
import wilcoxon from '@stdlib/stats-wilcoxon';
import ranks from '@stdlib/stats-ranks';
import normalCdf from '@stdlib/stats-base-dists-normal-cdf';
import tCdf from '@stdlib/stats-base-dists-t-cdf';
import chisquareCdf from '@stdlib/stats-base-dists-chisquare-cdf';
export { ttest2, ttest, chi2test, bartlettTest, wilcoxon, ranks, normalCdf, tCdf, chisquareCdf };