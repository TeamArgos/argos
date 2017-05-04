library(AnomalyDetection)

data(raw_data)
res = AnomalyDetectionTs(raw_data, max_anoms=0.02, direction='both', plot=TRUE, piecewise_median_period_weeks=1)
res$plot