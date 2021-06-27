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

    # df_results = df_results.sort_values(['mrr'])

    # re_max = df_results.groupby("Re").max()
    # pco_mean = df_results.groupby("Pco").mean()
    # pco_max = df_results.groupby("Pco").max()
    # psm_mean = df_results.groupby("Psm").mean()
    # psm_max = df_results.groupby("Psm").max()
    # ppm_mean = df_results.groupby("Ppm").mean()
    # ppm_max = df_results.groupby("Ppm").max()
    # spm_mean = df_results.groupby("Spm").mean()["mrr"]
    # spm_ma = df_results.groupby("Spm").max()

    def plot(cols=[]):
        BAR_SIZE = .3
        calc_figsize = lambda cols: (6.4, len(cols) * BAR_SIZE + 1)

        # Best and worst
        all_mean = df_results.groupby(['Re', 'Pco', 'Psm', 'Ppm', 'Spm']).mean()
        for idx, c in enumerate(cols):
            fig, axs = plt.subplots(nrows=2, ncols=1, sharex=True)
            fig.suptitle('Grid search, best and worst ($R_e, P_{co}, P_{sm}, P_{pm}, S_{pm}$)')
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
        fig.suptitle('Grid search, mean ($P_{co}, S_{sm}$)')
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
    "Filmtrust":[
        'main-run-1_filmtrust_Di5_Dm6_i1_gs100_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
        'main-run-2_filmtrust_Di5_Dm6_i1_gs100_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
        'main-run-3_filmtrust_Di5_Dm6_i1_gs100_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
        'main-run-4_filmtrust_Di5_Dm6_i1_gs100_Pm0.1_Pc1_Ppr0.9_Pps0.1_Pe0.05_ts2.csv',
    ]
}


def experiment_main():
    for name, files in files_main_big.items():
        for idx, file in enumerate(files):
            result = pd.read_csv('data/' + file, delimiter="\t", dtype={
                COL_GEN: float
            }, na_values='-')
            result_generations = result[result.type == TYPE_INDIVIDUAL]
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

            if idx == 0:
                baseline = result[result.type == 'baseline']
                plt.plot(x, np.full(x.shape, baseline[COL_SCORE]), label='Baseline', color=COLOR_BASE)

            config_max = result_generations[result_generations[COL_SCORE] == result_generations[COL_SCORE].max()]
            config_str = config_max[COL_CONFIG].iloc[0]
            config_score = config_max[COL_SCORE].iloc[0]
            print('[`'+name+'-'+str(idx)+'`, `'+config_str+"`, `MRR@10="+str(round(config_score, 4))+"`],")
        plt.legend(),
        plt.grid(True)
        plt.title(name + " - MRR@10")
        plt.tight_layout()
        plt.savefig('report/4-main-'+name.lower()+'.pdf')
        plt.xlabel('Generation')
        plt.ylabel('MRR@10')
        plt.show()


files_evaluation = {
    'MRR@10': 'evaluation_movielens_mrr_Di5_Dm6_i1_gs200_Pm0.1_Pc0.9_Ppr0.9_Pps0.1_Pe0.05_ts4.csv',
    'Precision@1': 'evaluation_movielens_precision1_Di5_Dm6_i1_gs200_Pm0.1_Pc0.9_Ppr0.9_Pps0.1_Pe0.05_ts4.csv',
    'Recall@10': 'evaluation_movielens_recall_Di5_Dm6_i1_gs200_Pm0.1_Pc0.9_Ppr0.9_Pps0.1_Pe0.05_ts4.csv',
}

def experiment_evaluation():
    width = .275
    fig, axs = plt.subplots(nrows=1, ncols=3, sharex=True)
    fig.suptitle("Evaluation function experiment")
    axs[0].set_title("MRR@10")
    axs[1].set_title("Precision@1")
    axs[2].set_title("Recall@10")
    plt.setp(axs, xticks=[0, width, 2* width], xticklabels=['MRR@10', 'P@1', 'R@10'])
    axs[0].tick_params(labelrotation=45)
    axs[1].tick_params(labelrotation=45)
    axs[2].tick_params(labelrotation=45)
    # plt.xticks(rotation = 25)
    axs[0].set_ylim(0.5, 0.6)
    axs[1].set_ylim(0.2, 0.25)
    axs[2].set_ylim(0.1, 0.12)
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
        axs[0].bar(width * xidx, mrr, width = width)
        axs[1].bar(width * xidx,p1, width = width)
        axs[2].bar(width * xidx,recall, width = width)

        config_str = config_max[COL_CONFIG].iloc[0]
        config_score = config_max[COL_SCORE].iloc[0]
        print('[`'+evaluation+'`, `'+config_str+"`, `MRR@10="+str(round(config_score, 4))+"`],")
        xidx += 1
    plt.savefig('report/4-evaluation.pdf')
    plt.show()


def experiment_interactions():
    return



# experiment_gridsearch()
# experiment_main()
# %%
experiment_evaluation()
