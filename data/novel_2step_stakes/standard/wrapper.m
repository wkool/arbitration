function results = wrapper

load ../groupdata

% simulation parameters
N = 200;        % number of trials per subject

data = struct;

nstarts = 100;

for j = 1:length(groupdata.i)
    
    i = groupdata.i(j);
    
    subdata = groupdata.subdata{i};
    
    data(j).points = subdata.points;
    data(j).choice1 = subdata.choice1;
    data(j).state1 = subdata.state1;
    data(j).state2 = subdata.state2;
    data(j).stake = subdata.stake;
    data(j).rt1 = subdata.rt1;
    data(j).rt2 = subdata.rt2;
    data(j).rews = subdata.rews;
    data(j).stim_left = subdata.stim_left;
    data(j).N = N;
    
end

% run optimization
params = set_params;
f = @(x,data) MB_MF_rllik(x,data);
results = mfit_optimize(f,params,data,nstarts);

end
