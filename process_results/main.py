import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import json

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

COLOR_MAX = 'xkcd:lightish green'
COLOR_MEAN = 'xkcd:faded blue'
COLOR_BASE = 'xkcd:dull red'

def plot(filename, column, title):
    result = pd.read_csv('data/' + filename, delimiter="\t")
    result_generations = result[result.type == TYPE_INDIVIDUAL]

    fitness_baseline = result[result.type == TYPE_BASELINE][column]
    fitness_generation_baseline = result[result.type == TYPE_GEN_BASELINE][column]
    fitness_best = result[result.type == TYPE_BEST][column]

    config_best = result[result.type == TYPE_BEST]
    config_max = config_best[config_best.f_score == config_best.f_score.max()]

    config_str = config_max[COL_CONFIG].iloc[-1]
    print(title + ' - best config:')
    print(config_str)
    # config = json.load(config_str)
    # print(json.dumps(config, indent=4))


    x = result_generations[COL_GEN].unique().astype(int)

    grouped_by = result_generations.groupby([COL_GEN])

    unique = grouped_by[COL_CONFIG].nunique()

    result_max = grouped_by.max()[column]
    result_max_trend = trend(x, result_max)
    result_mean = grouped_by.mean()[column]
    result_mean_trend = trend(x, result_mean)

    result_std = trend(x, grouped_by.std()[column])

    fig, axs = plt.subplots(2, 1, sharex='all', sharey='all')
    # %%
    axs[0].plot(x, result_max, label='max', color=COLOR_MAX)
    axs[0].plot(x, result_max_trend, label='max (trend)', color=COLOR_MAX, linestyle='dotted')
    axs[0].plot(x, result_mean, label='mean', color=COLOR_MEAN)
    axs[0].plot(x, result_mean_trend, label='mean (trend)', color=COLOR_MEAN, linestyle='dotted')
    axs[0].plot(x, fitness_generation_baseline, label='baseline', color=COLOR_BASE)
    axs[0].set_ylabel('f score')
    axs[0].legend(),
    axs[0].grid(True)


    axs[1].plot(x, fitness_best, label='Best performance (validation)', color=COLOR_MAX)
    axs[1].plot(x, trend(x, fitness_best), label='Best performance (trend)', color=COLOR_MAX, linestyle='dotted')
    axs[1].plot(x, np.maximum.accumulate(fitness_best), label='Best performance (cumulative)', color='xkcd:pumpkin orange')
    axs[1].plot(x, np.full(x.shape, fitness_baseline), label='baseline (validation)', color=COLOR_BASE)
    axs[1].legend()
    axs[1].set_xlabel('generation')
    axs[1].set_ylabel('f score')
    axs[1].grid(True)
    fig.tight_layout()

    plt.title(title)
    plt.show()

    # plt.plot(x, unique, label='# unique')
    # plt.title(filename + ' # unique configs per gen')
    # plt.show()


def trend(x, range):
    b, m = np.polynomial.polynomial.polyfit(x, range, 1)
    return b + m * x


columns = [
    COL_F_SCORE,
    # COL_F_SCORE_NORMALIZED,
]

files = {
    # '2021-05-05_movielens.csv',
    # '2021-05-05_sobazaar.csv',
    # '2021-05-07_movielens_80_60.csv',
    # '2021-05-07_movielens_320_60.csv',
    # '2021-05-07_sobazaar_80_60.csv',
    # '2021-05-07_sobazaar_320_60.csv',
    'DEPTH_Fri May 07 2021_Movielens_3_0.2_40_60.csv': 'Movielens depth=3',
    'DEPTH_Fri May 07 2021_Movielens_4_0.2_40_60.csv': 'Movielens depth=4',
    'DEPTH_Fri May 07 2021_Movielens_5_0.2_40_60.csv': 'Movielens depth=5',
    'DEPTH_Sat May 08 2021_Movielens_6_0.2_40_60.csv': 'Movielens depth=6',
    'DEPTH_Sat May 08 2021_Sobazaar_3_0.2_40_60.csv': 'Sobazaar depth=3',
    'DEPTH_Sat May 08 2021_Sobazaar_4_0.2_40_60.csv': 'Sobazaar depth=4',
    'DEPTH_Sat May 08 2021_Sobazaar_5_0.2_40_60.csv': 'Sobazaar depth=5',
    'DEPTH_Sat May 08 2021_Sobazaar_6_0.2_40_60.csv': 'Sobazaar depth=6',
}

for file, title in files.items():
    for column in columns:
        plot(file, column, title)
