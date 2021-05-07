import numpy as np
import matplotlib.pyplot as plt
import pandas as pd

# Column names:
COL_TYPE = 'type'
COL_GEN = 'generation'
COL_INDIVIDUAL = 'individual'
COL_F_SCORE = 'f_score'
COL_F_SCORE_NORMALIZED = 'f_score_normalized'
COL_CONFIG = 'config'

# Column types
TYPE_BASELINE = 'baseline'
TYPE_BEST = 'best'
TYPE_INDIVIDUAL = 'individual'
TYPE_GEN_BASELINE = 'gen_baseline'


def plot(filename, column):
    result = pd.read_csv('data/' + filename, delimiter="\t")
    result_generations = result[result.type == TYPE_INDIVIDUAL]

    fitness_baseline = result[result.type == TYPE_BASELINE][column]
    fitness_generation_baseline = result[result.type == TYPE_GEN_BASELINE][column]
    fitness_best = result[result.type == TYPE_BEST][column]

    config_best = result[result.type == TYPE_BEST][COL_CONFIG]
    print(config_best.iloc[-1])

    x = result_generations[COL_GEN].unique().astype(int)

    grouped_by = result_generations.groupby([COL_GEN])

    unique = grouped_by[COL_CONFIG].nunique()

    result_max = grouped_by.max()[column]
    result_max_trend = trend(x, result_max)
    result_mean = grouped_by.mean()[column]
    result_mean_trend = trend(x, result_mean)

    result_std = trend(x, grouped_by.std()[column])

    # %%
    plt.plot(x, result_max, label='max')
    plt.plot(x, result_max_trend, label='max (trend)')
    plt.plot(x, result_mean, label='mean')
    plt.plot(x, result_mean_trend, label='mean (trend)')
    plt.plot(x, fitness_generation_baseline, label='popular')

    plt.legend()
    plt.title(filename + ' - ' + column)
    plt.show()

    plt.plot(x, fitness_best, label='Best performance (validation)')
    plt.plot(x, np.maximum.accumulate(fitness_best), label='Best performance (agg)')
    plt.plot(x, trend(x, fitness_best), label='Best performance (trend)')
    plt.plot(x, np.full(x.shape, fitness_baseline), label='baseline (validation)')
    plt.legend()
    plt.title(filename + " validation performance")
    plt.show()

    plt.plot(x, unique, label='# unique')
    plt.title(filename + ' # unique configs per gen')
    plt.show()


def trend(x, range):
    b, m = np.polynomial.polynomial.polyfit(x, range, 1)
    return b + m * x


columns = [
    COL_F_SCORE,
    COL_F_SCORE_NORMALIZED,
]

files = [
    # '2021-05-05_movielens.csv',
    # '2021-05-05_sobazaar.csv',
    # '2021-05-07_movielens_80_60.csv',
    '2021-05-07_movielens_320_60.csv',
    # '2021-05-07_sobazaar_80_60.csv',
    # '2021-05-07_sobazaar_320_60.csv',

]
for file in files:
    for column in columns:
        plot(file, column)
