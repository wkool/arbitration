#Data These directories contain all the raw data for the stake versions of both two-step paradigms, and the functions that are used to analyze them.

All processed data, including reinforcement-learning model fits and hierarchical fits, are stored in the groupdata.mat variables in each experiment's directory.

The maximum a posteriori model-fitting procedure can be run the subdirectories called 'standard' and 'exhaustive'. These procedures require the mfit model-fittin package developed by Sam Gershman, which can be found here: https://github.com/sjgershm/mfit

The functions that fit the data to the RL models (mfit_wrapper.m) will take a long time to finish. This process can be sped up by breaking up these analyses and running them in parallel jobs on your institution's computing cluster.

If you have any questions, please do not hesitate to contact Wouter Kool (wkool@fas.harvard.edu).
