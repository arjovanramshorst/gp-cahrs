import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import re
import seaborn as sns
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


def process(filename, column, store=False, plot=False, ylim=None):
    result = pd.read_csv('data/' + filename, delimiter="\t", dtype={
        COL_GEN: float
    }, na_values='-')
    result_generations = result[result.type == TYPE_INDIVIDUAL]

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
    if store:
        store_results(filename, config_max, delta_max, delta_mean)
    title = filename_to_title(filename)
    print(title + ' - best config:')
    print("score: " + str(config_max[COL_SCORE].iloc[0]))
    print(config_str)

    result_std = trend(x, grouped_by.std()[column])

    if plot:
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
    return "$" + tuple[0][0:1] + "_{" + tuple[0][1:] + "}=" + tuple[1] + "$"


def filename_to_title(filename, with_params=True):
    params = re.findall('_([a-zA-Z]+)(\d+(\.\d+)?)', filename)
    split = filename.split("_")
    experiment_string = split[1] + " - " + split[0]
    param_string = ", ".join(map(join_param, params))
    if with_params:
        return experiment_string + "\n" + param_string
    else:
        return experiment_string


def filename_to_dict(filename):
    params = re.findall('_([a-zA-Z]+)(\d+(\.\d+)?)', filename)
    dict = {}
    for param in params:
        dict[param[0]] = param[1]
    return dict


