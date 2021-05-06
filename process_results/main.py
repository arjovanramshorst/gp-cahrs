import numpy as np
import matplotlib.pyplot as plt
import pandas as pd


def plot(filename, column):
    result = pd.read_csv(filename, delimiter="\t")

    result_baseline = result[result.Individual == 'baseline'][column]
    result_without_baseline = result[result.Individual != 'baseline']

    x = result['Gen #'].unique()

    grouped_by = result_without_baseline.groupby(['Gen #'])

    unique = grouped_by['config'].nunique()

    result_max = grouped_by.max()[column]
    result_max_trend = trend(x, result_max)
    result_mean = grouped_by.mean()[column]
    result_mean_trend = trend(x, result_mean)

    result_std = trend(x, grouped_by.std()[column])

    #%%
    plt.plot(x, result_max, label='max')
    plt.plot(x, result_max_trend, label='max (trend)')
    plt.plot(x, result_mean, label='mean')
    plt.plot(x, result_mean_trend, label='mean (trend)')
    plt.plot(x, result_baseline, label='popular')
    plt.legend()
    plt.title(filename + ' - ' + column)
    plt.show()

    plt.plot(x, unique, label='# unique')
    plt.title(filename + ' # unique configs per gen')
    plt.show()

def trend(x, range):
    b, m = np.polynomial.polynomial.polyfit(x, range, 1)
    return b + m*x


column = 'fScore (normalized)'

plot('data/2021-05-05_movielens.csv', column)
# plot('data/2021-05-05_sobazaar.csv', column)
# plot('data/2021-05-05_sobazaar_normalized.csv', column)

column = 'fScore'

plot('data/2021-05-05_movielens.csv', column)
# plot('data/2021-05-05_sobazaar.csv', column)
# plot('data/2021-05-05_sobazaar_normalized.csv', column)
