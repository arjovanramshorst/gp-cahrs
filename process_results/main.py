import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import re
import json

# Column names:
COL_SCORE = 'mrr10'
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

# Colors
COLOR_MAX = 'xkcd:lightish green'
COLOR_MEAN = 'xkcd:faded blue'
COLOR_BASE = 'xkcd:dull red'

# filename split values
FILENAME_SEPARATOR = '_'
FILENAME_NUM_PARAMS = 8

ML_BASELINE = 0.5672

latex_table = ''

def plot(filename, column, ylim=None):
    result = pd.read_csv('data/' + filename, delimiter="\t", dtype={
        COL_GEN: float
    }, na_values='-')
    result_generations = result[result.type == TYPE_INDIVIDUAL]

    # result = pd.read_csv('data/' + filename, delimiter="\t", dtype={
    #     column: float,
    #     COL_GEN: int
    # }, na_values=['-'])
    config_max = result_generations[result_generations[column] == result_generations[column].max()]
    config_str = config_max[COL_CONFIG].iloc[0]

    fitness_baseline = result[result.type == TYPE_BASELINE][column]
    fitness_generation_baseline = result[result.type == TYPE_GEN_BASELINE][column]

    fitness_best = result[result.type == TYPE_BEST][column]

    config_best = result[result.type == TYPE_BEST]
    # config_max = config_best[config_best[column] == config_best[column].max()]

    # config_str = config_max[COL_CONFIG].iloc[0]

    x = result_generations[COL_GEN].unique().astype(int)
    grouped_by = result_generations.groupby([COL_GEN], sort=False)

    ml_baseline = np.full(x.shape, ML_BASELINE)

    unique = grouped_by[COL_CONFIG].nunique()

    result_max = grouped_by.max().sort_values(COL_GEN)[column]
    result_max_trend, delta_max = trend(x, result_max)
    result_mean = grouped_by.mean().sort_values(COL_GEN)[column]
    result_mean_trend, delta_mean = trend(x, result_mean)

    global latex_table
    latex_table += latex_table_string(filename, config_max, delta_max, delta_mean)

    title = filename_to_title(filename)
    print(title + ' - best config:')
    print(config_str)

    result_std = trend(x, grouped_by.std()[column])

    fig, axs = plt.subplots(2, 1, sharex='all', sharey='all')
    if ylim:
        axs[0].set_ylim(ylim)
    # %%
    axs[0].plot(x, result_max, label='max', color=COLOR_MAX)
    axs[0].plot(x, result_max_trend, label='max (trend)', color=COLOR_MAX, linestyle='dotted')
    axs[0].plot(x, result_mean, label='mean', color=COLOR_MEAN)
    axs[0].plot(x, result_mean_trend, label='mean (trend)', color=COLOR_MEAN, linestyle='dotted')
    axs[0].plot(x, fitness_generation_baseline, label='baseline', color=COLOR_BASE)
    # axs[0].plot(x, ml_baseline, label='baseline', color=COLOR_BASE)

    axs[0].set_ylabel('MRR@10')
    axs[0].legend(),
    axs[0].grid(True)

    axs[1].plot(x, fitness_best, label='Best performance (validation)', color=COLOR_MAX)
    fitness_best_trend, fitness_best_delta = trend(x, fitness_best)
    axs[1].plot(x, fitness_best_trend, label='Best performance (trend)', color=COLOR_MAX, linestyle='dotted')
    axs[1].plot(x, np.maximum.accumulate(fitness_best), label='Best performance (cumulative)',
                color='xkcd:pumpkin orange')
    axs[1].plot(x, np.full(x.shape, fitness_baseline), label='baseline (validation)', color=COLOR_BASE)
    # axs[1].plot(x, ml_baseline, label='baseline (validation)', color=COLOR_BASE)
    axs[1].legend()
    axs[1].set_xlabel('generation')
    axs[1].set_ylabel('MRR@10')
    axs[1].grid(True)

    plt.title(title)
    plt.savefig('output/' + filename + '.pdf')
    plt.show()

    # plt.plot(x, unique, label='# unique')
    # plt.title(filename + ' # unique configs per gen')
    # plt.show()


def trend(x, range):
    b, m = np.polynomial.polynomial.polyfit(x, range, 1)
    return b + m * x, m


def join_param(tuple):
    return tuple[0] + "=" + tuple[1]


def filename_to_title(filename):
    params = re.findall('_([a-zA-Z]+)(\d+(\.\d+)?)', filename)
    return ", ".join(map(join_param, params))


def filename_to_dict(filename):
    params = re.findall('_([a-zA-Z]+)(\d+(\.\d+)?)', filename)
    dict = {}
    for param in params:
        dict[param[0]] = param[1]
    return dict

def latex_table_string(filename, config, delta_max, delta_mean):
    dict = filename_to_dict(filename)
    return " & ".join([
        dict["Pm"],
        dict["Pc"],
        dict["Ppr"],
        dict["Pps"],
        str(round(delta_mean, 4)),
        str(round(delta_max, 4)),
        str(round(config["mrr10"].max(), 4)),
        str(round(config["precision1"].max(), 4)),
        str(round(config["precision10"].max(), 4)),
        str(config["generation"].min()),
    ]) + " \\\\ \\midrule\n"