def latex_table_string(filename, config, delta_max, delta_mean):
    dict = filename_to_dict(filename)
    return " & ".join([
        dict["Pe"],
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


results = {
    'Re': [],
    'Psm': [],
    'Pco': [],
    'Ppm': [],
    'Spm': [],
    'dmean': [],
    'dmax': [],
    'mrr': [],
    'p@1': [],
    'p@10': [],
    'filename': [],
}


def store_results(filename, config, delta_max, delta_mean):
    global results
    dict = filename_to_dict(filename)
    results['Re'].append(dict["Pe"])
    results['Psm'].append(dict["Pm"])
    results['Pco'].append(dict["Pc"])
    results['Ppm'].append(dict["Ppr"])
    results['Spm'].append(dict["Pps"])
    results['dmean'].append(delta_mean)
    results['dmax'].append(delta_max)
    results['mrr'].append(config['mrr10'].max())
    results['p@1'].append(config['precision1'].max())
    results['p@10'].append(config['precision10'].max())
    results['filename'].append(filename)


columns = [
    COL_SCORE
    # COL_F_SCORE_NORMALIZED,
]

files_gridsearch = [
    '2021-06-09_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc1_Ppr0.1_Pps0.1_Pe0.05_ts2.csv',
    '2021-06-09_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc1_Ppr0.1_Pps0.1_Pe0_ts2.csv',
    '2021-06-09_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc1_Ppr0.1_Pps0.5_Pe0.05_ts2.csv',
    '2021-06-09_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc1_Ppr0.1_Pps0.5_Pe0_ts2.csv',
    '2021-06-09_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc1_Ppr0.5_Pps0.5_Pe0.05_ts2.csv',
    '2021-06-09_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc1_Ppr0.5_Pps0.5_Pe0_ts2.csv',
    '2021-06-10_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc1_Ppr0.5_Pps0.1_Pe0.05_ts2.csv',
    '2021-06-10_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc1_Ppr0.5_Pps0.1_Pe0_ts2.csv',
    '2021-06-10_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc1_Ppr0.9_Pps0.5_Pe0.05_ts2.csv',
    '2021-06-10_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc1_Ppr0.9_Pps0.5_Pe0_ts2.csv',
    '2021-06-11_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0_Pc1_Ppr0.1_Pps0.1_Pe0.05_ts2.csv',
    '2021-06-11_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0_Pc1_Ppr0.1_Pps0.1_Pe0_ts2.csv',
    '2021-06-11_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0_Pc1_Ppr0.1_Pps0.5_Pe0.05_ts2.csv',
    '2021-06-11_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0_Pc1_Ppr0.1_Pps0.5_Pe0_ts2.csv',
    '2021-06-11_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0_Pc1_Ppr0.5_Pps0.1_Pe0.05_ts2.csv',
    '2021-06-11_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0_Pc1_Ppr0.5_Pps0.5_Pe0.05_ts2.csv',
    '2021-06-11_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0_Pc1_Ppr0.5_Pps0.5_Pe0_ts2.csv',
    '2021-06-11_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
    '2021-06-11_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc1_Ppr0.9_Pps0.1_Pe0_ts2.csv',
    '2021-06-12_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.1_Pc0.9_Ppr0.1_Pps0.1_Pe0.05_ts2.csv',
    '2021-06-12_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.1_Pc0.9_Ppr0.1_Pps0.1_Pe0_ts2.csv',
    '2021-06-12_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.1_Pc0.9_Ppr0.1_Pps0.5_Pe0.05_ts2.csv',
    '2021-06-12_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.1_Pc0.9_Ppr0.1_Pps0.5_Pe0_ts2.csv',
    '2021-06-12_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.1_Pc0.9_Ppr0.5_Pps0.1_Pe0.05_ts2.csv',
    '2021-06-12_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.1_Pc0.9_Ppr0.5_Pps0.1_Pe0_ts2.csv',
    '2021-06-12_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.1_Pc0.9_Ppr0.5_Pps0.5_Pe0.05_ts2.csv',
    '2021-06-12_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.1_Pc0.9_Ppr0.5_Pps0.5_Pe0_ts2.csv',
    '2021-06-12_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.1_Pc0.9_Ppr0.9_Pps0.5_Pe0.05_ts2.csv',
    '2021-06-12_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0_Pc1_Ppr0.5_Pps0.1_Pe0_ts2.csv',
    '2021-06-12_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
    '2021-06-12_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0_Pc1_Ppr0.9_Pps0.1_Pe0_ts2.csv',
    '2021-06-12_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0_Pc1_Ppr0.9_Pps0.5_Pe0.05_ts2.csv',
    '2021-06-12_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0_Pc1_Ppr0.9_Pps0.5_Pe0_ts2.csv',
    '2021-06-13_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.1_Pc0.9_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
    '2021-06-13_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.1_Pc0.9_Ppr0.9_Pps0.1_Pe0_ts2.csv',
    '2021-06-13_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.1_Pc0.9_Ppr0.9_Pps0.5_Pe0_ts2.csv',
    '2021-06-13_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.9_Pc0.1_Ppr0.1_Pps0.1_Pe0.05_ts2.csv',
    '2021-06-13_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.9_Pc0.1_Ppr0.1_Pps0.1_Pe0_ts2.csv',
    '2021-06-13_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.9_Pc0.1_Ppr0.1_Pps0.5_Pe0.05_ts2.csv',
    '2021-06-13_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.9_Pc0.1_Ppr0.1_Pps0.5_Pe0_ts2.csv',
    '2021-06-13_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.9_Pc0.1_Ppr0.5_Pps0.1_Pe0.05_ts2.csv',
    '2021-06-13_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.9_Pc0.1_Ppr0.5_Pps0.5_Pe0.05_ts2.csv',
    '2021-06-13_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.9_Pc0.1_Ppr0.5_Pps0.5_Pe0_ts2.csv',
    '2021-06-14_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.9_Pc0.1_Ppr0.5_Pps0.1_Pe0_ts2.csv',
    '2021-06-14_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.9_Pc0.1_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
    '2021-06-14_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.9_Pc0.1_Ppr0.9_Pps0.1_Pe0_ts2.csv',
    '2021-06-14_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.9_Pc0.1_Ppr0.9_Pps0.5_Pe0.05_ts2.csv',
    '2021-06-14_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm0.9_Pc0.1_Ppr0.9_Pps0.5_Pe0_ts2.csv',
    '2021-06-15_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc0_Ppr0.1_Pps0.1_Pe0.05_ts2.csv',
    '2021-06-15_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc0_Ppr0.1_Pps0.1_Pe0_ts2.csv',
    '2021-06-15_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc0_Ppr0.1_Pps0.5_Pe0.05_ts2.csv',
    '2021-06-15_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc0_Ppr0.1_Pps0.5_Pe0_ts2.csv',
    '2021-06-15_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc0_Ppr0.5_Pps0.1_Pe0.05_ts2.csv',
    '2021-06-15_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc0_Ppr0.5_Pps0.1_Pe0_ts2.csv',
    '2021-06-15_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc0_Ppr0.5_Pps0.5_Pe0.05_ts2.csv',
    '2021-06-15_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc0_Ppr0.5_Pps0.5_Pe0_ts2.csv',
    '2021-06-16_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc0_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
    '2021-06-16_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc0_Ppr0.9_Pps0.1_Pe0_ts2.csv',
    '2021-06-16_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc0_Ppr0.9_Pps0.5_Pe0.05_ts2.csv',
    '2021-06-16_grid-search_Movielens V2_Di5_Dm8_i1_gs100_Pm1_Pc0_Ppr0.9_Pps0.5_Pe0_ts2.csv',
]


def experiment_gridsearch():
    for file in files_gridsearch:
        for column in columns:
            process(file, column, store=True, ylim=[0.1, 0.65])

    print(latex_table)

    # %%
    df_results = pd.DataFrame.from_dict(results)

    def plot(cols=[]):
        BAR_SIZE = .3
        calc_figsize = lambda cols: (6.4, len(cols) * BAR_SIZE + 1)

        # Best and worst
        all_mean = df_results.groupby(['Re', 'Pco', 'Psm', 'Ppm', 'Spm']).mean()
        for idx, c in enumerate(cols):
            fig, axs = plt.subplots(nrows=2, ncols=1, sharex=True, figsize=(4, 4.2))
            fig.suptitle('($R_e, P_{co}, P_{sm}, P_{pm}, S_{pm}$)')
            p = all_mean[c['col']].sort_values(ascending=True).tail(5).plot(
                ax=axs[0],
                kind='barh', xlim=c['xlim'],
                title='Best 5 ' + c['title'])
            p.set(ylabel=None)
            p = all_mean[c['col']].sort_values(ascending=False).tail(5).plot(
                ax=axs[1],
                kind='barh', xlim=c['xlim'],
                title='Worst 5 ' + c['title'])
            p.set(ylabel=None)
            plt.tight_layout()
            plt.savefig('report/4-grid-search-best-worst-' + c['col'] + '.pdf')
            plt.show()

        # Elitism
        re_mean = df_results.groupby("Re").mean()
        fig, axs = plt.subplots(nrows=1, ncols=len(cols), sharey=True)
        fig.suptitle('Grid search, mean ($R_e$)')
        for idx, c in enumerate(cols):
            p = re_mean[c['col']].plot(kind='barh', ax=axs[idx], xlim=c['xlim'], title=c['title'],
                                       figsize=calc_figsize(re_mean))
            p.set(ylabel=None)
        plt.tight_layout()
        plt.savefig('report/4-grid-search-elitism.pdf')
        plt.show()

        # Parameter mutation
        ppm_spm_mean = df_results.groupby(["Ppm", "Spm"]).mean()
        fig, axs = plt.subplots(nrows=1, ncols=len(cols), sharey=True)
        fig.suptitle('Grid search, mean ($P_{pm}, S_{pm}$)')
        for idx, c in enumerate(cols):
            p = ppm_spm_mean[c['col']].plot(kind='barh', ax=axs[idx], xlim=c['xlim'], title=c['title'],
                                            figsize=calc_figsize(ppm_spm_mean))
            p.set(ylabel=None)
        plt.tight_layout()
        plt.savefig('report/4-grid-search-param-mutation.pdf')
        plt.show()

        # Crossover/subtree mutation
        pco_psm_mean = df_results.groupby(["Pco", "Psm"]).mean()
        fig, axs = plt.subplots(nrows=1, ncols=len(cols), sharey=True)
        fig.suptitle('Grid search, mean ($P_{co}, P_{sm}$)')
        for idx, c in enumerate(cols):
            p = pco_psm_mean[c['col']].plot(kind='barh', ax=axs[idx], xlim=c['xlim'], title=c['title'],
                                            figsize=calc_figsize(pco_psm_mean))
            p.set(ylabel=None)
        plt.tight_layout()
        plt.savefig('report/4-grid-search-crossover-mutation.pdf')
        plt.show()

    plot([
        {"col": "mrr", "title": "MRR@10", "xlim": [0.55, 0.62]},
        {"col": "dmean", "title": "$\Delta$Mean", "xlim": None},
        {"col": "dmax", "title": "$\Delta$Max", "xlim": None},
    ])


files_main = [

    'main-run-1_filmtrust_Di5_Dm6_i1_gs100_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
    'main-run-2_filmtrust_Di5_Dm6_i1_gs100_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
    'main-run-3_filmtrust_Di5_Dm6_i1_gs100_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
    'main-run-4_filmtrust_Di5_Dm6_i1_gs100_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
    'main-run-1_movielens_Di5_Dm6_i1_gs100_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
    'main-run-2_movielens_Di5_Dm6_i1_gs100_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
    'main-run-3_movielens_Di5_Dm6_i1_gs100_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
    'main-run-4_movielens_Di5_Dm6_i1_gs100_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
    'main-run-1_sobazaar_Di5_Dm6_i1_gs100_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
    'main-run-2_sobazaar_Di5_Dm6_i1_gs100_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
    'main-run-3_sobazaar_Di5_Dm6_i1_gs100_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
    'main-run-4_sobazaar_Di5_Dm6_i1_gs100_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
]

files_main_big = {
    "Movielens": [
        'main-run-big-1_movielens_Di5_Dm8_i1_gs200_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts4.csv',
        'main-run-big-2_movielens_Di5_Dm8_i1_gs200_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts4.csv',
        'main-run-big-3_movielens_Di5_Dm8_i1_gs200_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts4.csv',
        'main-run-big-4_movielens_Di5_Dm8_i1_gs200_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts4.csv'
    ],
    "Sobazaar": [
        'main-run-big-1_sobazaar_Di5_Dm8_i1_gs200_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts4.csv',
        'main-run-big-2_sobazaar_Di5_Dm8_i1_gs200_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts4.csv',
        'main-run-big-3_sobazaar_Di5_Dm8_i1_gs200_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts4.csv',
        'main-run-big-4_sobazaar_Di5_Dm8_i1_gs200_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts4.csv',
    ],
    "Filmtrust": [
        'main-run-1_filmtrust_Di5_Dm6_i1_gs100_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
        'main-run-2_filmtrust_Di5_Dm6_i1_gs100_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
        'main-run-3_filmtrust_Di5_Dm6_i1_gs100_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
        'main-run-4_filmtrust_Di5_Dm6_i1_gs100_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
    ]
}


def experiment_main():
    for name, files in files_main_big.items():
        plt.figure(figsize=(4, 4.8))
        for idx, file in enumerate(files):
            result = pd.read_csv('data/' + file, delimiter="\t", dtype={
                COL_GEN: float
            }, na_values='-')
            result_generations = result[(result.type == TYPE_INDIVIDUAL) & (result.generation <= 55)]
            x = result_generations[COL_GEN].unique().astype(int)
            grouped_by = result_generations.groupby([COL_GEN], sort=False)
            result_mean = grouped_by.mean().sort_values(COL_GEN)[COL_SCORE]
            result_mean_trend, delta_max = trend(x, result_mean)
            result_max = grouped_by.max().sort_values(COL_GEN)[COL_SCORE]
            result_max_trend, delta_max = trend(x, result_max)

            plt.plot(x, result_max, label=('max' if idx == 0 else None), color=COLOR_MAX)
            plt.plot(x, result_max_trend, label=('max (trend)' if idx == 0 else None), color=COLOR_MAX,
                     linestyle='dotted')
            plt.plot(x, result_mean, label=('mean' if idx == 0 else None), color=COLOR_MEAN)
            plt.plot(x, result_mean_trend, label='mean (trend)' if idx == 0 else None, color=COLOR_MEAN,
                     linestyle='dotted')


            config_max = result_generations[result_generations[COL_SCORE] == result_generations[COL_SCORE].max()]
            config_str = config_max[COL_CONFIG].iloc[0]
            config_score = config_max[COL_SCORE].iloc[0]
            print('[`' + name + '-' + str(idx) + '`, `' + config_str + "`, `MRR@10=" + str(
                round(config_score, 4)) + "`],")
        if name == 'Movielens':
            baselines = [0.339, 0.5316, 0.5672]
        elif name == 'Sobazaar':
            baselines = [0.0054, 0.001, 0.0023]
        else:
            baselines = [0.9868, 0.8502, 0.5257]
        for idx, baseline in enumerate(baselines):
            plt.plot(x, np.full(x.shape, baseline), label='Baseline' if idx == 0 else None, color=COLOR_BASE)

        plt.legend(),
        plt.grid(True)
        plt.title(name + " - MRR@10")
        plt.tight_layout()
        plt.savefig('report/4-main-' + name.lower() + '.pdf')
        plt.xlabel('Generation')
        plt.ylabel('MRR@10')
        plt.show()


files_evaluation = {
    'MRR@10': 'evaluation-2_movielens_mrr_Di5_Dm6_i1_gs200_Pm0.1_Pc0.9_Ppr0.9_Pps0.1_Pe0.05_ts4.csv',
    'Precision@1': 'evaluation-2_movielens_precision1_Di5_Dm6_i1_gs200_Pm0.1_Pc0.9_Ppr0.9_Pps0.1_Pe0.05_ts4.csv',
    'Recall@10': 'evaluation-2_movielens_recall_Di5_Dm6_i1_gs200_Pm0.1_Pc0.9_Ppr0.9_Pps0.1_Pe0.05_ts4.csv',
}


def experiment_evaluation():
    width = .275
    fig, axs = plt.subplots(nrows=1, ncols=3, sharex=True, figsize=(8, 4))
    fig.suptitle("Evaluation function experiment")
    axs[0].set_title("MRR@10")
    axs[1].set_title("Precision@1")
    axs[2].set_title("Recall@10")
    plt.setp(axs, xticks=[0, width, 2 * width], xticklabels=['MRR@10', 'P@1', 'R@10'])
    xidx = 0
    for evaluation, file in files_evaluation.items():
        result = pd.read_csv('data/' + file, delimiter="\t", dtype={
            COL_GEN: float
        }, na_values='-')
        result_generations = result[result.type == TYPE_INDIVIDUAL]
        config_max = result_generations[result_generations[COL_SCORE] == result_generations[COL_SCORE].max()]
        mrr = config_max["mrr10"].iloc[0]
        p1 = config_max["precision1"].iloc[0]
        recall = config_max["recall"].iloc[0]
        axs[0].bar(width * xidx, mrr, width=width)
        axs[1].bar(width * xidx, p1, width=width)
        axs[2].bar(width * xidx, recall, width=width)

        config_str = config_max[COL_CONFIG].iloc[0]
        config_score = config_max[COL_SCORE].iloc[0]
        print('[`' + evaluation + '`, `' + config_str + "`, `MRR@10=" + str(round(config_score, 4)) + "`],")
        xidx += 1
    plt.tight_layout()
    plt.savefig('report/4-evaluation.pdf')
    plt.show()


files_density = {
    'dense': [
        'density-1_sobazaar-dense_purchase:buy_clicked_mrr_Di5_Dm6_i1_gs200_Pm0.1_Pc0.9_Ppr0.9_Pps0.1_Pe0.05_ts4.csv',
        'density-3_sobazaar-dense_purchase:buy_clicked_mrr_Di5_Dm6_i1_gs200_Pm0.1_Pc0.9_Ppr0.9_Pps0.1_Pe0.05_ts4.csv',
    ],
    'sparse': [
        'density-1_sobazaar-sparse_purchase:buy_clicked_mrr_Di5_Dm6_i1_gs200_Pm0.1_Pc0.9_Ppr0.9_Pps0.1_Pe0.05_ts4.csv',
        'density-4_sobazaar-sparse_purchase:buy_clicked_mrr_Di5_Dm6_i1_gs200_Pm0.1_Pc0.9_Ppr0.9_Pps0.1_Pe0.05_ts4.csv',
    ]
}


def experiment_density():
    for type, files in files_density.items():
        for idx, file in enumerate(files):
            result = pd.read_csv('data/' + file, delimiter="\t", dtype={
                COL_GEN: float
            }, na_values='-')
            result_generations = result[result.type == TYPE_INDIVIDUAL]
            config_max = result_generations[result_generations[COL_SCORE] == result_generations[COL_SCORE].max()]
            config_str = config_max[COL_CONFIG].iloc[0]
            config_score = config_max[COL_SCORE].iloc[0]
            print('[`' + type + '-' + str(idx) + '`, `' + config_str + "`, `MRR@10=" + str(
                round(config_score, 4)) + "`],")


results_density = [
    {'dataset': 'sobazaar-dense', 'training': 'dense-0', 'mrr': 0.024062301587301597},
    {'dataset': 'sobazaar-sparse', 'training': 'dense-0', 'mrr': 0.01345827268316351},
    # {'dataset': 'sobazaar-dense', 'training': 'dense-1', 'mrr': 0.020631349206349212},
    # {'dataset': 'sobazaar-sparse', 'training': 'dense-1', 'mrr': 0.010851615027379215},
    {'dataset': 'sobazaar-dense', 'training': 'dense-1', 'mrr': 0.02497142857142858},
    {'dataset': 'sobazaar-sparse', 'training': 'dense-1', 'mrr': 0.004883638317044431},
    # {'dataset': 'sobazaar-dense', 'training': 'dense-3', 'mrr': 0.01051626984126984},
    # {'dataset': 'sobazaar-sparse', 'training': 'dense-3', 'mrr': 0.01283054342552159},
    {'dataset': 'sobazaar-dense', 'training': 'sparse-0', 'mrr': 0.006850793650793651},
    {'dataset': 'sobazaar-sparse', 'training': 'sparse-0', 'mrr': 0.013350402023982808},
    # {'dataset': 'sobazaar-dense', 'training': 'sparse-1', 'mrr': 0.010173809523809524},
    # {'dataset': 'sobazaar-sparse', 'training': 'sparse-1', 'mrr': 0.009508213765855682},
    # {'dataset': 'sobazaar-dense', 'training': 'sparse-2', 'mrr': 0.011784126984126984},
    # {'dataset': 'sobazaar-sparse', 'training': 'sparse-2', 'mrr': 0.006507330006238302},
    {'dataset': 'sobazaar-dense', 'training': 'sparse-1', 'mrr': 0.006227380952380954},
    {'dataset': 'sobazaar-sparse', 'training': 'sparse-1', 'mrr': 0.011382304013308376},
]


def plot_density():
    for result in results_density:
        print(result['dataset']+' MRR@10: '+str(round(result['mrr'], 4)))
    df_density = pd.DataFrame.from_records(results_density)

    ax = df_density.groupby(['dataset', 'training'], sort=False).sum().unstack().plot.bar(
        title='Results using datasets with different levels of sparsity for training',
        figsize=(8, 4)
    )
    ax.legend(
        ['dense-0', 'dense-1', 'sparse-0', 'sparse-1'],
        title="Recommender system",
    )
    plt.ylabel('MRR@10')
    plt.tick_params(labelrotation=0)
    plt.tight_layout()
    plt.savefig('report/4-density.pdf')
    plt.show()


files_interaction = {
    'product_detail_viewed': 'interaction_sobazaar-dense_content:interact:product_detail_viewed_mrr_Di5_Dm6_i1_gs200_Pm0.1_Pc0.9_Ppr0.9_Pps0.1_Pe0.05_ts4.csv',
    'product_detail_clicked': 'interaction_sobazaar-dense_product_detail_clicked_mrr_Di5_Dm6_i1_gs200_Pm0.1_Pc0.9_Ppr0.9_Pps0.1_Pe0.05_ts4.csv',
    'product_wanted': 'interaction_sobazaar-dense_product_wanted_mrr_Di5_Dm6_i1_gs200_Pm0.1_Pc0.9_Ppr0.9_Pps0.1_Pe0.05_ts4.csv',
    'buy_clicked': 'interaction_sobazaar-dense_purchase:buy_clicked_mrr_Di5_Dm6_i1_gs200_Pm0.1_Pc0.9_Ppr0.9_Pps0.1_Pe0.05_ts4.csv',
}


def experiment_interaction():
    for interaction, file in files_interaction.items():
        result = pd.read_csv('data/' + file, delimiter="\t", dtype={
            COL_GEN: float
        }, na_values='-')
        result_generations = result[result.type == TYPE_INDIVIDUAL]
        config_max = result_generations[result_generations[COL_SCORE] == result_generations[COL_SCORE].max()]
        config_str = config_max[COL_CONFIG].iloc[0]
        config_score = config_max[COL_SCORE].iloc[0]
        print('[`' + interaction + '`, `' + config_str + "`, `MRR@10=" + str(round(config_score, 4)) + "`],")


results_interaction = [
    {'dataset': 'product_detail_viewed', 'training': 'product_detail_viewed', 'mrr': 0.06014603174603179},
    {'dataset': 'product_detail_viewed', 'training': 'product_detail_clicked', 'mrr': 0.017065476190476193},
    {'dataset': 'product_detail_viewed', 'training': 'product_wanted', 'mrr': 0.015904365079365077},
    {'dataset': 'product_detail_viewed', 'training': 'buy_clicked', 'mrr': 0.01955595238095238},
    {'dataset': 'product_detail_clicked', 'training': 'product_detail_viewed', 'mrr': 0.08655753968253983},
    {'dataset': 'product_detail_clicked', 'training': 'product_detail_clicked', 'mrr': 0.1315761904761906},
    {'dataset': 'product_detail_clicked', 'training': 'product_wanted', 'mrr': 0.10324246031746045},
    {'dataset': 'product_detail_clicked', 'training': 'buy_clicked', 'mrr': 0.05247579365079367},
    {'dataset': 'product_wanted', 'training': 'product_detail_viewed', 'mrr': 0.10678214285714298},
    {'dataset': 'product_wanted', 'training': 'product_detail_clicked', 'mrr': 0.08344365079365094},
    {'dataset': 'product_wanted', 'training': 'product_wanted', 'mrr': 0.17166468253968262},
    {'dataset': 'product_wanted', 'training': 'buy_clicked', 'mrr': 0.06245198412698415},
    {'dataset': 'buy_clicked', 'training': 'product_detail_viewed', 'mrr': 0.01628730158730159},
    {'dataset': 'buy_clicked', 'training': 'product_detail_clicked', 'mrr': 0.005981746031746034},
    {'dataset': 'buy_clicked', 'training': 'product_wanted', 'mrr': 0.00812063492063492},
    {'dataset': 'buy_clicked', 'training': 'buy_clicked', 'mrr': 0.017569047619047623},
]


def plot_results_interaction():
    for item in results_interaction:
        print('sobazaar-' + item['dataset'] + ' MRR@10: ' + str(round(item['mrr'], 4)))
    df_interactions = pd.DataFrame.from_records(results_interaction)

    ax = df_interactions.groupby(['dataset', 'training'], sort=False).sum().unstack().plot.bar(
        title='Results using different interactions for training',
        figsize=(8, 4)
    )
    ax.legend(
        ['product_detail_viewed', 'product_detail_clicked', 'product_wanted', 'buy_clicked'],
        title="Recommender system",
    )
    plt.ylabel('MRR@10')
    plt.tick_params(labelrotation=0)
    plt.tight_layout()
    plt.savefig('report/4-interaction.pdf')
    plt.show()


experiment_gridsearch()

experiment_main()

experiment_evaluation()

experiment_density()

plot_density()

experiment_interaction()

plot_results_interaction()
