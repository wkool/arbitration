function groupdata = groupanalysis

groupdata = make_raw_data;

if exist('standard/results.mat','file')
    standard_results = load('standard/results.mat');
    groupdata.fits = standard_results.results;
end

if exist('standard/results.mat','file')
    exhaustive_results = load('exhaustive/results.mat');
    groupdata.exhaustive_fits = exhaustive_results.results;
end

nrsubs = length(groupdata.subdata);

T = [];

s = 0;

for i = 1:nrsubs
    
    subdata = groupdata.subdata{i};
    
    if sum(subdata.missed) < 40
        
        s = s+1;
        
        groupdata.i(s,1) = i;
        
        groupdata.missed(s,1) = sum(subdata.missed);
        groupdata.rewardrate(s,1) = mean(subdata.win);
        ps = [subdata.ps1a1 subdata.ps1a2 subdata.ps2a1 subdata.ps2a2];
        groupdata.avg_p(s,1) = mean(ps(:));
        groupdata.rewardrate_corrected(s,1) = groupdata.rewardrate(s,1) - groupdata.avg_p(s,1);
        groupdata.score(s,1) = subdata.score(200);
        
        stake = subdata.stake(~(subdata.missed|subdata.prevmissed));
        prevwin = subdata.prevwin(~(subdata.missed|subdata.prevmissed));
        prevcommon = subdata.prevcommon(~(subdata.missed|subdata.prevmissed));
        stay = subdata.stay(~(subdata.missed|subdata.prevmissed));
                
        groupdata.mb_component(s,1) = mean([mean(stay(prevwin&prevcommon&stake==1)) mean(stay(~prevwin&~prevcommon&stake==1))]) ...
            - mean([mean(stay(prevwin&~prevcommon&stake==1)) mean(stay(~prevwin&prevcommon&stake==1))]);  % low-stakes
        groupdata.mb_component(s,2) = mean([mean(stay(prevwin&prevcommon&stake==5)) mean(stay(~prevwin&~prevcommon&stake==5))]) ...
            - mean([mean(stay(prevwin&~prevcommon&stake==5)) mean(stay(~prevwin&prevcommon&stake==5))]);  % high-stakes
        
        if exist('standard_results','var')
            groupdata.w(s,:) = standard_results.results.x(s,4:5);
        end
        
        if exist('exhaustive_results','var')
            groupdata.w_exhaustive(s,:) = exhaustive_results.results.x(s,7:8);
        end
        
        T = [T; s*ones(length(subdata.table),1) subdata.table];
                
    end
    
end

groupdata.table = table(T(:,1),T(:,2),T(:,3),T(:,4),T(:,5),'VariableNames',{'subnr' 'prevwin' 'prevcommon' 'stake' 'stay'});
groupdata.glme = fitglme(groupdata.table,'stay~prevwin*prevcommon*stake + (prevwin*prevcommon*stake|subnr)','Distribution','Binomial');

end