columns = [
    COL_SCORE
    # COL_F_SCORE_NORMALIZED,
]

files = [
    # Grid search
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm0.1_Pc0.9_Ppr0.1_Pps0.1_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm0.1_Pc0.9_Ppr0.1_Pps0.3_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm0.1_Pc0.9_Ppr0.1_Pps0.5_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm0.1_Pc0.9_Ppr0.5_Pps0.1_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm0.1_Pc0.9_Ppr0.5_Pps0.3_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm0.1_Pc0.9_Ppr0.9_Pps0.1_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm0.1_Pc0.9_Ppr0.9_Pps0.3_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm0_Pc1_Ppr0.1_Pps0.1_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm0_Pc1_Ppr0.1_Pps0.3_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm0_Pc1_Ppr0.5_Pps0.1_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm0_Pc1_Ppr0.5_Pps0.3_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm0_Pc1_Ppr0.9_Pps0.1_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm0_Pc1_Ppr0.9_Pps0.3_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm1_Pc0_Ppr0.1_Pps0.1_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm1_Pc0_Ppr0.1_Pps0.3_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm1_Pc0_Ppr0.5_Pps0.1_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm1_Pc0_Ppr0.5_Pps0.3_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm1_Pc0_Ppr0.9_Pps0.1_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm1_Pc0_Ppr0.9_Pps0.3_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm1_Pc1_Ppr0.1_Pps0.1_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm1_Pc1_Ppr0.1_Pps0.3_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm1_Pc1_Ppr0.1_Pps0.5_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm1_Pc1_Ppr0.5_Pps0.1_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm1_Pc1_Ppr0.5_Pps0.3_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm1_Pc1_Ppr0.9_Pps0.1_ts4.csv',
    # '2021-05-30_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm1_Pc1_Ppr0.9_Pps0.3_ts4.csv',
    # '2021-05-31_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm0.1_Pc0.9_Ppr0.5_Pps0.5_ts4.csv',
    # '2021-05-31_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm0.1_Pc0.9_Ppr0.9_Pps0.5_ts4.csv',
    # '2021-05-31_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm0_Pc1_Ppr0.1_Pps0.5_ts4.csv',
    # '2021-05-31_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm0_Pc1_Ppr0.5_Pps0.5_ts4.csv',
    # '2021-05-31_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm0_Pc1_Ppr0.9_Pps0.5_ts4.csv',
    # '2021-05-31_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm1_Pc0_Ppr0.1_Pps0.5_ts4.csv',
    # '2021-05-31_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm1_Pc0_Ppr0.5_Pps0.5_ts4.csv',
    # '2021-05-31_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm1_Pc0_Ppr0.9_Pps0.5_ts4.csv',
    # '2021-05-31_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm1_Pc1_Ppr0.5_Pps0.5_ts4.csv',
    # '2021-05-31_param-mutation-fix_Movielens V2_d5_i1_gs100_Pm1_Pc1_Ppr0.9_Pps0.5_ts4.csv',

    # Repeatability
    # '2021-06-02_repeatability-big-1_Movielens V2_d5_i1_gs400_Pm1_Pc0_Ppr0.1_Pps0.5_ts4.csv',
    # '2021-06-02_repeatability-big-2_Movielens V2_d5_i1_gs400_Pm1_Pc0_Ppr0.1_Pps0.5_ts4.csv',
    # '2021-06-02_repeatability-big-3_Movielens V2_d5_i1_gs400_Pm1_Pc0_Ppr0.1_Pps0.5_ts4.csv',
    # '2021-06-02_repeatability-big-4_Movielens V2_d5_i1_gs400_Pm1_Pc0_Ppr0.1_Pps0.5_ts4.csv',

    # Elitism
    # '2021-06-02_elitism-1_Movielens V2_d5_i1_gs400_Pm0.1_Pc0.9_Ppr0.1_Pps0.5_ts4.csv',
    # '2021-06-02_elitism-2_Movielens V2_d5_i1_gs400_Pm0.1_Pc0.9_Ppr0.1_Pps0.5_ts4.csv',
    # '2021-06-02_elitism-3_Movielens V2_d5_i1_gs400_Pm0.1_Pc0.9_Ppr0.1_Pps0.5_ts4.csv',
    # '2021-06-02_elitism-4_Movielens V2_d5_i1_gs400_Pm0.1_Pc0.9_Ppr0.1_Pps0.5_ts4.csv',

    # Sobazaar
    # '2021-06-04_sobazaar-cache-cleared-1_Sobazaar_d8_i1_gs400_Pm0.1_Pc0.9_Ppr0.1_Pps0.5_ts4.csv',
    # '2021-06-04_sobazaar-cache-cleared-2_Sobazaar_d8_i1_gs400_Pm0.1_Pc0.9_Ppr0.1_Pps0.5_ts4.csv',
    # '2021-06-04_sobazaar-cache-cleared-3_Sobazaar_d8_i1_gs400_Pm0.1_Pc0.9_Ppr0.1_Pps0.5_ts4.csv',
    # '2021-06-04_sobazaar-cache-cleared-4_Sobazaar_d8_i1_gs400_Pm0.1_Pc0.9_Ppr0.1_Pps0.5_ts4.csv',

    # Grid search 2
]

for file in files:
    for column in columns:
        plot(file, column, ylim=[0.1, 0.65])

print(latex_table)