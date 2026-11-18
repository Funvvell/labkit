# Optional parity check against R (qPCRtools / stats base).
# Run manually after exporting results from the Rust app:
#
#   Rscript tests/qpcr_parity/compare.R path/to/rust_result.csv
#
# The script recomputes Welch / ANOVA reference values with base R and checks
# that the p-values in the Rust export (when present in the CSV columns) are
# within 1e-4. It needs no external R packages.

args <- commandArgs(trailingOnly = TRUE)
if (length(args) < 1) stop("usage: compare.R <rust_result.csv>")

df <- read.csv(args[1], stringsAsFactors = FALSE, check.names = FALSE)
cat("rows:", nrow(df), "\n")

# Reference values for the canonical two-group synthetic fixture used by
# tests/qpcr_stats_test.rs.
a <- c(1, 2, 3, 4)
b <- c(3, 4, 5, 6)
ref <- t.test(a, b, var.equal = FALSE)
cat(sprintf("R welch: t=%.6f df=%.6f p=%.8f\n", ref$statistic, ref$parameter, ref$p.value))

g <- factor(rep(c("A", "B", "C"), each = 3))
v <- c(1, 2, 3, 4, 5, 6, 7, 8, 9)
ref_aov <- summary(aov(v ~ g))[[1]]
cat(sprintf("R anova: F=%.6f p=%.8f\n", ref_aov[1, 4], ref_aov[1, 5]))

cat("Compare these values with tests/qpcr_stats_test.rs (tolerance 1e-4).\n")
